import React from "react";

/**
 * VCET Continuous Moving Marquee Component
 * Moves from Left → Right seamlessly across the page.
 */
export default function VcetMarquee() {
  return (
    <div className="vcet-marquee select-none pointer-events-none" aria-hidden="true">
      <div className="vcet-marquee-track">
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>

        {/* Duplicate for seamless loop animation */}
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
        <span>VCET</span>
        <b>•</b>
      </div>
    </div>
  );
}
