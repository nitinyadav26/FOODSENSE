"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { GuestSessionProvider } from "@/hooks/useGuestSession";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <GuestSessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </GuestSessionProvider>
  );
};
