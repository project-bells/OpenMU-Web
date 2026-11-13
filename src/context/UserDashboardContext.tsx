import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import {
  type AccountProfile,
  type CreditExchangeRecord,
  type OnlineTimeRedemptionRecord,
  type OpenMuCharacter,
  type PlayerSessionSummary,
  type TopupOrderRecord,
  type WalletLedgerEntry,
  type WalletState,
  exchangeCreditsToWcoin,
  fetchPlayerSession,
  fetchWalletSummary,
  loginAccount,
  logoutAccount,
  redeemOnlineTimeCredits,
} from "../services/dbApi";

interface UserDashboardContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  account: AccountProfile | null;
  wallet: WalletState | null;
  mainCharacter: string;
  mainCharacterObj: OpenMuCharacter | null;
  characters: OpenMuCharacter[];
  availableHours: number;
  availableOnlineSeconds: number;
  authoritativeOnlineSeconds: number;
  redeemedOnlineSeconds: number;
  credits: number;
  wcoin: number;
  pendingWcoin: number;
  ledger: WalletLedgerEntry[];
  redemptions: OnlineTimeRedemptionRecord[];
  exchanges: CreditExchangeRecord[];
  orders: TopupOrderRecord[];
  refreshSummary: () => Promise<PlayerSessionSummary | null>;
  loginPlayer: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutPlayer: () => Promise<void>;
  redeemHours: (
    hours?: number | null
  ) => Promise<{ ok: boolean; message: string; earnedCredits?: number; idempotent?: boolean }>;
  exchangeCredits: (
    credits: number
  ) => Promise<{
    ok: boolean;
    message: string;
    deductedCredits?: number;
    wcoinReceived?: number;
    idempotent?: boolean;
  }>;
}

const UserDashboardContext = createContext<UserDashboardContextType | undefined>(undefined);

export function UserDashboardProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<PlayerSessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateSession = useCallback(async (): Promise<PlayerSessionSummary | null> => {
    try {
      const data = await fetchPlayerSession();
      setSummary(data && data.authenticated ? data : null);
      return data && data.authenticated ? data : null;
    } catch {
      setSummary(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const refreshSummary = useCallback(async (): Promise<PlayerSessionSummary | null> => {
    try {
      const data = await fetchWalletSummary();
      setSummary(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const loginPlayer = useCallback(
    async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const trimmed = username.trim();
      if (!trimmed || !password) {
        return { ok: false, error: "กรุณากรอก Username และ Password" };
      }

      const res = await loginAccount(trimmed, password);
      if (res.success && res.summary) {
        setSummary(res.summary);
        return { ok: true };
      }
      return { ok: false, error: res.error || "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง" };
    },
    []
  );

  const logoutPlayer = useCallback(async () => {
    try {
      await logoutAccount();
    } catch {
      // Clear local session state even if network logout fails
    } finally {
      setSummary(null);
    }
  }, []);

  const redeemHours = useCallback(
    async (
      hours?: number | null
    ): Promise<{ ok: boolean; message: string; earnedCredits?: number; idempotent?: boolean }> => {
      const res = await redeemOnlineTimeCredits(hours);
      if (res.success) {
        await refreshSummary();
        const earned = res.redemption?.creditsAwarded ?? 0;
        const usedHours = res.redemption?.hoursRedeemed ?? hours ?? 0;
        return {
          ok: true,
          idempotent: res.idempotent,
          earnedCredits: earned,
          message: `แลกสำเร็จ! ใช้ ${usedHours} ชม. ออนไลน์ → ได้รับ +${earned.toLocaleString()} เครดิต`,
        };
      }
      return {
        ok: false,
        message: res.error || "ไม่สามารถแลกเครดิตจากเวลาออนไลน์ได้",
      };
    },
    [refreshSummary]
  );

  const exchangeCredits = useCallback(
    async (
      creditsAmount: number
    ): Promise<{
      ok: boolean;
      message: string;
      deductedCredits?: number;
      wcoinReceived?: number;
      idempotent?: boolean;
    }> => {
      const res = await exchangeCreditsToWcoin(creditsAmount);
      if (res.success) {
        await refreshSummary();
        const deducted = res.deductedCredits ?? creditsAmount;
        const wcoin = res.wcoinReceived ?? 0;
        return {
          ok: true,
          idempotent: res.idempotent,
          deductedCredits: deducted,
          wcoinReceived: wcoin,
          message: `แลกสำเร็จ! ใช้ ${deducted.toLocaleString()} Credits → ได้รับ +${wcoin.toLocaleString()} WCoinC`,
        };
      }
      return {
        ok: false,
        message: res.error || "ไม่สามารถแลก Credits เป็น WCoinC ได้",
      };
    },
    [refreshSummary]
  );

  const derived = useMemo(() => {
    const account = summary?.account ?? null;
    const wallet = summary?.wallet ?? null;
    const characters = summary?.characters ?? account?.characters ?? [];
    const sortedChars = [...characters].sort((a, b) => (b.resets - a.resets) || (b.lvl - a.lvl));
    const mainCharacterObj = sortedChars[0] ?? null;
    const authoritativeOnlineSeconds = account?.onlineTimeSeconds ?? 0;
    const redeemedOnlineSeconds = wallet?.redeemedOnlineSeconds ?? 0;
    const availableOnlineSeconds = Math.max(0, authoritativeOnlineSeconds - redeemedOnlineSeconds);
    const availableHours = Math.floor(availableOnlineSeconds / 3600);

    return {
      isAuthenticated: Boolean(summary?.authenticated && account),
      username: account?.loginName ?? "",
      account,
      wallet,
      characters,
      mainCharacterObj,
      mainCharacter: mainCharacterObj?.name ?? "-",
      authoritativeOnlineSeconds,
      redeemedOnlineSeconds,
      availableOnlineSeconds,
      availableHours,
      credits: wallet?.credits ?? account?.credits ?? 0,
      wcoin: account?.wcoin ?? 0,
      pendingWcoin: account?.pendingWcoin ?? 0,
      ledger: summary?.ledger ?? [],
      redemptions: summary?.redemptions ?? [],
      exchanges: summary?.exchanges ?? [],
      orders: summary?.orders ?? [],
    };
  }, [summary]);

  return (
    <UserDashboardContext.Provider
      value={{
        ...derived,
        isLoading,
        refreshSummary,
        loginPlayer,
        logoutPlayer,
        redeemHours,
        exchangeCredits,
      }}
    >
      {children}
    </UserDashboardContext.Provider>
  );
}

export function useUserDashboard() {
  const ctx = useContext(UserDashboardContext);
  if (!ctx) {
    throw new Error("useUserDashboard must be used within a UserDashboardProvider");
  }
  return ctx;
}
