import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: "amber" | "blue" | "emerald" | "purple" | "slate";
}

const colorStyles = {
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "emerald",
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            colorStyles[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-emerald-600" : "text-slate-500"
            )}
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
