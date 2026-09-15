/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Contains Hero Section, 4 Core Domain Cards, Certificate Showcase, and Visitor Counter.
 */

import React from "react";
import Hero from "../components/Hero";
import Domains from "../sections/Domains";
import CertificatePreviewSection from "../sections/CertificatePreviewSection";
import { RESOURCES } from "../data/resources";

export default function HomePage() {
  return (
    <div className="flex-grow">
      {/* 1. Hero Section with Campus Background Slideshow */}
      <Hero />

      {/* 2. Four Main Resource Domains */}
      <Domains resources={RESOURCES} />

      {/* 3. Official VCET Certificate Showcase & Live Preview */}
      <CertificatePreviewSection />
    </div>
  );
}
