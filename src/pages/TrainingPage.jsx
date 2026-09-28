import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  Code2,
  Building2,
  Users2,
  Cpu,
  Award,
  Search,
  ExternalLink,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { trainingService } from "../services/trainingService";
import TextReveal from "../components/TextReveal";



const TRACK_ICONS = {
  Target: Target,
  Code2: Code2,
  Building2: Building2,
  Users2: Users2,
  Cpu: Cpu,
  Award: Award,
};

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [registeredBootcampId, setRegisteredBootcampId] = useState(null);
  const [expandedTrackId, setExpandedTrackId] = useState(null);

  const [trainingTracks, setTrainingTracks] = useState([]);
  const [upcomingBootcamps, setUpcomingBootcamps] = useState([]);
  const [companyMockTests, setCompanyMockTests] = useState([]);
  const [downloadableToolkits, setDownloadableToolkits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const overview = await trainingService.getOverview();
        setTrainingTracks(overview.tracks || []);
        setUpcomingBootcamps(overview.bootcamps || []);
        setCompanyMockTests(overview.companies || []);
        setDownloadableToolkits(overview.toolkits || []);
      } catch (err) {
        console.error("Failed to load training data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered Training Tracks
  const filteredTracks = useMemo(() => {
    return trainingTracks.filter((track) => {
      const matchCat =
        selectedCategory === "all" ||
        track.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        track.title.toLowerCase().includes(q) ||
        track.description.toLowerCase().includes(q) ||
        track.topics.some((t) => t.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [trainingTracks, selectedCategory, searchQuery]);

  // Filtered Company Tests
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === "") return companyMockTests;
    return companyMockTests.filter(
      (c) =>
        (c.company || c.name || "").toLowerCase().includes(q) ||
        (c.role || "").toLowerCase().includes(q) ||
        (c.pattern || "").toLowerCase().includes(q) ||
        (c.sampleQuestions || []).some((sq) => sq.toLowerCase().includes(q))
    );
  }, [companyMockTests, searchQuery]);

  const handleRegisterBootcamp = (id) => {
    setRegisteredBootcampId(id);
    setTimeout(() => {
      setRegisteredBootcampId(null);
    }, 4000);
  };

  const toggleTrackExpand = (id) => {
    setExpandedTrackId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 flex items-center justify-center text-xs font-bold text-slate-500">
        Loading Placement PrepZone & Bootcamps from MongoDB...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 selection:bg-[#0B4A8F] selection:text-white scroll-smooth">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B4A8F] via-[#084282] to-[#063A75] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xs">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-100 mb-3 backdrop-blur-sm"
              >
                <Sparkles size={13} className="text-blue-200" />
                <span>VCET PREPZONE & SKILL EMPOWERMENT</span>
              </motion.div>

              <TextReveal
                text="PrepZone & Industry Training Hub"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                delay={0.12}
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-xl"
              >
                Structured PrepZone bootcamps, company-specific recruitment tracks (Zoho, TCS, Infosys, Cognizant), quantitative aptitude drills, and technical interview toolkits.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center gap-3 shrink-0"
            >
              <Link
                to="/courses"
                className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white text-[#0B4A8F] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span>EXPLORE COURSES</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-150 group-hover:translate-x-1 text-[#0B4A8F]"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MAIN CONTENT AREA
          ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* SEARCH BAR & FILTER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, company patterns (Zoho, TCS, Infosys), or skills..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] bg-slate-50/70 hover:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/15 focus:border-[#0B4A8F] cursor-pointer"
              >
                <option value="all">All Disciplines</option>
                <option value="Aptitude">Placement Aptitude</option>
                <option value="Technical">Technical & Coding</option>
                <option value="Company Prep">Company Specific</option>
                <option value="Soft Skills">Soft Skills & HR</option>
                <option value="Core Tech">Core Engineering</option>
                <option value="Certifications">Certifications</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 1: TRAINING TRACKS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F] border border-blue-100">
                <Target size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Curated Training Tracks
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Comprehensive skill modules from aptitude to core technical competencies
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredTracks.length} Tracks
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredTracks.map((track, index) => {
              const Icon = TRACK_ICONS[track.icon] || Target;
              const isExpanded = expandedTrackId === (track.trackId || track._id);

              return (
                <motion.article
                  key={track.trackId || track._id || index}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: (index % 4) * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/40 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-[#0B4A8F] border border-blue-100">
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#0B4A8F]">
                            {track.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 block">
                            {track.level} • {track.duration}
                          </span>
                        </div>
                      </div>

                      {track.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {track.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                      {track.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4">
                      {track.description}
                    </p>

                    <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/70 p-3">
                      <button
                        type="button"
                        onClick={() => toggleTrackExpand(track.trackId || track._id)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#0B4A8F] cursor-pointer select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-[#0B4A8F]" />
                          <span>Core Syllabus Modules ({track.topics?.length || 0})</span>
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                          {track.topics?.map((topic, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B4A8F] mt-1.5 shrink-0" />
                              <span className="leading-tight font-medium">{topic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recommended Practice Portals:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {track.resources?.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0B4A8F] text-xs font-bold transition-colors"
                        >
                          <span>{res.name}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: COMPANY CRACKERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F] border border-blue-100">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Company Recruitment Crackers
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Targeted recruitment roadmaps, exam patterns, and coding test series
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredCompanies.length} Companies
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredCompanies.map((comp, index) => (
              <motion.article
                key={comp._id || comp.slug || index}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: (index % 4) * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0B4A8F]/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-sm font-black uppercase tracking-wider text-[#0B4A8F]">
                      {comp.company || comp.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      CTC: {comp.salary || comp.packageRange}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">
                    {comp.role}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    {comp.rounds?.length ? `${comp.rounds.length} Rounds` : comp.rounds}
                  </p>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl mb-4 text-xs text-slate-700">
                    <strong className="text-[#0B4A8F] block mb-1">
                      Exam Strategy & Pattern:
                    </strong>
                    {comp.pattern}
                  </div>

                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      High-Frequency Coding Questions:
                    </span>
                    {comp.sampleQuestions?.map((sq, sIdx) => (
                      <div
                        key={sIdx}
                        className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 font-mono"
                      >
                        • {sq}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={comp.testLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                  >
                    <span>PRACTICE {(comp.company || comp.name || "").toUpperCase()} TEST SERIES</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* SECTION 3: UPCOMING BOOTCAMPS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F] border border-blue-100">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Upcoming Placement Bootcamps
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Live hands-on training sessions with industry experts and alumni
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-red-500 text-white animate-pulse">
              LIVE SESSIONS
            </span>
          </div>

          {registeredBootcampId && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Your bootcamp registration has been logged! Check your college email.
              </span>
              <button
                onClick={() => setRegisteredBootcampId(null)}
                className="font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-3">
            {upcomingBootcamps.map((bootcamp) => (
              <div
                key={bootcamp.bootcampId || bootcamp._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0B4A8F] border border-blue-200 inline-block mb-3">
                    {bootcamp.status}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {bootcamp.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600 my-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#0B4A8F] shrink-0" />
                      <span>{bootcamp.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#0B4A8F] shrink-0" />
                      <span>{bootcamp.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 size={14} className="text-[#0B4A8F] shrink-0" />
                      <span>{bootcamp.eligible}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {bootcamp.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRegisterBootcamp(bootcamp.bootcampId || bootcamp._id)}
                  className="w-full py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  REGISTER NOW (FREE)
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: DOWNLOADABLE TOOLKITS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F] border border-blue-100">
                <Download size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Placement Toolkits & Cheat Sheets
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Curated interview handbooks, resume templates, and formula sheets
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {downloadableToolkits.length} Files
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {downloadableToolkits.map((item, idx) => (
              <div
                key={item._id || idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="font-bold text-[#0B4A8F] uppercase tracking-wider text-[11px]">
                      {item.category}
                    </span>
                    <span className="font-mono text-[11px]">{item.size}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.desc}
                  </p>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-4">
                    Downloaded by {item.downloads}
                  </span>
                </div>

                <a
                  href={item.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#083E7A] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                >
                  <Download size={13} />
                  <span>DOWNLOAD TOOLKIT</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
