/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Renders real-data sections: Domain Resources and Certificate Showcase.
 * No hardcoded hero copy or decorative watermark marquee.
 */

import React, { useState, useEffect } from "react";
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
      {/* 1. Four Main Resource Domains (real resource data) */}
      <Domains resources={resources} />

      {/* 2. Official VCET Certificate Showcase & Live Preview (real data) */}
      <CertificatePreviewSection />
    </div>
  );
}