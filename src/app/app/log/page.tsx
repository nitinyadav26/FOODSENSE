"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MealHistoryList } from "@/components/meal/MealHistoryList";
import { useGuestSession } from "@/hooks/useGuestSession";
import { useAuth } from "@/hooks/useAuth";
import { MacroTotals, MealRecord } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

const macroTargets: MacroTotals = {
  calories: 2100,
  protein: 120,
  carbs: 250,
  fat: 70,
  fiber: 30,
};

type MealsPayload = {
  meals: MealRecord[];
  totals: MacroTotals;
  date: string;
};

export default function HistoryPage() {
  const { guestId } = useGuestSession();
  const { user, status } = useAuth();
  const [selectedDate, setSelectedDate] = useState(today());
  const [payload, setPayload] = useState<MealsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    if (status === "loading") return;
    if (!user && !guestId) return;
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      if (!user && guestId) headers["x-guest-id"] = guestId;
      const res = await fetch(`/api/meals?date=${selectedDate}`, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPayload(data);
      }
    } finally {
      setLoading(false);
    }
  }, [guestId, selectedDate, status, user]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const macroProgress = useMemo(() => {
    if (!payload) return [];
    return (
      Object.entries(payload.totals) as [keyof MacroTotals, number][]
    ).map(([key, value]) => {
      const target = macroTargets[key];
      const percent = Math.min(100, Math.round((value / target) * 100));
      return { key, value, target, percent };
    });
  }, [payload]);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">History</p>
            <h2 className="text-2xl font-semibold text-white">{payload?.date || selectedDate}</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white"
          />
        </div>
        <div className="space-y-3">
          {macroProgress.map((macro) => (
            <div key={macro.key}>
              <div className="flex justify-between text-xs text-slate-400">
                <span className="capitalize">{macro.key}</span>
                <span>
                  {macro.value}/{macro.target}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${macro.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <h3 className="text-xl font-semibold text-white">Meals</h3>
        {loading ? (
          <p className="text-sm text-slate-300">Loading history...</p>
        ) : payload ? (
          <MealHistoryList meals={payload.meals} />
        ) : (
          <p className="text-sm text-slate-300">No meals for this day.</p>
        )}
      </section>
    </div>
  );
}
