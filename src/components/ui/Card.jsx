import React from "react";
import { cn } from "../../lib/utils";

/**
 * Shared surface for every bordered panel in the app. Replaces the
 * `rounded-xl border border-vcet-line` recipe that was hand-copied across
 * pages, so radius, border and elevation stay identical everywhere.
 */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-vcet-line bg-white shadow-xs", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-bold text-vcet-dark text-balance", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-vcet-dark/70 text-pretty", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />
  );
}
