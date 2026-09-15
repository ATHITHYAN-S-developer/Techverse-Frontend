/**
 * ResourceCard Component for VCET Tech Hub
 * Reusable card for Aptitude, Updates, Technology websites, and YouTube channels.
 * Strict Palette: White, #C9C9C9 border, #444445 text, #0062A8 blue accents.
 */

import React from "react";
import { motion } from "framer-motion";
import { FiExternalLink, FiGlobe, FiTag } from "react-icons/fi";
import { FaYoutube, FaLaptopCode, FaMobileAlt, FaBrain, FaNewspaper } from "react-icons/fa";

export default function ResourceCard({ resource }) {
  // Determine representative icon based on resource type / category
  const getTypeIcon = () => {
    switch (resource.type) {
      case "youtube":
        return <FaYoutube className="w-5 h-5 text-[#0062A8]" />;
      case "aptitude":
        return <FaBrain className="w-5 h-5 text-[#0062A8]" />;
      case "updates":
        return <FaNewspaper className="w-5 h-5 text-[#0062A8]" />;
      default:
        return <FiGlobe className="w-5 h-5 text-[#0062A8]" />;
    }
  };

  const getButtonText = () => {
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

  const handleCardClick = () => {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={handleCardClick}
      className="group relative bg-white border border-[#C9C9C9] hover:border-[#0062A8] p-6 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Meta Row: Platform & Category Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0062A8]/10 group-hover:bg-[#0062A8] flex items-center justify-center transition-colors duration-300">
            <span className="group-hover:text-white transition-colors duration-300">
              {getTypeIcon()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-[#F4F4F4] text-[#444445] rounded-md border border-[#C9C9C9]/60">
              {resource.category}
            </span>
            {resource.featured && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-[#0062A8] text-white rounded-md">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Resource Name */}
        <h3 className="text-lg font-bold text-[#444445] group-hover:text-[#0062A8] transition-colors mb-2 leading-snug">
          {resource.name}
        </h3>

        {/* Resource Description */}
        <p className="text-xs text-[#444445]/80 leading-relaxed mb-4 font-normal">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-[#444445]/70 bg-[#F4F4F4] px-2 py-0.5 rounded flex items-center gap-1"
              >
                <FiTag size={9} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Action: External link button */}
      <div className="pt-4 border-t border-[#C9C9C9]/50 flex items-center justify-between mt-auto">
        <span className="text-[11px] text-[#444445]/70 font-medium">
          {resource.platform}
        </span>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0062A8] hover:bg-[#00528c] shadow-xs group-hover:shadow transition-all group-hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0062A8]"
        >
          <span>{getButtonText()}</span>
          <FiExternalLink
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </a>
      </div>
    </motion.div>
  );
}
