import React, { useState } from "react";
import {
  Flame,
  Award,
  Zap,
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  Trophy,
  Code2,
  BookOpen,
  Calendar,
  Check
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const INITIAL_POINT_RULES = [
  { id: "rule-1", action: "Daily Test Completed", key: "dailyTest", points: 10, description: "Awarded automatically upon submitting a daily practice test." },
  { id: "rule-2", action: "Test Passed (>= Passing Score)", key: "testPassed", points: 20, description: "Awarded when student achieves a score >= passing mark." },
  { id: "rule-3", action: "7-Day Consecutive Streak Milestone", key: "streak7Day", points: 50, description: "Bonus awarded when student logs in and completes tests for 7 days in a row." },
  { id: "rule-4", action: "Course Completed (100% Modules)", key: "courseCompleted", points: 100, description: "Awarded when all syllabus modules and quizzes in a course are marked complete." },
  { id: "rule-5", action: "Coding Problem Solved (Arena)", key: "codingProblem", points: 25, description: "Awarded when all public and hidden test cases pass in the code compiler." },
  { id: "rule-6", action: "Certificate Earned", key: "certificateEarned", points: 100, description: "Awarded when official VCET verified certificate is generated." }
];

export default function AdminPointsPage() {
  const { showSuccess } = useToast();
  const [rules, setRules] = useState(INITIAL_POINT_RULES);

  const handlePointsChange = (id, newPoints) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, points: Number(newPoints) } : r))
    );
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    showSuccess("Institutional Gamification & Points rules saved successfully ✓");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Institutional Gamification & Points Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure learning XP reward weights, streak multipliers, and engagement incentives across TechVerse.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Point Weights</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#0062A8] font-bold">
                  {r.key}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{r.action}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                <input
                  type="number"
                  value={r.points}
                  onChange={(e) => handlePointsChange(r.id, e.target.value)}
                  className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-amber-600 text-sm focus:outline-none focus:border-[#0062A8]"
                />
                <span className="text-xs font-bold text-slate-500">XP</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak Multipliers Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Consecutive Daily Streak Multipliers
        </h2>
        <p className="text-xs text-slate-500">
          Multiply daily task rewards as students maintain uninterrupted learning streaks.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">3-Day Streak</span>
            <div className="text-lg font-black text-[#0062A8] mt-1">1.10x</div>
            <span className="text-[10px] text-slate-500">+10% Bonus XP</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">7-Day Streak</span>
            <div className="text-lg font-black text-amber-600 mt-1">1.25x</div>
            <span className="text-[10px] text-slate-500">+25% Bonus XP</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">14-Day Streak</span>
            <div className="text-lg font-black text-emerald-600 mt-1">1.50x</div>
            <span className="text-[10px] text-slate-500">+50% Bonus XP</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">30-Day Master Streak</span>
            <div className="text-lg font-black text-purple-600 mt-1">2.00x</div>
            <span className="text-[10px] text-slate-500">2x Double XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
