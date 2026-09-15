import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Target, ArrowLeft, CheckCircle2, Clock, HelpCircle, Briefcase, Award, ArrowRight } from "lucide-react";
import { COMPANIES_DATA } from "../data/companiesData";

export default function CompanyDetailPage() {
  const { company } = useParams();
  const navigate = useNavigate();

  const found = COMPANIES_DATA.find((c) => c.slug === company || c.id === company) || COMPANIES_DATA[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <button
        onClick={() => navigate("/training")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0062A8] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Placement Training
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src={found.logo} alt={found.name} className="w-16 h-16 object-contain p-2 bg-slate-50 rounded-2xl border border-slate-100" />
          <div>
            <span className="text-xs font-bold text-[#0062A8] uppercase tracking-wider">{found.tagline}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{found.name}</h1>
            <p className="text-xs text-slate-500 mt-1">{found.eligibility}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center shrink-0">
          <span className="text-[10px] uppercase tracking-wider block text-amber-700">Package Range</span>
          <div className="text-lg font-black">{found.packageRange}</div>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900">Recruitment Blueprint & Strategy</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{found.description}</p>
      </div>

      {/* Rounds Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recruitment Rounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {found.rounds?.map((r, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0062A8] border border-blue-200">
                  {r.round}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {r.duration}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{r.details}</p>
              <div className="pt-2 text-[11px] text-amber-800 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                <span className="font-bold">Pro-Tip:</span> {r.tips}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Questions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Sample Technical & Coding Questions</h2>
        <div className="space-y-2">
          {found.sampleQuestions?.map((q, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-800 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                {i + 1}
              </span>
              <span>{q}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex items-center justify-between">
          <Link
            to="/coding"
            className="px-5 py-2.5 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
          >
            <span>Practice in Coding Arena</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
