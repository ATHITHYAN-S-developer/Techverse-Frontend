/**
 * Dedicated Page: Tech Pulse (Apps for Tech Updates)
 * Path: /updates
 * Horizontal Snap Showcase with direct app & feed links.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function UpdatesPage() {
  const [updateResources, setUpdateResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      const fallbackUpdates = RESOURCES.filter((item) => item.type === "updates");
      try {
        const all = await resourceService.getAllResources();
        const dbUpdates = all.filter((item) => item.type === "updates");

        if (dbUpdates && dbUpdates.length > 0) {
          const map = new Map();
          fallbackUpdates.forEach((r) => map.set(r.id || r.name, r));
          dbUpdates.forEach((r) => map.set(r.id || r.name || r._id, { ...r, id: r.id || r._id }));
          setUpdateResources(Array.from(map.values()));
        } else {
          setUpdateResources(fallbackUpdates);
        }
      } catch (err) {
        console.warn("Using curated fallback for Tech Pulse resources:", err);
        setUpdateResources(fallbackUpdates);
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
          <span>Loading Tech Pulse Updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0062A8] selection:text-white select-none">
      <ResourceListView
        resources={updateResources}
        pageTitle="Tech Pulse — Apps for Tech Updates"
        badgeText="REAL-TIME TECH FEEDS & APPS"
        subtitle="Stay ahead with real-time news, curated engineering feeds, breaking startup developments, and community discussions."
        ctaText="VIEW ANNOUNCEMENTS"
        ctaLink="/announcements"
      />
    </div>
  );
}
