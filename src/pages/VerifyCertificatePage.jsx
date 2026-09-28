import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ShieldCheck, Search, CheckCircle2, XCircle, Award, Calendar, User, BookOpen, ArrowRight } from "lucide-react";
import { certificateService } from "../services/certificateService";
import { downloadCertificatePdf } from "../services/certificatePdfGenerator";

import vcetLogoImg from "../assets/vcet-logo.png";

export default function VerifyCertificatePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("id") || "");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setQuery(urlId);
      handleVerify(urlId);
    }
  }, [searchParams]);

  const handleVerify = async (certIdToSearch) => {
    const target = certIdToSearch || query;
    if (!target.trim()) return;

    setLoading(true);
    setSearched(true);
    const found = await certificateService.verifyCertificate(target);
    setResult(found);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Institutional Registry</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verify VCET Credential
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Validate the authenticity of course completion certificates and technical honors awarded by Velalar College of Engineering and Technology.
        </p>
      </div>

      {/* 2. Search Verification Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate ID (e.g. VCET-CERT-2026-PY-0091)"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-xs sm:text-sm border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0062A8] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B4A8F] hover:bg-[#0062A8] text-white font-bold text-xs rounded-2xl shadow transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Verifying..." : "Verify Credential"}</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span>Sample Certificate IDs:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("VCET-CERT-2026-PY-0091");
              handleVerify("VCET-CERT-2026-PY-0091");
            }}
            className="text-[#0062A8] hover:underline font-mono"
          >
            VCET-CERT-2026-PY-0091
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setQuery("VCET-CERT-2026-GIT-0044");
              handleVerify("VCET-CERT-2026-GIT-0044");
            }}
            className="text-[#0062A8] hover:underline font-mono"
          >
            VCET-CERT-2026-GIT-0044
          </button>
        </div>
      </div>

      {/* 3. Verification Result Card */}
      {searched && (
        <div>
          {result ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Authenticity Seal Header */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      Official Institutional Record
                    </span>
                    <h2 className="text-lg font-black text-slate-900">
                      VERIFIED AUTHENTIC
                    </h2>
                  </div>
                </div>

                <img src={vcetLogoImg} alt="VCET" className="w-10 h-10 object-contain hidden sm:block" />
              </div>

              {/* Record Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400">Awarded To:</span>
                  <div className="text-sm font-bold text-slate-900">{result.studentName}</div>
                  <div className="font-mono text-[11px] text-[#0062A8]">{result.registerNumber}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400">Course / Technical Specialization:</span>
                  <div className="text-sm font-bold text-slate-900">{result.courseName}</div>
                  <div className="text-[11px] text-slate-500">Grade: {result.grade} ({result.score}%)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400">Date of Award:</span>
                  <div className="text-sm font-bold text-slate-900">{result.issuedDate}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400">Verification Hash:</span>
                  <div className="font-mono text-xs font-bold text-slate-800">{result.verificationCode}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>This digital credential was legitimately minted under the authority of Velalar College of Engineering and Technology (Autonomous), Erode.</span>
                <button
                  type="button"
                  onClick={() => downloadCertificatePdf(result)}
                  className="px-4 py-2 bg-[#0B4A8F] hover:bg-[#084282] text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-rose-300 p-8 shadow-lg text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Certificate Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching academic record was found for "{query}". Please check the ID or contact the VCET Controller of Examinations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
