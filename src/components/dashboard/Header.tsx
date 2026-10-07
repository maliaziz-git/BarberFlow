"use client";

import React from "react";
import { Menu, Plus, Calendar, Bell } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNewAppointment?: () => void;
  userRole?: string;
  userName?: string;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNewAppointment,
  userRole = "ADMIN",
  userName = "User",
  title = "Dashboard",
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Welcome back, {userName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onNewAppointment && (
          <Button
            onClick={onNewAppointment}
            size="sm"
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Book Appointment</span>
            <span className="sm:hidden">Book</span>
          </Button>
        )}
      </div>
    </header>
  );
};
