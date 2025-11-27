"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { useLiveWeight } from "@/hooks/useLiveWeight";
import { useGuestSession } from "@/hooks/useGuestSession";
import { NutritionAnalysis } from "@/lib/types";
import { BluetoothConnectButton } from "@/components/scale/BluetoothConnectButton";
import { WeightDisplay } from "@/components/scale/WeightDisplay";
import { NutritionResultCard } from "@/components/meal/NutritionResultCard";
import { CameraCapture } from "@/components/meal/CameraCapture";

const mealOptions = ["breakfast", "lunch", "dinner", "snack"] as const;

type AnalyzeResponse = {
  analysis: NutritionAnalysis;
  weightGrams: number;
  mealType?: string;
  notes?: string;
  imageUrl?: string;
};

export const MealForm = () => {
  const {
    weight,
    mode,
    error: weightError,
    isConnecting,
    bluetoothAvailable,
    connectBluetooth,
    startNetworkPolling,
  } = useLiveWeight();
  const { guestId, ensureGuestSession } = useGuestSession();
  const [manualWeight, setManualWeight] = useState<number | null>(null);
  const [mealType, setMealType] = useState<(typeof mealOptions)[number] | "">("");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (weight && !manualWeight) {
      setManualWeight(weight);
    }
  }, [manualWeight, weight]);

  const displayWeight = useMemo(() => manualWeight ?? weight ?? 0, [manualWeight, weight]);

  const handlePhotoCapture = (file: File, previewUrl: string) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  const ensureSessionHeaders = async () => {
    const headers: Record<string, string> = {};
    const id = guestId ?? (await ensureGuestSession());
    if (id) headers["x-guest-id"] = id;
    return headers;
  };

  const analyzeMeal = async () => {
    if (!photoFile && !photoPreview) {
      setMessage("Please capture a photo before analyzing");
      return;
    }
    if (!displayWeight) {
      setMessage("Weight is required");
      return;
    }
    setMessage(null);
    setIsAnalyzing(true);
    const form = new FormData();
    form.append("weight_grams", String(displayWeight));
    if (photoFile) form.append("image", photoFile);
    if (mealType) form.append("meal_type", mealType);
    if (notes) form.append("notes", notes);
    try {
      const headers = await ensureSessionHeaders();
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        body: form,
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || "Unable to analyze meal");
        return;
      }
      setAnalysis(data as AnalyzeResponse);
      setMessage("AI analysis ready. Save it to your log.");
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!analysis) {
      setMessage("Analyze a meal first");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const headers = await ensureSessionHeaders();
      headers["Content-Type"] = "application/json";
      const res = await fetch("/api/meals", {
        method: "POST",
        headers,
        body: JSON.stringify({
          weightGrams: displayWeight,
          mealType,
          notes,
          analysis: analysis.analysis,
          imageUrl: analysis.imageUrl || photoPreview,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || "Unable to save meal");
        return;
      }
      setMessage("Meal saved to history ✅");
      setAnalysis(null);
      setNotes("");
      setMealType("");
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch {
      setMessage("Offline? Try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Scale</p>
            <h2 className="text-xl font-semibold text-white">Connect to your FoodSense</h2>
          </div>
        </div>
        <WeightDisplay weight={weight} mode={mode} />
        <BluetoothConnectButton supported={bluetoothAvailable} onConnect={connectBluetooth} isConnecting={isConnecting} />
        <Button variant="secondary" fullWidth onClick={startNetworkPolling}>
          Use Wi-Fi mode
        </Button>
        {weightError && <p className="text-xs text-amber-300">{weightError}</p>}
      </section>

      <section className="space-y-4 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Camera</p>
            <h2 className="text-xl font-semibold text-white">Stream and snap your plate</h2>
          </div>
        </div>
        <CameraCapture onCapture={handlePhotoCapture} />
        {photoPreview ? (
          <Image
            src={photoPreview}
            alt="Meal preview"
            width={800}
            height={400}
            unoptimized
            className="h-48 w-full rounded-3xl object-cover"
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-white/20 px-4 py-10 text-center text-sm text-white/60">
            <p>Tap “Capture photo” to freeze the current frame or upload from files.</p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/5">
        <div>
          <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Meal type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {mealOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMealType(option)}
                className={`rounded-full px-4 py-2 text-sm capitalize ${
                  mealType === option ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white focus:border-emerald-400 focus:outline-none"
            rows={3}
            placeholder="Add ingredients, mood, etc."
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Adjust weight (g)</label>
          <input
            type="number"
            value={manualWeight ?? weight ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setManualWeight(value ? Number(value) : null);
            }}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-lg text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={analyzeMeal} disabled={isAnalyzing} fullWidth>
            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
          </Button>
          {analysis && (
            <Button variant="ghost" onClick={saveMeal} disabled={saving} fullWidth>
              {saving ? "Saving..." : "Save to log"}
            </Button>
          )}
        </div>
        {message && <p className="text-xs text-emerald-200">{message}</p>}
      </section>

      {analysis && <NutritionResultCard analysis={analysis.analysis} />}
    </div>
  );
};
