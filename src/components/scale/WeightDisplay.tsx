import clsx from "clsx";

export const WeightDisplay = ({
  weight,
  mode,
}: {
  weight: number | null;
  mode: "idle" | "bluetooth" | "network";
}) => {
  const stateText =
    mode === "bluetooth"
      ? "Bluetooth mode"
      : mode === "network"
        ? "Online mode"
        : "Awaiting source";
  return (
    <div className="rounded-3xl bg-slate-950/40 p-5 text-center ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live weight</p>
      <p className="mt-3 text-6xl font-black text-white">{weight ?? "--"}</p>
      <p className="text-sm text-slate-400">grams</p>
      <p className={clsx("mt-2 text-xs", mode === "idle" ? "text-amber-300" : "text-emerald-300")}>{stateText}</p>
    </div>
  );
};
