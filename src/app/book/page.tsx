"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { format, addDays } from "date-fns";

export default function PublicBookingPage() {
  const [step, setStep] = useState<number>(1);

  // Shop & Data
  const [settings, setSettings] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Selections
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Customer Contact Info
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Load shop settings, services, and barbers
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, servicesRes, barbersRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/services"),
          fetch("/api/barbers"),
        ]);
        const [settingsData, servicesData, barbersData] = await Promise.all([
          settingsRes.json(),
          servicesRes.json(),
          barbersRes.json(),
        ]);

        setSettings(settingsData);
        setServices(servicesData);
        setBarbers(barbersData);
      } catch (err) {
        console.error("Error loading booking catalog:", err);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Fetch slots whenever barber, service, or date changes in Step 3
  useEffect(() => {
    if (!selectedService || !selectedBarber || !selectedDate) return;

    setIsLoadingSlots(true);
    setSelectedSlot("");
    setErrorMsg(null);

    fetch(
      `/api/appointments/availability?barberId=${selectedBarber.id}&serviceId=${selectedService.id}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots);
        } else {
          setAvailableSlots([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableSlots([]);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [selectedService, selectedBarber, selectedDate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !phone) {
      setErrorMsg("Please provide your name and contact phone number.");
      return;
    }

    if (!selectedSlot) {
      setErrorMsg("Please select a time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = `${selectedDate}T${selectedSlot}:00`;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          startTime,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          notes: notes || null,
          status: "BOOKED",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm appointment");
      }

      setConfirmedBooking(data);
      setStep(5); // Confirmation view
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete appointment booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <LoadingSpinner message="Loading BarberFlow booking schedule..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:bg-amber-400 transition-colors">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                Barber<span className="text-amber-400">Flow</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {settings?.shopName || "Artisan Barber Studio"}
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Main Booking Container */}
      <main className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        {step < 5 && (
          <div className="text-center mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Step {step} of 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              {step === 1 && "Choose Your Service"}
              {step === 2 && "Select Your Barber"}
              {step === 3 && "Pick Date & Time"}
              {step === 4 && "Confirm Your Details"}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              {step === 1 && "Explore our premium grooming and styling services."}
              {step === 2 && "Choose your preferred craftsman or stylist."}
              {step === 3 && "Select from real-time conflict-free open chair slots."}
              {step === 4 && "Enter your contact info to secure your chair."}
            </p>
          </div>
        )}

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => {
                const isSelected = selectedService?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-white"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-white">{s.name}</h3>
                      <span className="font-extrabold text-amber-400 text-base">
                        {formatCurrency(s.price)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {s.description || "Classic artisan haircut with premium styling finish."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {formatDuration(s.durationMinutes)}
                      </span>
                      {isSelected ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          Selected <CheckCircle className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-slate-500 group-hover:text-slate-300">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6">
              <Button
                size="lg"
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="w-full sm:w-auto"
              >
                Continue to Barber <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT BARBER */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {barbers.map((b) => {
                const isSelected = selectedBarber?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBarber(b)}
                    className={`cursor-pointer rounded-2xl p-5 border text-center transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-amber-500/50 overflow-hidden mb-3 flex items-center justify-center">
                      {b.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.avatarUrl}
                          alt={b.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-amber-400" />
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base">{b.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {b.bio || "Master barber specializing in traditional cuts & fades."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {isSelected ? (
                        <span className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
                          Selected <CheckCircle className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Choose Barber</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="lg"
                disabled={!selectedBarber}
                onClick={() => setStep(3)}
              >
                Pick Date & Time <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PICK DATE & TIME */}
        {step === 3 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Date selection bar */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const d = addDays(new Date(), offset);
                  const formatted = format(d, "yyyy-MM-dd");
                  const isCurDate = selectedDate === formatted;

                  return (
                    <button
                      key={formatted}
                      type="button"
                      onClick={() => setSelectedDate(formatted)}
                      className={`px-4 py-3 rounded-xl border text-center shrink-0 transition-all ${
                        isCurDate
                          ? "bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-semibold">
                        {format(d, "EEE")}
                      </span>
                      <span className="block text-base font-bold">
                        {format(d, "d MMM")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Available Slots for {selectedBarber?.name} ({selectedService?.durationMinutes} min)
                </span>
                {isLoadingSlots && (
                  <span className="text-xs text-amber-400 animate-pulse">
                    Calculating availability...
                  </span>
                )}
              </div>

              {availableSlots.length === 0 && !isLoadingSlots ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-400">
                    No available time slots on this date. The shop may be closed or the barber is fully booked.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400"
                            : slot.available
                            ? "bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-400 hover:text-white"
                            : "bg-slate-950/60 border-slate-800/40 text-slate-600 line-through cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                size="lg"
                disabled={!selectedSlot}
                onClick={() => setStep(4)}
              >
                Client Details <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CLIENT CONTACT DETAILS & SUBMIT */}
        {step === 4 && (
          <form
            onSubmit={handleConfirmBooking}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Booking Summary Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Service:</span>
                <span className="font-bold text-white">
                  {selectedService?.name} ({selectedService?.durationMinutes}m)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Barber:</span>
                <span className="font-bold text-white">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Appointment Time:</span>
                <span className="font-bold text-amber-400">
                  {format(new Date(`${selectedDate}T00:00:00`), "MMMM d, yyyy")} at {selectedSlot}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-2">
                <span>Total Due at Counter:</span>
                <span className="font-extrabold text-lg text-emerald-400">
                  {formatCurrency(selectedService?.price || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. (555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Special Notes or Style Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Low skin fade, beard sculpting, sensitive neck"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(3)}
                className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button type="submit" size="lg" isLoading={isSubmitting}>
                Complete Booking <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 5: INSTANT CONFIRMATION */}
        {step === 5 && confirmedBooking && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Booking Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                You&apos;re All Set, {name}!
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                We have reserved your appointment chair at {settings?.shopName}.
              </p>
            </div>

            <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 text-left space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Service:</span>
                <span className="font-bold text-white">
                  {confirmedBooking.service?.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Barber:</span>
                <span className="font-bold text-white">
                  {confirmedBooking.barber?.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Date & Time:</span>
                <span className="font-bold text-amber-400">
                  {format(new Date(confirmedBooking.startTime), "EEEE, MMMM d, yyyy 'at' hh:mm a")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2">
                <span>Status:</span>
                <span className="font-bold text-blue-400 uppercase">
                  {confirmedBooking.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedBarber(null);
                  setSelectedSlot("");
                  setConfirmedBooking(null);
                }}
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white"
              >
                Book Another Appointment
              </Button>
              <Link href="/">
                <Button className="w-full sm:w-auto">Return to Home</Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} {settings?.shopName || "BarberFlow"}. {settings?.address} &bull; {settings?.phone}
        </p>
      </footer>
    </div>
  );
}
