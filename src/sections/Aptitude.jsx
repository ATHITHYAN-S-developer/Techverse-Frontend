/**
 * Aptitude Apps Section Component for VCET Tech Hub
 * #aptitude
 */

import React from "react";
import { motion } from "framer-motion";
import { FaBrain } from "react-icons/fa";
import ResourceCard from "../components/ResourceCard";

export default function Aptitude({ resources }) {
  const aptitudeResources = resources.filter((item) => item.type === "aptitude");

  return (
    <section
      id="aptitude"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#C9C9C9]/60 scroll-mt-16 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0062A8]/10 text-[#0062A8] text-xs uppercase tracking-widest font-bold mb-3">
              <FaBrain size={13} />
              <span>Section 01 • Placement Ready</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#444445] tracking-tight mb-2">
              Skill Forge — Aptitude Preparation Apps
            </h2>
            <p className="text-sm sm:text-base text-[#444445]/80 max-w-xl font-normal leading-relaxed">
              Sharpen your aptitude, reasoning and problem-solving skills for exams and placements.
            </p>
          </div>

          <div className="text-xs uppercase tracking-wider font-bold text-[#444445] bg-[#F4F4F4] px-4 py-2 rounded-xl border border-[#C9C9C9]/70 self-start md:self-auto">
            Quantitative • Reasoning • Verbal
          </div>
        </div>

        {/* Resources Grid: Desktop 4, Tablet 2, Mobile 1 */}
        {aptitudeResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aptitudeResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#F4F4F4] rounded-2xl border border-[#C9C9C9]">
            <p className="text-[#444445] text-sm">
              No aptitude resources match the current filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
