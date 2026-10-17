import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronRight,
  FiExternalLink,
  FiCheckCircle,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiCompass,
  FiFolder,
  FiBookOpen,
  FiList,
  FiTool,
} from "react-icons/fi";
import {
  FaCode,
  FaBrain,
  FaChartSimple,
  FaCloud,
  FaShieldHalved,
  FaLink,
  FaPenRuler,
  FaGamepad,
  FaWifi,
  FaMicrochip,
  FaWindowMaximize,
  FaServer,
  FaLayerGroup,
  FaMobileScreen,
  FaRobot,
  FaChartLine,
  FaLanguage,
  FaEye,
  FaWandMagicSparkles,
  FaKeyboard,
  FaDatabase,
  FaArrowsRotate,
  FaSkull,
  FaKey,
  FaCube,
  FaFileCode,
  FaGlobe,
  FaPalette,
  FaGears,
  FaPaintbrush,
  FaNetworkWired,
  FaTerminal,
  FaBolt,
  FaFlask,
  FaBuilding,
  FaGraduationCap,
  FaCertificate,
  FaRocket,
  FaDiagramProject,
  FaCodeBranch,
} from "react-icons/fa6";

import { ROADMAP_DOMAINS } from "../data/roadmapDomains";

// Map fontawesome icon names to react-icons/fa6 components
const ICON_MAP = {
  "fa-code": FaCode,
  "fa-brain": FaBrain,
  "fa-chart-bar": FaChartSimple,
  "fa-cloud": FaCloud,
  "fa-shield-halved": FaShieldHalved,
  "fa-shield": FaShieldHalved,
  "fa-link": FaLink,
  "fa-pen-ruler": FaPenRuler,
  "fa-gamepad": FaGamepad,
  "fa-wifi": FaWifi,
  "fa-microchip": FaMicrochip,
  "fa-window-maximize": FaWindowMaximize,
  "fa-server": FaServer,
  "fa-layer-group": FaLayerGroup,
  "fa-mobile-screen": FaMobileScreen,
  "fa-robot": FaRobot,
  "fa-chart-line": FaChartLine,
  "fa-language": FaLanguage,
  "fa-eye": FaEye,
  "fa-wand-magic-sparkles": FaWandMagicSparkles,
  "fa-keyboard": FaKeyboard,
  "fa-database": FaDatabase,
  "fa-arrows-rotate": FaArrowsRotate,
  "fa-skull": FaSkull,
  "fa-key": FaKey,
  "fa-cube": FaCube,
  "fa-file-code": FaFileCode,
  "fa-globe": FaGlobe,
  "fa-palette": FaPalette,
  "fa-gears": FaGears,
  "fa-paintbrush": FaPaintbrush,
  "fa-network-wired": FaNetworkWired,
  "fa-terminal": FaTerminal,
  "fa-bolt": FaBolt,
  "fa-flask": FaFlask,
  "fa-building": FaBuilding,
  "fa-graduation-cap": FaGraduationCap,
  "fa-certificate": FaCertificate,
  "fa-rocket": FaRocket,
};

function DomainIcon({ name, className = "w-5 h-5" }) {
  const Component = ICON_MAP[name] || FaCode;
  return <Component className={className} />;
}

