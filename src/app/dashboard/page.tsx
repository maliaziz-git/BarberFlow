"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Users,
  Scissors,
  Clock,
  TrendingUp,
  CheckCircle2,
  Phone,
  User,
  ArrowRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { AppointmentModal } from "@/components/dashboard/AppointmentModal";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleAppointmentCreated = () => fetchStats();
    window.addEventListener("appointment-created", handleAppointmentCreated);
    return () =>
      window.removeEventListener("appointment-created", handleAppointmentCreated);
  }, []);

  const handleQuickStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard metrics..." />;
  }

  const role = stats?.role || "ADMIN";
  const todayList = stats?.todayAppointments || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            {role === "ADMIN" ? "Shop Performance Overview" : `Barber Dashboard: ${stats?.barberName || "Alex"}`}
          </span>
          <h2 className="text-2xl font-bold mt-2 tracking-tight">
            Today is {format(new Date(), "EEEE, MMMM d, yyyy")}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            You have <strong className="text-white font-semibold">{stats?.todayAppointmentsCount || 0} appointments</strong> scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Quick Booking
          </Button>
          <Link href="/book" target="_blank">
            <Button variant="outline" className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700">
              Customer View
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle={`Today: ${formatCurrency(stats?.todayRevenue || 0)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Today's Bookings"
          value={stats?.todayAppointmentsCount || 0}
          subtitle={`Total Lifetime: ${stats?.totalAppointments || 0}`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Clients"
          value={stats?.totalCustomers || 0}
          subtitle="Registered customer profiles"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Active Barbers"
          value={stats?.totalBarbers || 0}
          subtitle="Ready for appointments"
          icon={Scissors}
          color="purple"
        />
      </div>

      {/* Status Breakdown Pills */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Appointment Status Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Booked", key: "BOOKED", variant: "BOOKED" as const },
            { label: "Confirmed", key: "CONFIRMED", variant: "CONFIRMED" as const },
            { label: "In Progress", key: "IN_PROGRESS", variant: "IN_PROGRESS" as const },
            { label: "Completed", key: "COMPLETED", variant: "COMPLETED" as const },
            { label: "Cancelled", key: "CANCELLED", variant: "CANCELLED" as const },
            { label: "No Show", key: "NO_SHOW", variant: "NO_SHOW" as const },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col items-start gap-1"
            >
              <Badge variant={item.variant} size="sm">
                {item.label}
              </Badge>
              <span className="text-xl font-bold text-slate-800 mt-1">
                {stats?.statusCounts?.[item.key] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Live List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today&apos;s Appointments</h3>
            <p className="text-xs text-slate-500">
              Live queue for today with real-time status controls
            </p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Full Calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No appointments scheduled for today"
              description="Your chair is open! Book an appointment manually or share your public booking link with clients."
              actionLabel="Book First Appointment"
              onAction={() => setIsModalOpen(true)}
              icon={Calendar}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayList.map((appt: any) => {
              const startTime = format(new Date(appt.startTime), "hh:mm a");
              const endTime = format(new Date(appt.endTime), "hh:mm a");
              const isUpdating = updatingId === appt.id;

              return (
                <div
                  key={appt.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 text-center py-2 px-1 bg-amber-50 border border-amber-200/60 rounded-xl shrink-0">
                      <span className="block text-xs font-bold text-amber-800 uppercase">
                        {startTime.split(" ")[1]}
                      </span>
                      <span className="block text-sm font-black text-amber-950">
                        {startTime.split(" ")[0]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {appt.customer?.name}
                        </span>
                        <Badge variant={appt.status}>{appt.status}</Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Scissors className="w-3.5 h-3.5 text-amber-600" />
                          {appt.service?.name} ({appt.service?.durationMinutes}m • ${appt.priceAtBooking})
                        </span>
                        {role === "ADMIN" && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Barber: <strong className="text-slate-700">{appt.barber?.name}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {appt.customer?.phone}
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-amber-900/80 italic bg-amber-50/50 px-2 py-0.5 rounded inline-block">
                          Note: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {appt.status === "BOOKED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={isUpdating}
                        onClick={() => handleQuickStatus(appt.id, "CONFIRMED")}
                      >
                        Confirm
                      </Button>
                    )}
                    {(appt.status === "CONFIRMED" || appt.status === "BOOKED") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={isUpdating}
                        onClick={() => handleQuickStatus(appt.id, "IN_PROGRESS")}
                      >
                        Start Service
                      </Button>
                    )}
                    {appt.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        isLoading={isUpdating}
                        onClick={() => handleQuickStatus(appt.id, "COMPLETED")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleQuickStatus(appt.id, "CANCELLED")}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
}
