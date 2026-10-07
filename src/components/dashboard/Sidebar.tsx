"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scissors,
  Calendar,
  Users,
  Sparkles,
  UserCheck,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: "ADMIN" | "BARBER";
  userName?: string;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole = "ADMIN",
  userName = "User",
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: BarChart3, roles: ["ADMIN", "BARBER"] },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["ADMIN", "BARBER"] },
    { name: "Customers", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "BARBER"] },
    { name: "Services", href: "/dashboard/services", icon: Sparkles, roles: ["ADMIN"] },
    { name: "Barbers", href: "/dashboard/barbers", icon: UserCheck, roles: ["ADMIN"] },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN", "BARBER"] },
    { name: "Shop Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
  ];

  const allowedNav = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
            <Scissors className="w-5 h-5 -rotate-45 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              Barber<span className="text-emerald-400">Flow</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block">
              {userRole === "ADMIN" ? "Admin Console" : "Barber Portal"}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Management
        </div>
        {allowedNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-emerald-400"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Public Client
        </div>
        <Link
          href="/book"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            <span>Public Booking Page</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            Open
          </span>
        </Link>
      </div>

      {/* User profile & quick sign out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              {userRole === "ADMIN" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <UserCircle className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-emerald-400 font-mono capitalize">
                {userRole.toLowerCase()}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 select-none z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
