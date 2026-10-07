"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Plus, Edit2, Phone, Mail, Scissors, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBarbers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/barbers?includeInactive=true");
      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
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

  const handleOpenAdd = () => {
    setSelectedBarber(null);
    setName("");
    setEmail("");
    setPhone("");
    setBio("");
    setAvatarUrl("");
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setSelectedBarber(b);
    setName(b.name);
    setEmail(b.email);
    setPhone(b.phone || "");
    setBio(b.bio || "");
    setAvatarUrl(b.avatarUrl || "");
    setIsActive(b.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email) {
      setFormError("Barber name and email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        email,
        phone,
        bio,
        avatarUrl,
        isActive,
      };

      let res;
      if (selectedBarber) {
        res = await fetch(`/api/barbers/${selectedBarber.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/barbers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save barber profile");
      }

      setIsModalOpen(false);
      fetchBarbers();
    } catch (err: any) {
      setFormError(err.message || "Failed to save barber profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (b: any) => {
    try {
      const res = await fetch(`/api/barbers/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) fetchBarbers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Barbers Roster
          </h2>
          <p className="text-sm text-slate-500">
            Manage your shop&apos;s team, assign bookings, and update active availability
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Barber
        </Button>
      </div>

      {/* Barbers Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading barbers roster..." />
      ) : barbers.length === 0 ? (
        <EmptyState
          title="No barbers listed yet"
          description="Add barbers to enable clients to book appointments with them."
          actionLabel="Add Barber"
          onAction={handleOpenAdd}
          icon={UserCheck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                b.isActive
                  ? "border-slate-200/80 shadow-sm hover:shadow-md"
                  : "border-slate-200 bg-slate-50/50 opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold overflow-hidden shrink-0 shadow-inner">
                  {b.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.avatarUrl}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-amber-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 truncate">
                      {b.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    {b.email}
                  </p>
                  {b.phone && (
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      {b.phone}
                    </p>
                  )}
                </div>
              </div>

              {b.bio && (
                <p className="text-xs text-slate-600 mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                  {b.bio}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50">
                  {b._count?.appointments || 0} lifetime bookings
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className="text-xs px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                  >
                    {b.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBarber ? "Edit Barber Profile" : "Add New Barber"}
        description="Configure staff information and public booking profile"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Barber Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Barber"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="barber@barberflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 789-0001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Bio & Specialties
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Master barber specializing in skin fades and straight razor shaves"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveBarberCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
            />
            <label htmlFor="isActiveBarberCheck" className="text-sm font-medium text-slate-700">
              Active (eligible to receive bookings)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {selectedBarber ? "Save Changes" : "Add Barber"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
