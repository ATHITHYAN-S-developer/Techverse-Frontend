/**
 * Dedicated Page: Tech Pulse (Apps for Tech Updates)
 * Path: /updates
 * Offers both Horizontal Snap Showcase and Category Grid Explorer with real-time search & direct feed links.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  RotateCcw,
  LayoutGrid,
  SlidersHorizontal,
  Newspaper,
  TrendingUp,
  Zap,
} from "lucide-react";
import { resourceService } from "../services/resourceService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function UpdatesPage() {
  const [updateResources, setUpdateResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "showcase"

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

  const filteredResources = useMemo(() => {
    return updateResources.filter((res) => {
      const name = res.name || res.title || "";
      const desc = res.description || "";
      const tags = Array.isArray(res.tags) ? res.tags.join(" ") : "";
      const q = searchQuery.toLowerCase().trim();

      return (
        q === "" ||
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q)
      );
    });
  }, [updateResources, searchQuery]);

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
      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/70 text-slate-900 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-sky-200/60 shadow-2xs">
        <div className="w-full max-w-[1500px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-300 text-xs font-bold uppercase tracking-widest text-[#0062A8] mb-3 shadow-2xs">
                <Bell size={13} className="text-[#0062A8]" />
                <span>SECTION 02 • FEEDS & NEWSLETTERS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Tech Pulse — Apps for Tech Updates
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
                Stay ahead of technology shifts with real-time newsfeeds, venture capital briefings, hacker discussions, and AI release alerts.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <div className="flex items-center p-1 bg-white/90 rounded-2xl border border-sky-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#0062A8] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Grid Explorer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("showcase")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "showcase"
                      ? "bg-[#0062A8] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span>Snap Showcase</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {viewMode === "showcase" ? (
        <ResourceListView
          resources={filteredResources}
          pageTitle="Tech Pulse — Apps for Tech Updates"
        />
      ) : (
        <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* Search Strip */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search feeds by name, keyword, or topic..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8] bg-slate-50/50 hover:bg-white transition-all"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw size={13} />
                  <span>Clear Search</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Search size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No feeds match your search</h3>
              <p className="text-xs sm:text-sm text-slate-500">Try searching for developer news, venture capital, or AI updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const isFeatured = Boolean(resource.featured);

                return (
                  <div
                    key={resource.id || resource.name}
                    className={`bg-white rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-[#0062A8]/30 group ${
                      isFeatured ? "border-sky-200 ring-2 ring-sky-100" : "border-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 rounded-2xl bg-blue-50 text-[#0062A8] group-hover:scale-110 transition-transform">
                          <Newspaper size={20} />
                        </span>
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            <Sparkles size={11} className="text-amber-500" />
                            <span>Featured Feed</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0062A8] transition-colors leading-snug">
                        {resource.name}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal line-clamp-3">
                        {resource.description}
                      </p>

                      {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {resource.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {resource.platform || "Web / Mobile"}
                      </span>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer group-hover:translate-x-0.5"
                      >
                        <span>Open Feed</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
