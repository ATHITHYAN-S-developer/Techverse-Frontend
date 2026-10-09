import React from "react";
import techverseIconImg from "../assets/techverse-icon.png";

/**
 * TechVerse Brand Logo Component
 * Renders the prominent, high-res globe icon alongside the TechVerse wordmark
 * with contemporary Space Grotesk / Outfit typography.
 */
export default function TechVerseLogo({
  className = "",
  iconSize = "h-10 w-10 sm:h-12 sm:w-12",
  textSize = "text-[22px] sm:text-[25px]",
}) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <img
        src={techverseIconImg}
        alt="TechVerse"
        className={`${iconSize} object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-sm shrink-0`}
      />
      <span
        className={`${textSize} font-black tracking-[-0.03em] select-none leading-none flex items-center`}
        style={{ fontFamily: "'Space Grotesk', 'Outfit', 'Sora', sans-serif" }}
      >
        <span className="text-slate-900 transition-colors group-hover:text-blue-950">Tech</span>
        <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent ml-0.5">
          Verse
        </span>
      </span>
    </div>
  );
}
