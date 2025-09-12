"use client";
import React from "react";

export function Badge({ children, className = "", variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  const base = "inline-block px-2 py-0.5 rounded text-white text-xs";
  const variantCls = variant === "destructive" ? "bg-red-600" : "bg-green-600";
  return <span className={`${base} ${variantCls} ${className}`}>{children}</span>;
}

export default Badge;
