import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  ShieldCheck,
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  FileDown,
  QrCode,
} from "lucide-react";
import {
  getCertificatePreviewDataUrl,
  downloadCertificatePdf,
} from "../services/certificatePdfGenerator";
import { useToast } from "../context/ToastContext";

const SAMPLE_CERTIFICATE_DATA = {
  id: "VCET-CERT-2026-FS-0091",
  certificateId: "VCET-CERT-2026-FS-0091",
  verificationCode: "0x89FA9B432E",
  studentName: "ATHITHYA V",
  registerNumber: "732924CSE001",
  department: "Department of Computer Science & Engineering",
  courseName: "Full-Stack MERN Engineering Competency",
  instructor: "Dr. K. Sathish Kumar",
  score: 94,
  grade: "Outstanding (Distinction)",
  issuedDate: "September 14, 2026",
  status: "Verified",
};

export default function CertificatePreviewSection() {
  const { showSuccess, showError } = useToast();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function generatePreview() {
      try {
        setLoading(true);
        const url = await getCertificatePreviewDataUrl(SAMPLE_CERTIFICATE_DATA);
        setPreviewUrl(url);
      } catch (err) {
        console.error("Failed to render home certificate preview:", err);
      } finally {
        setLoading(false);
      }
    }
    generatePreview();
  }, []);

  const handleDownloadSample = async () => {
    try {
      setDownloading(true);
      showSuccess("Generating official sample PDF certificate...");
      await downloadCertificatePdf(SAMPLE_CERTIFICATE_DATA);
      showSuccess("Certificate PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      showError("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-[#071d38] to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none border-t border-slate-800">
      {/* Ambient background glow & geometric rings */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            <span>INSTITUTIONAL ACCREDITATION & CERTIFICATION</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
          >
            Verifiable VCET Academic Credentials
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal"
          >
            Complete self-paced video modules, pass practical coding tests, and master quizzes to automatically unlock tamper-evident, cryptographically verifiable certificates recognized across top engineering industries.
          </motion.p>
        </div>

        {/* Certificate Display Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Certificate Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="lg:col-span-7 group relative"
          >
            {/* Subtle multi-layer backdrop shadow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-blue-600/30 to-amber-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl p-2 sm:p-3 aspect-[1.414/1] flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-4 border-[#0B4A8F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Generating Live Certificate...</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Official VCET Certificate Template"
                  className="w-full h-full object-contain rounded-xl shadow-inner group-hover:scale-[1.01] transition-transform duration-500"
                />
              ) : (
                <span className="text-xs text-slate-500">Certificate preview currently loading...</span>
              )}

              {/* Floating Verified Seal Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-emerald-500/50 shadow-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300">
                  Official Record Verified
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Feature Highlights & Quick CTA Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* 4 Feature Points */}
            <div className="space-y-3.5">
              {[
                {
                  title: "Gold-Standard Institutional Accreditation",
                  desc: "Issued under Velalar College of Engineering and Technology (Autonomous, NBA Tier-1, NAAC A+).",
                  icon: Award,
                  color: "text-amber-400",
                },
                {
                  title: "Tamper-Evident Cryptographic Hash",
                  desc: "Every certificate embeds a unique ID and verification hash for instant public lookup.",
                  icon: ShieldCheck,
                  color: "text-emerald-400",
                },
                {
                  title: "Automated Instant Issuance",
                  desc: "Mints automatically the moment you complete 100% of a course's video and assessment criteria.",
                  icon: Sparkles,
                  color: "text-sky-400",
                },
                {
                  title: "High-Resolution Printable PDF",
                  desc: "Download full-bleed landscape vector PDF ready for LinkedIn, resumes, and academic portfolios.",
                  icon: Download,
                  color: "text-blue-400",
                },
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-start gap-3.5"
                  >
                    <div className="p-2 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${feat.color}`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/certificates"
                className="flex-1 px-5 py-3.5 rounded-xl bg-[#0B4A8F] hover:bg-[#0062A8] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all group"
              >
                <span>My Certificates</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={handleDownloadSample}
                disabled={downloading}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>{downloading ? "Generating PDF..." : "Download Sample PDF"}</span>
              </button>

              <Link
                to="/verify-certificate"
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                title="Verify Certificate Credential"
              >
                <QrCode className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
