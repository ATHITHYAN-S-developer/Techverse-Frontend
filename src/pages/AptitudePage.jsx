import React, { useState } from "react";
import { Award, BookOpen, Clock, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { APTITUDE_CATEGORIES } from "../data/aptitudeData";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function AptitudePage() {
  const [activeTab, setActiveTab] = useState("formulas"); // "formulas" | "apps"
  const [expandedCategory, setExpandedCategory] = useState(APTITUDE_CATEGORIES[0]?.id);
  const [userAnswers, setUserAnswers] = useState({});

  const aptitudeResources = RESOURCES.filter((item) => item.type === "aptitude");

  const handleSelectAnswer = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-[#0B4A8F] via-[#0062A8] to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 mb-3 border border-white/20">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Placement Skill Forge</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Quantitative Aptitude & Reasoning Forge
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Master mental math shortcuts, speed calculations, formulas, and mock questions tailored for Zoho, TCS NQT, and Cognizant AMCAT tests.
          </p>
        </div>

        <Link
          to="/tests/aptitude-speed-math"
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Speed Math Test (+10 Pts)</span>
        </Link>
      </div>

      {/* 2. Switcher Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab("formulas")}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "formulas"
              ? "bg-white text-[#0062A8] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Formula Sheets & Practice Sets
        </button>
        <button
          onClick={() => setActiveTab("apps")}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "apps"
              ? "bg-white text-[#0062A8] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Curated Practice Portals & Apps
        </button>
      </div>

      {/* 3. Content */}
      {activeTab === "formulas" ? (
        <div className="space-y-4">
          {APTITUDE_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0062A8]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0062A8]">
                        {cat.domain}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {cat.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {cat.formulaCount} Formulas • {cat.questionCount} Questions
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Accordion Content Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-6 text-xs text-slate-700">
                    {/* Core Concepts */}
                    <div className="pt-4 space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0062A8]">
                        Key Concepts:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        {cat.concepts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Formula Bank */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0062A8]">
                        Essential Formulas & Shortcuts:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cat.formulas.map((f, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="font-semibold text-slate-800">{f.name}</div>
                            <div className="font-mono text-[11px] text-[#0062A8] mt-1 font-bold">{f.expr}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Solved Examples */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0062A8]">
                        Solved Blueprint Example:
                      </h4>
                      {cat.examples.map((ex, i) => (
                        <div key={i} className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/80 space-y-1">
                          <div className="font-semibold text-slate-800">Q: {ex.q}</div>
                          <div className="text-slate-600"><span className="font-bold text-[#0062A8]">Solution:</span> {ex.solution}</div>
                        </div>
                      ))}
                    </div>

                    {/* Practice Questions */}
                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#0062A8]">
                        Practice Questions:
                      </h4>
                      {cat.practiceQuestions.map((pq) => {
                        const selected = userAnswers[pq.id];
                        return (
                          <div key={pq.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="font-semibold text-slate-900">{pq.q}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {pq.options.map((opt, oIdx) => (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectAnswer(pq.id, oIdx)}
                                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                                    selected === oIdx
                                      ? selected === pq.correct
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                                        : "bg-rose-50 border-rose-300 text-rose-800 font-bold"
                                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {selected !== undefined && (
                              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                                <span className="font-bold">{selected === pq.correct ? "✓ Correct!" : "✕ Incorrect."}</span> {pq.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <ResourceListView resources={aptitudeResources} pageTitle="Skill Forge — Aptitude Preparation Apps" />
      )}
    </div>
  );
}
