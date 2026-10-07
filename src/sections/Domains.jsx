/**
 * Scrollytelling Vertically Stacked Sections for VCET Tech Hub (TechVerse)
 * 4 Curated alternating domain sections with uniform, balanced image sizing,
 * interactive 3D parallax hover, staggered keyword tags, and direct navigation.
 * Palette: VCET Blue (#0062A8), Dark Gray (#444445), Light Gray (#C9C9C9), White (#FFFFFF)
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiGlobe, FiBell, FiYoutube, FiAward } from "react-icons/fi";

// Import High-Res 4 Domain Visuals
import techExplorerImg from "../assets/domains/Tech Explore.jpg";
import techPulseImg from "../assets/domains/Tech Pulse.jpg";
import techVisionImg from "../assets/domains/tech-vision-cinematic.jpg";
import skillForgeImg from "../assets/domains/aptitude-cinematic.jpg";

// Motion constants
const EASE_EXPO = [0.16, 1, 0.3, 1];

export default function Domains({ resources = [] }) {
  const navigate = useNavigate();

  const getCount = (type) => resources.filter((r) => r.type === type).length;

  return (
    <div className="relative bg-[#F8FAFC] text-vcet-dark selection:bg-vcet-blue selection:text-white flex flex-col gap-10 sm:gap-14 lg:gap-16 py-10 sm:py-14 lg:py-16">

      {/* =========================================================================
          SECTION 1: TECH EXPLORER (Image LEFT, Text RIGHT)
          ========================================================================= */}
      <section
        id="section-technology"
        className="py-10 sm:py-14 lg:py-16 border-y border-slate-200/70 relative overflow-hidden bg-white shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* LEFT: Uniform Framed Image */}
          <div
            onClick={() => navigate("/technology")}
            className="w-full lg:w-[48%] h-[320px] sm:h-[380px] lg:h-[420px] relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 flex shrink-0 order-2 lg:order-1"
          >
            <img
              src={techExplorerImg}
              alt="Tech Explorer Web Platforms"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Curtain Reveal Overlay */}
            <motion.div
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: EASE_EXPO }}
              style={{ transformOrigin: "right" }}
              className="absolute inset-0 bg-vcet-blue z-10 pointer-events-none"
            />

            {/* Ambient Overlay & Badge */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-6 sm:p-8 pointer-events-none">
              <div className="self-start px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-vcet-blue text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <FiGlobe size={14} />
                <span>Web Platforms</span>
              </div>

              <div className="flex items-center justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-vcet-gray font-mono block">
                    RESOURCE DOMAIN
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Tech Explorer
                  </h4>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 bg-vcet-blue text-white rounded-xl shadow-xs">
                  {getCount("technology") || 10}+ Websites
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Text Content with Padding */}
          <div className="w-full lg:w-[52%] flex items-center order-1 lg:order-2">
            <div className="max-w-xl mx-auto lg:mx-0 space-y-5">
              {/* 1. Section Number & Pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl sm:text-4xl font-mono font-black text-vcet-blue/30">
                  01
                </span>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs uppercase tracking-widest font-bold">
                  <FiGlobe size={13} />
                  <span>Section 01 • Hands-On Learning</span>
                </div>
              </motion.div>

              {/* 2. Main Title */}
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark tracking-tight leading-tight"
              >
                Tech Explorer — Websites to Improve Tech Knowledge
              </motion.h2>

              {/* 3. Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.3 }}
                className="text-sm sm:text-base text-vcet-dark/80 leading-relaxed font-normal"
              >
                Discover curated websites that open the door to new technologies, artificial intelligence, cybersecurity challenges, and interactive development platforms designed to elevate engineering skills.
              </motion.p>

              {/* 4. Tags / Keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {["AI", "CYBERSECURITY", "INNOVATION", "WEB DEVELOPMENT", "CLOUD"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: EASE_EXPO }}
                    className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 bg-vcet-gray-light text-vcet-dark rounded-xl border border-vcet-gray-border/70 hover:border-vcet-blue hover:text-vcet-blue transition-colors"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              {/* 5. CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.5 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate("/technology")}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-vcet-blue hover:bg-vcet-blue-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-vcet-blue focus:ring-offset-2"
                >
                  <span>Explore Tech Explorer</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-block group-hover:translate-x-1.5 transition-transform duration-200"
                  >
                    <FiArrowRight size={16} />
                  </motion.span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: TECH PULSE (Text LEFT, Image RIGHT)
          ========================================================================= */}
      <section
        id="section-updates"
        className="py-10 sm:py-14 lg:py-16 border-y border-slate-200/70 relative overflow-hidden bg-[#FAFAFA] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* LEFT: Text Content with Padding */}
          <div className="w-full lg:w-[52%] flex items-center">
            <div className="max-w-xl mx-auto lg:mx-0 space-y-5">
              {/* 1. Section Number & Pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl sm:text-4xl font-mono font-black text-vcet-blue/30">
                  02
                </span>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs uppercase tracking-widest font-bold">
                  <FiBell size={13} />
                  <span>Section 02 • Real-Time Feeds</span>
                </div>
              </motion.div>

              {/* 2. Main Title */}
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark tracking-tight leading-tight"
              >
                Tech Pulse — Apps for Tech Updates
              </motion.h2>

              {/* 3. Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.3 }}
                className="text-sm sm:text-base text-vcet-dark/80 leading-relaxed font-normal"
              >
                Catch the pulse of the tech industry. Access real-time technology news, AI breakthroughs, framework updates, open-source releases, and engaging engineering discussions in one unified stream.
              </motion.p>

              {/* 4. Tags / Keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {["AI NEWS", "INDUSTRY TRENDS", "DEV DISCUSSIONS", "TECH ALERTS", "COMMUNITY"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: EASE_EXPO }}
                    className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 bg-white text-vcet-dark rounded-xl border border-vcet-gray-border/70 hover:border-vcet-blue hover:text-vcet-blue transition-colors shadow-2xs"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              {/* 5. CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.5 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate("/updates")}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-vcet-blue hover:bg-vcet-blue-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-vcet-blue focus:ring-offset-2"
                >
                  <span>Explore Tech Pulse</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-block group-hover:translate-x-1.5 transition-transform duration-200"
                  >
                    <FiArrowRight size={16} />
                  </motion.span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: Uniform Framed Image */}
          <div
            onClick={() => navigate("/updates")}
            className="w-full lg:w-[48%] h-[320px] sm:h-[380px] lg:h-[420px] relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 flex shrink-0"
          >
            <img
              src={techPulseImg}
              alt="Tech Pulse News and Feeds"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Curtain Reveal Overlay */}
            <motion.div
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: EASE_EXPO }}
              style={{ transformOrigin: "left" }}
              className="absolute inset-0 bg-vcet-blue z-10 pointer-events-none"
            />

            {/* Ambient Overlay & Badge */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-6 sm:p-8 pointer-events-none">
              <div className="self-start px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-vcet-blue text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <FiBell size={14} />
                <span>Real-Time Updates</span>
              </div>

              <div className="flex items-center justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-vcet-gray font-mono block">
                    RESOURCE DOMAIN
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Tech Pulse
                  </h4>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 bg-vcet-blue text-white rounded-xl shadow-xs">
                  {getCount("updates") || 8}+ Feeds & Apps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: TECH VISION (Image LEFT, Text RIGHT)
          ========================================================================= */}
      <section
        id="section-youtube"
        className="py-10 sm:py-14 lg:py-16 border-y border-slate-200/70 relative overflow-hidden bg-white shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* LEFT: Uniform Framed Image */}
          <div
            onClick={() => navigate("/youtube")}
            className="w-full lg:w-[48%] h-[320px] sm:h-[380px] lg:h-[420px] relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 flex shrink-0 order-2 lg:order-1"
          >
            <img
              src={techVisionImg}
              alt="Tech Vision Video Tutorials"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Curtain Reveal Overlay */}
            <motion.div
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: EASE_EXPO }}
              style={{ transformOrigin: "right" }}
              className="absolute inset-0 bg-vcet-blue z-10 pointer-events-none"
            />

            {/* Ambient Overlay & Badge */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-6 sm:p-8 pointer-events-none">
              <div className="self-start px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-vcet-blue text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <FiYoutube size={14} />
                <span>Video Channels</span>
              </div>

              <div className="flex items-center justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-vcet-gray font-mono block">
                    RESOURCE DOMAIN
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Tech Vision
                  </h4>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 bg-vcet-blue text-white rounded-xl shadow-xs">
                  {getCount("youtube") || 6}+ Curated Channels
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Text Content with Padding */}
          <div className="w-full lg:w-[52%] flex items-center order-1 lg:order-2">
            <div className="max-w-xl mx-auto lg:mx-0 space-y-5">
              {/* 1. Section Number & Pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl sm:text-4xl font-mono font-black text-vcet-blue/30">
                  03
                </span>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs uppercase tracking-widest font-bold">
                  <FiYoutube size={13} />
                  <span>Section 03 • Visual Lectures & Demos</span>
                </div>
              </motion.div>

              {/* 2. Main Title */}
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark tracking-tight leading-tight"
              >
                Tech Vision — Tech YouTube Channels
              </motion.h2>

              {/* 3. Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: 0.3 }}
                className="text-sm sm:text-base text-vcet-dark/80 leading-relaxed font-normal"
              >
                Learn through visual storytelling, animated deep-dives, paper breakdowns, research insights, and comprehensive programming masterclasses curated from the best engineering creators globally.
              </motion.p>

              {/* 4. Tags / Keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {["AI SUMMARIES", "CODE TUTORIALS", "RESEARCH DEMOS", "DEEP DIVES", "ARCHITECTURE"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: EASE_EXPO }}
                    className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 bg-vcet-gray-light text-vcet-dark rounded-xl border border-vcet-gray-border/70 hover:border-vcet-blue hover:text-vcet-blue transition-colors"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              {/* 5. CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.5 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate("/youtube")}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-vcet-blue hover:bg-vcet-blue-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-vcet-blue focus:ring-offset-2"
                >
                  <span>Explore Tech Vision</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-block group-hover:translate-x-1.5 transition-transform duration-200"
                  >
                    <FiArrowRight size={16} />
                  </motion.span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SKILL FORGE (Text LEFT, Image RIGHT)
          ========================================================================= */}
      <section
        id="section-aptitude"
        className="py-10 sm:py-14 lg:py-16 border-y border-slate-200/70 relative overflow-hidden bg-[#FAFAFA] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* LEFT: Text Content with Padding */}
          <div className="w-full lg:w-[52%] flex items-center">
            <div className="max-w-xl mx-auto lg:mx-0 space-y-5">
              {/* 1. Section Number & Pill */}
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl sm:text-4xl font-mono font-black text-vcet-blue/30">
                  04
                </span>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs uppercase tracking-widest font-bold">
                  <FiAward size={13} />
                  <span>Section 04 • Placement Ready</span>
                </div>
              </motion.div>

              {/* 2. Main Title */}
              <motion.h2
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-vcet-dark tracking-tight leading-tight"
              >
                Skill Forge — Aptitude Preparation Apps
              </motion.h2>

              {/* 3. Description */}
              <motion.p
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.3 }}
                className="text-sm sm:text-base text-vcet-dark/80 leading-relaxed font-normal"
              >
                Sharpen your analytical acumen. Master quantitative ability, logical deduction, verbal reasoning, and company-specific recruitment mock tests with high-yield practice tools.
              </motion.p>

              {/* 4. Tags / Keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {["QUANTITATIVE", "LOGICAL REASONING", "VERBAL PROFICIENCY", "MOCK DRILLS", "PLACEMENTS"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.4 + i * 0.08 }}
                    className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 bg-white text-vcet-dark rounded-xl border border-vcet-gray-border/70 hover:border-vcet-blue hover:text-vcet-blue transition-colors shadow-2xs"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>

              {/* 5. CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.5 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate("/aptitude")}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-vcet-blue hover:bg-vcet-blue-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer focus:ring-2 focus:ring-vcet-blue focus:ring-offset-2"
                >
                  <span>Explore Skill Forge</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="inline-block group-hover:translate-x-1.5 transition-transform duration-200"
                  >
                    <FiArrowRight size={16} />
                  </motion.span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: Uniform Framed Image */}
          <div
            onClick={() => navigate("/aptitude")}
            className="w-full lg:w-[48%] h-[320px] sm:h-[380px] lg:h-[420px] relative group cursor-pointer overflow-hidden rounded-3xl shadow-lg border border-slate-200/80 flex shrink-0"
          >
            <img
              src={skillForgeImg}
              alt="Skill Forge Aptitude Training"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Curtain Reveal Overlay */}
            <motion.div
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: EASE_EXPO }}
              style={{ transformOrigin: "left" }}
              className="absolute inset-0 bg-vcet-blue z-10 pointer-events-none"
            />

            {/* Ambient Overlay & Badge */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-6 sm:p-8 pointer-events-none">
              <div className="self-start px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-vcet-blue text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <FiAward size={14} />
                <span>Aptitude Training</span>
              </div>

              <div className="flex items-center justify-between text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-vcet-gray font-mono block">
                    RESOURCE DOMAIN
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Skill Forge
                  </h4>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 bg-vcet-blue text-white rounded-xl shadow-xs">
                  {getCount("aptitude") || 6}+ Platforms & Drills
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
