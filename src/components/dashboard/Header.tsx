"use client";

import React from "react";
import { Menu, Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

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
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Welcome back, {userName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

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
