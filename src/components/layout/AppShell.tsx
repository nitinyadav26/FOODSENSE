"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { useGuestSession } from "@/hooks/useGuestSession";

const NAV_ITEMS = [
  { href: "/app", label: "Today" },
  { href: "/app/log", label: "History" },
  { href: "/app/new", label: "Log" },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const { guestId } = useGuestSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-sm text-slate-300">
        Loading your dashboard...
      </div>
    );
  }

  if (status === "unauthenticated" && !guestId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg text-slate-100">Start as a guest or log in first</p>
        <Button variant="primary" onClick={() => router.push("/")}>Go to landing</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center justify-between rounded-3xl bg-slate-900/60 px-4 py-4 ring-1 ring-white/5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">FoodSense</p>
          <p className="text-base font-semibold text-white">
            {user ? user.email : "Guest session"}
          </p>
        </div>
        {user ? (
          <Button variant="ghost" className="text-xs" onClick={logout}>
            Log out
          </Button>
        ) : (
          <Button variant="ghost" className="text-xs" onClick={() => router.push("/") }>
            Switch account
          </Button>
        )}
      </header>
      <main className="flex-1 space-y-4 pb-6">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-3xl px-6 pb-6">
        <div className="rounded-full bg-slate-900/80 px-4 py-3 text-xs text-slate-200 shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={`flex flex-1 items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-white text-slate-900" : "text-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="primary"
              className="ml-2 hidden text-xs sm:block"
              onClick={() => router.push("/app/new")}
            >
              + Log meal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
