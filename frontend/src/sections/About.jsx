/**
 * About Section Component for VCET Tech Hub
 * #about
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiExternalLink, FiCompass } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import {
  SITE_NAME,
  COLLEGE_NAME,
  COLLEGE_LOCATION,
  ABOUT_MISSION,
  ABOUT_DETAILS,
  COLLEGE_LINKS,
} from "../config/site";
import vcetLogoImg from "../assets/vcet-logo.png";
import logoImg from "../assets/logo.png";

export default function About() {
  const [vcetLogoError, setVcetLogoError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <section
      id="about"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16 relative border-b border-[#C9C9C9]/60"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand, Mission Statement, and Portal CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0062A8]/10 text-[#0062A8] text-xs uppercase tracking-widest font-bold">
              <span>About The Platform</span>
            </div>

            {/* Dual Logo representation */}
            <div className="flex items-center gap-4 p-3 bg-[#F4F4F4] rounded-2xl border border-[#C9C9C9]/60 w-fit">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs">
                {!vcetLogoError ? (
                  <img
                    src={vcetLogoImg}
                    alt="VCET College Logo"
                    className="w-full h-full object-contain"
                    onError={() => setVcetLogoError(true)}
                  />
                ) : (
                  <FaGraduationCap className="w-7 h-7 text-[#0062A8]" />
                )}
              </div>

              <div className="w-[1px] h-6 bg-[#C9C9C9]" />

              <div className="w-12 h-12 rounded-xl bg-[#0062A8] p-1.5 flex items-center justify-center text-white shadow-xs">
                {!logoError ? (
                  <img
                    src={logoImg}
                    alt="Tech Hub Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <FiCompass className="w-6 h-6 text-white" />
                )}
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#444445] tracking-tight">
              {SITE_NAME}
            </h2>

            <blockquote className="border-l-4 border-[#0062A8] pl-4 py-1 text-base sm:text-lg italic font-medium text-[#444445]">
              "{ABOUT_MISSION}"
            </blockquote>

            <p className="text-sm text-[#444445]/80 leading-relaxed font-normal">
              Created specifically for the scholars and faculty of {COLLEGE_NAME}, this centralized
              technology resource directory cuts through online noise. It equips aspiring
              engineers and innovators with high-yield aptitude platforms, real-time industry news feeds,
              interactive dev playgrounds, and top-tier educational channels.
            </p>

            <div className="pt-2">
              <a
                href={COLLEGE_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white text-xs uppercase tracking-wider font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>VCET Institutional Portal</span>
                <FiExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          {/* Right Column: 4 Strategic Pillars Card Stack */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="bg-[#F4F4F4] p-6 sm:p-8 rounded-3xl border border-[#C9C9C9]/80 shadow-sm relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C9C9C9]/60">
                <h3 className="text-lg font-bold text-[#444445]">
                  Core Objectives & Directives
                </h3>
                <span className="text-xs uppercase tracking-wider font-mono text-[#0062A8] font-bold">
                  AUTONOMOUS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ABOUT_DETAILS.map((detail, index) => (
                  <div
                    key={detail.title}
                    className="bg-white p-5 rounded-2xl border border-[#C9C9C9]/60 shadow-xs hover:border-[#0062A8] transition-colors"
                  >
                    <div className="text-xs font-mono font-bold text-[#0062A8] mb-1.5">
                      0{index + 1}. OBJECTIVE
                    </div>
                    <h4 className="font-bold text-sm text-[#444445] mb-2 leading-snug">
                      {detail.title}
                    </h4>
                    <p className="text-xs text-[#444445]/80 leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* College Accreditation Banner */}
              <div className="mt-6 pt-4 border-t border-[#C9C9C9]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#444445]/80 gap-2">
                <span className="font-bold uppercase tracking-wider text-[#444445]">
                  {COLLEGE_NAME}
                </span>
                <span className="font-mono text-[11px]">
                  {COLLEGE_LOCATION}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
