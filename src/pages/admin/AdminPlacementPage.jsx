import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  ExternalLink,
  Flame,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  Loader2,
  RefreshCw,
  Pin,
  Layers,
  Award,
  BookOpen,
  FileText
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { placementEventService } from "../../services/placementEventService";
import { trainingService } from "../../services/trainingService";
import { API_BASE_URL } from "../../services/api";

const DRIVE_CATEGORIES = [
  { key: "it-software", label: "IT & Software Services" },
  { key: "core-eng", label: "Core Engineering" },
  { key: "product-dev", label: "Product & R&D" },
  { key: "management", label: "Management & Consulting" },
  { key: "edtech", label: "EdTech & Education" },
];

function resolvePosterUrl(item) {
  const raw = item.poster || item.imageUrl || item.image || "";
  if (!raw) return "";
  if (raw.startsWith("data:") || /^https?:\/\//i.test(raw)) return raw;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${raw.startsWith("/") ? raw : `/uploads/placement-events/${raw}`}`;
}

export default function AdminPlacementPage() {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("drives"); // "drives" | "companies" | "bootcamps"

  // Drives state
  const [drives, setDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [searchDrives, setSearchDrives] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Companies & Training state
  const [companies, setCompanies] = useState([]);
  const [bootcamps, setBootcamps] = useState([]);
  const [toolkits, setToolkits] = useState([]);
  const [loadingTraining, setLoadingTraining] = useState(false);

  // Drive Modals
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [previewDrive, setPreviewDrive] = useState(null);
  const [driveImageFile, setDriveImageFile] = useState(null);
  const [driveImagePreview, setDriveImagePreview] = useState(null);
  const [savingDrive, setSavingDrive] = useState(false);

  const [driveFormData, setDriveFormData] = useState({
    title: "",
    subtitle: "",
    organiser: "",
    category: "it-software",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 AM - 04:00 PM",
    venue: "VCET Campus / Placement Lab",
    department: "All Engineering Branches",
    description: "",
    linkUrl: "",
    linkText: "Register for Drive",
    badge: "Campus Drive",
    isPinned: false,
    poster: ""
  });

  // Company Modal
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    packageRange: "₹6.0 LPA - ₹10.0 LPA",
    salary: "₹6.5 - ₹10.0 LPA",
    role: "Software Development Engineer (SDE)",
    eligibility: "BE/B.Tech (All Branches) • CGPA > 6.5",
    description: "",
    pattern: "",
    testLink: "https://www.geeksforgeeks.org",
    logo: "",
    roundsText: "Round 1: Online Aptitude & Coding\nRound 2: Technical Interview\nRound 3: HR Discussion",
    questionsText: "1. Reverse an array without extra space\n2. Find duplicate numbers in O(n) time"
  });

  // Bootcamp Modal
  const [bootcampModalOpen, setBootcampModalOpen] = useState(false);
  const [editingBootcamp, setEditingBootcamp] = useState(null);
  const [savingBootcamp, setSavingBootcamp] = useState(false);
  const [bootcampFormData, setBootcampFormData] = useState({
    title: "",
    trainer: "VCET Placement Cell & Alumni Network",
    date: "Sep 22 - Sep 26, 2026",
    time: "04:30 PM - 06:30 PM IST",
    mode: "Hybrid",
    eligible: "3rd & Final Year (All Branches)",
    seats: "100 Seats Available",
    status: "Registration Open",
    tagsText: "Coding, Mock Interview, DSA"
  });

  // Load drives
  const loadDrives = async () => {
    try {
      setLoadingDrives(true);
      const res = await placementEventService.getAll({ all: "true" });
      setDrives(Array.isArray(res.events) ? res.events : []);
    } catch (err) {
      showError("Failed to fetch placement events");
    } finally {
      setLoadingDrives(false);
    }
  };

  // Load companies, bootcamps, toolkits
  const loadTrainingData = async () => {
    try {
      setLoadingTraining(true);
      const res = await trainingService.getOverview();
      if (res.success) {
        setCompanies(res.companies || []);
        setBootcamps(res.bootcamps || []);
        setToolkits(res.toolkits || []);
      }
    } catch (err) {
      showError("Failed to load training & company blueprints");
    } finally {
      setLoadingTraining(false);
    }
  };

  useEffect(() => {
    loadDrives();
    loadTrainingData();
  }, []);

  // --- DRIVE HANDLERS ---
  const handleOpenAddDrive = () => {
    setEditingDrive(null);
    setDriveFormData({
      title: "",
      subtitle: "Placement Cell Notification",
      organiser: "",
      category: "it-software",
      date: new Date().toISOString().split("T")[0],
      time: "09:00 AM - 04:00 PM",
      venue: "VCET Campus / Placement Lab",
      department: "All Engineering Branches",
      description: "",
      linkUrl: "",
      linkText: "Register for Drive",
      badge: "Campus Drive",
      isPinned: false,
      poster: ""
    });
    setDriveImageFile(null);
    setDriveImagePreview(null);
    setDriveModalOpen(true);
  };

  const handleOpenEditDrive = (drive) => {
    setEditingDrive(drive);
    const dateStr = drive.date ? String(drive.date).slice(0, 10) : "";
    setDriveFormData({
      title: drive.title || "",
      subtitle: drive.subtitle || "",
      organiser: drive.organiser || "",
      category: drive.category || "it-software",
      date: dateStr || new Date().toISOString().split("T")[0],
      time: drive.time || "09:00 AM - 04:00 PM",
      venue: drive.venue || "VCET Campus",
      department: drive.department || "All Engineering Branches",
      description: drive.description || "",
      linkUrl: drive.linkUrl || "",
      linkText: drive.linkText || "Register for Drive",
      badge: drive.badge || "Campus Drive",
      isPinned: Boolean(drive.isPinned),
      poster: drive.poster || drive.imageUrl || ""
    });
    setDriveImageFile(null);
    setDriveImagePreview(resolvePosterUrl(drive) || null);
    setDriveModalOpen(true);
  };

  const handleSaveDrive = async (e) => {
    e.preventDefault();
    if (!driveFormData.title.trim() || !driveFormData.organiser.trim()) {
      showError("Please enter Title and Company/Organiser");
      return;
    }

    try {
      setSavingDrive(true);
      const payload = {
        title: driveFormData.title.trim(),
        subtitle: driveFormData.subtitle.trim(),
        organiser: driveFormData.organiser.trim(),
        category: driveFormData.category,
        date: driveFormData.date,
        time: driveFormData.time,
        venue: driveFormData.venue,
        department: driveFormData.department,
        description: driveFormData.description,
        linkUrl: driveFormData.linkUrl,
        linkText: driveFormData.linkText,
        badge: driveFormData.badge,
        isPinned: driveFormData.isPinned,
      };

      if (driveImageFile) {
        const formData = new FormData();
        Object.keys(payload).forEach((k) => formData.append(k, payload[k]));
        formData.append("poster", driveImageFile);

        if (editingDrive) {
          await placementEventService.update(editingDrive._id || editingDrive.id, formData);
          showSuccess("Placement drive updated ✓");
        } else {
          await placementEventService.create(formData);
          showSuccess("New placement drive published ✓");
        }
      } else {
        if (driveImagePreview && driveImagePreview.startsWith("http")) {
          payload.poster = driveImagePreview;
          payload.imageUrl = driveImagePreview;
        }
        if (editingDrive) {
          await placementEventService.update(editingDrive._id || editingDrive.id, payload);
          showSuccess("Placement drive updated ✓");
        } else {
          await placementEventService.create(payload);
          showSuccess("New placement drive published ✓");
        }
      }

      setDriveModalOpen(false);
      await loadDrives();
    } catch (err) {
      showError(err.message || "Failed to save placement drive");
    } finally {
      setSavingDrive(false);
    }
  };

  const handleDeleteDrive = async (drive) => {
    const id = drive._id || drive.id;
    if (!window.confirm(`Permanently delete placement drive "${drive.title}"?`)) return;
    try {
      await placementEventService.delete(id);
      setDrives((prev) => prev.filter((d) => d._id !== id && d.id !== id));
      showSuccess("Placement drive deleted permanently ✓");
    } catch (err) {
      showError("Failed to delete placement drive");
    }
  };

  const handleToggleDriveActive = async (drive) => {
    try {
      const id = drive._id || drive.id;
      const nextActive = !drive.isActive;
      await placementEventService.update(id, { isActive: nextActive });
      setDrives((prev) =>
        prev.map((d) => (d._id === id || d.id === id ? { ...d, isActive: nextActive } : d))
      );
      showSuccess(nextActive ? "Drive made live on campus portal ✓" : "Drive suspended from live feed");
    } catch (err) {
      showError("Failed to toggle drive status");
    }
  };

  // --- COMPANY HANDLERS ---
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyFormData({
      name: "",
      slug: "",
      tagline: "Product Engineering & Technology Services",
      packageRange: "₹6.0 LPA - ₹10.0 LPA",
      salary: "₹6.5 - ₹10.0 LPA",
      role: "Software Engineer / System Innovator",
      eligibility: "BE/B.Tech (All Branches) • No standing arrears • CGPA > 6.5",
      description: "Recruitment blueprint covering round-wise hiring criteria, coding challenges, and interview tips.",
      pattern: "Aptitude + 2 Hands-on Coding Challenges + Technical TR + HR",
      testLink: "https://www.geeksforgeeks.org",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zoho_Corporation_logo.svg/320px-Zoho_Corporation_logo.svg.png",
      roundsText: "Round 1: Basic Programming & Aptitude\nRound 2: Advanced Problem Solving & Data Structures\nRound 3: Technical & HR Discussion",
      questionsText: "1. Rotate a square matrix 90 degrees clockwise in-place.\n2. Longest substring without repeating characters."
    });
    setCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (c) => {
    setEditingCompany(c);
    const roundsStr = Array.isArray(c.rounds)
      ? c.rounds.map((r) => `${r.title || r.round}: ${r.details || r.tips || ""}`).join("\n")
      : "";
    const qStr = Array.isArray(c.sampleQuestions) ? c.sampleQuestions.join("\n") : "";
    setCompanyFormData({
      name: c.name || "",
      slug: c.slug || "",
      tagline: c.tagline || "",
      packageRange: c.packageRange || "",
      salary: c.salary || c.packageRange || "",
      role: c.role || "",
      eligibility: c.eligibility || "",
      description: c.description || "",
      pattern: c.pattern || "",
      testLink: c.testLink || "",
      logo: c.logo || "",
      roundsText: roundsStr,
      questionsText: qStr
    });
    setCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyFormData.name.trim()) {
      showError("Company name is required");
      return;
    }

    try {
      setSavingCompany(true);
      const rounds = companyFormData.roundsText
        .split("\n")
        .filter((l) => l.trim())
        .map((line, idx) => {
          const parts = line.split(":");
          return {
            round: `Round ${idx + 1}`,
            title: parts[0]?.trim() || `Round ${idx + 1}`,
            details: parts[1]?.trim() || "",
            tips: "Practice past company patterns thoroughly."
          };
        });

      const sampleQuestions = companyFormData.questionsText
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean);

      const payload = {
        name: companyFormData.name.trim(),
        slug: companyFormData.slug.trim() || companyFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tagline: companyFormData.tagline,
        packageRange: companyFormData.packageRange,
        salary: companyFormData.salary || companyFormData.packageRange,
        role: companyFormData.role,
        eligibility: companyFormData.eligibility,
        description: companyFormData.description,
        pattern: companyFormData.pattern,
        testLink: companyFormData.testLink,
        logo: companyFormData.logo,
        rounds,
        sampleQuestions
      };

      if (editingCompany) {
        await trainingService.updateCompany(editingCompany._id || editingCompany.id, payload);
        showSuccess("Company blueprint updated ✓");
      } else {
        await trainingService.createCompany(payload);
        showSuccess("New company blueprint created ✓");
      }

      setCompanyModalOpen(false);
      await loadTrainingData();
    } catch (err) {
      showError(err.message || "Failed to save company blueprint");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDeleteCompany = async (company) => {
    const id = company._id || company.id;
    if (!window.confirm(`Delete company blueprint "${company.name}"?`)) return;
    try {
      await trainingService.deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      showSuccess("Company blueprint removed ✓");
    } catch (err) {
      showError("Failed to delete company");
    }
  };

  // --- BOOTCAMP HANDLERS ---
  const handleOpenAddBootcamp = () => {
    setEditingBootcamp(null);
    setBootcampFormData({
      title: "",
      trainer: "VCET Placement Cell & Industry Alumni",
      date: "Oct 10 - Oct 14, 2026",
      time: "04:30 PM - 06:30 PM IST",
      mode: "Hybrid (Placement Lab 2 & Online)",
      eligible: "3rd & Final Year (All Branches)",
      seats: "120 Seats Remaining",
      status: "Registration Open",
      tagsText: "Aptitude, Coding, Interview Prep"
    });
    setBootcampModalOpen(true);
  };

  const handleOpenEditBootcamp = (b) => {
    setEditingBootcamp(b);
    setBootcampFormData({
      title: b.title || "",
      trainer: b.trainer || "",
      date: b.date || "",
      time: b.time || "",
      mode: b.mode || "Hybrid",
      eligible: b.eligible || "",
      seats: b.seats || "",
      status: b.status || "Registration Open",
      tagsText: Array.isArray(b.tags) ? b.tags.join(", ") : ""
    });
    setBootcampModalOpen(true);
  };

  const handleSaveBootcamp = async (e) => {
    e.preventDefault();
    if (!bootcampFormData.title.trim()) {
      showError("Bootcamp title is required");
      return;
    }
    try {
      setSavingBootcamp(true);
      const tags = bootcampFormData.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: bootcampFormData.title.trim(),
        trainer: bootcampFormData.trainer,
        date: bootcampFormData.date,
        time: bootcampFormData.time,
        mode: bootcampFormData.mode,
        eligible: bootcampFormData.eligible,
        seats: bootcampFormData.seats,
        status: bootcampFormData.status,
        tags
      };

      if (editingBootcamp) {
        await trainingService.updateBootcamp(editingBootcamp._id || editingBootcamp.id, payload);
        showSuccess("Bootcamp updated ✓");
      } else {
        await trainingService.createBootcamp(payload);
        showSuccess("New training bootcamp scheduled ✓");
      }
      setBootcampModalOpen(false);
      await loadTrainingData();
    } catch (err) {
      showError(err.message || "Failed to save bootcamp");
    } finally {
      setSavingBootcamp(false);
    }
  };

  const handleDeleteBootcamp = async (b) => {
    const id = b._id || b.id;
    if (!window.confirm(`Delete bootcamp "${b.title}"?`)) return;
    try {
      await trainingService.deleteBootcamp(id);
      setBootcamps((prev) => prev.filter((item) => item._id !== id && item.id !== id));
      showSuccess("Bootcamp removed ✓");
    } catch (err) {
      showError("Failed to delete bootcamp");
    }
  };

  // Filtered drives
  const filteredDrives = drives.filter((d) => {
    const q = searchDrives.toLowerCase();
    const title = (d.title || "").toLowerCase();
    const org = (d.organiser || "").toLowerCase();
    const desc = (d.description || "").toLowerCase();
    const matchesSearch = !q || title.includes(q) || org.includes(q) || desc.includes(q);

    const matchesCat = categoryFilter === "ALL" || d.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "LIVE" && d.isActive !== false) ||
      (statusFilter === "SUSPENDED" && d.isActive === false);

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-vcet-surface text-vcet-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-100 text-vcet-blue rounded-md">
                Admin Control
              </span>
              <span className="text-xs text-slate-500 font-medium">Campus Recruitment & Training Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Briefcase className="w-7 h-7 text-vcet-blue" />
              Placement & Career Hub Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Complete full-stack CRUD control over Campus Placement Drives, Tier-1 Company Blueprints, and Placement Training Bootcamps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadDrives();
                loadTrainingData();
              }}
              className="p-2.5 bg-white border border-vcet-line rounded-xl hover:bg-slate-50 text-slate-700 transition shadow-xs cursor-pointer"
              title="Refresh all data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingDrives || loadingTraining ? "animate-spin text-vcet-blue" : ""}`} />
            </button>

            {activeTab === "drives" && (
              <button
                onClick={handleOpenAddDrive}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-vcet-blue hover:bg-[#0077C8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Publish Campus Drive
              </button>
            )}

            {activeTab === "companies" && (
              <button
                onClick={handleOpenAddCompany}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-vcet-blue hover:bg-[#0077C8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Company Blueprint
              </button>
            )}

            {activeTab === "bootcamps" && (
              <button
                onClick={handleOpenAddBootcamp}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-vcet-blue hover:bg-[#0077C8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Schedule Bootcamp
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-vcet-line pb-2">
          <button
            onClick={() => setActiveTab("drives")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "drives"
                ? "bg-vcet-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-vcet-line"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Campus Drives & Events ({drives.length})
          </button>

          <button
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "companies"
                ? "bg-vcet-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-vcet-line"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Blueprints ({companies.length})
          </button>

          <button
            onClick={() => setActiveTab("bootcamps")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "bootcamps"
                ? "bg-vcet-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-vcet-line"
            }`}
          >
            <Award className="w-4 h-4" />
            Training Bootcamps ({bootcamps.length})
          </button>
        </div>

        {/* TAB 1: PLACEMENT DRIVES */}
        {activeTab === "drives" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-vcet-line rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search drives, companies, roles..."
                    value={searchDrives}
                    onChange={(e) => setSearchDrives(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-vcet-surface border border-vcet-line rounded-xl text-xs text-slate-800 focus:bg-white focus:border-vcet-blue"
                  />
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-vcet-surface border border-vcet-line rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="ALL">All Categories</option>
                    {DRIVE_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-vcet-surface border border-vcet-line rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value="ALL">All Status (Live & Suspended)</option>
                    <option value="LIVE">🟢 Live Campus Drives</option>
                    <option value="SUSPENDED">🔴 Suspended Drives</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Drives List Grid */}
            {loadingDrives ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-vcet-line">
                <Loader2 className="w-8 h-8 text-vcet-blue animate-spin mb-2" />
                <p className="text-xs font-bold text-slate-500">Loading placement events...</p>
              </div>
            ) : filteredDrives.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-vcet-line p-6">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Placement Drives Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Publish Campus Drive" above to create and schedule your first company recruitment drive.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDrives.map((drive) => {
                  const poster = resolvePosterUrl(drive);
                  const isLive = drive.isActive !== false;
                  return (
                    <div
                      key={drive._id || drive.id}
                      className="bg-white border border-vcet-line rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                        {poster ? (
                          <img
                            src={poster}
                            alt={drive.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-vcet-blue/10 to-[#0077C8]/20 text-vcet-blue">
                            <Briefcase className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">VCET Campus Drive</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-white/95 text-slate-800 rounded-full border border-slate-200 shadow-xs">
                            {drive.organiser}
                          </span>
                          {drive.isPinned && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full flex items-center gap-1 shadow-xs">
                              <Pin className="w-3 h-3" /> PINNED
                            </span>
                          )}
                        </div>

                        <span
                          className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isLive ? "bg-[#16A34A] text-white shadow-xs" : "bg-[#DC2626] text-white shadow-xs"
                          }`}
                        >
                          {isLive ? "Live" : "Suspended"}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                            {drive.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {drive.description || drive.subtitle}
                          </p>
                        </div>

                        <div className="space-y-1.5 text-[11px] bg-vcet-surface p-2.5 rounded-xl border border-vcet-line">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-vcet-blue shrink-0" />
                            <span>Date: <strong className="text-slate-900">{drive.date ? String(drive.date).slice(0, 10) : "Upcoming"}</strong></span>
                          </div>
                          {drive.time && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-vcet-blue shrink-0" />
                              <span>Time: <strong className="text-slate-900">{drive.time}</strong></span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-vcet-blue shrink-0" />
                            <span>Venue: <strong className="text-slate-900 truncate">{drive.venue || "VCET Campus"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-white border-t border-vcet-line flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewDrive(drive)}
                            className="p-1.5 rounded-lg bg-vcet-surface hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-vcet-line transition cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDrive(drive)}
                            className="p-1.5 rounded-lg bg-vcet-surface hover:bg-blue-50 text-vcet-blue border border-vcet-line transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDrive(drive)}
                            className="p-1.5 rounded-lg bg-vcet-surface hover:bg-rose-50 text-[#DC2626] border border-vcet-line transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleToggleDriveActive(drive)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isLive
                              ? "bg-rose-50 hover:bg-rose-100 text-[#DC2626] border border-rose-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200"
                          }`}
                        >
                          {isLive ? "Suspend" : "Make Live"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPANY BLUEPRINTS */}
        {activeTab === "companies" && (
          <div className="space-y-4">
            {companies.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-vcet-line p-6">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Company Blueprints Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add interview prep patterns and hiring tracks for companies like Zoho, TCS, Infosys, Cognizant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {companies.map((c) => (
                  <div
                    key={c._id || c.id}
                    className="bg-white border border-vcet-line rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} className="w-10 h-10 object-contain rounded-lg p-1 bg-slate-50 border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-vcet-blue/10 text-vcet-blue flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">{c.name}</h3>
                          <span className="text-[11px] font-semibold text-vcet-blue">{c.packageRange || c.salary}</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {c.slug}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description || c.tagline}
                    </p>

                    <div className="space-y-1.5 text-[11px] bg-vcet-surface p-3 rounded-xl border border-vcet-line">
                      <div>
                        <strong className="text-slate-700">Role:</strong> <span className="text-slate-900">{c.role || "SDE / Graduate Trainee"}</span>
                      </div>
                      <div>
                        <strong className="text-slate-700">Rounds:</strong> <span className="text-slate-900">{Array.isArray(c.rounds) ? c.rounds.length : 0} Selection Rounds</span>
                      </div>
                      <div>
                        <strong className="text-slate-700">Eligibility:</strong> <span className="text-slate-900 truncate block">{c.eligibility}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-vcet-line flex items-center justify-between">
                      <a
                        href={c.testLink || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-vcet-blue hover:underline flex items-center gap-1 font-bold"
                      >
                        Practice Questions <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditCompany(c)}
                          className="p-1.5 rounded-lg bg-vcet-surface hover:bg-blue-50 text-vcet-blue border border-vcet-line transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(c)}
                          className="p-1.5 rounded-lg bg-vcet-surface hover:bg-rose-50 text-[#DC2626] border border-vcet-line transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOOTCAMPS & TOOLKITS */}
        {activeTab === "bootcamps" && (
          <div className="space-y-4">
            {bootcamps.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-vcet-line p-6">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Training Bootcamps Scheduled</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Schedule Bootcamp" to organize placement training workshops.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bootcamps.map((b) => (
                  <div
                    key={b._id || b.id}
                    className="bg-white border border-vcet-line rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                          {b.mode || "Hybrid Bootcamp"}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {b.status || "Open"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{b.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Trainer: {b.trainer}</p>
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-vcet-surface p-3 rounded-xl border border-vcet-line">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-vcet-blue" />
                        <span>Dates: <strong>{b.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-vcet-blue" />
                        <span>Timings: <strong>{b.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users className="w-3.5 h-3.5 text-vcet-blue" />
                        <span>Eligibility: <strong>{b.eligible}</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-vcet-line flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditBootcamp(b)}
                        className="p-1.5 rounded-lg bg-vcet-surface hover:bg-blue-50 text-vcet-blue border border-vcet-line transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBootcamp(b)}
                        className="p-1.5 rounded-lg bg-vcet-surface hover:bg-rose-50 text-[#DC2626] border border-vcet-line transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL: CREATE / EDIT DRIVE --- */}
      {driveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-vcet-line rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setDriveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-vcet-blue" />
              {editingDrive ? "Edit Placement Drive" : "Publish Campus Placement Drive"}
            </h2>

            <form onSubmit={handleSaveDrive} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Drive Title *</label>
                <input
                  type="text"
                  required
                  value={driveFormData.title}
                  onChange={(e) => setDriveFormData({ ...driveFormData, title: e.target.value })}
                  placeholder="e.g. ZOHO Corporation — Campus Recruitment Drive 2026"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:border-vcet-blue focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company / Organiser *</label>
                  <input
                    type="text"
                    required
                    value={driveFormData.organiser}
                    onChange={(e) => setDriveFormData({ ...driveFormData, organiser: e.target.value })}
                    placeholder="e.g. Zoho Corporation"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={driveFormData.category}
                    onChange={(e) => setDriveFormData({ ...driveFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  >
                    {DRIVE_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={driveFormData.date}
                    onChange={(e) => setDriveFormData({ ...driveFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Timings</label>
                  <input
                    type="text"
                    value={driveFormData.time}
                    onChange={(e) => setDriveFormData({ ...driveFormData, time: e.target.value })}
                    placeholder="09:00 AM - 04:30 PM"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Venue / Mode</label>
                  <input
                    type="text"
                    value={driveFormData.venue}
                    onChange={(e) => setDriveFormData({ ...driveFormData, venue: e.target.value })}
                    placeholder="e.g. VCET Placement Lab 3"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Eligible Branches</label>
                  <input
                    type="text"
                    value={driveFormData.department}
                    onChange={(e) => setDriveFormData({ ...driveFormData, department: e.target.value })}
                    placeholder="e.g. CSE, IT, AI&DS, ECE"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description & Eligibility</label>
                <textarea
                  rows={3}
                  value={driveFormData.description}
                  onChange={(e) => setDriveFormData({ ...driveFormData, description: e.target.value })}
                  placeholder="Job profile, salary package, rounds, dress code, required documents..."
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:border-vcet-blue focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Registration Link (URL)</label>
                  <input
                    type="text"
                    value={driveFormData.linkUrl}
                    onChange={(e) => setDriveFormData({ ...driveFormData, linkUrl: e.target.value })}
                    placeholder="https://forms.gle/... or company portal"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Button Text</label>
                  <input
                    type="text"
                    value={driveFormData.linkText}
                    onChange={(e) => setDriveFormData({ ...driveFormData, linkText: e.target.value })}
                    placeholder="Register Now / View Details"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Poster Upload */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Upload Poster Image <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                {driveImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-vcet-line bg-vcet-surface">
                    <img src={driveImagePreview} alt="Preview" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-vcet-line">
                      <span className="text-[11px] text-slate-500 truncate max-w-[80%]">
                        {driveImageFile?.name || "Selected Poster"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDriveImageFile(null);
                          setDriveImagePreview(null);
                        }}
                        className="text-[#DC2626] hover:text-red-700 text-xs font-bold ml-2 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 w-full h-20 rounded-xl border-2 border-dashed border-vcet-line bg-vcet-surface hover:bg-slate-100 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-vcet-blue" />
                    <span className="text-xs text-slate-600 font-medium">Click to upload company poster</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          showError("Image must be under 5 MB");
                          return;
                        }
                        setDriveImageFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setDriveImagePreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Pin toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="drive-pin-toggle"
                  checked={driveFormData.isPinned}
                  onChange={(e) => setDriveFormData({ ...driveFormData, isPinned: e.target.checked })}
                  className="rounded text-vcet-blue focus:ring-vcet-blue"
                />
                <label htmlFor="drive-pin-toggle" className="text-xs text-slate-700 font-bold flex items-center gap-1 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-vcet-blue" /> Pin to top of placement announcements
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-vcet-line">
                <button
                  type="button"
                  onClick={() => setDriveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDrive}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingDrive && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingDrive ? "Save Changes" : "Broadcast Campus Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT COMPANY BLUEPRINT --- */}
      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-vcet-line rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setCompanyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-vcet-blue" />
              {editingCompany ? "Edit Company Blueprint" : "Create Company Blueprint"}
            </h2>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    placeholder="e.g. Zoho Corporation"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Range</label>
                  <input
                    type="text"
                    value={companyFormData.packageRange}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, packageRange: e.target.value })}
                    placeholder="₹6.0 LPA - ₹10.0 LPA"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Title</label>
                  <input
                    type="text"
                    value={companyFormData.role}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, role: e.target.value })}
                    placeholder="Software Development Engineer"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={companyFormData.logo}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, logo: e.target.value })}
                    placeholder="https://... logo.png"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={companyFormData.eligibility}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, eligibility: e.target.value })}
                  placeholder="BE/B.Tech (All Branches) • No standing backlogs • 6.5+ CGPA"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hiring Rounds (one per line)</label>
                <textarea
                  rows={3}
                  value={companyFormData.roundsText}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, roundsText: e.target.value })}
                  placeholder="Round 1: Basic Programming MCQs&#10;Round 2: Data Structures & Algorithms&#10;Round 3: HR & Cultural Fit"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sample Questions (one per line)</label>
                <textarea
                  rows={3}
                  value={companyFormData.questionsText}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, questionsText: e.target.value })}
                  placeholder="Print spiral matrix&#10;Implement custom string copy without built-ins"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Practice Resource Link (URL)</label>
                <input
                  type="text"
                  value={companyFormData.testLink}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, testLink: e.target.value })}
                  placeholder="https://www.geeksforgeeks.org/..."
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-vcet-line">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingCompany && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCompany ? "Save Changes" : "Save Company Blueprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT BOOTCAMP --- */}
      {bootcampModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-vcet-line rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setBootcampModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-vcet-blue" />
              {editingBootcamp ? "Edit Training Bootcamp" : "Schedule Training Bootcamp"}
            </h2>

            <form onSubmit={handleSaveBootcamp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bootcamp Title *</label>
                <input
                  type="text"
                  required
                  value={bootcampFormData.title}
                  onChange={(e) => setBootcampFormData({ ...bootcampFormData, title: e.target.value })}
                  placeholder="e.g. Zoho Corporation Coding & Application Bootcamp"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Trainer / Facilitator</label>
                  <input
                    type="text"
                    value={bootcampFormData.trainer}
                    onChange={(e) => setBootcampFormData({ ...bootcampFormData, trainer: e.target.value })}
                    placeholder="VCET Placement Cell"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mode</label>
                  <input
                    type="text"
                    value={bootcampFormData.mode}
                    onChange={(e) => setBootcampFormData({ ...bootcampFormData, mode: e.target.value })}
                    placeholder="Hybrid (Lab 2 & Google Meet)"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Schedule Dates</label>
                  <input
                    type="text"
                    value={bootcampFormData.date}
                    onChange={(e) => setBootcampFormData({ ...bootcampFormData, date: e.target.value })}
                    placeholder="Oct 12 - Oct 16, 2026"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Timings</label>
                  <input
                    type="text"
                    value={bootcampFormData.time}
                    onChange={(e) => setBootcampFormData({ ...bootcampFormData, time: e.target.value })}
                    placeholder="04:30 PM - 06:30 PM IST"
                    className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={bootcampFormData.tagsText}
                  onChange={(e) => setBootcampFormData({ ...bootcampFormData, tagsText: e.target.value })}
                  placeholder="Aptitude, Coding, Mock TR"
                  className="w-full px-3 py-2 bg-vcet-surface rounded-xl border border-vcet-line text-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-vcet-line">
                <button
                  type="button"
                  onClick={() => setBootcampModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBootcamp}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-vcet-blue hover:bg-[#0077C8] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingBootcamp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingBootcamp ? "Save Changes" : "Save Bootcamp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW DRIVE MODAL --- */}
      {previewDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-vcet-line rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewDrive(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100">
                {resolvePosterUrl(previewDrive) ? (
                  <img
                    src={resolvePosterUrl(previewDrive)}
                    alt={previewDrive.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-vcet-blue/10 to-[#0077C8]/20 text-vcet-blue">
                    <Briefcase className="w-10 h-10 opacity-40 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">VCET Campus Drive</span>
                  </div>
                )}
              </div>

              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-vcet-blue text-white rounded-full">
                  {previewDrive.organiser}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-2">
                  {previewDrive.title}
                </h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed whitespace-pre-line">
                  {previewDrive.description || previewDrive.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-vcet-surface p-3 rounded-xl border border-vcet-line">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Drive Date</span>
                  <p className="font-bold text-slate-800">{previewDrive.date ? String(previewDrive.date).slice(0, 10) : "Upcoming"}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Timings</span>
                  <p className="font-bold text-slate-800">{previewDrive.time || "Full Day"}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-vcet-line">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Venue</span>
                  <p className="font-bold text-slate-800">{previewDrive.venue || "VCET Campus"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
