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
import { FiArrowLeft, FiArrowRight, FiExternalLink, FiChevronLeft, FiChevronRight, FiGlobe, FiSmartphone } from "react-icons/fi";
import { FaAndroid, FaApple, FaYoutube, FaNewspaper } from "react-icons/fa";

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

export default function ResourceListView({ resources = [], pageTitle = "" }) {
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
    <div className="relative min-h-[85vh] bg-white text-[#444445] py-8 sm:py-12 flex flex-col justify-between select-none">
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between mb-8">
        {/* Back to Home Button with slide-left hover micro-animation */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#0062A8] hover:text-[#004e87] transition-colors duration-200"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1.5 transition-transform duration-200"
          />
          <span className="border-b border-transparent group-hover:border-[#004e87]">
            Back to Home
          </span>
        </Link>

        {/* Resources Counter */}
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
