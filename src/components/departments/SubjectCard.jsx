import React from "react";
import { motion } from "framer-motion";
import { Download, HelpCircle } from "lucide-react";
import SyllabusAccordion from "./SyllabusAccordion";
import ResourceTags from "./ResourceTags";

export default function SubjectCard({
  subject,
  index,
  isExpanded,
  onToggleExpand,
  onOpenResource,
  typeLabel,
  notesResource,
  questionBankResource,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: (index % 4) * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[20px] border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0B4A8F] text-white">
              {subject.deptCode || "Dept"}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#0B4A8F] ring-1 ring-blue-100">
              {subject.code}
            </span>
          </div>

          {(subject.semester || subject.credits) && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              {subject.semester && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Semester {subject.semester}</span>
              )}
              {subject.credits && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{subject.credits} Credits</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#0F172A] leading-snug mb-3">{subject.name}</h3>

        {/* Units / syllabus accordion */}
        <Syllabus
          subject={subject}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onOpenResource={onOpenResource}
        />

        {/* Resource type tags */}
        {subject.filteredResources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <ResourceTags
              items={subject.filteredResources.slice(0, 6)}
              labelFor={(r) => typeLabel(r.type) || r.type || "Notes"}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3.5 border-t border-slate-100 grid grid-cols-1 gap-2">
        <button
          onClick={() => onOpenResource(notesResource || subject.filteredResources[0])}
          disabled={!notesResource && subject.filteredResources.length === 0}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F] focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <Download size={13} />
          <span>LECTURE NOTES</span>
        </button>

        {questionBankResource && (
          <button
            onClick={() => onOpenResource(questionBankResource)}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#0B4A8F] ring-1 ring-blue-200 text-xs font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4A8F]/50"
          >
            <HelpCircle size={13} />
            <span>QUESTION BANK</span>
          </button>
        )}
      </div>
    </motion.article>
  );
}

function Syllabus({ subject, isExpanded, onToggleExpand, onOpenResource }) {
  return (
    <SyllabusAccordion
      subject={subject}
      isExpanded={isExpanded}
      onToggle={onToggleExpand}
      onOpenResource={onOpenResource}
    />
  );
}