import { MacroTotals } from "@/lib/types";

export const SummaryCard = ({ totals }: { totals: MacroTotals }) => {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg">
      <p className="text-xs uppercase tracking-wide text-white/80">Today&apos;s load</p>
      <p className="text-4xl font-black leading-tight">{totals.calories} kcal</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-white/70">Protein</p>
          <p className="text-xl font-semibold">{totals.protein} g</p>
        </div>
        <div>
          <p className="text-white/70">Carbs</p>
          <p className="text-xl font-semibold">{totals.carbs} g</p>
        </div>
        <div>
          <p className="text-white/70">Fat</p>
          <p className="text-xl font-semibold">{totals.fat} g</p>
        </div>
      </div>
    </section>
  );
};
