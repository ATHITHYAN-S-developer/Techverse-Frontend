/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Contains Hero Section, 4 Core Domain Cards, Certificate Showcase, and Visitor Counter.
 */

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import VcetMarquee from "../components/VcetMarquee";
import Domains from "../sections/Domains";
import CertificatePreviewSection from "../sections/CertificatePreviewSection";
import { resourceService } from "../services/resourceService";

export default function HomePage() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await resourceService.getAllResources();
        setResources(data);
      } catch (e) {
        console.warn("Error fetching homepage resources:", e);
      }
    }
    fetchResources();
  }, []);

  return (
    <div className="flex-grow">
      {/* 1. Hero Section with Campus Background Slideshow */}
      <Hero />

      {/* VCET Continuous Moving Marquee Strip */}
      <VcetMarquee />

      {/* 2. Four Main Resource Domains */}
      <Domains resources={resources} />

      {/* 3. Official VCET Certificate Showcase & Live Preview */}
      <CertificatePreviewSection />
    </div>
  );
}
