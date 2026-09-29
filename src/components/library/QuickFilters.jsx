import React from "react";
import { Home, BookOpen, FileText, ClipboardList, Monitor, Download, UserCircle2 } from "lucide-react";

const PILLS = [
  { key: "all", label: "All", icon: Home },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "notes", label: "Lecture Notes", icon: FileText },
  { key: "question_bank", label: "Question Bank", icon: ClipboardList },
  { key: "software", label: "Free Software", icon: Monitor },
  { key: "downloads", label: "Downloads", icon: Download },
];

export default function QuickFilters({
  activeKey,
  onSelect,
  userDeptName,
  myDeptActive,
  onMyDeptToggle,
}) {
  return (
    <div className="mt-5 px-5 sm:px-0">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
        {PILLS.map((pill) => {
          const Icon = pill.icon;
          const active = activeKey === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => onSelect(pill.key)}
              aria-pressed={active}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border ${
                active
                  ? "bg-profile-main text-white border-profile-main shadow-md shadow-profile-main/10"
                  : "bg-white text-profile-ink/80 border-profile-rule hover:border-profile-main hover:text-profile-main"
              }`}
            >
              <Icon size={15} className={active ? "text-white" : "text-profile-ink/60"} />
              {pill.label}
            </button>
          );
        })}
        {userDeptName && (
          <button
            onClick={onMyDeptToggle}
            aria-pressed={myDeptActive}
            className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border ${
              myDeptActive
                ? "bg-profile-main text-white border-profile-main shadow-md shadow-profile-main/10"
                : "bg-white text-profile-ink/80 border-profile-rule hover:border-profile-main hover:text-profile-main"
            }`}
          >
            <UserCircle2 size={15} className={myDeptActive ? "text-white" : "text-profile-ink/60"} />
            My Department
          </button>
        )}
      </div>
    </div>
  );
}