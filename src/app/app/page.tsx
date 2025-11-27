"use client";

import { useCallback, useEffect, useState } from "react";
import { SummaryCard } from "@/components/meal/SummaryCard";
import { MealHistoryList } from "@/components/meal/MealHistoryList";
import { Button } from "@/components/common/Button";
import { useGuestSession } from "@/hooks/useGuestSession";
import { useAuth } from "@/hooks/useAuth";
import { MacroTotals, MealRecord } from "@/lib/types";
import { useRouter } from "next/navigation";

const todayString = () => new Date().toISOString().slice(0, 10);

type MealsPayload = {
  meals: MealRecord[];
  totals: MacroTotals;
  date: string;
};

export default function AppHomePage() {
  const router = useRouter();
  const { guestId } = useGuestSession();
  const { user, status } = useAuth();
  const [payload, setPayload] = useState<MealsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    if (status === "loading") return;
    if (!user && !guestId) return;
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      if (!user && guestId) headers["x-guest-id"] = guestId;
      const res = await fetch(`/api/meals?date=${todayString()}`, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPayload(data);
      }
    } finally {
      setLoading(false);
    }
  }, [guestId, status, user]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Today</p>
          <h2 className="text-2xl font-semibold text-white">{payload?.date || todayString()}</h2>
        </div>
        <Button variant="primary" onClick={() => router.push("/app/new") }>
          + Log a meal
        </Button>
      </div>
      {payload ? <SummaryCard totals={payload.totals} /> : null}
      <section className="space-y-4 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <header className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Latest meals</h3>
          <span className="text-xs text-slate-400">Live from your account</span>
        </header>
        {loading ? (
          <p className="text-sm text-slate-300">Loading meals...</p>
        ) : payload ? (
          <MealHistoryList meals={payload.meals.slice(0, 3)} />
        ) : (
          <p className="text-sm text-slate-300">Connect your scale and start logging.</p>
        )}
      </section>
    </div>
  );
}
