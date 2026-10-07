"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { format, parseISO } from "date-fns";
import { AlertCircle, Clock, Check, Calendar as CalendarIcon, User, Scissors } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

interface Barber {
  id: string;
  name: string;
  isActive: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBarberId?: string;
  editingAppointment?: any;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialBarberId,
  editingAppointment,
}) => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form states
  const [barberId, setBarberId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Customer Mode: 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("CONFIRMED");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load initial options
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBarbers(data);
          if (!barberId && data.length > 0) {
            setBarberId(initialBarberId || data[0].id);
          }
        }
      })
      .catch(console.error);

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
          if (!serviceId && data.length > 0) {
            setServiceId(data[0].id);
          }
        }
      })
      .catch(console.error);

    fetch("/api/customers?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      })
      .catch(console.error);

    // If editing
    if (editingAppointment) {
      setBarberId(editingAppointment.barberId);
      setServiceId(editingAppointment.serviceId);
      const apptDate = new Date(editingAppointment.startTime);
      setDateStr(format(apptDate, "yyyy-MM-dd"));
      setSelectedSlot(format(apptDate, "HH:mm"));
      setCustomerMode("existing");
      setCustomerId(editingAppointment.customerId);
      setNotes(editingAppointment.notes || "");
      setStatus(editingAppointment.status);
    } else {
      setSelectedSlot("");
      setNotes("");
      setStatus("CONFIRMED");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
    }
  }, [isOpen, editingAppointment, initialBarberId]);

  // Fetch slots whenever barber, service, or date changes
  useEffect(() => {
    if (!barberId || !serviceId || !dateStr) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    fetch(`/api/appointments/availability?barberId=${barberId}&serviceId=${serviceId}&date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots);
          // If editing and selectedSlot was the current time, make sure it's selectable
          if (editingAppointment) {
            const currentEditTime = format(new Date(editingAppointment.startTime), "HH:mm");
            if (dateStr === format(new Date(editingAppointment.startTime), "yyyy-MM-dd")) {
              setAvailableSlots((prev) =>
                prev.map((s) => (s.time === currentEditTime ? { ...s, available: true } : s))
              );
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching slots:", err))
      .finally(() => setIsLoadingSlots(false));
  }, [barberId, serviceId, dateStr, editingAppointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSlot) {
      setErrorMsg("Please choose an available appointment time slot.");
      return;
    }

    if (customerMode === "existing" && !customerId) {
      setErrorMsg("Please select an existing customer.");
      return;
    }

    if (customerMode === "new" && (!customerName || !customerPhone)) {
      setErrorMsg("Customer name and phone number are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = `${dateStr}T${selectedSlot}:00`;

      if (editingAppointment) {
        // Update existing appointment
        const res = await fetch(`/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barberId,
            serviceId,
            startTime,
            status,
            notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update appointment");
        }
      } else {
        // Create new appointment
        const payload: any = {
          barberId,
          serviceId,
          startTime,
          status,
          notes,
        };

        if (customerMode === "existing") {
          payload.customerId = customerId;
        } else {
          payload.customerName = customerName;
          payload.customerPhone = customerPhone;
          payload.customerEmail = customerEmail;
        }

        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create appointment");
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAppointment ? "Reschedule / Edit Appointment" : "Book New Appointment"}
      description="Select barber, service, date, and verified conflict-free time slot."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Barber & Service Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Barber
            </label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              required
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {!b.isActive ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (${s.price} • {s.durationMinutes}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Date & Time Selection */}
        <div className="border border-slate-100 bg-slate-50/60 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
              Appointment Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Available Slots {selectedService && `(${selectedService.durationMinutes} min)`}
              </span>
              {isLoadingSlots && (
                <span className="text-xs text-amber-600 font-medium">Checking schedule...</span>
              )}
            </div>

            {availableSlots.length === 0 && !isLoadingSlots ? (
              <p className="text-xs text-slate-500 italic py-2">
                No slots available on this date or shop is closed.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                        isSelected
                          ? "bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-300"
                          : slot.available
                          ? "bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50"
                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Customer Info */}
        {!editingAppointment && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setCustomerMode("new")}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  customerMode === "new"
                    ? "bg-amber-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + New Customer
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode("existing")}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  customerMode === "existing"
                    ? "bg-amber-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Select Existing Customer
              </button>
            </div>

            {customerMode === "existing" ? (
              <div>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                >
                  <option value="">-- Choose existing customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Customer Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <input
                  type="email"
                  placeholder="Email Address (optional)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* 4. Status and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="BOOKED">BOOKED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Skin fade preferences, allergies"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {editingAppointment ? "Update Appointment" : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