export default function TechPulseRoadmapExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation stack: [] = root 10 domains, [domain] = domain paths, [domain, path] = detailed roadmap
  const [navStack, setNavStack] = useState([]);
  const [direction, setDirection] = useState(1);

  // Sync state with URL params (?domain=...&path=...)
  const domainParam = searchParams.get("domain");
  const pathParam = searchParams.get("path");

  useEffect(() => {
    if (!domainParam) {
      if (navStack.length > 0) setNavStack([]);
      return;
    }

    const domainNode = ROADMAP_DOMAINS.find((d) => d.id === domainParam);
    if (!domainNode) return;

    if (!pathParam) {
      setNavStack([domainNode]);
      return;
    }

    const pathNode = (domainNode.children || []).find((c) => c.id === pathParam);
    if (pathNode) {
      setNavStack([domainNode, pathNode]);
    } else {
      setNavStack([domainNode]);
    }
  }, [domainParam, pathParam]);

  const pushNode = useCallback(
    (node) => {
      setDirection(1);
      setNavStack((prev) => {
        const next = [...prev, node];
        setSearchParams((sp) => {
          const q = new URLSearchParams(sp);
          if (next.length === 1) {
            q.set("domain", next[0].id);
            q.delete("path");
          } else if (next.length >= 2) {
            q.set("domain", next[0].id);
            q.set("path", next[1].id);
          }
          return q;
        });
        return next;
      });
      window.scrollTo({ top: 320, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const popNode = useCallback(() => {
    setDirection(-1);
    setNavStack((prev) => {
      const next = prev.slice(0, -1);
      setSearchParams((sp) => {
        const q = new URLSearchParams(sp);
        if (next.length === 0) {
          q.delete("domain");
          q.delete("path");
        } else if (next.length === 1) {
          q.set("domain", next[0].id);
          q.delete("path");
        }
        return q;
      });
      return next;
    });
    window.scrollTo({ top: 320, behavior: "smooth" });
  }, [setSearchParams]);

  const resetToRoot = useCallback(() => {
    setDirection(-1);
    setNavStack([]);
    setSearchParams((sp) => {
      const q = new URLSearchParams(sp);
      q.delete("domain");
      q.delete("path");
      return q;
    });
    window.scrollTo({ top: 320, behavior: "smooth" });
  }, [setSearchParams]);

  const currentLevel = navStack.length; // 0 = domains, 1 = domain paths, 2 = path mindmap
  const activeDomain = navStack[0] || null;
  const activePath = navStack[1] || null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
      {/* 1. Breadcrumb Bar with Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 sm:px-6 py-3 mb-8 shadow-xs">
        <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium">
          {currentLevel > 0 && (
            <button
              type="button"
              onClick={popNode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all font-semibold cursor-pointer mr-1.5 shadow-2xs"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetToRoot}
            className={`transition-colors font-semibold ${
              currentLevel === 0 ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900 cursor-pointer"
            }`}
          >
            Home
          </button>

          {activeDomain && (
            <>
              <span className="text-slate-400 font-normal">&gt;</span>
              <button
                type="button"
                onClick={() => currentLevel > 1 && popNode()}
                className={`transition-colors ${
                  currentLevel === 1 ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900 cursor-pointer font-medium"
                }`}
              >
                {activeDomain.label}
              </button>
            </>
          )}

          {activePath && (
            <>
              <span className="text-slate-400 font-normal">&gt;</span>
              <span className="font-extrabold text-slate-900">{activePath.label}</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Interactive Career Path</span>
        </div>
      </div>

      {/* 2. Layer Views with Animated Transition */}
      <AnimatePresence mode="wait" custom={direction}>
        {currentLevel === 0 && (
          <motion.div
            key="domains-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header Section */}
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs font-extrabold tracking-wider uppercase mb-3 border border-vcet-blue/20">
                <FaCodeBranch className="w-3 h-3" />
                10 Core Tech Domains
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark-deep tracking-tight mb-3">
                Explore Your Future Tech Career
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Choose a specialized domain below to explore structured learning paths, industry skills, step-by-step
                milestones, and career roadmaps.
              </p>
            </div>

            {/* The 10 Domain Cards Grid (Matching reference screenshot exactly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ROADMAP_DOMAINS.map((domain) => {
                const pathsCount = domain.children ? domain.children.length : 0;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => pushNode(domain)}
                    className="group relative flex flex-col justify-between text-left bg-white border border-[#C9C9C9]/80 hover:border-vcet-blue rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-pointer"
                  >
                    {/* Top colored accent stripe (TechVerse color code) */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all duration-300"
                      style={{ backgroundColor: domain.color }}
                    />

                    <div>
                      {/* Domain Icon Container */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-200"
                        style={{
                          backgroundColor: domain.bgLight,
                          color: domain.color,
                        }}
                      >
                        <DomainIcon name={domain.icon} className="w-5 h-5" />
                      </div>

                      {/* Domain Title */}
                      <h3 className="text-base sm:text-lg font-extrabold text-vcet-dark-deep tracking-tight mb-2 group-hover:text-vcet-blue transition-colors">
                        {domain.label}
                      </h3>

                      {/* Domain Description (2 lines clamp) */}
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4 font-normal">
                        {domain.details?.overview}
                      </p>
                    </div>

                    {/* Bottom Row: Path Count Pill & Hover Arrow */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold group-hover:bg-vcet-blue/10 group-hover:text-vcet-blue transition-colors">
                        <FaDiagramProject className="w-2.5 h-2.5" />
                        <span>{pathsCount} paths</span>
                      </span>

                      {/* Hover Arrow (sliding in on hover as shown in reference) */}
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-400 group-hover:text-vcet-blue group-hover:translate-x-1 transition-all">
                        <FiArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentLevel === 1 && activeDomain && (
          <motion.div
            key={`domain-${activeDomain.id}`}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Domain Hero Header */}
            <div className="bg-white border border-[#C9C9C9]/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: activeDomain.bgLight, color: activeDomain.color }}
                >
                  <DomainIcon name={activeDomain.icon} className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-vcet-blue">Domain Overview</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeDomain.children?.length || 0} Specialization Paths
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-vcet-dark-deep tracking-tight">
                    {activeDomain.label}
                  </h2>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl font-normal">
                {activeDomain.details?.overview}
              </p>
            </div>

            {/* Domain Paths Sub-Grid */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-vcet-dark-deep mb-4 flex items-center gap-2">
                <span>Select a Career Path to View Structured Roadmap</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeDomain.children || []).map((path) => {
                  const details = path.details || {};
                  const isCareer = details.type === "career";
                  const subTopicsCount = path.children ? path.children.length : 0;

                  return (
                    <button
                      key={path.id}
                      type="button"
                      onClick={() => pushNode(path)}
                      className="group relative flex flex-col justify-between text-left bg-white border border-[#C9C9C9]/80 hover:border-vcet-blue rounded-2xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                    >
                      {/* Top Accent Stripe */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all duration-300"
                        style={{ backgroundColor: activeDomain.color }}
                      />

                      <div>
                        {/* Top row: Icon + Name + Difficulty */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: activeDomain.bgLight, color: activeDomain.color }}
                            >
                              <DomainIcon name={path.icon} className="w-5 h-5" />
                            </div>
                            <span className="text-base font-extrabold text-vcet-dark-deep group-hover:text-vcet-blue transition-colors">
                              {path.label}
                            </span>
                          </div>

                          {details.difficulty && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                details.difficulty === "Advanced"
                                  ? "bg-rose-100 text-rose-700"
                                  : details.difficulty === "Intermediate"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {details.difficulty.slice(0, 3)}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                          {details.overview || details.what}
                        </p>
                      </div>

                      {/* Footer CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-vcet-blue flex items-center gap-1 group-hover:underline">
                          {isCareer ? "Explore Roadmap & Skills" : "View Curriculum"}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-vcet-blue group-hover:translate-x-1 transition-all">
                          {subTopicsCount > 0 && (
                            <span className="text-[10px] text-slate-400 mr-1 font-semibold">
                              ({subTopicsCount} sub-topics)
                            </span>
                          )}
                          <FiArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {currentLevel >= 2 && activePath && (
          <motion.div
            key={`path-${activePath.id}`}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Detailed Career Roadmap & Mind Map View */}
            <DetailedRoadmapView node={activePath} domain={activeDomain} onSelectSubNode={pushNode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Orange circular connector node matching the reference design
 */
function OrangeNodeDot({ className = "" }) {
  return (
    <div
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f95716] flex items-center justify-center shadow-md ring-4 ring-orange-100 shrink-0 ${className}`}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-white" />
    </div>
  );
}

/**
 * Detailed Mind Map & Multi-Step Roadmap View for a Selected Career Path
 * Styled to match the AiDots interactive diagram design:
 * - SKILLS card at the top
 * - LANGUAGES and TOOLS with orange node connector
 * - Central Path Card with blue border & squircle icon
 * - PROJECTS & Ancillary cards (left) connected with orange node to ROADMAP card (right)
 * - ROADMAP card with orange border, BEGINNER (green), INTERMEDIATE (amber), ADVANCED (red)
 */
function DetailedRoadmapView({ node, domain, onSelectSubNode }) {
  const details = node.details || {};
  const roadmapLevels = details.roadmap || null;

  const skills = details.skills || [];
  const languages = details.languages || [];
  const frameworks = details.frameworks || [];
  const tools = details.tools || [];
  const projects = details.projects || [];
  const certifications = details.certifications || [];
  const companies = details.companies || [];
  const resources = details.resources || [];

  // Extract roadmap steps by level
  const beginnerSteps = Array.isArray(roadmapLevels?.beginner) ? roadmapLevels.beginner : [];
  const intermediateSteps = Array.isArray(roadmapLevels?.intermediate) ? roadmapLevels.intermediate : [];
  const advancedSteps = Array.isArray(roadmapLevels?.advanced) ? roadmapLevels.advanced : [];

  // Calculate cumulative numbering
  const intermediateStartIdx = beginnerSteps.length;
  const advancedStartIdx = beginnerSteps.length + intermediateSteps.length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. TOP CARD: SKILLS */}
      {skills.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
            <FiList className="w-4 h-4 text-slate-400" />
            <span>SKILLS</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200/80 shadow-2xs hover:bg-slate-100 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. ROW: LANGUAGES & TOOLS with Center Orange Connector */}
      {(languages.length > 0 || tools.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Left: Languages */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs h-full flex flex-col justify-start">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              <span className="font-mono text-xs font-bold text-slate-400">&lt;/&gt;</span>
              <span>LANGUAGES</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold border border-blue-200/80 shadow-2xs hover:bg-blue-100/70 transition-colors"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Center Connector Dot */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <OrangeNodeDot />
          </div>

          {/* Right: Tools */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs h-full flex flex-col justify-start">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              <FiTool className="w-3.5 h-3.5 text-slate-400" />
              <span>TOOLS</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-50 text-cyan-700 text-xs sm:text-sm font-semibold border border-cyan-200/80 shadow-2xs hover:bg-cyan-100/70 transition-colors"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CENTRAL PATH HERO CARD (Blue border & rounded squircle icon) */}
      <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 sm:p-10 text-center shadow-xs max-w-3xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <DomainIcon name={node.icon} className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2.5">
          {node.label}
        </h1>

        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto font-normal">
          {details.overview || details.what}
        </p>
      </div>

      {/* 4. BOTTOM SECTION: Left (Projects & details) + Orange Connector + Right (ROADMAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.35fr] items-start gap-6 max-w-6xl mx-auto">
        {/* Left Column: Projects, Frameworks, Certifications, Companies, etc. */}
        <div className="space-y-6">
          {/* Projects Card */}
          {projects.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                <FiFolder className="w-3.5 h-3.5 text-slate-400" />
                <span>PROJECTS</span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {projects.map((proj, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-semibold border border-emerald-200/80 shadow-2xs hover:bg-emerald-100/70 transition-colors"
                  >
                    {proj}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Frameworks & Libraries (if present) */}
          {frameworks.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                <FaLayerGroup className="w-3.5 h-3.5 text-slate-400" />
                <span>FRAMEWORKS & LIBRARIES</span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {frameworks.map((fw, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-semibold border border-indigo-200/80 shadow-2xs hover:bg-indigo-100/70 transition-colors"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Industry Certifications */}
          {certifications.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                <FiAward className="w-4 h-4 text-slate-400" />
                <span>CERTIFICATIONS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Hiring Companies */}
          {companies.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                <FaBuilding className="w-3.5 h-3.5 text-slate-400" />
                <span>TOP HIRING COMPANIES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {companies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Why Choose This Path */}
          {details.whyChoose && (
            <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-5 shadow-2xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-800 mb-1.5">
                Why Choose This Path?
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {details.whyChoose}
              </p>
            </div>
          )}

          {/* Curated Resources */}
          {resources.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">
                <FiBookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>CURATED RESOURCES</span>
              </div>
              <div className="space-y-2">
                {resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-sky-50/50 hover:border-sky-300 transition-all group"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                      {res.name}
                    </span>
                    <FiExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Specializations / Paths */}
          {node.children && node.children.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Specialize Further ({node.children.length} paths)
              </h4>
              <div className="flex flex-wrap gap-2">
                {node.children.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectSubNode(sub)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50 text-xs font-bold text-slate-700 hover:text-sky-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <DomainIcon name={sub.icon} className="w-3.5 h-3.5 text-sky-600" />
                    <span>{sub.label}</span>
                    <FiChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Future Scope */}
          {details.futureScope && (
            <div className="bg-gradient-to-r from-orange-50/70 to-white border border-orange-200/70 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <FaRocket className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-600 mb-1">
                  Future Industry Outlook
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {details.futureScope}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center Connector Dot */}
        <div className="hidden lg:flex flex-col items-center justify-center pt-8">
          <OrangeNodeDot />
        </div>

        {/* Right Column: The Orange-Bordered ROADMAP Card */}
        {roadmapLevels && (
          <div className="bg-white border-2 border-orange-400 rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              <FiCompass className="w-4 h-4 text-slate-400" />
              <span>ROADMAP</span>
            </div>

            {/* BEGINNER Section */}
            {beginnerSteps.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-emerald-600 uppercase mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>BEGINNER</span>
                </div>
                <div className="space-y-1.5">
                  {beginnerSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="px-2.5 py-0.5 rounded-full border border-emerald-500 text-emerald-600 text-xs font-bold font-mono tracking-tight shrink-0 min-w-[28px] text-center">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-slate-700 leading-snug">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERMEDIATE Section */}
            {intermediateSteps.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-amber-500 uppercase mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>INTERMEDIATE</span>
                </div>
                <div className="space-y-1.5">
                  {intermediateSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="px-2.5 py-0.5 rounded-full border border-amber-500 text-amber-500 text-xs font-bold font-mono tracking-tight shrink-0 min-w-[28px] text-center">
                        {String(intermediateStartIdx + idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-slate-700 leading-snug">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADVANCED Section */}
            {advancedSteps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-black tracking-wider text-rose-500 uppercase mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>ADVANCED</span>
                </div>
                <div className="space-y-1.5">
                  {advancedSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="px-2.5 py-0.5 rounded-full border border-rose-500 text-rose-500 text-xs font-bold font-mono tracking-tight shrink-0 min-w-[28px] text-center">
                        {String(advancedStartIdx + idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-slate-700 leading-snug">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
