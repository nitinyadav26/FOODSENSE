"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "foodsense_guest_id";

type GuestContextValue = {
  guestId: string | null;
  ensureGuestSession: () => Promise<string>;
  clearGuestSession: () => void;
};

const GuestSessionContext = createContext<GuestContextValue | undefined>(undefined);

export const GuestSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [guestId, setGuestId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (!guestId || typeof document === "undefined") return;
    document.cookie = `foodsense_guest_id=${guestId}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }, [guestId]);

  const persistGuest = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, id);
    if (typeof document !== "undefined") {
      document.cookie = `foodsense_guest_id=${id}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
    setGuestId(id);
  }, []);

  const ensureGuestSession = useCallback(async () => {
    if (guestId) return guestId;
    if (typeof window === "undefined") throw new Error("Guest session only available in browser");
    const newId = self.crypto?.randomUUID() ?? Math.random().toString(36).slice(2);
    persistGuest(newId);
    return newId;
  }, [guestId, persistGuest]);

  const clearGuestSession = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    if (typeof document !== "undefined") {
      document.cookie = "foodsense_guest_id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
    setGuestId(null);
  }, []);

  return (
    <GuestSessionContext.Provider value={{ guestId, ensureGuestSession, clearGuestSession }}>
      {children}
    </GuestSessionContext.Provider>
  );
};

export const useGuestSession = () => {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) {
    throw new Error("useGuestSession must be used within GuestSessionProvider");
  }
  return ctx;
};
