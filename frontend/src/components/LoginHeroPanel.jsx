import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, GraduationCap, Compass, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginHeroPanel() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const words = ["Welcome", "Back"];

  const stats = [
    { num: "01", label: "LEARN", desc: "Curated Topics", icon: GraduationCap },
    { num: "02", label: "EXPLORE", desc: "GATE & Aptitude", icon: Compass },
    { num: "03", label: "GROW", desc: "Placement Ready", icon: TrendingUp },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white p-8 sm:p-10 md:p-12 min-h-[380px] md:min-h-[640px]"
    >
      {/* Decorative ambient background circles with continuous slow drift & mouse parallax */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Slow rotating/drifting outer ring */}
        <motion.div
          animate={{
            rotate: 360,
            x: mousePos.x * 0.6,
            y: mousePos.y * 0.6,
          }}
          transition={{
            rotate: { duration: 28, repeat: Infinity, ease: "linear" },
            x: { type: "spring", stiffness: 60, damping: 20 },
            y: { type: "spring", stiffness: 60, damping: 20 },
          }}
          className="absolute -left-20 -top-20 h-72 w-72 md:h-96 md:w-96 rounded-full border border-white/10 opacity-70"
        />

        <motion.div
          animate={{
            rotate: -360,
            x: mousePos.x * -0.8,
            y: mousePos.y * -0.8,
          }}
          transition={{
            rotate: { duration: 32, repeat: Infinity, ease: "linear" },
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
          }}
          className="absolute right-[-40px] top-1/4 h-56 w-56 md:h-72 md:w-72 rounded-full border border-white/15 opacity-60"
        />

        <motion.div
          animate={{
            x: mousePos.x * 0.4,
            y: mousePos.y * 0.4,
          }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 20,
          }}
          className="absolute bottom-[-60px] left-1/4 h-64 w-64 md:h-80 md:w-80 rounded-full border border-white/10 bg-white/[0.02] opacity-80"
        />

        {/* Soft radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B79D3]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Bar: Back to Home link */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200 group px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/15"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Center Content Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 my-6 sm:my-8 md:my-10"
      >
        {/* Pill Badge */}
        <motion.div variants={itemVariants} className="inline-block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white shadow-inner">
            <Sparkles size={13} className="text-blue-200" />
            <span>TECHVERSE</span>
          </div>
        </motion.div>

        {/* Large Heading with Word-by-Word Stagger Reveal */}
        <div className="mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block mr-3"
              >
                {word}
                {i === 0 && <br className="hidden sm:inline" />}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="mt-4 sm:mt-5 max-w-md text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed font-normal"
        >
          Access curated technology resources, GATE prep, and department e-resources.
        </motion.p>
      </motion.div>

      {/* 3-stat row at bottom with thin dividers and sequential animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 sm:gap-4 md:gap-6"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.num}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: 0.5 + idx * 0.12,
                    ease: "easeOut",
                  },
                },
              }}
              className="flex flex-col group"
            >
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight group-hover:text-blue-200 transition-colors">
                  {stat.num}
                </span>
                <Icon size={14} className="opacity-60 hidden sm:inline" />
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 mt-0.5">
                {stat.label}
              </div>
              <div className="text-[9px] sm:text-[11px] text-blue-200/80 font-normal truncate hidden sm:block">
                {stat.desc}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
