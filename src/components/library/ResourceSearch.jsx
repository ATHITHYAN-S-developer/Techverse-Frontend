import React from "react";
import { Search, Command } from "lucide-react";

export default function ResourceSearch({ query, onChange, inputRef }) {
  return (
    <div className="mt-5 px-5 sm:px-0">
      <label htmlFor="resource-search" className="sr-only">
        Search resources
      </label>
      <div className="relative group">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-profile-ink/60 group-focus-within:text-profile-main transition-colors"
        />
        <input
          id="resource-search"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search notes, question banks, software, subjects…"
          autoComplete="off"
          className="w-full h-14 sm:h-16 rounded-2xl border border-profile-rule bg-white pl-12 pr-24 sm:pr-28 text-sm text-profile-ink placeholder:text-profile-ink/60 shadow-sm ring-1 ring-transparent transition-all duration-200 focus:ring-2 focus:ring-profile-main focus:border-profile-main"
        />
        <span className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-1 rounded-lg border border-profile-rule bg-profile-alt px-2 py-1 text-[11px] font-semibold text-profile-ink/60">
          <Command size={11} />K
        </span>
      </div>
    </div>
  );
}