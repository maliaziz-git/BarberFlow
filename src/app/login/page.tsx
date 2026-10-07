"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Lock, Mail, AlertCircle, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store in localStorage for mobile/client API consumption
      if (data.token) {
        localStorage.setItem("barberflow_token", data.token);
        localStorage.setItem("barberflow_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo login failed");
      }

      if (data.token) {
        localStorage.setItem("barberflow_token", data.token);
        localStorage.setItem("barberflow_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Scissors className="w-6 h-6 -rotate-45" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Barber<span className="text-emerald-400">Flow</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-slate-200">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Access the BarberFlow management dashboard & queue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 backdrop-blur-md">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@barberflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-3">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("admin@barberflow.com", "admin123")
                }
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin("barber@barberflow.com", "barber123")
                }
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                Demo Barber
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to BarberFlow Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
