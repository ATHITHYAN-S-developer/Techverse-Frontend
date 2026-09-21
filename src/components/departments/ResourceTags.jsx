import React from "react";

export default function ResourceTags({ items, labelFor, tone = "blue" }) {
  if (!items || items.length === 0) return null;

  const toneClasses =
    tone === "blue"
      ? "bg-[#EFF6FF] text-[#0B4A8F] ring-1 ring-blue-100"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          key={item?._id || item?.id || item?.type || index}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${toneClasses}`}
        >
          {labelFor ? labelFor(item) : String(item)}
        </span>
      ))}
    </div>
  );
}