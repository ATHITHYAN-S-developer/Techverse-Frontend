/**
 * ResourceRow Component for VCET Tech Hub (TechVerse)
 * Alternating full-width scrollytelling row for resources.
 * Features:
 * - Alternating Left/Right Logo Panel & Content
 * - High-res logo display with soft gradient panel & 3D tilt
 * - Featured "Top Pick" ribbon & shimmer glow (PrepInsta / Featured items)
 * - Staggered text, individual chip stamp tags, visual platform badges (Web, Android, iOS)
 * - Animated divider gradient line
 * Palette: VCET Blue (#0062A8), Dark Gray (#444445), Light Gray (#C9C9C9), White (#FFFFFF)
 */

import React from "react";
import { motion } from "framer-motion";
import {
  FiExternalLink,
  FiGlobe,
  FiArrowRight,
  FiStar,
  FiCheckCircle,
  FiSmartphone,
} from "react-icons/fi";
import { FaAndroid, FaApple, FaYoutube, FaBrain, FaNewspaper, FaLaptopCode } from "react-icons/fa";
import TiltCard from "./TiltCard";

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

const EASE_EXPO = [0.16, 1, 0.3, 1];

export default function ResourceRow({ resource, index, totalCount }) {
  const isEven = index % 2 === 0;
  const isFeatured = resource.featured;
  const logoSrc = LOGO_MAP[resource.id];

  // Visual platform badges
  const renderPlatformBadges = (platformStr = "") => {
    const p = platformStr.toLowerCase();
    const badges = [];

    if (p.includes("web")) {
      badges.push(
        <span
          key="web"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F4] text-[#444445] text-xs font-semibold border border-[#C9C9C9]/60 shadow-2xs"
        >
          <FiGlobe className="text-[#0062A8]" size={13} />
          <span>Web</span>
        </span>
      );
    }
    if (p.includes("android")) {
      badges.push(
        <span
          key="android"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F4] text-[#444445] text-xs font-semibold border border-[#C9C9C9]/60 shadow-2xs"
        >
          <FaAndroid className="text-emerald-600" size={13} />
          <span>Android</span>
        </span>
      );
    }
    if (p.includes("ios") || p.includes("apple")) {
      badges.push(
        <span
          key="ios"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F4] text-[#444445] text-xs font-semibold border border-[#C9C9C9]/60 shadow-2xs"
        >
          <FaApple className="text-[#444445]" size={13} />
          <span>iOS</span>
        </span>
      );
    }
    if (p.includes("mobile") && !badges.some((b) => b.key === "android" || b.key === "ios")) {
      badges.push(
        <span
          key="mobile"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F4] text-[#444445] text-xs font-semibold border border-[#C9C9C9]/60 shadow-2xs"
        >
          <FiSmartphone className="text-[#0062A8]" size={13} />
          <span>Mobile</span>
        </span>
      );
    }

    if (badges.length === 0 && platformStr) {
      badges.push(
        <span
          key="custom"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F4] text-[#444445] text-xs font-semibold border border-[#C9C9C9]/60"
        >
          <FiGlobe className="text-[#0062A8]" size={13} />
          <span>{platformStr}</span>
        </span>
      );
    }

    return badges;
  };

  const getButtonLabel = () => {
    switch (resource.type) {
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

  const openUrl = () => {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id={`resource-${resource.id}`}
      className={`relative w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-12 transition-colors duration-300 rounded-3xl ${
        isFeatured
          ? "bg-gradient-to-r from-[#0062A8]/[0.07] via-[#0062A8]/[0.03] to-[#0062A8]/[0.07] border-2 border-[#0062A8]/40 shadow-sm"
          : "bg-white border border-[#C9C9C9]/60 hover:border-[#0062A8]/40"
      }`}
    >
      {/* Featured Ribbon / Top Pick Badge */}
      {isFeatured && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0062A8] text-white text-xs font-extrabold uppercase tracking-wider shadow-md"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <FiStar size={13} className="text-amber-300 fill-amber-300" />
            </motion.span>
            <span>Top Pick • Featured</span>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* LOGO / PREVIEW PANEL */}
        <div
          className={`lg:col-span-5 flex justify-center ${
            isEven ? "order-1 lg:order-1" : "order-1 lg:order-2"
          }`}
        >
          <TiltCard maxTilt={6} className="w-full max-w-sm sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 16,
                delay: 0.15,
              }}
              onClick={openUrl}
              className={`group relative rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-md hover:shadow-2xl border ${
                isFeatured
                  ? "bg-gradient-to-br from-white via-[#F0F7FC] to-[#E3EFF9] border-[#0062A8]/30 hover:border-[#0062A8]"
                  : "bg-gradient-to-br from-white via-[#FAFAFA] to-[#F4F4F4] border-[#C9C9C9] hover:border-[#0062A8]"
              }`}
            >
              {/* Decorative Subtle Background Pattern */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0062A8_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl pointer-events-none" />

              {/* High-Res Logo or Styled Panel */}
              <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white p-4 shadow-sm border border-[#C9C9C9]/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={`${resource.name} logo`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#0062A8]/10 flex items-center justify-center text-[#0062A8]">
                    {resource.type === "youtube" ? (
                      <FaYoutube className="w-14 h-14 text-[#0062A8]" />
                    ) : resource.type === "updates" ? (
                      <FaNewspaper className="w-14 h-14 text-[#0062A8]" />
                    ) : (
                      <FiGlobe className="w-14 h-14 text-[#0062A8]" />
                    )}
                  </div>
                )}
              </div>

              {/* Resource Brand Title & Category badge below logo */}
              <div className="mt-5 text-center relative z-10">
                <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 bg-white text-[#0062A8] rounded-full border border-[#0062A8]/20 shadow-2xs">
                  {resource.category}
                </span>
                <p className="text-[11px] text-[#444445]/60 font-mono mt-2 uppercase tracking-widest">
                  {String(index + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
                </p>
              </div>
            </motion.div>
          </TiltCard>
        </div>

        {/* TEXT CONTENT & ACTIONS */}
        <div
          className={`lg:col-span-7 space-y-5 ${
            isEven ? "order-2 lg:order-2" : "order-2 lg:order-1"
          }`}
        >
          {/* 1. Header Row: Index & Category */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
            className="flex items-center gap-3"
          >
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#0062A8]/30">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0062A8] bg-[#0062A8]/10 px-3 py-1 rounded-full">
              {resource.type.toUpperCase()} • {resource.category}
            </span>
          </motion.div>

          {/* 2. Main Title */}
          <motion.h3
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease: EASE_EXPO, delay: 0.08 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#444445] tracking-tight leading-tight hover:text-[#0062A8] transition-colors cursor-pointer"
            onClick={openUrl}
          >
            {resource.name}
          </motion.h3>

          {/* 3. Description */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease: EASE_EXPO, delay: 0.15 }}
            className="text-sm sm:text-base text-[#444445]/85 leading-relaxed font-normal max-w-2xl"
          >
            {resource.description}
          </motion.p>

          {/* 4. Platform Availability Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.2 }}
            className="flex items-center gap-2 pt-1"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#444445]/60 mr-1">
              Available On:
            </span>
            <div className="flex flex-wrap gap-2">
              {renderPlatformBadges(resource.platform)}
            </div>
          </motion.div>

          {/* 5. Tags (Chips Stamped in Left-to-Right) */}
          {resource.tags && resource.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {resource.tags.map((tag, tagIdx) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.75, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 16,
                    delay: 0.28 + tagIdx * 0.06,
                  }}
                  className="text-xs font-bold text-[#444445] bg-[#F4F4F4] hover:bg-[#0062A8]/10 hover:text-[#0062A8] border border-[#C9C9C9]/70 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  #{tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* 6. CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              type: "spring",
              stiffness: 190,
              damping: 17,
              delay: 0.35,
            }}
            className="pt-3"
          >
            <button
              type="button"
              onClick={openUrl}
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#0062A8] hover:bg-[#004e87] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0062A8] focus:ring-offset-2"
            >
              <span>{getButtonLabel()}</span>
              <FiExternalLink
                size={15}
                className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Animated Gradient Line Divider at bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: EASE_EXPO }}
        style={{ transformOrigin: "left" }}
        className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#C9C9C9]/70 to-transparent"
      />
    </section>
  );
}
