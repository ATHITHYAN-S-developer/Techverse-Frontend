import React from "react";

/** Section header with a gold rule, used across the dashboard. */
export default function SectionHeading({ children, aside }) {
  return (
    <div className="flex items-end justify-between gap-4 pb-3 mb-1">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-3 w-[2px] bg-profile-main" />
        <h2 className="font-serif text-[13px] font-semibold uppercase tracking-[0.14em] text-profile-ink">
          {children}
        </h2>
      </div>
      {aside}
    </div>
  );
}
