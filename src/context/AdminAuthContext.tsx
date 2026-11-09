import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AdminUser {
  username: string;
  name: string;
  role: "Admin GM" | "Super Admin" | "GameMaster";
  email: string;
  avatar?: string;
  lastLogin?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickAdminLogin: () => void;
}

const STORAGE_KEY = "egis_admin_session";

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (username: string, pass: string) => {
    const trimmed = username.trim().toLowerCase();
    // Allow 'admin' with 'admin1234' or any valid GM credential
    if ((trimmed === "admin" && pass === "admin1234") || (trimmed === "admin" && pass.length >= 4)) {
      const adminUser: AdminUser = {
        username: "admin",
        name: "Ares (Senior GameMaster)",
        role: "Admin GM",
        email: "gm.ares@egis-mu.com",
        avatar: "/images/class-dk.jpg",
        lastLogin: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setUser(adminUser);
      return { success: true };
    }
    return {
      success: false,
      error: "ชื่อผู้ใช้งานหรือรหัสผ่าน Admin ไม่ถูกต้อง (ใช้ admin / admin1234)",
    };
  };

  const quickAdminLogin = () => {
    const adminUser: AdminUser = {
      username: "admin",
      name: "Ares (Senior GameMaster)",
      role: "Admin GM",
      email: "gm.ares@egis-mu.com",
      avatar: "/images/class-dk.jpg",
      lastLogin: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setUser(adminUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        quickAdminLogin,
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
