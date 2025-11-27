import { MealForm } from "@/components/meal/MealForm";

export default function NewMealPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Log</p>
        <h1 className="text-3xl font-semibold text-white">New meal</h1>
        <p className="text-sm text-slate-300">Connect to your scale, capture a plate, and let FoodSense analyze it.</p>
      </header>
      <MealForm />
    </div>
  );
}
