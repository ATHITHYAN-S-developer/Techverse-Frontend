import React from "react";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, BookOpen, Layers, Clock } from "lucide-react";
import TextReveal from "../TextReveal";

function StatsItem({ value, label, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 + index * 0.08, ease: "easeOut" }}
      className="flex flex-col items-start gap-1"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-white/70" />
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{value}</span>
      </div>
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70">
        {label}
      </span>
    </motion.div>
  );
}

export default function HeroSection({ liveReady, resourcesCount, subjectsCount, departmentsCount }) {
  const stats = [
    { value: subjectsCount, label: "Subjects", icon: BookOpen },
    { value: resourcesCount, label: "Resources", icon: Layers },
    { value: departmentsCount, label: "Departments", icon: GraduationCap },
    { value: "24/7", label: "Access", icon: Clock },
  ];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(135deg, #0B4A8F 0%, #084282 50%, #063A75 100%)",
      }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border border-white/20" />
        <div className="absolute right-[-40px] top-1/4 h-80 w-80 rounded-full border border-white/20" />
        <div className="absolute -top-10 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="absolute left-8 bottom-10 h-2 w-2 rounded-full bg-white/40" />
        <div className="absolute left-36 bottom-24 h-1.5 w-1.5 rounded-full bg-white/30" />
        <div className="absolute right-24 top-16 h-1.5 w-1.5 rounded-full bg-white/30" />
        <div className="absolute right-64 top-40 h-2 w-2 rounded-full bg-white/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24">
        {/* Live status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/90">
            {liveReady ? `Live · ${resourcesCount}+ resources online` : "VCET Academic Repositories"}
          </span>
          <Sparkles size={14} className="text-white/70" />
        </motion.div>

        {/* Headline */}
        <div className="mt-6 max-w-3xl">
          <TextReveal
            text="Explore. Learn. Build."
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white"
            delay={0.12}
          />

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="mt-5 text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed font-normal max-w-2xl"
          >
            Access academic notes, question banks, software tools, course materials and learning
            resources — all in one place. New material uploaded by your faculty appears here instantly.
          </motion.p>
        </div>

        {/* Statistics */}
        <div className="mt-10 sm:mt-12 pt-8 border-t border-white/15 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsItem key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}