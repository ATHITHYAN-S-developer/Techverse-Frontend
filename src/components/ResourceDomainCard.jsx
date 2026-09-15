/**
 * ResourceDomainCard Component for VCET Tech Hub
 * Large premium card for the 4 core pillars.
 * Palette: White background, #C9C9C9 border, #444445 text, #0062A8 accent.
 */

import React from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiGlobe } from "react-icons/fi";
import { FaBrain, FaBell, FaYoutube, FaLaptopCode } from "react-icons/fa";

export default function ResourceDomainCard({ domain, itemCount, onSelect }) {
  const getIcon = () => {
    switch (domain.iconName) {
      case "brain":
        return <FaBrain className="w-6 h-6 text-[#0062A8]" />;
      case "bell":
        return <FaBell className="w-6 h-6 text-[#0062A8]" />;
      case "globe":
        return <FiGlobe className="w-6 h-6 text-[#0062A8]" />;
      case "youtube":
        return <FaYoutube className="w-6 h-6 text-[#0062A8]" />;
      default:
        return <FaLaptopCode className="w-6 h-6 text-[#0062A8]" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => onSelect(domain.targetId)}
      className="group relative bg-white border border-[#C9C9C9] hover:border-[#0062A8] p-7 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Card Header: Icon & Resource Count Pill */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-13 h-13 rounded-xl bg-[#0062A8]/10 group-hover:bg-[#0062A8] flex items-center justify-center transition-colors duration-300">
            <span className="group-hover:text-white transition-colors duration-300">
              {getIcon()}
            </span>
          </div>

          <span className="text-[11px] uppercase tracking-wider font-bold px-3 py-1 bg-[#F4F4F4] group-hover:bg-[#0062A8] text-[#444445] group-hover:text-white rounded-full transition-colors">
            {itemCount} Resources
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-[#444445] group-hover:text-[#0062A8] transition-colors leading-snug">
            {domain.title}
          </h3>
          {domain.shortTitle && (
            <p className="text-xs font-semibold text-[#0062A8] mt-1">
              {domain.shortTitle}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#444445]/80 leading-relaxed mb-6 font-normal">
          {domain.description}
        </p>
      </div>

      {/* Card Footer: Category highlight & Action button */}
      <div className="pt-4 border-t border-[#C9C9C9]/50 flex items-center justify-between mt-auto">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#0062A8]">
          {domain.accentText}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#F4F4F4] group-hover:bg-[#0062A8] text-[#444445] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
          <FiArrowUpRight size={16} />
        </div>
      </div>
    </motion.div>
  );
}
