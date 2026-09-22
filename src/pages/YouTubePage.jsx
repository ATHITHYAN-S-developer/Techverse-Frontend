/**
 * Dedicated Page: Tech Vision (Tech YouTube Channels)
 * Path: /youtube
 * Horizontal Snap Showcase with direct channel links.
 */

import React, { useState, useEffect } from "react";
import { resourceService } from "../services/resourceService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function YouTubePage() {
  const [youtubeResources, setYoutubeResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      const fallbackYouTube = RESOURCES.filter((item) => item.type === "youtube");
      try {
        const all = await resourceService.getAllResources();
        const dbYouTube = all.filter((item) => item.type === "youtube");

        if (dbYouTube && dbYouTube.length > 0) {
          const map = new Map();
          fallbackYouTube.forEach((r) => map.set(r.id || r.name, r));
          dbYouTube.forEach((r) => map.set(r.id || r.name || r._id, { ...r, id: r.id || r._id }));
          setYoutubeResources(Array.from(map.values()));
        } else {
          setYoutubeResources(fallbackYouTube);
        }
      } catch (err) {
        console.warn("Using curated fallback for Tech Vision resources:", err);
        setYoutubeResources(fallbackYouTube);
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
          <span>Loading Tech Vision Channels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0062A8] selection:text-white select-none">
      <ResourceListView
        resources={youtubeResources}
        pageTitle="Tech Vision — Tech YouTube Channels"
        badgeText="CURATED VIDEO REPOSITORIES"
        subtitle="Explore high-impact video channels breaking down complex engineering principles, AI breakthroughs, and software development."
        ctaText="EXPLORE COURSES"
        ctaLink="/courses"
      />
    </div>
  );
}
