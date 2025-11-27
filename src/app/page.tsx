"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useGuestSession } from "@/hooks/useGuestSession";

const features = [
  {
    title: "Instant macros",
    body: "Capture weight + photo and let Gemini-ready pipelines estimate calories and micros in seconds.",
  },
  {
    title: "Guest friendly",
    body: "Use the scale without an account. Your meals stay in a local guest ID that can migrate later.",
  },
  {
    title: "PWA ready",
    body: "Install FoodSense to your home screen for a native-like experience across platforms.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { ensureGuestSession } = useGuestSession();

  const handleGuest = async () => {
    await ensureGuestSession();
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="rounded-3xl bg-slate-900/60 p-8 text-center ring-1 ring-white/10">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">FoodSense</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            Smart food scale meets AI nutrition
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Pair your BLE/Wi-Fi scale with computer vision to log meals in seconds. Designed as a mobile-first PWA
            that works even when you skip sign up.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={handleGuest} fullWidth>
              Continue without account
            </Button>
            <Button variant="secondary" fullWidth onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button variant="ghost" fullWidth onClick={() => router.push("/signup")}>
              Sign up
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl bg-slate-900/50 p-5 ring-1 ring-white/5">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/5">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. Connect your ESP32-powered scale via Bluetooth or fall back to Wi-Fi polling.</li>
            <li>2. Snap a photo of the plate using your device camera.</li>
            <li>3. FoodSense forwards weight + image to the AI backend for macro + micro estimation.</li>
            <li>4. Save the entry locally (guest) or to your authenticated cloud profile.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
