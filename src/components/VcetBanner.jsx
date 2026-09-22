import React from "react";
import vcetWideLogo from "../assets/vcet-wide-logo.png";

/**
 * VCET Official Institutional Banner
 * Displays the wide VCET header logo (college name + 25 years badge)
 * above the marquee strip on every page.
 */
export default function VcetBanner() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 16px",
        width: "100%",
      }}
    >
      <img
        src={vcetWideLogo}
        alt="Velalar College of Engineering and Technology – Autonomous"
        style={{
          height: "56px",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
