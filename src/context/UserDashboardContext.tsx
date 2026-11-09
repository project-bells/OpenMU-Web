import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ExchangeHistoryItem {
  id: string;
  timestamp: string;
  hoursUsed: number;
  creditsReceived: number;
  status: "สำเร็จ";
  note?: string;
}

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  role: "Admin GM" | "VIP" | "Moderator" | "Player";
  status: "Active" | "Banned";
  characters: string;
  characterClass: string;
  level: number;
  resets: number;
  credits: number;
  wcoin: number;
  availableHours: number;
  lastLogin: string;
  ipAddress: string;
  notes?: string;
  banReason?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  target: string;
  details: string;
  admin: string;
  time: string;
  timestamp: number;
}

interface UserDashboardContextType {
  // Current logged in player
  currentUser: ManagedUser;
  username: string;
  email: string;
  availableHours: number;
  credits: number;
  wcoin: number;
  mainCharacter: string;
  history: ExchangeHistoryItem[];

  // Global players list (Shared central state)
  players: ManagedUser[];
  auditLogs: AuditLogItem[];

  // Actions
  loginPlayer: (username: string, password?: string) => { success: boolean; error?: string; user?: ManagedUser };
  logoutPlayer: () => void;
  redeemHours: (hours: number) => { success: boolean; error?: string };
  addCreditsToUser: (userIdOrUsername: string, amount: number, note?: string) => { success: boolean; newCredits: number; error?: string };
  updateUserStatus: (userId: string, status: "Active" | "Banned", reason?: string) => void;
  resetAllMockData: () => void;
  resetMockData: () => void;
}

const PLAYERS_STORAGE_KEY = "egismu_players_shared_state_v2";
const CURRENT_USER_STORAGE_KEY = "egismu_active_player_v2";
const HISTORY_STORAGE_KEY = "egismu_exchange_history_v2";
const LOGS_STORAGE_KEY = "egismu_audit_logs_v2";

export const INITIAL_PLAYERS: ManagedUser[] = [
  {
    id: "u-1",
    username: "admin",
    email: "gm.ares@egis-mu.com",
    role: "Admin GM",
    status: "Active",
    characters: "GM_Ares (BM Lv.400)",
    characterClass: "Blade Master (GM)",
    level: 400,
    resets: 50,
    credits: 1500,
    wcoin: 800,
    availableHours: 100,
    lastLogin: "2 นาทีที่แล้ว",
    ipAddress: "127.0.0.1",
    notes: "Senior GameMaster Console",
  },
  {
    id: "u-2",
    username: "lorencia_pro",
    email: "lorencia.pro@gmail.com",
    role: "VIP",
    status: "Active",
    characters: "BladeKnight_X (BM Lv.400)",
    characterClass: "Blade Master (BM)",
    level: 400,
    resets: 18,
    credits: 0, // Starts at 0 Credits as requested
    wcoin: 100,
    availableHours: 50, // Starts at 50 Hours as requested
    lastLogin: "10 นาทีที่แล้ว",
    ipAddress: "171.96.12.45",
    notes: "Top Rank BK Fighter • Lorencia",
  },
  {
    id: "u-3",
    username: "magic_wizard",
    email: "grandmaster.th@hotmail.com",
    role: "Player",
    status: "Active",
    characters: "GrandMaster_99 (GM Lv.398)",
    characterClass: "Grand Master (SM)",
    level: 398,
    resets: 14,
    credits: 200,
    wcoin: 150,
    availableHours: 35,
    lastLogin: "25 นาทีที่แล้ว",
    ipAddress: "182.232.88.19",
    notes: "Devias Ice Storm Specialist",
  },
  {
    id: "u-4",
    username: "elf_archer",
    email: "muse.fairy@yahoo.com",
    role: "VIP",
    status: "Active",
    characters: "HighElf_Fairy (HE Lv.365)",
    characterClass: "High Elf (AE)",
    level: 365,
    resets: 12,
    credits: 450,
    wcoin: 300,
    availableHours: 42,
    lastLogin: "1 ชั่วโมงที่แล้ว",
    ipAddress: "49.228.104.72",
    notes: "Guild Master of VENDETTA",
  },
  {
    id: "u-5",
    username: "dark_summoner",
    email: "bloody.curse@outlook.com",
    role: "Player",
    status: "Active",
    characters: "BloodySum_TH (BS Lv.340)",
    characterClass: "Dimension Summoner",
    level: 340,
    resets: 8,
    credits: 180,
    wcoin: 100,
    availableHours: 28,
    lastLogin: "3 ชั่วโมงที่แล้ว",
    ipAddress: "124.120.55.80",
    notes: "Elbeland Caster",
  },
  {
    id: "u-6",
    username: "rage_fighter",
    email: "brawler.fist@gmail.com",
    role: "Player",
    status: "Active",
    characters: "FistMaster_KO (FM Lv.310)",
    characterClass: "Fist Master (RF)",
    level: 310,
    resets: 6,
    credits: 120,
    wcoin: 50,
    availableHours: 20,
    lastLogin: "5 ชั่วโมงที่แล้ว",
    ipAddress: "110.164.20.91",
    notes: "Karutan Brawler",
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    action: "Grant Balance",
    target: "lorencia_pro",
    details: "+500 Credits (GM Special Bonus)",
    admin: "admin",
    time: "5 นาทีที่แล้ว",
    timestamp: Date.now() - 300000,
  },
  {
    id: "log-2",
    action: "Online Exchange",
    target: "lorencia_pro",
    details: "Redeemed 20 Hours -> +100 Credits",
    admin: "System",
    time: "20 นาทีที่แล้ว",
    timestamp: Date.now() - 1200000,
  },
];

