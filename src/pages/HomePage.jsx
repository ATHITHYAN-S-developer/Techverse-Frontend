/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Includes campus slideshow hero, domain resources, official certificate showcase, and about section.
 */

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Domains from "../sections/Domains";
import CertificatePreviewSection from "../sections/CertificatePreviewSection";
import About from "../sections/About";
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
      {/* 1. Hero Showcase with Continuous VCET Campus Background Slideshow */}
      <Hero />

      {/* 2. Four Main Resource Domains */}
      <Domains resources={resources} />

      {/* 3. Official VCET Certificate Showcase & Live Preview */}
      <CertificatePreviewSection />

      {/* 4. About the Platform */}
      <About />
    </div>
  );
}