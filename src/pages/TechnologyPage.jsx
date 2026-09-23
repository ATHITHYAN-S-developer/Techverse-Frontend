/**
 * Dedicated Page: Tech Explorer (Websites to Improve Tech Knowledge)
 * Path: /technology
 * Horizontal Snap Showcase with direct platform launch links.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function TechnologyPage() {
  const [techResources, setTechResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      const fallbackTech = RESOURCES.filter((item) => item.type === "technology");
      try {
        const all = await resourceService.getAllResources();
        const dbTech = all.filter((item) => item.type === "technology");

        if (dbTech && dbTech.length > 0) {
          const map = new Map();
          fallbackTech.forEach((r) => map.set(r.id || r.name, r));
          dbTech.forEach((r) => map.set(r.id || r.name || r._id, { ...r, id: r.id || r._id }));
          setTechResources(Array.from(map.values()));
        } else {
          setTechResources(fallbackTech);
        }
      } catch (err) {
        console.warn("Using curated fallback for Tech Explorer resources:", err);
        setTechResources(fallbackTech);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#0062A8] border-t-transparent rounded-full animate-spin" />
          <span>Loading Tech Explorer Platforms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0062A8] selection:text-white select-none">
      <ResourceListView
        resources={techResources}
        pageTitle="Tech Explorer — Websites to Improve Tech Knowledge"
        badgeText="VCET ACADEMIC & TECH REPOSITORIES"
        subtitle="Access hand-picked technology portals, AI research hubs, cybersecurity platforms, and interactive engineering learning resources."
        ctaText="EXPLORE COURSES"
        ctaLink="/courses"
      />
    </div>
  );
}
