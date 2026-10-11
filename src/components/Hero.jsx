import React from "react";
import { motion } from "framer-motion";
import { Infinity } from "lucide-react";
import CollegeBackground from "./CollegeBackground";

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
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-3 sm:mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          >
            <span className="font-extrabold text-white">Tech</span>
            <span className="font-light bg-gradient-to-r from-white via-[#93c5fd] to-[#38bdf8] bg-clip-text text-transparent ml-0.5">
              Verse
            </span>
          </motion.h1>

          {/* Elegant Cursive Quote: "One Point ∞ Endless Knowledge" */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center justify-center select-none mt-1 sm:mt-2"
          >
            <p
              style={{
                fontFamily: "'Great Vibes', 'Dancing Script', cursive",
              }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/95 font-normal tracking-wide drop-shadow-[0_3px_16px_rgba(0,0,0,0.85)] px-4 py-1 flex items-center justify-center gap-2.5 sm:gap-4"
            >
              <span>        One Point</span>
              <Infinity className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 lg:w-16 lg:h-16 inline text-white drop-shadow-[0_3px_12px_rgba(255,255,255,0.35)] shrink-0 stroke-[2.3] mx-1" />
              <span>Endless Knowledge</span>
            </p>
          </motion.div>


        </div>
      </section>


    </>
  );
}
