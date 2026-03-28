"use client";
import * as React from "react";
import { cn } from "@/design-system/lib/utils";

interface CardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function CardWrapper({ children, className }: CardWrapperProps) {
  return (
    <div
      className={cn(
        "border-border/40 rounded-xl border bg-white/[0.64] p-6 shadow-[0_0_16px_rgba(0,0,0,0.03)] backdrop-blur-lg transition-shadow duration-200 lg:p-7",
        className
      )}
    >
      {children}
    </div>
  );
}
