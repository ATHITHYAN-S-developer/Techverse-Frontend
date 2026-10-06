import React from "react";
import { cn } from "../../lib/utils";

/**
 * Loading indicator that announces itself to screen readers while it spins.
 * Pass `label` when the wait needs a visible explanation.
 */
export function Spinner({ className, label, ...props }) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-sm font-medium text-vcet-dark/70", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-vcet-blue border-t-transparent"
      />
      {label}
    </span>
  );
}

export default Spinner;
