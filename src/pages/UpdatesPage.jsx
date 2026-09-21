/**
 * Dedicated Page: Tech Pulse (Apps for Tech Updates)
 * Path: /updates
 * Alternating full-width scrollytelling vertical list view.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import ResourceListView from "../components/ResourceListView";

export default function UpdatesPage() {
  const [updateResources, setUpdateResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const all = await resourceService.getAllResources();
        setUpdateResources(all.filter((item) => item.type === "updates"));
      } catch (err) {
        console.error("Failed to load Tech Pulse resources:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        Loading Tech Pulse Updates from MongoDB...
      </div>
    );
  }

  return (
    <ResourceListView
      resources={updateResources}
      badgeText="VCET TECH PULSE"
      pageTitle="Tech Pulse — Apps for Tech Updates"
      subtitle="Stay informed with real-time tech news, developer digests, product launches, and industry engineering insights."
      ctaText="LATEST NOTICES"
      ctaLink="/announcements"
    />
  );
}
