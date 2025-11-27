import { NutritionAnalysis } from "@/lib/types";

export const NutritionResultCard = ({ analysis }: { analysis: NutritionAnalysis }) => {
  return (
    <section className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200 ring-1 ring-white/10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">AI result</p>
          <h3 className="text-xl font-semibold text-white">{analysis.mealName}</h3>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
          {analysis.totals.calories} kcal
        </span>
      </header>
      <p className="mt-2 text-slate-300">{analysis.summary}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-center text-base text-white sm:grid-cols-4">
        {([
          ["Protein", analysis.totals.protein],
          ["Carbs", analysis.totals.carbs],
          ["Fat", analysis.totals.fat],
          ["Fiber", analysis.totals.fiber],
        ] as const).map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-950/40 p-3">
            <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="text-lg font-semibold">{value} g</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 space-y-2">
        {analysis.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-950/30 px-4 py-3">
            <div>
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-xs text-slate-400">{item.calories} kcal</p>
            </div>
            <p className="text-xs text-slate-400">
              {item.protein ?? 0}p · {item.carbs ?? 0}c · {item.fat ?? 0}f
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
