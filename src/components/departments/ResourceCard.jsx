import React from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, HardDrive, ArrowDown } from "lucide-react";
import ResourceTags from "./ResourceTags";

export default function ResourceCard({
  resource,
  index,
  deptCode,
  typeLabel,
  isSoftwareType,
  onOpenResource,
}) {
  const hasFile = Boolean(resource.fileUrl);
  const hasExternal = Boolean(resource.externalUrl);
  const canOpen = hasFile || hasExternal;
  const isSoftware = isSoftwareType(resource);

  const ctaLabel = isSoftware ? "OPEN RESOURCE" : hasFile ? "DOWNLOAD" : "OPEN";
  const CtaIcon = isSoftware ? ExternalLink : hasFile ? Download : ArrowDown;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: (index % 6) * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-200 group"
    >
      <div>
        {/* Top metadata */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#0B4A8F] ring-1 ring-blue-100">
            {deptCode} • {typeLabel(resource.type)}
          </span>
          {resource.unit && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              Unit {resource.unit}
            </span>
          )}
        </div>

        {/* Title (2-line clamp) */}
        <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0B4A8F] transition-colors duration-200 leading-snug mb-1.5 line-clamp-2">
          {resource.title}
        </h3>

        {/* Description (2-3 line clamp) */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
          {resource.description || "Department study material."}
        </p>
      </div>

      <div className="pt-3.5 border-t border-slate-100 space-y-3.5">
        {/* Tags */}
        {Array.isArray(resource.tags) && resource.tags.length > 0 && (
          <ResourceTags
            items={resource.tags.slice(0, 5)}
            tone="gray"
            labelFor={(tag) => `#${tag}`}
          />
        )}

        {/* CTA */}
        <button
          onClick={() => canOpen && onOpenResource(resource)}
          disabled={!canOpen}
          className="group/btn w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F] focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <CtaIcon size={13} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          <span>{canOpen ? ctaLabel : "NO FILE ATTACHED"}</span>
        </button>

        {/* Footer metadata */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1">
            {resource.downloadsCount ? (
              <>
                <ArrowDown size={11} /> {resource.downloadsCount} downloads
              </>
            ) : null}
          </span>
          {resource.fileSize ? (
            <span className="inline-flex items-center gap-1">
              <HardDrive size={11} /> {String(resource.fileSize).toUpperCase()}
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}