/**
 * Horizontal Snap-Scroll Edge-to-Edge Resource List View for VCET Tech Hub (TechVerse)
 * - Container-less, un-card-like design: No box borders, no rounded rectangle containers, no drop shadows.
 * - Horizontal swipe, drag-to-scroll, keyboard arrows, and minimal chevron navigation.
 * - Icon floats top-left, large title, plain paragraph flow, tags separated by "·", plain text link CTA.
 * - Featured items get wider panel width & colored background wash bleeding off.
 * - Bottom story dashes progress indicator.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { FiArrowLeft, FiArrowRight, FiExternalLink, FiChevronLeft, FiChevronRight, FiGlobe, FiSmartphone } from "react-icons/fi";
import { FaAndroid, FaApple, FaYoutube, FaNewspaper } from "react-icons/fa";

import TextReveal from "./TextReveal";


// Import Aptitude Logos
import indiabixLogo from "../assets/logos/IndiaBIX.jpg";
import pocketAptitudeLogo from "../assets/logos/pocket-aptitude-logo.png";
import prepinstaLogo from "../assets/logos/PrepInsta.png";
import careerrideLogo from "../assets/logos/careerride-logo.png";
import gfgLogo from "../assets/logos/GeeksforGeeks Aptitude.png";
import smartkeedaLogo from "../assets/logos/Smartkeeda.png";

// Import Tech Pulse (Updates) Logos
import dailyDevLogo from "../assets/logos/daily.dev.png";
import hackerNewsLogo from "../assets/logos/news.ycombinator.png";
import productHuntLogo from "../assets/logos/producthunt.png";
import techcrunchLogo from "../assets/logos/techcrunch.jpg";
import theVergeLogo from "../assets/logos/theverge.png";
import tldrTechLogo from "../assets/logos/tldr.tech.png";

// Import Tech Explore (Technology) Logos
import aiStudioLogo from "../assets/logos/aistuido.jpg";
import anthropicLogo from "../assets/logos/anthropic.png";
import freecodecampLogo from "../assets/logos/freecodecamp.png";
import googleSkillsLogo from "../assets/logos/google skills.jpg";
import mitLogo from "../assets/logos/mit.png";
import openaiLogo from "../assets/logos/openai.png";
import techradarLogo from "../assets/logos/techradar.jpg";
import tryhackmeLogo from "../assets/logos/tryhackme.png";
import wiredLogo from "../assets/logos/wired.webp";

// Import Tech Vision (YouTube) Logos
import anastasiLogo from "../assets/logos/Anastasi In Tech.jpg";
import deeplearningAiLogo from "../assets/logos/DeepLearningAI.jpg";
import fireshipLogo from "../assets/logos/Fireship.jpg";
import mattVidProLogo from "../assets/logos/MattVidPro.jpg";
import aiAdvantageLogo from "../assets/logos/The AI Advantage.jpg";
import twoMinutePapersLogo from "../assets/logos/Two Minute Papers.jpg";
import aiExplainedLogo from "../assets/logos/ai explained.jpg";
import mattWolfeLogo from "../assets/logos/mreflow.jpg";

const LOGO_MAP = {
  // Aptitude
  indiabix: indiabixLogo,
  "pocket-aptitude": pocketAptitudeLogo,
  prepinsta: prepinstaLogo,
  careerride: careerrideLogo,
  "gfg-aptitude": gfgLogo,
  smartkeeda: smartkeedaLogo,

  // Updates
  "daily-dev": dailyDevLogo,
  techcrunch: techcrunchLogo,
  "hacker-news": hackerNewsLogo,
  "tldr-tech": tldrTechLogo,
  "the-verge": theVergeLogo,
  "product-hunt": productHuntLogo,

  // Technology
  "google-ai-studio": aiStudioLogo,
  tryhackme: tryhackmeLogo,
  wired: wiredLogo,
  techradar: techradarLogo,
  "mit-tech-review": mitLogo,
  "anthropic-blog": anthropicLogo,
  "openai-blog": openaiLogo,
  freecodecamp: freecodecampLogo,
  "cloud-skills-boost": googleSkillsLogo,

  // YouTube
  "matt-wolfe": mattWolfeLogo,
  "ai-explained": aiExplainedLogo,
  "two-minute-papers": twoMinutePapersLogo,
  "deeplearning-ai": deeplearningAiLogo,
  "the-ai-advantage": aiAdvantageLogo,
  "mattvidpro-ai": mattVidProLogo,
  fireship: fireshipLogo,
  "anastasi-in-tech": anastasiLogo,
};

export default function ResourceListView({
  resources = [],
  pageTitle = "",
  badgeText = "VCET ACADEMIC & TECH REPOSITORIES",
  subtitle = "Access hand-picked technology portals, AI research hubs, cybersecurity platforms, and interactive engineering learning resources.",
  ctaText = "EXPLORE COURSES",
  ctaLink = "/courses",
}) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft: sLeft, clientWidth } = scrollRef.current;
    const panelWidth = clientWidth > 1024 ? clientWidth * 0.36 : clientWidth > 640 ? clientWidth * 0.48 : clientWidth * 0.82;
    const index = Math.round(sLeft / panelWidth);
    setActiveIndex(Math.max(0, Math.min(resources.length - 1, index)));
  }, [resources.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowLeft") {
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const scrollToIndex = (idx) => {
    if (!scrollRef.current) return;
    const targetIdx = Math.max(0, Math.min(resources.length - 1, idx));
    const items = scrollRef.current.querySelectorAll(".resource-panel");
    if (items[targetIdx]) {
      items[targetIdx].scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
      setActiveIndex(targetIdx);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const openUrl = (url) => {
    if (!hasMoved.current && url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getButtonLabel = (type) => {
    switch (type) {
      case "youtube":
        return "Visit Channel";
      case "aptitude":
        return "Open Resource";
      case "updates":
        return "Read Updates";
      default:
        return "Visit Website";
    }
  };

  return (
    <div className="relative min-h-[85vh] bg-[#F8FAFC] text-[#444445] pb-24 flex flex-col justify-between select-none">
      {/* =========================================================================
          1. HERO SECTION (Exact Match with Departments & Courses Pages)
          ========================================================================= */}
      <section className="relative bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xs">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border border-white/20" />
          <div className="absolute right-[-40px] top-1/4 h-80 w-80 rounded-full border border-white/20" />
          <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-100 mb-3 backdrop-blur-sm"
              >
                <Sparkles size={13} className="text-blue-200" />
                <span>{badgeText}</span>
              </motion.div>

              <TextReveal
                text={pageTitle || "Tech Explorer — Websites to Improve Tech Knowledge"}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                delay={0.12}
              />

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                  className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-xl"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-3 shrink-0"
            >
              <Link
                to={ctaLink}
                className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-[#0B4A8F] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-colors duration-150"
              >
                <span>{ctaText}</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1 text-[#0B4A8F]"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sub-Bar: Back to Home & Resource Count */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0062A8] hover:text-[#004e87] transition-colors duration-200"
        >
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="border-b border-transparent group-hover:border-[#004e87]">
            Back to Home
          </span>
        </Link>

        <span className="text-xs font-mono font-bold text-[#444445]/60 uppercase tracking-widest">
          {resources.length} Resources
        </span>
      </div>

      {/* Minimal Floating Edge Navigation Arrows */}
      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label="Previous resource"
        className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-2 text-[#444445]/40 hover:text-[#0062A8] transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
      >
        <FiChevronLeft size={42} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex + 1)}
        disabled={activeIndex === resources.length - 1}
        aria-label="Next resource"
        className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 p-2 text-[#444445]/40 hover:text-[#0062A8] transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
      >
        <FiChevronRight size={42} strokeWidth={1.5} />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full flex gap-10 sm:gap-14 lg:gap-16 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-6 sm:px-12 lg:px-20 cursor-grab active:cursor-grabbing py-6 my-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {resources.map((resource, index) => {
          const logoSrc = LOGO_MAP[resource.id];
          const isFeatured = resource.featured;

          return (
            <article
              key={resource.id}
              className={`resource-panel shrink-0 snap-start flex flex-col justify-between py-6 px-4 sm:px-6 relative transition-all duration-300 ${
                isFeatured
                  ? "w-[88vw] sm:w-[54vw] lg:w-[42vw] bg-[#0062A8]/[0.05] rounded-3xl"
                  : "w-[82vw] sm:w-[48vw] lg:w-[36vw]"
              }`}
            >
              {/* Huge Faint Background Numeral */}
              <div className="absolute top-2 right-4 text-[70px] sm:text-[90px] font-mono font-black text-[#0062A8]/[0.08] pointer-events-none select-none leading-none z-0">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="space-y-4 relative z-10">
                {/* Top Row: Floating Logo & Category */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => openUrl(resource.url)}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={`${resource.name} logo`}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#0062A8]/10 text-[#0062A8] flex items-center justify-center">
                        {resource.type === "youtube" ? (
                          <FaYoutube size={26} />
                        ) : resource.type === "updates" ? (
                          <FaNewspaper size={24} />
                        ) : (
                          <FiGlobe size={24} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isFeatured && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0062A8] bg-[#0062A8]/15 px-2.5 py-1 rounded-full">
                        ★ Top Pick
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#444445]/60">
                      {resource.category}
                    </span>
                  </div>
                </div>

                {/* Resource Name */}
                <h3
                  onClick={() => openUrl(resource.url)}
                  className="text-2xl sm:text-3xl font-extrabold text-[#444445] tracking-tight leading-snug cursor-pointer hover:text-[#0062A8] transition-colors"
                >
                  {resource.name}
                </h3>

                {/* Description in Plain Flow */}
                <p className="text-xs sm:text-sm text-[#444445]/80 leading-relaxed font-normal">
                  {resource.description}
                </p>

                {/* Tags as Inline Text Separated by "·" */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="text-[11px] font-semibold text-[#444445]/70 tracking-wider flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1">
                    {resource.tags.map((tag, idx) => (
                      <React.Fragment key={tag}>
                        <span className="underline underline-offset-4 decoration-[#C9C9C9] hover:text-[#0062A8] transition-colors">
                          #{tag}
                        </span>
                        {idx < resource.tags.length - 1 && (
                          <span className="text-[#0062A8] font-bold no-underline">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Row: Platform & Plain Text Link with Animated Underline */}
              <div className="pt-6 border-t border-[#C9C9C9]/40 flex items-center justify-between mt-6 relative z-10">
                <span className="text-[11px] text-[#444445]/60 font-medium">
                  {resource.platform}
                </span>

                <button
                  type="button"
                  onClick={() => openUrl(resource.url)}
                  className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0062A8] hover:text-[#004e87] transition-colors cursor-pointer focus:outline-none"
                >
                  <span className="border-b-2 border-[#0062A8] group-hover:border-[#004e87] pb-0.5 transition-colors">
                    {getButtonLabel(resource.type)}
                  </span>
                  <FiArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Story-Like Dashes Progress Track */}
      <div className="max-w-xs mx-auto flex items-center justify-center gap-2 pt-6">
        {resources.map((_, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to item ${idx + 1}`}
              className="group py-2 focus:outline-none cursor-pointer"
            >
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-8 bg-[#0062A8]"
                    : "w-3.5 bg-[#C9C9C9]/50 group-hover:bg-[#C9C9C9]"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
