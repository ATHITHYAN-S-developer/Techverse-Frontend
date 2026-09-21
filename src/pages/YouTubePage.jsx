/**
 * Dedicated Page: Tech Vision (Tech YouTube Channels)
 * Path: /youtube
 * Alternating full-width scrollytelling vertical list view.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import ResourceListView from "../components/ResourceListView";

export default function YouTubePage() {
  const [youtubeResources, setYoutubeResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const all = await resourceService.getAllResources();
        setYoutubeResources(all.filter((item) => item.type === "youtube"));
      } catch (err) {
        console.error("Failed to load YouTube resources:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-bold text-sm">
        Loading Tech Vision Channels from MongoDB...
      </div>
    );
  }

  return (
    <ResourceListView
      resources={youtubeResources}
      badgeText="VCET TECH VISION"
      pageTitle="Tech Vision — Tech YouTube Channels"
      subtitle="Watch top technical creators, AI breakdowns, architecture deep-dives, and coding tutorials."
      ctaText="TECH EXPLORER"
      ctaLink="/technology"
    />
  );
}
