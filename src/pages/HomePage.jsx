/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Includes the campus slideshow hero and the four resource domains.
 */

import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Domains from "../sections/Domains";
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
    </div>
  );
}