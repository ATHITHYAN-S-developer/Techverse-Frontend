import React, { useState, useEffect } from "react";
import {
  Award,
  Search,
  Eye,
  Download,
  Trash2,
  Ban,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  QrCode,
  Calendar,
  User,
  GraduationCap
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

export default function AdminCertificatesPage() {
  const { showSuccess, showError } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCerts = async () => {
      try {
        const res = await api.get("/certificates");
        if (isMounted) {
          const list = res?.certificates || res?.data?.certificates || res?.data || (Array.isArray(res) ? res : []);
          setCertificates(list);
        }
      } catch (err) {
        if (isMounted) setCertificates([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCerts();
    return () => { isMounted = false; };
  }, []);

  const handleToggleRevoke = async (cert) => {
    try {
      const targetId = cert._id || cert.id;
      await api.put(`/certificates/${targetId}/status`);
      const newStatus = cert.status === "Active" ? "Revoked" : "Active";
      setCertificates((prev) =>
        prev.map((c) =>
          (c.id === targetId || c._id === targetId)
            ? { ...c, status: newStatus }
            : c
        )
      );
      showSuccess(
        cert.status === "Active"
          ? `Certificate ${cert.certificateNumber} has been revoked.`
          : `Certificate ${cert.certificateNumber} restored to active status ✓`
      );
    } catch (e) {
      showError("Failed to update certificate status");
    }
  };

  const filtered = certificates.filter((c) => {
    if (!c) return false;
    const q = (searchTerm || "").toLowerCase();
    const studentName = (c.studentName || "").toLowerCase();
    const regNo = (c.regNo || c.registerNumber || "").toLowerCase();
    const certNum = (c.certificateNumber || "").toLowerCase();
    const courseTitle = (c.courseTitle || c.courseName || "").toLowerCase();

    const matchesSearch =
      !q ||
      studentName.includes(q) ||
      regNo.includes(q) ||
      certNum.includes(q) ||
      courseTitle.includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "active" && (c.status === "Active" || c.status === "valid")) ||
      (statusFilter === "revoked" && (c.status === "Revoked" || c.status === "revoked"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0062A8]" />
            Institutional Certificate Registry & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit issued course completion credentials, manage public verification codes, and revoke invalid records.
          </p>
        </div>

        <a
          href="/verify"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all border border-slate-200 self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-[#0062A8]" />
          <span>Open Public Verifier</span>
        </a>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Issued</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{certificates.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active / Valid</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {certificates.filter((c) => c.status === "Active" || !c.status).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Revoked</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {certificates.filter((c) => c.status === "Revoked").length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
          <p className="text-2xl font-black text-[#0062A8] mt-1">Verified</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Certificate No (TV-2026-...), Register No, or Student Name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0062A8] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Certificate ID</th>
                <th className="px-4 py-3.5">Student Details</th>
                <th className="px-4 py-3.5">Course Completed</th>
                <th className="px-4 py-3.5">Score</th>
                <th className="px-4 py-3.5">Issued Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-bold text-[#0062A8] text-sm">
                      {c.certificateNumber}
                    </div>
                    <a
                      href={`/verify?code=${c.verificationCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-0.5"
                    >
                      <span>Public verify</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{c.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {c.regNo} • {c.department}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs font-medium text-slate-800">
                    <div className="line-clamp-1">{c.courseTitle}</div>
                    <div className="text-[10px] text-slate-400">By {c.instructor}</div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{c.score}</td>
                  <td className="px-4 py-3.5 text-slate-500">{c.issueDate}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        c.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {c.status === "Active" ? "✓ Verified" : "✗ Revoked"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewCert(c)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleRevoke(c)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          c.status === "Active"
                            ? "bg-slate-50 hover:bg-rose-50 text-rose-600 border-slate-200"
                            : "bg-slate-50 hover:bg-emerald-50 text-emerald-600 border-slate-200"
                        }`}
                        title={c.status === "Active" ? "Revoke" : "Restore"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal Preview - White Mode */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Frame */}
            <div className="border-4 border-amber-400/40 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-slate-50 text-center relative overflow-hidden shadow-xs">
              <div className="text-[11px] uppercase tracking-widest font-black text-amber-700 mb-1">
                Velalar College of Engineering and Technology
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-4">
                (Autonomous) • Accredited by NAAC with 'A+' Grade • Erode - 638 012
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                Certificate of Technical Mastery
              </h2>

              <p className="text-xs text-slate-500 mt-4">This is to certify that</p>

              <div className="text-lg sm:text-xl font-black text-[#0062A8] my-2">
                {previewCert.studentName}
              </div>

              <p className="text-xs text-slate-600 font-mono">
                Reg. No: {previewCert.regNo} ({previewCert.department})
              </p>

              <p className="text-xs text-slate-500 mt-3">
                has successfully completed the comprehensive curriculum and achieved a score of{" "}
                <strong className="text-emerald-700 font-bold">{previewCert.score}</strong> in
              </p>

              <div className="text-base font-bold text-slate-900 mt-1 mb-4">
                {previewCert.courseTitle}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 text-left">
                <div>
                  <div>Certificate No: <strong className="text-slate-800 font-mono">{previewCert.certificateNumber}</strong></div>
                  <div>Issued Date: {previewCert.issueDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{previewCert.instructor}</div>
                  <div className="text-slate-400">Course Instructor & HOD</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  showSuccess(`Certificate ${previewCert.certificateNumber} downloaded ✓`);
                  setPreviewCert(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0062A8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
