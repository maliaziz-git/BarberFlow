"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Scissors,
  User,
  Phone,
  Clock,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentModal } from "@/components/dashboard/AppointmentModal";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBarbers = async () => {
    try {
      const res = await fetch("/api/barbers");
      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedBarberId) params.append("barberId", selectedBarberId);
      if (selectedStatus) params.append("status", selectedStatus);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, selectedBarberId, selectedStatus]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedBarberId("");
    setSelectedStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointments Management
          </h2>
          <p className="text-sm text-slate-500">
            Book, reschedule, filter, and update customer appointment statuses
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAppointment(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Date */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Barber */}
          <div>
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Barbers</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="BOOKED">BOOKED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>
        </div>

        {(selectedDate || selectedBarberId || selectedStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Appointment List / Table */}
      {isLoading ? (
        <LoadingSpinner message="Filtering appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="Try adjusting your filter criteria or schedule a new appointment."
          actionLabel="Book Appointment"
          onAction={() => {
            setEditingAppointment(null);
            setIsModalOpen(true);
          }}
          icon={CalendarIcon}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Barber</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const start = new Date(appt.startTime);
                  const end = new Date(appt.endTime);
                  const isBusy = actionLoadingId === appt.id;

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {format(start, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {format(start, "hh:mm a")} - {format(end, "hh:mm a")}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {appt.customer?.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {appt.customer?.phone}
                        </div>
                      </td>

                      {/* Barber */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {appt.barber?.name}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {appt.service?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {appt.service?.durationMinutes} mins
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900">
                        {formatCurrency(appt.priceAtBooking)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={appt.status}
                          disabled={isBusy}
                          onChange={(e) => handleStatusUpdate(appt.id, e.target.value)}
                          className="text-xs font-semibold rounded-md border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                        >
                          <option value="BOOKED">BOOKED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="NO_SHOW">NO_SHOW</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Reschedule / Edit"
                            onClick={() => {
                              setEditingAppointment(appt);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {appt.status !== "CANCELLED" && (
                            <button
                              title="Cancel"
                              disabled={isBusy}
                              onClick={() => handleDelete(appt.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Modal for Create & Reschedule */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchAppointments}
        editingAppointment={editingAppointment}
      />
    </div>
  );
}
