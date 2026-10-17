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
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-[#C9C9C9]/80 rounded-2xl px-4 sm:px-6 py-3 mb-8 shadow-xs">
        <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium">
          {currentLevel > 0 && (
            <button
              type="button"
              onClick={popNode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9C9C9] text-vcet-dark hover:text-vcet-blue hover:border-vcet-blue bg-slate-50 transition-all font-semibold cursor-pointer mr-1"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetToRoot}
            className={`transition-colors font-bold ${
              currentLevel === 0 ? "text-vcet-blue" : "text-vcet-dark hover:text-vcet-blue cursor-pointer"
            }`}
          >
            Roadmaps
          </button>

          {activeDomain && (
            <>
              <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => currentLevel > 1 && popNode()}
                className={`transition-colors font-bold ${
                  currentLevel === 1 ? "text-vcet-blue" : "text-vcet-dark hover:text-vcet-blue cursor-pointer"
                }`}
              >
                {activeDomain.label}
              </button>
            </>
          )}

          {activePath && (
            <>
              <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-extrabold text-vcet-blue">{activePath.label}</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-vcet-blue animate-pulse" />
          <span>TechVerse Interactive Roadmaps</span>
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
 * Detailed Mind Map & Multi-Step Roadmap View for a Selected Career Path
 * Built with TechVerse branding:
 * - Primary VCET Blue (#0062A8)
 * - Dark Gray (#444445)
 * - Light Gray (#C9C9C9)
 * - White (#FFFFFF)
 */
function DetailedRoadmapView({ node, domain, onSelectSubNode }) {
  const details = node.details || {};
  const roadmapLevels = details.roadmap || null;
  const isTechType = details.type === "tech";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Central Hero Card */}
      <div className="bg-white border border-[#C9C9C9]/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: domain?.bgLight || "#0062A814", color: domain?.color || "#0062A8" }}
          >
            <DomainIcon name={node.icon} className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-vcet-blue">
                {domain?.label} Specialization
              </span>
              {details.difficulty && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-bold text-slate-500">{details.difficulty}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark-deep tracking-tight">
              {node.label}
            </h1>
          </div>
        </div>

        {/* Overview */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-4">
          {details.overview || details.what}
        </p>

        {/* Why Choose This Path */}
        {details.whyChoose && (
          <div className="bg-vcet-blue/5 border border-vcet-blue/20 rounded-2xl p-4 sm:p-5 mt-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-vcet-blue mb-1">
              Why Choose This Path?
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{details.whyChoose}</p>
          </div>
        )}


      </div>

      {/* 2. Step-by-Step Learning Milestones Roadmap */}
      {roadmapLevels && (
        <div className="bg-white border border-[#C9C9C9]/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-vcet-blue/10 text-vcet-blue flex items-center justify-center font-bold">
              <FiCompass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-vcet-dark-deep tracking-tight">
                Step-by-Step Learning Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Progressive milestones structured from beginner foundations to advanced mastery.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {["beginner", "intermediate", "advanced"].map((levelKey, lIdx) => {
              const steps = roadmapLevels[levelKey];
              if (!steps || steps.length === 0) return null;

              const levelTitle =
                levelKey === "beginner" ? "Beginner" : levelKey === "intermediate" ? "Intermediate" : "Advanced";

              const badgeColor =
                levelKey === "beginner"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : levelKey === "intermediate"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-rose-50 text-rose-800 border-rose-200";

              return (
                <div key={levelKey} className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/50">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${badgeColor}`}>
                      Phase {lIdx + 1} — {levelTitle}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">({steps.length} milestones)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {steps.map((stepText, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-vcet-blue transition-colors"
                      >
                        <span className="shrink-0 w-6 h-6 rounded-lg bg-vcet-blue/10 text-vcet-blue font-bold font-mono text-xs flex items-center justify-center mt-0.5">
                          {String(sIdx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">{stepText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Skills, Languages, Tools & Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Skills */}
        {details.skills && details.skills.length > 0 && (
          <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-vcet-dark mb-3 flex items-center gap-2">
              <FaDiagramProject className="text-vcet-blue" />
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {details.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Frameworks */}
        {(details.languages || details.frameworks) && (
          <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-vcet-dark mb-3 flex items-center gap-2">
              <FaCode className="text-vcet-blue" />
              Languages & Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {[...(details.languages || []), ...(details.frameworks || [])].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-vcet-blue/10 text-vcet-blue font-bold text-xs border border-vcet-blue/20"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tools & Platforms */}
        {details.tools && details.tools.length > 0 && (
          <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-vcet-dark mb-3 flex items-center gap-2">
              <FaGears className="text-vcet-blue" />
              Industry Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {details.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Real-World Projects & Recommended Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        {details.projects && details.projects.length > 0 && (
          <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-vcet-dark-deep mb-4 flex items-center gap-2">
              <FaFlask className="text-vcet-blue" />
              Portfolio Projects to Build
            </h3>
            <div className="space-y-2.5">
              {details.projects.map((proj, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <FiFolder className="w-4 h-4 text-vcet-blue shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">{proj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Companies */}
        <div className="space-y-6">
          {details.certifications && details.certifications.length > 0 && (
            <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-vcet-dark-deep mb-3 flex items-center gap-2">
                <FaCertificate className="text-vcet-blue" />
                Industry Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {details.companies && details.companies.length > 0 && (
            <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-extrabold text-vcet-dark-deep mb-3 flex items-center gap-2">
                <FaBuilding className="text-vcet-blue" />
                Top Hiring Companies
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.companies.map((comp) => (
                  <span
                    key={comp}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Learning Resources & Practice Platforms */}
      {details.resources && details.resources.length > 0 && (
        <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-vcet-dark-deep mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-vcet-blue" />
            Curated Learning Resources & Documentation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-vcet-blue/5 hover:border-vcet-blue transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FiBookOpen className="w-4 h-4 text-vcet-blue" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-vcet-blue transition-colors">
                    {res.name}
                  </span>
                </div>
                <FiExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-vcet-blue" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sub-topics / Specializations Further Down (if any) */}
      {node.children && node.children.length > 0 && (
        <div className="bg-white border border-[#C9C9C9]/80 rounded-2xl p-6 shadow-xs text-center">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Specialize Further in this Sub-Domain ({node.children.length} paths)
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {node.children.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubNode(sub)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C9C9C9] bg-white hover:border-vcet-blue hover:bg-vcet-blue/5 text-xs sm:text-sm font-bold text-vcet-dark hover:text-vcet-blue transition-all cursor-pointer shadow-2xs"
              >
                <DomainIcon name={sub.icon} className="w-4 h-4 text-vcet-blue" />
                <span>{sub.label}</span>
                <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Future Scope & AI Impact */}
      {details.futureScope && (
        <div className="bg-gradient-to-r from-vcet-blue/10 via-slate-50 to-white border border-vcet-blue/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-vcet-blue text-white flex items-center justify-center shrink-0">
            <FaRocket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-vcet-blue mb-1">
              Future Industry Outlook & AI Readiness
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{details.futureScope}</p>
          </div>
        </div>
      )}
    </div>
  );
}
