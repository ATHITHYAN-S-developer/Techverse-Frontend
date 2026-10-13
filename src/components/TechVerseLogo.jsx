import React from "react";
import techverseLogoImg from "../assets/techverse-logo.png";
import techverseIconImg from "../assets/techverse-icon.png";

/**
 * TechVerse Official Logo Component
 * Renders the exact official logo image with the 3D globe emblem and custom typography.
 */
export default function TechVerseLogo({
  className = "",
  height = "h-8 sm:h-9",
  iconOnly = false,
  iconSize = "h-8 w-8 sm:h-9 sm:w-9",
}) {
  if (iconOnly) {
    return (
      <img
        src={techverseIconImg}
        alt="TechVerse"
        className={`${iconSize} object-contain select-none shrink-0 drop-shadow-xs transition-transform duration-200 group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <img
      src={techverseLogoImg}
      alt="TechVerse"
      className={`${height} w-auto object-contain select-none shrink-0 drop-shadow-xs transition-transform duration-200 group-hover:scale-105 ${className}`}
    />
  );
}
