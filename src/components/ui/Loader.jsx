import React from "react";
import { cn } from "../../lib/utils";

export function Loader({ className }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
} 