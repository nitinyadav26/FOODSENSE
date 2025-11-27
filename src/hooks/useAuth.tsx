"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthenticatedUser } from "@/lib/types";
import { useGuestSession } from "./useGuestSession";

type AuthStatus = "loading" | "authenticated" | "guest" | "unauthenticated";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login: (payload: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { guestId } = useGuestSession();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setStatus(guestId ? "guest" : "unauthenticated");
        return;
      }
      const data = await res.json();
      setUser(data);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus(guestId ? "guest" : "unauthenticated");
    }
  }, [guestId]);

  useEffect(() => {
    const id = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(id);
  }, [refresh]);

  const postJson = useCallback(
    async (url: string, payload: object) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      return { ok: res.ok, data };
    },
    []
  );

  const login = useCallback<Required<AuthContextValue>["login"]>(
    async (payload) => {
      const result = await postJson("/api/auth/login", payload);
      if (result.ok) {
        setUser(result.data.user);
        setStatus("authenticated");
        return { success: true };
      }
      return { success: false, message: result.data?.message || "Login failed" };
    },
    [postJson]
  );

  const register = useCallback<Required<AuthContextValue>["register"]>(
    async (payload) => {
      const result = await postJson("/api/auth/register", payload);
      if (result.ok) {
        setUser(result.data.user);
        setStatus("authenticated");
        return { success: true };
      }
      return { success: false, message: result.data?.message || "Registration failed" };
    },
    [postJson]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus(guestId ? "guest" : "unauthenticated");
  }, [guestId]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refresh }),
    [login, logout, refresh, register, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
