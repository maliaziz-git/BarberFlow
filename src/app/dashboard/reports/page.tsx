"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Scissors,
  Award,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Generating business intelligence reports..." />;
  }

  const summary = data?.summary || {
    totalAppointments: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    totalRevenue: 0,
    completionRate: 0,
  };

  const popularServices = data?.popularServices || [];
  const barberPerformance = data?.barberPerformance || [];
  const dailyTrend = data?.dailyTrend || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Performance & Revenue Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Financial performance, completion rates, and service popularity metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Realized Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtitle="From completed bookings"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Completed Appointments"
          value={summary.completedCount}
          subtitle={`Out of ${summary.totalAppointments} total`}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Completion Rate"
          value={`${summary.completionRate}%`}
          subtitle="Fulfilled client bookings"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Cancellations & No-Shows"
          value={summary.cancelledCount + summary.noShowCount}
          subtitle={`${summary.cancelledCount} cancelled, ${summary.noShowCount} no-show`}
          icon={XCircle}
          color="slate"
        />
      </div>

      {/* Popular Services Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Most Popular Services
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ranked by Demand
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4">Revenue Earned</th>
                <th className="py-3 px-4">% of Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {popularServices.map((service: any, index: number) => {
                const percent =
                  summary.totalRevenue > 0
                    ? Math.round((service.revenue / summary.totalRevenue) * 100)
                    : 0;
                return (
                  <tr key={service.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-400 dark:text-slate-500">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {service.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {service.count} appointments
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(service.revenue)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {percent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Barber Breakdown & 14-Day Activity Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barber Revenue Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Barber Contribution
          </h3>
          <div className="space-y-4">
            {barberPerformance.map((b: any) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {b.appointments} appointments fulfilled
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                    {formatCurrency(b.revenue)}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    Revenue
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 14-Day Daily Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Past 14-Days Activity Summary
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
            {dailyTrend.map((d: any) => (
              <div
                key={d.date}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">{d.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 dark:text-slate-400">{d.count} appointments</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(d.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
