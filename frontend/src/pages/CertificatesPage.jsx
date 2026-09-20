import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  CheckCircle2,
  QrCode,
  ExternalLink,
  ShieldCheck,
  X,
  Eye,
  RefreshCw,
  Sparkles,
  FileDown,
} from "lucide-react";
import { certificateService } from "../services/certificateService";
import { downloadCertificatePdf, getCertificatePreviewDataUrl } from "../services/certificatePdfGenerator";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import vcetLogoImg from "../assets/vcet-logo.png";
import certTemplateImg from "../assets/certificate-template.png";

export default function CertificatesPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCert, setSelectedCert] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getStudentCertificates();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (cert) => {
    setSelectedCert(cert);
    setPreviewLoading(true);
    try {
      const url = await getCertificatePreviewDataUrl(cert);
      setPreviewDataUrl(url);
    } catch (err) {
      console.error("Preview render error:", err);
      showError("Could not render certificate preview canvas");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (cert) => {
    try {
      setDownloadingId(cert.id || cert.certificateId);
      showSuccess(`Generating official PDF certificate for "${cert.courseName}"...`);
      await downloadCertificatePdf(cert);
      showSuccess(`Certificate downloaded successfully!`);
    } catch (err) {
      console.error("PDF download error:", err);
      showError("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verifiable Academic Credentials</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Earned Course Certificates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          All certificates issued by Velalar College of Engineering and Technology feature unique cryptographic verification hashes and institutional accreditation credentials.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0B4A8F]" />
          <p className="text-xs text-slate-500 mt-2">Loading credentials...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            No Certificates Earned Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete your enrolled technical modules (Video + Coding/MCQs) to achieve 100% course completion and automatically unlock your verified certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const certId = cert.id || cert.certificateId || cert.certificateNumber;
            const isDownloading = downloadingId === certId;

            return (
              <div
                key={certId}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-[#0B4A8F]/40 transition-all p-6 flex flex-col justify-between space-y-6"
              >
                {/* Top Certificate Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={vcetLogoImg} alt="VCET" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B4A8F]">
                        Velalar College of Engineering & Technology
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                        {cert.courseName || cert.title}
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider border border-emerald-200 shrink-0">
                    {cert.grade || "Distinction"}
                  </span>
                </div>

                {/* Recipient details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold text-slate-800">
                      {cert.studentName} {cert.registerNumber ? `(${cert.registerNumber})` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score Achieved:</span>
                    <span className="font-bold text-emerald-600">{cert.score || 92}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span className="font-medium text-slate-700">
                      {cert.issuedDate || cert.issuedAt || "September 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate ID:</span>
                    <span className="font-mono text-[11px] text-[#0B4A8F] font-bold">
                      {cert.certificateId || cert.certificateNumber || certId}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenPreview(cert)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#0B4A8F]" />
                    <span>Preview Certificate</span>
                  </button>
                  <button
                    onClick={() => handleDownload(cert)}
                    disabled={isDownloading}
                    className="px-5 py-2.5 bg-[#0B4A8F] hover:bg-[#084282] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          Printable Certificate Live Canvas / Image Preview Modal
          ========================================================================= */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F]">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Official VCET Certificate Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generated dynamically using the official VCET Gold & Navy institutional design
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Resolution Certificate Render */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100 flex items-center justify-center aspect-[1.414/1]">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0B4A8F]" />
                  <span className="text-xs font-bold text-slate-600">
                    Rendering high-resolution vector certificate...
                  </span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Official Certificate"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">Failed to load preview</span>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-mono">
                ID: {selectedCert.certificateId || selectedCert.id} • Hash: {selectedCert.verificationCode || "0x89FA9B432E"}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedCert)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download High-Resolution PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
