import Link from "next/link";
import {
  Scissors,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Users,
  Star,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Studio Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                Barber<span className="text-emerald-600 dark:text-emerald-400">Flow</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold block uppercase tracking-wider -mt-0.5">
                Modern Studio & Chairs
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/book">
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20"
              >
                Book a Chair <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Vibrant Green & Studio White Accents */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Soft emerald studio ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Modern Barbershop Management & Precision Booking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Minimalist Studio Vibe. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-green-500">
              Effortless Booking Flow.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Inspired by contemporary high-end studio spaces. Zero double-bookings, automatic service duration calculation, chair queue management, and live financial metrics.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-500/25"
              >
                Public Client Booking <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-500/50"
              >
                Open Staff Dashboard
              </Button>
            </Link>
          </div>

          {/* Demo Credentials Box */}
          <div className="mt-12 inline-block bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left max-w-md mx-auto text-xs text-slate-600 dark:text-slate-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
              Instant 1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Shop Admin:</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">admin@barberflow.com</span>
                <span className="text-emerald-600 dark:text-emerald-400 block font-mono">admin123</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Chair Barber:</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">barber@barberflow.com</span>
                <span className="text-emerald-600 dark:text-emerald-400 block font-mono">barber123</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars with Clean Modern Design */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/60 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Modern Studio Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Engineered For Busy Chairs & Clean Operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Smart Conflict Prevention
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically calculates end times based on exact service durations. Enforces operating hours and mathematically blocks double-bookings.
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Barber Companion App
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Native mobile app for barbers at the station. See today&apos;s appointments, update statuses (In Progress, Done), review customer notes, and call clients.
              </p>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Revenue & Popular Cuts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear insights into your most lucrative services, cancellation rates, barber performance, and daily income trajectories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">BarberFlow Studio Management</span>
            <span>&bull; Powered by Next.js & Neon PostgreSQL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/book" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Customer Booking
            </Link>
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
