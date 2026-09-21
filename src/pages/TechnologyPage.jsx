/**
 * Dedicated Page: Tech Explorer (Websites to Improve Tech Knowledge)
 * Path: /technology
 * Alternating full-width scrollytelling vertical list view.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import ResourceListView from "../components/ResourceListView";

export default function TechnologyPage() {
  const [techResources, setTechResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const all = await resourceService.getAllResources();
        setTechResources(all.filter((item) => item.type === "technology"));
      } catch (err) {
        console.error("Failed to load Tech Explorer resources:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        Loading Tech Explorer Platforms from MongoDB...
      </div>
    );
  }

  return (
    <ResourceListView
      resources={techResources}
      badgeText="VCET TECH EXPLORER"
      pageTitle="Tech Explorer — Websites to Improve Tech Knowledge"
      subtitle="Access hand-picked technology portals, AI research hubs, cybersecurity platforms, and interactive engineering learning resources."
      ctaText="EXPLORE COURSES"
      ctaLink="/courses"
    />
  );
}