const INITIAL_HISTORY: ExchangeHistoryItem[] = [
  {
    id: "ex-init-1",
    timestamp: new Date(Date.now() - 86400000).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    hoursUsed: 10,
    creditsReceived: 50,
    status: "สำเร็จ",
    note: "แลกเวลาออนไลน์ประจำวัน (1 ชม. = 5 เครดิต)",
  },
];

const UserDashboardContext = createContext<UserDashboardContextType | undefined>(undefined);

export function UserDashboardProvider({ children }: { children: ReactNode }) {
  // 1. Central Players State (Loaded from localStorage or initial)
  const [players, setPlayers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem(PLAYERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PLAYERS;
  });

  // 2. Active Logged-in Player
  const [currentUser, setCurrentUser] = useState<ManagedUser>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sync with latest players state
        const fresh = INITIAL_PLAYERS.find((p) => p.username === parsed.username);
        return fresh || parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PLAYERS[1]; // default to lorencia_pro
  });

  // 3. Exchange History
  const [history, setHistory] = useState<ExchangeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_HISTORY;
  });

  // 4. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
    } catch {
      // ignore
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  // Synchronize currentUser whenever players list updates
  useEffect(() => {
    const freshUser = players.find((p) => p.id === currentUser.id || p.username === currentUser.username);
    if (freshUser && (freshUser.credits !== currentUser.credits || freshUser.availableHours !== currentUser.availableHours)) {
      setCurrentUser(freshUser);
    }
  }, [players, currentUser.id, currentUser.username, currentUser.credits, currentUser.availableHours]);

  // Player Login Action
  const loginPlayer = (username: string, _password?: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const found = players.find(
      (p) => p.username.toLowerCase() === cleanUsername || p.email.toLowerCase() === cleanUsername
    );

    if (!found) {
      return {
        success: false,
        error: `ไม่พบชื่อบัญชี "${username}" ในระบบ กรุณาตรวจสอบหรือเลือกบัญชีทดสอบด้านล่าง`,
      };
    }

    if (found.status === "Banned") {
      return {
        success: false,
        error: `บัญชีนี้ถูกระงับการใช้งานชั่วคราว: ${found.banReason || "โปรดติดต่อ GM"}`,
      };
    }

    // Update lastLogin in state
    const updated = {
      ...found,
      lastLogin: "ขณะนี้ (Just now)",
    };

    setPlayers((prev) => prev.map((p) => (p.id === found.id ? updated : p)));
    setCurrentUser(updated);

    return {
      success: true,
      user: updated,
    };
  };

  const logoutPlayer = () => {
    // Keep lorencia_pro as default fallback
    const fallback = players.find((p) => p.username === "lorencia_pro") || INITIAL_PLAYERS[1];
    setCurrentUser(fallback);
  };

  // Online Time Redeem Action (1 Hour = 5 Credits)
  const redeemHours = (hours: number) => {
    const validHours = Math.floor(hours);
    if (isNaN(validHours) || validHours <= 0) {
      return { success: false, error: "กรุณาระบุจำนวนชั่วโมงที่มากกว่า 0" };
    }
    if (validHours > currentUser.availableHours) {
      return {
        success: false,
        error: `ชั่วโมงออนไลน์ไม่เพียงพอ (มีอยู่ ${currentUser.availableHours} ชั่วโมง)`,
      };
    }

    const earnedCredits = validHours * 5;
    const nowStr = new Date().toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newHistoryItem: ExchangeHistoryItem = {
      id: `ex-${Date.now()}`,
      timestamp: nowStr,
      hoursUsed: validHours,
      creditsReceived: earnedCredits,
      status: "สำเร็จ",
      note: `แลก ${validHours} ชม. รับ ${earnedCredits} Credits`,
    };

    // 1. Deduct hours and add credits in central players state and currentUser
    const updatedUser: ManagedUser = {
      ...currentUser,
      availableHours: currentUser.availableHours - validHours,
      credits: currentUser.credits + earnedCredits,
    };

    setCurrentUser(updatedUser);
    setPlayers((prev) => prev.map((p) => (p.id === currentUser.id ? updatedUser : p)));

    // 2. Prepend newly created history record to the top of history table immediately
    setHistory((prev) => [newHistoryItem, ...prev]);

    // 3. Log to audit
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: "Online Exchange",
        target: currentUser.username,
        details: `Redeemed ${validHours}h -> +${earnedCredits} Credits`,
        admin: "System",
        time: "เมื่อสักครู่",
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true };
  };

  // GM / Admin Action: Add Credit to Any Player in Real-time
  const addCreditsToUser = (userIdOrUsername: string, amount: number, note?: string) => {
    const validAmount = Math.floor(amount);
    if (isNaN(validAmount) || validAmount <= 0) {
      return { success: false, newCredits: 0, error: "กรุณาระบุจำนวนเครดิตที่ถูกต้องและมากกว่า 0" };
    }

    let targetUser: ManagedUser | undefined;
    let newBalance = 0;

    setPlayers((prev) => {
      const matchIndex = prev.findIndex(
        (p) => p.id === userIdOrUsername || p.username.toLowerCase() === userIdOrUsername.toLowerCase()
      );
      if (matchIndex === -1) return prev;

      targetUser = prev[matchIndex];
      newBalance = targetUser.credits + validAmount;

      const updatedTarget: ManagedUser = {
        ...targetUser,
        credits: newBalance,
      };

      const nextList = [...prev];
      nextList[matchIndex] = updatedTarget;
      return nextList;
    });

    if (!targetUser) {
      return { success: false, newCredits: 0, error: "ไม่พบผู้เล่นดังกล่าวในระบบ" };
    }

    // If target is current logged in player, update currentUser state in real time
    if (currentUser.id === targetUser.id || currentUser.username === targetUser.username) {
      setCurrentUser((prev) => ({
        ...prev,
        credits: prev.credits + validAmount,
      }));
    }

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: "Add Credit (GM)",
        target: targetUser!.username,
        details: `+${validAmount.toLocaleString()} Credits${note ? ` (${note})` : ""}`,
        admin: "admin",
        time: "เมื่อสักครู่",
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    return { success: true, newCredits: newBalance };
  };

  const updateUserStatus = (userId: string, status: "Active" | "Banned", reason?: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status, banReason: reason || p.banReason } : p))
    );
  };

  const resetAllMockData = () => {
    localStorage.removeItem(PLAYERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(LOGS_STORAGE_KEY);
    setPlayers(INITIAL_PLAYERS);
    setCurrentUser(INITIAL_PLAYERS[1]);
    setHistory(INITIAL_HISTORY);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <UserDashboardContext.Provider
      value={{
        currentUser,
        username: currentUser.username,
        email: currentUser.email,
        availableHours: currentUser.availableHours,
        credits: currentUser.credits,
        wcoin: currentUser.wcoin,
        mainCharacter: currentUser.characters.split(" ")[0] || currentUser.characters,
        history,
        players,
        auditLogs,
        loginPlayer,
        logoutPlayer,
        redeemHours,
        addCreditsToUser,
        updateUserStatus,
        resetAllMockData,
        resetMockData: resetAllMockData,
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
