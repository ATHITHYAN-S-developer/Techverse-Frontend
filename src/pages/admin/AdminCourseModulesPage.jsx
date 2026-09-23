import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Puzzle,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
  CheckCircle,
  X,
  Play,
  RefreshCw,
  Code2,
  CheckSquare,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Save,
  Check,
  Award,
  ArrowLeft,
  User,
} from "lucide-react";
import { api } from "../../services/api";
import { courseService } from "../../services/courseService";
import { useToast } from "../../context/ToastContext";

/**
 * Extract YouTube 11-char Video ID
 */
function extractYouTubeId(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

export default function AdminCourseModulesPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCourseId = searchParams.get("courseId") || "";
  const isFaculty = window.location.pathname.startsWith("/faculty") || user?.role === "teacher";

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Main Module Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Module Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedMinutes: 45,
    hasVideo: true, // ALWAYS true (mandatory)
    hasCoding: false,
    hasMCQ: false,
    videos: [],
    codingProblems: [],
    mcqs: [],
  });

  // Sub-builder Inline / Sub-modals
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "coding" | "mcq"

  // Video Item Form
  const [videoForm, setVideoForm] = useState({
    title: "",
    youtubeUrl: "",
    duration: "20 mins",
    description: "",
  });

  // Coding Item Form
  const [codingForm, setCodingForm] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    constraints: "1 <= N <= 10^5\nTime Limit: 2.0s",
    inputFormat: "First line contains N.",
    outputFormat: "Print output.",
    starterCode: "function solution(input) {\n  // Write solution here\n  return input;\n}",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "15",
  });

  // MCQ Item Form
  const [mcqForm, setMcqForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: 0,
    explanation: "",
    marks: 1,
  });

  // Load courses and initial modules on mount
  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const res = isFaculty ? await courseService.getMyCourses() : await api.get("/courses");
      const courseList = isFaculty
        ? Array.isArray(res)
          ? res
          : res?.courses || res?.data?.courses || []
        : res?.data?.courses || res?.courses || [];
      setCourses(courseList);
      if (courseList.length > 0) {
        if (paramCourseId && courseList.some((c) => (c._id || c.id || c.slug) === paramCourseId)) {
          setSelectedCourseId(paramCourseId);
        } else if (!selectedCourseId) {
          setSelectedCourseId(courseList[0]._id || courseList[0].id);
        }
      }
    } catch (err) {
      console.debug("Error loading courses:", err);
    }
  };

  const loadModules = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/modules?courseId=${courseId}`);
      const moduleList = res?.data?.modules || res?.modules || [];
      setModules(moduleList);
    } catch (err) {
      console.debug("Error loading modules from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingModule(null);
    setFormData({
      title: `Module ${modules.length + 1}: `,
      description: "",
      estimatedMinutes: 45,
      hasVideo: true,
      hasCoding: false,
      hasMCQ: false,
      videos: [],
      codingProblems: [],
      mcqs: [],
    });
    setActiveTab("videos");
    setModalOpen(true);
  };

  const handleOpenEdit = (mod) => {
    setEditingModule(mod);
    
    // Normalize existing videos or fallback from videoUrl
    let initialVideos = mod.videos && mod.videos.length > 0 ? [...mod.videos] : [];
    if (initialVideos.length === 0 && mod.videoUrl) {
      initialVideos.push({
        title: `${mod.title || "Module"} - Lecture Video`,
        youtubeUrl: mod.videoUrl,
        youtubeVideoId: extractYouTubeId(mod.videoUrl),
        duration: "30 mins",
        order: 1,
      });
    }

    setFormData({
      title: mod.title || "",
      description: mod.description || "",
      estimatedMinutes: mod.estimatedMinutes || 45,
      hasVideo: true,
      hasCoding: Boolean(mod.hasCoding || (mod.codingProblems && mod.codingProblems.length > 0)),
      hasMCQ: Boolean(mod.hasMCQ || (mod.mcqs && mod.mcqs.length > 0)),
      videos: initialVideos,
      codingProblems: mod.codingProblems ? [...mod.codingProblems] : [],
      mcqs: mod.mcqs ? [...mod.mcqs] : [],
    });
    setActiveTab("videos");
    setModalOpen(true);
  };

  // ----------------------------------------------------
  // Video Sub-item Handlers
  // ----------------------------------------------------
  const handleAddVideo = () => {
    if (!videoForm.title.trim() || !videoForm.youtubeUrl.trim()) {
      showError("Please enter both Video Title and a valid YouTube URL");
      return;
    }
    const videoId = extractYouTubeId(videoForm.youtubeUrl.trim());
    const newVideo = {
      title: videoForm.title.trim(),
      youtubeUrl: videoForm.youtubeUrl.trim(),
      youtubeVideoId: videoId,
      duration: videoForm.duration.trim() || "20 mins",
      description: videoForm.description.trim(),
      order: formData.videos.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));
    setVideoForm({
      title: "",
      youtubeUrl: "",
      duration: "20 mins",
      description: "",
    });
    showSuccess("Video added to module playlist.");
  };

  const handleRemoveVideo = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // Coding Problem Sub-item Handlers
  // ----------------------------------------------------
  const handleAddCodingProblem = () => {
    if (!codingForm.title.trim() || !codingForm.description.trim()) {
      showError("Please enter Problem Title and Description");
      return;
    }
    const newProblem = {
      title: codingForm.title.trim(),
      description: codingForm.description.trim(),
      difficulty: codingForm.difficulty,
      constraints: codingForm.constraints,
      inputFormat: codingForm.inputFormat,
      outputFormat: codingForm.outputFormat,
      starterCode: codingForm.starterCode,
      testCases: [
        {
          input: codingForm.sampleInput,
          output: codingForm.sampleOutput,
          isHidden: false,
        },
      ],
    };
    setFormData((prev) => ({
      ...prev,
      codingProblems: [...prev.codingProblems, newProblem],
    }));
    setCodingForm({
      title: "",
      description: "",
      difficulty: "Medium",
      constraints: "1 <= N <= 10^5\nTime Limit: 2.0s",
      inputFormat: "First line contains N.",
      outputFormat: "Print output.",
      starterCode: "function solution(input) {\n  // Write solution here\n  return input;\n}",
      sampleInput: "",
      sampleOutput: "",
    });
    showSuccess("Coding problem added.");
  };

  const handleRemoveCodingProblem = (index) => {
    setFormData((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // MCQ Sub-item Handlers
  // ----------------------------------------------------
  const handleAddMCQ = () => {
    if (!mcqForm.question.trim()) {
      showError("Please enter Question text");
      return;
    }
    if (!mcqForm.optionA.trim() || !mcqForm.optionB.trim()) {
      showError("Please enter at least Option A and Option B");
      return;
    }
    const options = [
      mcqForm.optionA.trim(),
      mcqForm.optionB.trim(),
      mcqForm.optionC.trim() || "None of the above",
      mcqForm.optionD.trim() || "All of the above",
    ];
    const newMCQ = {
      question: mcqForm.question.trim(),
      options,
      correctAnswer: Number(mcqForm.correctAnswer) || 0,
      explanation: mcqForm.explanation.trim(),
      marks: Number(mcqForm.marks) || 1,
    };
    setFormData((prev) => ({
      ...prev,
      mcqs: [...prev.mcqs, newMCQ],
    }));
    setMcqForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: 0,
      explanation: "",
      marks: 1,
    });
    showSuccess("MCQ question added.");
  };

  const handleRemoveMCQ = (index) => {
    setFormData((prev) => ({
      ...prev,
      mcqs: prev.mcqs.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------
  // Save / Publish Full Module with Complete Validation
  // ----------------------------------------------------
  const handleSaveModule = async (e) => {
    e.preventDefault();

    // 1. Title validation
    if (!formData.title.trim()) {
      showError("❌ Module title is required.");
      return;
    }

    // 2. Video validation (MANDATORY)
    if (formData.videos.length === 0) {
      showError(`❌ Module "${formData.title}" must contain at least one video.`);
      return;
    }

    // 3. Coding validation (if enabled)
    if (formData.hasCoding && formData.codingProblems.length === 0) {
      showError(`❌ Coding is enabled: please add at least one coding problem or uncheck Coding.`);
      return;
    }

    // 4. MCQ validation (if enabled)
    if (formData.hasMCQ && formData.mcqs.length === 0) {
      showError(`❌ MCQ is enabled: please add at least one MCQ question or uncheck MCQ.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedMinutes: formData.estimatedMinutes,
        hasVideo: true,
        hasCoding: Boolean(formData.hasCoding),
        hasMCQ: Boolean(formData.hasMCQ),
        videos: formData.videos,
        codingProblems: formData.hasCoding ? formData.codingProblems : [],
        mcqs: formData.hasMCQ ? formData.mcqs : [],
        videoUrl: formData.videos[0]?.youtubeUrl || "",
        content: formData.description,
      };

      if (editingModule) {
        await api.put(`/modules/${editingModule._id || editingModule.id}`, payload);
        showSuccess(`Module "${formData.title}" updated successfully!`);
      } else {
        await api.post("/modules", payload);
        showSuccess(`Module "${formData.title}" created successfully!`);
      }

      setModalOpen(false);
      loadModules(selectedCourseId);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to save module";
      showError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (mod) => {
    if (!window.confirm(`Are you sure you want to delete "${mod.title}"?`)) return;
    try {
      await api.delete(`/modules/${mod._id || mod.id}`);
      showSuccess(`Module "${mod.title}" deleted.`);
      loadModules(selectedCourseId);
    } catch (err) {
      showError(err?.message || "Failed to delete module");
    }
  };

  const selectedCourse = courses.find((c) => (c._id || c.id) === selectedCourseId);

  return (
    <div className="space-y-6 pb-16 select-none max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#0B4A8F]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Course Module Content Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Define learning modules. Video is mandatory. Coding and MCQ assessments are optional.
          </p>
        </div>

        {/* Course Select & Add Action */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/20 max-w-xs"
          >
            {courses.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* Empty State — faculty with no assigned courses */}
      {courses.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-2 shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Courses Assigned to You Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFaculty
              ? "You will manage modules here once an administrator assigns courses to you. Ask your admin to assign a course to get started."
              : "No courses are available yet. Create a course first from the course catalog."}
          </p>
        </div>
      )}

      {/* 2. Course Overview & Rules Callout */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Course
            </span>
            <h3 className="text-base font-extrabold text-slate-800 mt-1 line-clamp-1">
              {selectedCourse.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Category: {selectedCourse.category} • {modules.length} Published Modules
            </p>
            {selectedCourse.assignedFacultyName && (
              <p className="text-[11px] font-semibold text-[#0B4A8F] mt-1.5 inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                Assigned to: {selectedCourse.assignedFacultyName}
              </p>
            )}
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                MANDATORY CONTENT RULE
              </span>
              <p className="text-xs text-blue-950 font-medium mt-0.5">
                Every module MUST contain at least one Video. Coding & MCQs are optional.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                STUDENT COMPLETION RULE
              </span>
              <p className="text-xs text-emerald-950 font-medium mt-0.5">
                Students must finish Video + enabled Coding/MCQ to achieve 100% completion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0B4A8F]" />
            <p className="text-xs text-slate-500 mt-2">Loading course syllabus modules...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#0B4A8F] flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No Modules Created Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start structuring this course curriculum by clicking "Add Module". Remember that at least one video is mandatory.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4A8F] text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {modules.map((mod, index) => {
              const videoCount = mod.videos?.length || (mod.videoUrl ? 1 : 0);
              const codingCount = mod.codingProblems?.length || 0;
              const mcqCount = mod.mcqs?.length || 0;

              return (
                <div
                  key={mod._id || mod.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-[#0B4A8F]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-sm shrink-0 border border-slate-200">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {mod.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {mod.estimatedMinutes || 45} mins
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {mod.description || "No description provided."}
                      </p>

                      {/* Content Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Video Badge (Always Present) */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-[#0B4A8F] border border-blue-200/70">
                          <Video className="w-3.5 h-3.5" />
                          <span>{videoCount} Video{videoCount > 1 ? "s" : ""} (Required)</span>
                        </span>

                        {/* Coding Badge */}
                        {mod.hasCoding ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/70">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{codingCount} Coding Problem{codingCount > 1 ? "s" : ""}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                            Coding Disabled
                          </span>
                        )}

                        {/* MCQ Badge */}
                        {mod.hasMCQ ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{mcqCount} MCQ Question{mcqCount > 1 ? "s" : ""}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                            MCQ Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEdit(mod)}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#0B4A8F] hover:bg-slate-100 transition-colors"
                      title="Edit Module Content"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MODULE BUILDER MODAL (Exact match for user content selection rules)
          ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveModule}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B4A8F] block">
                  {editingModule ? "EDIT MODULE CONTENT" : "CREATE NEW MODULE"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  {editingModule ? `Editing: ${editingModule.title}` : "Course Module Builder"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Basic Module Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Module Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Module 1: Python Data Structures & Algorithms"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/20 focus:border-[#0B4A8F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/20"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Module Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe learning goals and topics covered in this module..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4A8F]/20"
                  />
                </div>
              </div>

              {/* CONTENT OPTIONS SELECTOR */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0B4A8F]" />
                    <span>CONTENT OPTIONS</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Select active content components for this module
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Option 1: VIDEO (MANDATORY & LOCKED) */}
                  <div className="p-4 rounded-xl bg-blue-50/80 border-2 border-blue-300 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="mt-1 w-4 h-4 text-[#0B4A8F] rounded border-blue-400 cursor-not-allowed"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-[#0B4A8F]" />
                        <span className="text-xs font-extrabold text-blue-900">Video</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">
                        REQUIRED / MANDATORY
                      </span>
                      <p className="text-[11px] text-blue-900/80">
                        At least 1 lecture video is required.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: CODING (OPTIONAL) */}
                  <label
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.hasCoding
                        ? "bg-purple-50/80 border-purple-400"
                        : "bg-white border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hasCoding}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({ ...formData, hasCoding: checked });
                        if (checked) setActiveTab("coding");
                      }}
                      className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-purple-700" />
                        <span className="text-xs font-extrabold text-slate-900">Coding</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 block uppercase tracking-wider">
                        OPTIONAL
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Interactive code editor & test cases.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: MCQ (OPTIONAL) */}
                  <label
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.hasMCQ
                        ? "bg-emerald-50/80 border-emerald-400"
                        : "bg-white border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hasMCQ}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({ ...formData, hasMCQ: checked });
                        if (checked) setActiveTab("mcq");
                      }}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-extrabold text-slate-900">MCQ</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">
                        OPTIONAL
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Multiple-choice assessment quizzes.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Sub-Builder Tabs */}
              <div className="border-b border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("videos")}
                  className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === "videos"
                      ? "border-[#0B4A8F] text-[#0B4A8F]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Module Videos</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#0B4A8F]">
                    {formData.videos.length} (Mandatory)
                  </span>
                </button>

                {formData.hasCoding && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("coding")}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === "coding"
                        ? "border-purple-600 text-purple-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Coding Problems</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700">
                      {formData.codingProblems.length}
                    </span>
                  </button>
                )}

                {formData.hasMCQ && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("mcq")}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === "mcq"
                        ? "border-emerald-600 text-emerald-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>MCQ Questions</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                      {formData.mcqs.length}
                    </span>
                  </button>
                )}
              </div>

              {/* ---------------------------------------------------------------
                  TAB 1: VIDEO BUILDER (MANDATORY)
                  --------------------------------------------------------------- */}
              {activeTab === "videos" && (
                <div className="space-y-4">
                  {formData.videos.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>❌ Module must contain at least one video. Please add a video below.</span>
                    </div>
                  )}

                  {/* List of Added Videos */}
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        Added Module Videos ({formData.videos.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.videos.map((vid, vIdx) => (
                          <div
                            key={vIdx}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2"
                          >
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#0B4A8F] uppercase tracking-wider block">
                                Video {vIdx + 1} • {vid.duration}
                              </span>
                              <h5 className="text-xs font-extrabold text-slate-900 truncate">
                                {vid.title}
                              </h5>
                              <a
                                href={vid.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                {vid.youtubeUrl}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(vIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add Video Form */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0B4A8F]" />
                      <span>Add Lecture Video to Playlist</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Video Title *</label>
                        <input
                          type="text"
                          value={videoForm.title}
                          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                          placeholder="e.g., Python Variables & Data Types Explained"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">YouTube URL *</label>
                        <input
                          type="url"
                          value={videoForm.youtubeUrl}
                          onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Duration</label>
                        <input
                          type="text"
                          value={videoForm.duration}
                          onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                          placeholder="e.g., 25 mins"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Video Description</label>
                        <input
                          type="text"
                          value={videoForm.description}
                          onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                          placeholder="Optional notes or timestamp topics..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVideo}
                      className="px-4 py-2 bg-[#0B4A8F] hover:bg-[#084282] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Video</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------------------
                  TAB 2: CODING PROBLEM BUILDER (OPTIONAL)
                  --------------------------------------------------------------- */}
              {activeTab === "coding" && formData.hasCoding && (
                <div className="space-y-4">
                  {formData.codingProblems.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2 text-xs font-bold text-purple-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-purple-600" />
                      <span>Coding is enabled: please add at least one problem below.</span>
                    </div>
                  )}

                  {/* List of Added Coding Problems */}
                  {formData.codingProblems.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        Added Coding Problems ({formData.codingProblems.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.codingProblems.map((cp, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                                  Problem {cIdx + 1}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-100 text-purple-800">
                                  {cp.difficulty}
                                </span>
                              </div>
                              <h5 className="text-xs font-extrabold text-slate-900 truncate">
                                {cp.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {cp.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCodingProblem(cIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add Coding Problem Form */}
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
                    <h5 className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-purple-700" />
                      <span>Add Coding Challenge</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Problem Title *</label>
                        <input
                          type="text"
                          value={codingForm.title}
                          onChange={(e) => setCodingForm({ ...codingForm, title: e.target.value })}
                          placeholder="e.g., Two Sum in Array"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Difficulty</label>
                        <select
                          value={codingForm.difficulty}
                          onChange={(e) => setCodingForm({ ...codingForm, difficulty: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600">Description *</label>
                        <textarea
                          rows={2}
                          value={codingForm.description}
                          onChange={(e) => setCodingForm({ ...codingForm, description: e.target.value })}
                          placeholder="Explain problem statement and requirements..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Sample Input</label>
                        <input
                          type="text"
                          value={codingForm.sampleInput}
                          onChange={(e) => setCodingForm({ ...codingForm, sampleInput: e.target.value })}
                          placeholder="e.g., 4\n2 7 11 15"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Sample Expected Output</label>
                        <input
                          type="text"
                          value={codingForm.sampleOutput}
                          onChange={(e) => setCodingForm({ ...codingForm, sampleOutput: e.target.value })}
                          placeholder="e.g., [0, 1]"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCodingProblem}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Coding Problem</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------------------
                  TAB 3: MCQ BUILDER (OPTIONAL)
                  --------------------------------------------------------------- */}
              {activeTab === "mcq" && formData.hasMCQ && (
                <div className="space-y-4">
                  {formData.mcqs.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>MCQ is enabled: please add at least one question below.</span>
                    </div>
                  )}

                  {/* List of Added MCQs */}
                  {formData.mcqs.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        Added MCQ Questions ({formData.mcqs.length})
                      </span>
                      <div className="space-y-2">
                        {formData.mcqs.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                  Q{qIdx + 1}
                                </span>
                                <span className="text-xs font-extrabold text-slate-900">
                                  {q.question}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                {q.options.map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className={`px-2 py-1 rounded-lg border font-medium ${
                                      oIdx === q.correctAnswer
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                                        : "bg-white border-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                    {oIdx === q.correctAnswer && " ✓"}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMCQ(qIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add MCQ Form */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                    <h5 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-700" />
                      <span>Add Multiple Choice Question</span>
                    </h5>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Question Statement *</label>
                        <input
                          type="text"
                          value={mcqForm.question}
                          onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
                          placeholder="e.g., Which data structure operates on a FIFO (First-In-First-Out) principle?"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Option A *</label>
                          <input
                            type="text"
                            value={mcqForm.optionA}
                            onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                            placeholder="Option A"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Option B *</label>
                          <input
                            type="text"
                            value={mcqForm.optionB}
                            onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                            placeholder="Option B"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Option C</label>
                          <input
                            type="text"
                            value={mcqForm.optionC}
                            onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                            placeholder="Option C"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Option D</label>
                          <input
                            type="text"
                            value={mcqForm.optionD}
                            onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                            placeholder="Option D"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Correct Option *</label>
                          <select
                            value={mcqForm.correctAnswer}
                            onChange={(e) => setMcqForm({ ...mcqForm, correctAnswer: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 bg-white"
                          >
                            <option value={0}>Option A is Correct</option>
                            <option value={1}>Option B is Correct</option>
                            <option value={2}>Option C is Correct</option>
                            <option value={3}>Option D is Correct</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Explanation Note</label>
                          <input
                            type="text"
                            value={mcqForm.explanation}
                            onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
                            placeholder="e.g., Queue implements FIFO while Stack implements LIFO."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMCQ}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add MCQ Question</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls (Pinned Cleanly at the Bottom) */}
            <div className="p-4 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1 text-[#0B4A8F]">
                  <Video className="w-3.5 h-3.5" />
                  {formData.videos.length} Video{formData.videos.length === 1 ? "" : "s"}
                </span>
                {formData.hasCoding && (
                  <span className="inline-flex items-center gap-1 text-purple-700">
                    • <Code2 className="w-3.5 h-3.5" />
                    {formData.codingProblems.length} Coding
                  </span>
                )}
                {formData.hasMCQ && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    • <HelpCircle className="w-3.5 h-3.5" />
                    {formData.mcqs.length} MCQ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#0B4A8F] hover:bg-[#084282] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving to Database..." : editingModule ? "Update Module" : "Save & Publish Module"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
