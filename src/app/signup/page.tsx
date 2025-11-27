"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await register({ email, password });
    if (!result.success) {
      setMessage(result.message || "Unable to sign up");
    } else {
      router.push("/app");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-3xl bg-slate-900/70 p-6 ring-1 ring-white/5">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">FoodSense</p>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-sm text-slate-300">Migrate your guest meals anytime.</p>
        </header>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white focus:border-emerald-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white focus:border-emerald-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Creating..." : "Create account"}
          </Button>
          {message && <p className="text-center text-xs text-amber-300">{message}</p>}
        </form>
        <p className="text-center text-sm text-slate-300">
          Already have an account? <Link href="/login" className="text-emerald-300 underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
