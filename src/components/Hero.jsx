import React from "react";
import { motion } from "framer-motion";
import CollegeBackground from "./CollegeBackground";
import empowerLogo from "../assets/vcet-empower-blue.png";

export default function Hero() {
  return (
    <>
      {/* 1. Hero Showcase Section with Campus Slideshow */}
      <section
        id="home"
        style={{ clipPath: "inset(0)" }}
        className="hero-section relative min-h-[82vh] lg:min-h-[86vh] flex items-center justify-center py-24 sm:py-32 px-6 sm:px-8 overflow-hidden select-none"
      >
        {/* Layer 1 & 2: Continuous Campus Background Slideshow + Contrast Overlay */}
        <CollegeBackground />

        {/* Layer 3: Hero Content (Modern, high-end typography hierarchy) */}
        <div className="hero-content relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Modern Contemporary Headline: Mixed-Weight & Gradient Effect */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'Sora', 'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.04em",
            }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-8 sm:mb-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          >
            <span className="font-extrabold text-white">Tech</span>
            <span className="font-light bg-gradient-to-r from-white via-[#93c5fd] to-[#38bdf8] bg-clip-text text-transparent ml-0.5">
              Verse
            </span>
          </motion.h1>

          {/* Refined, High-Contrast Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.70)",
            }}
            className="max-w-xl text-sm sm:text-base md:text-lg text-white/90 font-normal leading-relaxed px-4"
          >
            Your curated gateway to cutting-edge web platforms, real-time tech updates, world-class tutorials, and placement aptitude training.
          </motion.p>
        </div>
      </section>

      {/* 2. Dedicated White Space Strip with Centered VCET Logo & Scroll View Animation */}
      <section className="w-full bg-white py-8 sm:py-12 flex items-center justify-center border-b border-[#C9C9C9]/40 relative z-10 shadow-2xs">
        <div className="flex flex-col items-center justify-center px-6">
          <img
            src={empowerLogo}
            alt="Velalar College of Engineering and Technology - Empowering the Next Generation"
            className="h-14 sm:h-18 md:h-20 max-w-[85vw] sm:max-w-[360px] object-contain autoRotate drop-shadow-xs"
          />
        </div>
      </section>
    </>
  );
}
