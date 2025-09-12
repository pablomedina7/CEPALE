"use client";
import React from "react";

export function Button({ children, onClick, disabled, className = "", size, variant }: any) {
  const base = "inline-flex items-center justify-center rounded px-3 py-1.5 border";
  const disabledCls = disabled ? "opacity-60 cursor-not-allowed" : "";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${disabledCls} ${className}`}>
      {children}
    </button>
  );
}

export default Button;
