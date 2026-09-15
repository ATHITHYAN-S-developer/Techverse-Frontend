import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiGlobe,
  FiEye,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import {
  SITE_NAME,
  COLLEGE_NAME,
  COLLEGE_LOCATION,
  COLLEGE_LINKS,
  NAV_LINKS,
} from "../config/site";
import { recordAndGetVisitorCount } from "../services/visitorService";
import vcetLogoImg from "../assets/vcet-empower-blue.png";
import jubileeLogoImg from "../assets/25-years-white.png";

export default function Footer() {
  const [vcetLogoError, setVcetLogoError] = useState(false);
  const [jubileeError, setJubileeError] = useState(false);
  const [visitorCount, setVisitorCount] = useState(() => {
    try {
      const cached = localStorage.getItem("vcet_tech_hub_visitor_count");
      if (cached && !isNaN(Number(cached))) return Number(cached).toLocaleString();
    } catch (e) {}
    return "--";
  });

  useEffect(() => {
    let isMounted = true;
    recordAndGetVisitorCount((res) => {
      if (isMounted) {
        if (typeof res?.count === "number") {
          setVisitorCount(Number(res.count).toLocaleString());
        } else if (res?.error) {
          setVisitorCount("--");
        }
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#444445] text-white pt-16 pb-12 relative overflow-hidden"
    >
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-[#C9C9C9]/20">
          {/* Column 1: Brand & College Emblem */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 flex items-center justify-center shrink-0">
                {!vcetLogoError ? (
                  <img
                    src={vcetLogoImg}
                    alt="VCET Logo"
                    className="h-10 w-auto max-w-[140px] object-contain drop-shadow-sm"
                    onError={() => setVcetLogoError(true)}
                  />
                ) : (
                  <FaGraduationCap className="w-7 h-7 text-[#0062A8]" />
                )}
              </div>

              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  {SITE_NAME}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9C9C9]">
                  VCET • Autonomous
                </span>
              </div>
            </div>

            <p className="text-xs text-[#C9C9C9] leading-relaxed pt-1 font-normal">
              A student-focused technology resource discovery hub created for the engineering scholars of {COLLEGE_NAME}.
            </p>

            {/* 25 Years Silver Jubilee celebration emblem */}
            {!jubileeError && (
              <div className="pt-2 flex items-center gap-3">
                <img
                  src={jubileeLogoImg}
                  alt="VCET 25 Years of Academic Excellence"
                  className="h-10 object-contain"
                  onError={() => setJubileeError(true)}
                />
                <span className="text-[10px] uppercase tracking-wider text-[#C9C9C9]/80 font-mono">
                  25 Years of Excellence
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="group text-[#C9C9C9] hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                    <span className="relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-400 after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resource Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              RESOURCE DOMAINS
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {[
                { name: "Tech Explorer (Websites)", href: "/technology" },
                { name: "Department E-Resources", href: "/departments" },
                { name: "PrepZone Hub", href: "/prepzone" },
                { name: "Tech Pulse (App Updates)", href: "/updates" },
                { name: "Tech Vision (YouTube)", href: "/youtube" },
                { name: "Skill Forge (Aptitude)", href: "/aptitude" },
                { name: "Institutional Notices", href: "/announcements" },
              ].map((domain) => (
                <li key={domain.name}>
                  <Link
                    to={domain.href}
                    className="group text-[#C9C9C9] hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                    <span className="relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-400 after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-200">
                      {domain.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: College Institutional Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              CONNECT
            </h4>
            <div className="space-y-3 text-xs text-[#C9C9C9]">
              <div className="flex items-start gap-2.5">
                <FiMapPin className="text-blue-400 shrink-0 mt-0.5" size={14} />
                <span>{COLLEGE_LOCATION}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiPhone className="text-blue-400 shrink-0" size={14} />
                <span>{COLLEGE_LINKS.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMail className="text-blue-400 shrink-0" size={14} />
                <a
                  href={`mailto:${COLLEGE_LINKS.email}`}
                  className="hover:text-white transition-colors"
                >
                  {COLLEGE_LINKS.email}
                </a>
              </div>
            </div>

            <div className="mt-5">
              <a
                href={COLLEGE_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0062A8] hover:bg-[#00528c] shadow-md transition-all hover:scale-[1.02]"
              >
                <FiGlobe size={13} />
                <span>VCET Official Website</span>
                <FiExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright, Visitor Counter and Accreditations */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#C9C9C9] gap-4 text-center md:text-left">
          <p>© 2026 {SITE_NAME} • Velalar College of Engineering and Technology</p>

          {/* Institutional Live Visitor Counter Badge in Footer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white shadow-inner font-mono text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <FiEye className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-[#C9C9C9] font-sans font-medium text-[11px] uppercase tracking-wider">
              Total Visitors:
            </span>
            <span className="font-extrabold text-white text-xs tracking-tight">
              {visitorCount}
            </span>
          </div>

          <p className="font-mono text-[11px] text-[#C9C9C9]/80">
            Autonomous Institution • Affiliated to Anna University, Chennai
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
