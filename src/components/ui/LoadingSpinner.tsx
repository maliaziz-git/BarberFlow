import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = "Loading...",
  className = "py-12",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
