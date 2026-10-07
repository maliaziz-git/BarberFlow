"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Edit2, Trash2, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDuration } from "@/lib/utils";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/services?includeInactive=true");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setSelectedService(null);
    setName("");
    setDescription("");
    setPrice("");
    setDurationMinutes("30");
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setSelectedService(s);
    setName(s.name);
    setDescription(s.description || "");
    setPrice(s.price.toString());
    setDurationMinutes(s.durationMinutes.toString());
    setIsActive(s.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !price || !durationMinutes) {
      setFormError("Service name, price, and duration are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        isActive,
      };

      let res;
      if (selectedService) {
        res = await fetch(`/api/services/${selectedService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save service");
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setFormError(err.message || "Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (s: any) => {
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (res.ok) fetchServices();
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
            Services & Pricing
          </h2>
          <p className="text-sm text-slate-500">
            Define your barber menu, durations, and pricing used across booking and calendar
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading services catalog..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services added yet"
          description="Create your first haircut or grooming service to enable client bookings."
          actionLabel="Add Service"
          onAction={handleOpenAdd}
          icon={Sparkles}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                s.isActive
                  ? "border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.name}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    s.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 min-h-[36px] line-clamp-2">
                {s.description || "No description provided."}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.price)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDuration(s.durationMinutes)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(s)}
                    title={s.isActive ? "Deactivate" : "Activate"}
                    className="text-xs px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    {s.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
        title={selectedService ? "Edit Service" : "Add New Service"}
        description="Configure service duration and standard price"
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
              Service Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Traditional Scissor Cut & Wash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="What does this service include?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="35.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                step="5"
                min="5"
                placeholder="30"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium text-slate-700">
              Active and visible on public booking page
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
              {selectedService ? "Save Service" : "Create Service"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
