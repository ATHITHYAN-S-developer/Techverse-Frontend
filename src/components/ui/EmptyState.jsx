import React from "react";
import { cn } from "../../lib/utils";

/**
 * Empty / no-results state. Always offers one clear next action so a blank
 * list never reads as a broken page.
 */
export function EmptyState({ icon: Icon, title, description, action, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed",
        "border-vcet-line bg-vcet-surface px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {Icon ? (
        <Icon aria-hidden="true" className="mb-3 size-8 text-vcet-gray" />
      ) : null}
      <h3 className="text-sm font-bold text-vcet-dark text-balance">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-vcet-dark/70 text-pretty">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
