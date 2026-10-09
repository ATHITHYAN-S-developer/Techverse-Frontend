/**
 * Dedicated Page: Tech Pulse (Apps for Tech Updates)
 * Path: /updates
 * Horizontal Snap Showcase driven by the admin-managed /api/tech-pulse feed,
 * falling back to the curated local list when the API is unreachable.
 */

import React, { useState, useEffect } from "react";
import { techPulseService } from "../services/techPulseService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function UpdatesPage() {
  const [updateResources, setUpdateResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUpdates() {
      const fallback = RESOURCES.filter((item) => item.type === "updates");
      let list = fallback;
      try {
        const posts = await techPulseService.getPublished();
        if (posts && posts.length > 0) list = posts;
      } catch (err) {
        console.warn("Using curated fallback for Tech Pulse resources:", err);
      } finally {
        if (active) {
          setUpdateResources(list);
          setLoading(false);
        }
      }
    }

    loadUpdates();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-vcet-blue border-t-transparent rounded-full animate-spin" />
          <span>Loading Tech Pulse Updates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-vcet-blue selection:text-white select-none">
      <ResourceListView
        resources={updateResources}
        pageTitle="Tech Pulse — Apps for Tech Updates"
        badgeText="REAL-TIME TECH FEEDS & APPS"
        ctaText="VIEW ANNOUNCEMENTS"
        ctaLink="/announcements"
        layout="grid"
      />
    </div>
  );
}
