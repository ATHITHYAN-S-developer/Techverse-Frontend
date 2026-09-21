/**
 * Dedicated Page: Tech Explorer (Websites to Improve Tech Knowledge)
 * Path: /technology
 * Offers both Horizontal Snap Showcase and Category Grid Explorer with real-time search & external launch links.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Shield,
  Cloud,
  Code2,
  FileText,
  BookOpen,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { resourceService } from "../services/resourceService";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

// Category Icon Mapping
const CATEGORY_ICONS = {
  All: Layers,
  AI: Cpu,
  Cybersecurity: Shield,
  Cloud: Cloud,
  Programming: Code2,
  Research: BookOpen,
  "Technology News": Globe,
};

export default function TechnologyPage() {
  const [techResources, setTechResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "showcase"

  useEffect(() => {
    async function loadResources() {
      const fallbackTech = RESOURCES.filter((item) => item.type === "technology");
      try {
        const all = await resourceService.getAllResources();
        const dbTech = all.filter((item) => item.type === "technology");

        if (dbTech && dbTech.length > 0) {
          // Merge unique by id or name
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

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    techResources.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [techResources]);

  const filteredResources = useMemo(() => {
    return techResources.filter((res) => {
      const name = res.name || res.title || "";
      const desc = res.description || "";
      const cat = res.category || "";
      const tags = Array.isArray(res.tags) ? res.tags.join(" ") : "";
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === "" ||
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" ||
        cat.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [techResources, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

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
      {/* 1. Hero Header */}
      <section className="relative bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/70 text-slate-900 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-sky-200/60 shadow-2xs">
        <div className="w-full max-w-[1500px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-300 text-xs font-bold uppercase tracking-widest text-[#0062A8] mb-3 shadow-2xs">
                <Globe size={13} className="text-[#0062A8]" />
                <span>SECTION 03 • HANDS-ON PLATFORMS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Tech Explorer — Websites to Improve Tech Knowledge
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
                Curated collection of industry-leading sandbox environments, frontier AI research portals, ethical hacking labs, and deep-tech journalism.
              </p>
            </div>

            {/* View Mode Toggle Buttons */}
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

      {/* 2. Main Content Area */}
      {viewMode === "showcase" ? (
        <ResourceListView
          resources={filteredResources}
          pageTitle="Tech Explorer — Websites to Improve Tech Knowledge"
        />
      ) : (
        <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
          {/* Category Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat] || Layers;
              const isSelected = selectedCategory === cat;
              const count =
                cat === "All"
                  ? techResources.length
                  : techResources.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none shrink-0 ${
                    isSelected
                      ? "bg-sky-100 text-[#0062A8] border-2 border-[#0062A8] font-black shadow-2xs"
                      : "bg-white text-slate-700 hover:bg-sky-50/70 border border-slate-200/90 font-semibold"
                  }`}
                >
                  <IconComp size={16} />
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? "bg-[#0062A8] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Strip */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search websites by name, technology topic, or tag..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062A8]/20 focus:border-[#0062A8] bg-slate-50/50 hover:bg-white transition-all"
                />
              </div>

              {(searchQuery || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Tech Cards Grid */}
          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Search size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">No websites match your filter</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Try adjusting your search term or picking another category filter.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const IconComponent = CATEGORY_ICONS[resource.category] || Globe;
                const isFeatured = Boolean(resource.featured);

                return (
                  <div
                    key={resource.id || resource.name}
                    className={`bg-white rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-[#0062A8]/30 group ${
                      isFeatured ? "border-sky-200 ring-2 ring-sky-100" : "border-slate-200/80"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-2xl bg-blue-50 text-[#0062A8] group-hover:scale-110 transition-transform">
                            <IconComponent size={20} />
                          </span>
                          <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full">
                            {resource.category || "Technology"}
                          </span>
                        </div>

                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            <Sparkles size={11} className="text-amber-500" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0062A8] transition-colors leading-snug">
                        {resource.name}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal line-clamp-3">
                        {resource.description}
                      </p>

                      {/* Tags */}
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

                    {/* Footer Launch Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {resource.platform || "Web Platform"}
                      </span>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs shadow-xs transition-all cursor-pointer group-hover:translate-x-0.5"
                      >
                        <span>Visit Website</span>
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
