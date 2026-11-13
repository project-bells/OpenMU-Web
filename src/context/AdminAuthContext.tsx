import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { fetchAdminSession, loginAdmin, logoutAdmin } from "../services/dbApi";

export interface AdminUserSession {
  username: string;
  loginName: string;
  role: string;
  roles: string[];
}

interface AdminAuthContextType {
  user: AdminUserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    twoFactorCode?: string,
    isRecoveryCode?: boolean
  ) => Promise<{ ok: boolean; error?: string; code?: string }>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

function mapAdminSession(admin: { loginName: string; roles: string[] }): AdminUserSession {
  const roles = Array.isArray(admin.roles) ? admin.roles : [];
  return {
    username: admin.loginName,
    loginName: admin.loginName,
    role: roles[0] || "GameMaster",
    roles,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const session = await fetchAdminSession();
      setUser(session?.authenticated && session.admin ? mapAdminSession(session.admin) : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (
      username: string,
      password: string,
      twoFactorCode?: string,
      isRecoveryCode = false
    ): Promise<{ ok: boolean; error?: string; code?: string }> => {
      const trimmed = username.trim();
      if (!trimmed || !password) {
        return { ok: false, error: "กรุณากรอก Username และ Password ให้ครบถ้วน" };
      }

      const res = await loginAdmin(trimmed, password, twoFactorCode, isRecoveryCode);
      if (res.success && res.admin) {
        setUser(mapAdminSession(res.admin));
        return { ok: true };
      }
      return {
        ok: false,
        error: res.error || "ชื่อผู้ใช้หรือรหัสผ่าน Admin ไม่ถูกต้อง หรือบัญชีไม่มีสิทธิ์ GM",
        code: res.code,
      };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // Clear local session state even if network logout fails
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
