import { MealRecord } from "@/lib/types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export const MealHistoryList = ({ meals }: { meals: MealRecord[] }) => {
  if (!meals.length) {
    return (
      <div className="rounded-3xl bg-slate-900/60 p-6 text-center text-sm text-slate-300">
        No meals logged yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {meals.map((meal) => (
        <li key={meal.id} className="rounded-3xl bg-slate-900/70 p-4 ring-1 ring-white/5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
            <span>{meal.mealType || "Meal"}</span>
            <span>{timeFormatter.format(new Date(meal.timestamp))}</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-white">
            {meal.analysis.mealName}
          </p>
          <p className="text-sm text-slate-300">{meal.analysis.summary}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>{meal.weightGrams} g</span>
            <span>{meal.analysis.totals.calories} kcal</span>
            <span>Protein {meal.analysis.totals.protein} g</span>
            <span>Carbs {meal.analysis.totals.carbs} g</span>
            <span>Fat {meal.analysis.totals.fat} g</span>
          </div>
        </li>
      ))}
    </ul>
  );
};
