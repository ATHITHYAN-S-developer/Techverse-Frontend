import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Sparkles,
  Layers,
  Save,
  Check,
  Award,
  ArrowLeft,
  User,
  Users,
  EyeOff,
  Globe,
  Lock,
  Search,
  Info,
} from "lucide-react";
import { api } from "../../services/api";
import { courseService } from "../../services/courseService";
import { useToast } from "../../context/ToastContext";

/**
 * Extract YouTube 11-char Video ID
 */
function extractYouTubeId(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : "";
}

export default function AdminCourseModulesPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCourseId = searchParams.get("courseId") || "";
  const isHod =
    user?.role === "hod" ||
    (user?.staffId && (user.staffId.includes("104") || user.staffId.toUpperCase().includes("HOD"))) ||
    (user?.designation && (user.designation.includes("HOD") || user.designation.includes("Head of the Department")));
  const isFacultyOnly = !isHod && user?.role !== "admin";

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const expandAll = () => {
    const all = {};
    modules.forEach((m) => {
      all[m._id || m.id] = true;
    });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const selectedCourse =
    courses.find((c) => String(c._id || c.id || c.slug) === String(selectedCourseId)) || null;

  const isAssignedFaculty =
    Boolean(selectedCourse) &&
    ((selectedCourse.assignedFacultyId &&
      String(selectedCourse.assignedFacultyId._id || selectedCourse.assignedFacultyId) === String(user?._id || user?.id)) ||
      (selectedCourse.assignedFacultyName &&
        user?.name &&
        selectedCourse.assignedFacultyName.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
      (selectedCourse.instructor &&
        user?.name &&
        selectedCourse.instructor.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
      (selectedCourse.createdBy &&
        String(selectedCourse.createdBy._id || selectedCourse.createdBy) === String(user?._id || user?.id)));

  const canPublishCourse =
    user?.role === "admin" ||
    isHod ||
    isAssignedFaculty;

  // Main Module Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const modalBodyRef = useRef(null);

  // Sub-item editing states (to allow editing existing videos, coding challenges, MCQs)
  const [editingVideoIdx, setEditingVideoIdx] = useState(null);
  const [editingCodingIdx, setEditingCodingIdx] = useState(null);
  const [editingMCQIdx, setEditingMCQIdx] = useState(null);

  // Module Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hasVideo: false,
    isVideoMandatory: false,
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

  // Load courses whenever user session is available
  useEffect(() => {
    loadCourses();
  }, [user]);

  // Keep selectedCourseId synced with paramCourseId when courses are populated
  useEffect(() => {
    if (paramCourseId && courses.length > 0) {
      const match = courses.find((c) => String(c._id || c.id || c.slug) === String(paramCourseId));
      if (match) {
        setSelectedCourseId(match._id || match.id);
      }
    }
  }, [paramCourseId, courses]);

  useEffect(() => {
    if (selectedCourseId) {
      loadModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleTogglePublish = async () => {
    if (!selectedCourse) return;
    if (!canPublishCourse) {
      showError("Forbidden: Only the assigned faculty, HOD, or an administrator can publish or unpublish this course.");
      return;
    }
    setPublishing(true);
    try {
      const newStatus = !selectedCourse.isPublished;
      await courseService.togglePublishStatus(selectedCourse._id || selectedCourse.id, newStatus);
      showSuccess(
        newStatus
          ? "🎉 Course published successfully! It is now live for students in PrepZone."
          : "Course unpublished and moved back to Draft (hidden from students)."
      );
      setCourses((prev) =>
        prev.map((c) =>
          String(c._id || c.id || c.slug) === String(selectedCourse._id || selectedCourse.id || selectedCourse.slug)
            ? { ...c, isPublished: newStatus }
            : c
        )
      );
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "Failed to update publication status.");
    } finally {
      setPublishing(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = user?.role === "admin" ? await api.get("/courses") : await courseService.getMyCourses();
      const courseList = user?.role !== "admin"
        ? Array.isArray(res)
          ? res
          : res?.courses || res?.data?.courses || []
        : res?.data?.courses || res?.courses || [];
      setCourses(courseList);
      if (courseList.length > 0) {
        if (paramCourseId && courseList.some((c) => String(c._id || c.id || c.slug) === String(paramCourseId))) {
          const match = courseList.find((c) => String(c._id || c.id || c.slug) === String(paramCourseId));
          setSelectedCourseId(match._id || match.id);
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
      hasVideo: true,
      isVideoMandatory: false,
      hasCoding: false,
      hasMCQ: false,
      videos: [],
      codingProblems: [],
      mcqs: [],
    });
    setActiveTab("videos");
    setEditingVideoIdx(null);
    setEditingCodingIdx(null);
    setEditingMCQIdx(null);
    setVideoForm({ title: "", youtubeUrl: "", duration: "20 mins", description: "" });
    setModalOpen(true);
    setTimeout(() => {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: "instant" });
    }, 50);
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

    const hasVid = mod.hasVideo !== undefined ? Boolean(mod.hasVideo) : initialVideos.length > 0;
    const isVidMandatory = Boolean(mod.isVideoMandatory);
    const hasCod = Boolean(mod.hasCoding || (mod.codingProblems && mod.codingProblems.length > 0));
    const hasM = Boolean(mod.hasMCQ || (mod.mcqs && mod.mcqs.length > 0));

    setFormData({
      title: mod.title || "",
      description: mod.description || "",
      hasVideo: hasVid,
      isVideoMandatory: isVidMandatory,
      hasCoding: hasCod,
      hasMCQ: hasM,
      videos: initialVideos,
      codingProblems: mod.codingProblems ? [...mod.codingProblems] : [],
      mcqs: mod.mcqs ? [...mod.mcqs] : [],
    });

    if (hasVid) setActiveTab("videos");
    else if (hasCod) setActiveTab("coding");
    else if (hasM) setActiveTab("mcq");
    else setActiveTab("videos");

    setEditingVideoIdx(null);
    setEditingCodingIdx(null);
    setEditingMCQIdx(null);
    setVideoForm({ title: "", youtubeUrl: "", duration: "20 mins", description: "" });
    setModalOpen(true);
    setTimeout(() => {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: "instant" });
    }, 50);
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
    const videoData = {
      title: videoForm.title.trim(),
      youtubeUrl: videoForm.youtubeUrl.trim(),
      youtubeVideoId: videoId,
      duration: videoForm.duration.trim() || "20 mins",
      description: videoForm.description.trim(),
    };

    if (editingVideoIdx !== null) {
      setFormData((prev) => {
        const updated = [...prev.videos];
        updated[editingVideoIdx] = {
          ...updated[editingVideoIdx],
          ...videoData,
        };
        return { ...prev, videos: updated };
      });
      setEditingVideoIdx(null);
      showSuccess("Video updated.");
    } else {
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, { ...videoData, order: prev.videos.length + 1 }],
      }));
      showSuccess("Video added to module playlist.");
    }

    setVideoForm({
      title: "",
      youtubeUrl: "",
      duration: "20 mins",
      description: "",
    });
  };

  const handleStartEditVideo = (index) => {
    const v = formData.videos[index];
    setVideoForm({
      title: v.title || "",
      youtubeUrl: v.youtubeUrl || "",
      duration: v.duration || "20 mins",
      description: v.description || "",
    });
    setEditingVideoIdx(index);
  };

  const handleCancelEditVideo = () => {
    setVideoForm({
      title: "",
      youtubeUrl: "",
      duration: "20 mins",
      description: "",
    });
    setEditingVideoIdx(null);
  };

  const handleRemoveVideo = (index) => {
    if (editingVideoIdx === index) {
      handleCancelEditVideo();
    }
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
    const problemData = {
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

    if (editingCodingIdx !== null) {
      setFormData((prev) => {
        const updated = [...prev.codingProblems];
        updated[editingCodingIdx] = {
          ...updated[editingCodingIdx],
          ...problemData,
        };
        return { ...prev, codingProblems: updated };
      });
      setEditingCodingIdx(null);
      showSuccess("Coding problem updated.");
    } else {
      setFormData((prev) => ({
        ...prev,
        codingProblems: [...prev.codingProblems, problemData],
      }));
      showSuccess("Coding problem added.");
    }

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
  };

  const handleStartEditCoding = (index) => {
    const cp = formData.codingProblems[index];
    setCodingForm({
      title: cp.title || "",
      description: cp.description || "",
      difficulty: cp.difficulty || "Medium",
      constraints: cp.constraints || "1 <= N <= 10^5\nTime Limit: 2.0s",
      inputFormat: cp.inputFormat || "First line contains N.",
      outputFormat: cp.outputFormat || "Print output.",
      starterCode: cp.starterCode || "function solution(input) {\n  // Write solution here\n  return input;\n}",
      sampleInput: cp.testCases?.[0]?.input || "",
      sampleOutput: cp.testCases?.[0]?.output || "",
    });
    setEditingCodingIdx(index);
  };

  const handleCancelEditCoding = () => {
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
    setEditingCodingIdx(null);
  };

  const handleRemoveCodingProblem = (index) => {
    if (editingCodingIdx === index) {
      handleCancelEditCoding();
    }
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
    const mcqData = {
      question: mcqForm.question.trim(),
      options,
      correctAnswer: Number(mcqForm.correctAnswer) || 0,
      explanation: mcqForm.explanation.trim(),
      marks: Number(mcqForm.marks) || 1,
    };

    if (editingMCQIdx !== null) {
      setFormData((prev) => {
        const updated = [...prev.mcqs];
        updated[editingMCQIdx] = {
          ...updated[editingMCQIdx],
          ...mcqData,
        };
        return { ...prev, mcqs: updated };
      });
      setEditingMCQIdx(null);
      showSuccess("MCQ question updated.");
    } else {
      setFormData((prev) => ({
        ...prev,
        mcqs: [...prev.mcqs, mcqData],
      }));
      showSuccess("MCQ question added.");
    }

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
  };

  const handleStartEditMCQ = (index) => {
    const q = formData.mcqs[index];
    setMcqForm({
      question: q.question || "",
      optionA: q.options?.[0] || "",
      optionB: q.options?.[1] || "",
      optionC: q.options?.[2] || "",
      optionD: q.options?.[3] || "",
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || "",
      marks: q.marks || 1,
    });
    setEditingMCQIdx(index);
  };

  const handleCancelEditMCQ = () => {
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
    setEditingMCQIdx(null);
  };

  const handleRemoveMCQ = (index) => {
    if (editingMCQIdx === index) {
      handleCancelEditMCQ();
    }
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

    // Auto-commit any unsaved / in-progress Video form if user enabled video
    let currentVideos = [...formData.videos];
    if (formData.hasVideo) {
      if (videoForm.youtubeUrl.trim()) {
        const vUrl = videoForm.youtubeUrl.trim();
        const vTitle = videoForm.title.trim() || `${formData.title.trim() || "Module"} - Lecture Video`;
        const vId = extractYouTubeId(vUrl);
        const autoVideo = {
          title: vTitle,
          youtubeUrl: vUrl,
          youtubeVideoId: vId,
          duration: videoForm.duration.trim() || "20 mins",
          description: videoForm.description.trim(),
        };
        if (editingVideoIdx !== null) {
          currentVideos[editingVideoIdx] = { ...currentVideos[editingVideoIdx], ...autoVideo };
        } else {
          currentVideos.push({ ...autoVideo, order: currentVideos.length + 1 });
        }
      }
    }

    // Auto-commit any unsaved / in-progress MCQ form if user enabled MCQ
    let currentMCQs = [...formData.mcqs];
    if (formData.hasMCQ) {
      if (mcqForm.question.trim()) {
        const autoMcq = {
          question: mcqForm.question.trim(),
          options: [
            mcqForm.optionA.trim() || "Option A",
            mcqForm.optionB.trim() || "Option B",
            mcqForm.optionC.trim() || "Option C",
            mcqForm.optionD.trim() || "Option D",
          ],
          correctAnswer: Number(mcqForm.correctAnswer) || 0,
          explanation: mcqForm.explanation.trim(),
          marks: Number(mcqForm.marks) || 1,
        };
        if (editingMCQIdx !== null) {
          currentMCQs[editingMCQIdx] = { ...currentMCQs[editingMCQIdx], ...autoMcq };
        } else {
          currentMCQs.push(autoMcq);
        }
      }
    }

    // Auto-commit any unsaved / in-progress Coding form if user enabled Coding
    let currentCoding = [...formData.codingProblems];
    if (formData.hasCoding) {
      if (codingForm.title.trim() || codingForm.description.trim()) {
        const autoCoding = {
          title: codingForm.title.trim() || "Coding Challenge",
          description: codingForm.description.trim() || "Solve the problem according to the specifications.",
          difficulty: codingForm.difficulty || "Medium",
          constraints: codingForm.constraints || "1 <= N <= 10^5\nTime Limit: 2.0s",
          inputFormat: codingForm.inputFormat || "Input format",
          outputFormat: codingForm.outputFormat || "Output format",
          starterCode: codingForm.starterCode || "function solution(input) {\n  return input;\n}",
          testCases: [
            {
              input: codingForm.sampleInput || "5\n1 2 3 4 5",
              output: codingForm.sampleOutput || "15",
              isHidden: false,
            },
          ],
        };
        if (editingCodingIdx !== null) {
          currentCoding[editingCodingIdx] = { ...currentCoding[editingCodingIdx], ...autoCoding };
        } else {
          currentCoding.push(autoCoding);
        }
      }
    }

    // 2. Validate enabled content
    if (formData.hasVideo && currentVideos.length === 0) {
      showError("❌ Video is enabled: please enter a YouTube URL or uncheck Video.");
      return;
    }

    if (formData.hasCoding && currentCoding.length === 0) {
      showError("❌ Coding is enabled: please enter problem details or uncheck Coding.");
      return;
    }

    if (formData.hasMCQ && currentMCQs.length === 0) {
      showError("❌ MCQ is enabled: please enter question and options or uncheck MCQ.");
      return;
    }

    const hasAnyContent = Boolean(
      formData.hasVideo || formData.hasCoding || formData.hasMCQ || formData.description.trim()
    );
    if (!hasAnyContent) {
      showError("❌ Please select at least one content option (Video, Coding, or MCQ) or enter a description.");
      return;
    }

    const targetCourseId = selectedCourse?._id || selectedCourse?.id || selectedCourseId;
    if (!targetCourseId) {
      showError("❌ No course selected. Please select a course first.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: targetCourseId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        hasVideo: Boolean(formData.hasVideo),
        isVideoMandatory: Boolean(formData.hasVideo && formData.isVideoMandatory),
        hasCoding: Boolean(formData.hasCoding),
        hasMCQ: Boolean(formData.hasMCQ),
        videos: formData.hasVideo ? currentVideos : [],
        codingProblems: formData.hasCoding ? currentCoding : [],
        mcqs: formData.hasMCQ ? currentMCQs : [],
        videoUrl: formData.hasVideo && currentVideos[0]?.youtubeUrl ? currentVideos[0].youtubeUrl : "",
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
      loadModules(targetCourseId);
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

  const filteredModules = modules.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  });

  const totalVideos = modules.reduce(
    (acc, m) => acc + (m.videos?.length || (m.videoUrl ? 1 : 0)),
    0
  );
  const totalMandatoryVideos = modules.reduce(
    (acc, m) =>
      acc + (m.hasVideo && m.isVideoMandatory ? (m.videos?.length || (m.videoUrl ? 1 : 0)) : 0),
    0
  );
  const totalCoding = modules.reduce(
    (acc, m) => acc + (m.codingProblems?.length || 0),
    0
  );
  const totalMCQs = modules.reduce((acc, m) => acc + (m.mcqs?.length || 0), 0);

  return (
    <div className="space-y-6 pb-16 select-none max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-vcet-blue border border-blue-100 shadow-xs">
              <Layers className="w-5 h-5 text-vcet-blue" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-vcet-blue block">
                CURRICULUM MANAGEMENT • PREPZONE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Students Course Module
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Design curriculum, manage interactive video lessons, coding challenges, and assessment quizzes for students.
          </p>
        </div>

        {/* Course Select & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full sm:w-auto pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-vcet-blue/20 transition-all cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title} {c.isPublished ? "• (Live)" : "• [Draft]"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `${user?.role === "admin" ? "/admin" : "/faculty"}/modules/students?courseId=${selectedCourseId}`
              )
            }
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            title="View enrolled students & per-module status"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Course</span>
            <span>Students</span>
          </button>

          <button
            type="button"
            onClick={() => selectedCourseId && loadModules(selectedCourseId)}
            disabled={loading || !selectedCourseId}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            title="Reload Modules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-vcet-blue" : ""}`} />
          </button>
        </div>
      </div>

      {/* Empty State — when no courses available */}
      {courses.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-vcet-blue flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Courses Assigned Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFacultyOnly
              ? "You will manage modules here once the Head of Department (HOD) assigns a course to you."
              : "No courses are available yet. Create a course first from the course catalog."}
          </p>
        </div>
      )}

      {/* 2. Course Hero & Metrics Command Card */}
      {selectedCourse && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Active Course Info & Status Controls */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Active Course
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-vcet-blue border border-blue-200">
                  {selectedCourse.category || "General"}
                </span>
                {selectedCourse.isPublished ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live in PrepZone
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Draft / Unpublished
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {selectedCourse.title}
              </h2>

              {selectedCourse.assignedFacultyName && (
                <p className="text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-vcet-blue" />
                  <span>Assigned Faculty:</span>
                  <span className="text-vcet-blue font-bold">{selectedCourse.assignedFacultyName}</span>
                </p>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to={`/courses/${selectedCourse.slug || selectedCourse._id || selectedCourse.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-vcet-blue bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
                  title="Open course in PrepZone"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview in PrepZone</span>
                </Link>

                <button
                  type="button"
                  onClick={handleTogglePublish}
                  disabled={publishing || !canPublishCourse}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                    !canPublishCourse
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : selectedCourse.isPublished
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer disabled:opacity-50"
                      : "bg-vcet-blue text-white hover:bg-vcet-blue-deep shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                  }`}
                  title={
                    !canPublishCourse
                      ? `Only the assigned faculty (${selectedCourse.assignedFacultyName || "Assigned Faculty"}) or HOD can publish this course`
                      : selectedCourse.isPublished
                      ? "Unpublish course"
                      : "Publish course to students"
                  }
                >
                  {publishing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : !canPublishCourse ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : selectedCourse.isPublished ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {publishing
                      ? "Updating..."
                      : !canPublishCourse
                      ? "Publish Restricted"
                      : selectedCourse.isPublished
                      ? "Unpublish"
                      : "Publish to PrepZone"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRulesInfo(!showRulesInfo)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showRulesInfo ? "Hide Guidelines" : "Completion Guidelines"}</span>
                </button>
              </div>
            </div>

            {/* Right: Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-[480px]">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Modules
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {modules.length}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">Total Chapters</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-vcet-blue">
                  Videos
                </span>
                <span className="text-xl sm:text-2xl font-black text-vcet-blue-deep mt-1">
                  {totalVideos}
                </span>
                <span className="text-[10px] font-bold text-blue-700 mt-0.5">
                  {totalMandatoryVideos} Mandatory
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                  Coding
                </span>
                <span className="text-xl sm:text-2xl font-black text-purple-900 mt-1">
                  {totalCoding}
                </span>
                <span className="text-[10px] font-bold text-purple-700 mt-0.5">Challenges</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  MCQs
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
                  {totalMCQs}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">Quiz Questions</span>
              </div>
            </div>
          </div>

          {/* Optional Guidelines Drawer */}
          {showRulesInfo && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                    MODULAR CONTENT RULE
                  </span>
                  <p className="text-xs text-blue-950 font-medium">
                    Customize each module with Videos, Coding challenges, and MCQs. Each can be toggled on or off per chapter.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    STUDENT COMPLETION RULE
                  </span>
                  <p className="text-xs text-emerald-950 font-medium">
                    Students must finish mandatory Videos + enabled Coding/MCQ to achieve 100% completion and earn their verified certificate.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Modules Explorer & Content Section */}
      <div className="space-y-4">
        {/* Explorer Sub-Bar: Search & Expand Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules by title or keywords..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-vcet-blue/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">
              Showing <strong className="text-slate-800">{filteredModules.length}</strong> of {modules.length} Modules
            </span>

            {modules.length > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                  title="Expand all modules to view items"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                  title="Collapse all modules"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modules List View */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-vcet-blue" />
            <p className="text-xs font-bold text-slate-600">Loading course curriculum modules...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-vcet-blue flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No Modules Created Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start structuring this course curriculum by clicking "Add Module" to add video lectures, coding exercises, or MCQs.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vcet-blue text-white font-bold text-xs shadow-xs hover:bg-vcet-blue-deep transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create First Module
            </button>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2 shadow-xs">
            <p className="text-xs font-bold text-slate-500">
              No modules match your search filter "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-vcet-blue hover:underline cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredModules.map((mod, index) => {
              const videoCount = mod.videos?.length || (mod.videoUrl ? 1 : 0);
              const codingCount = mod.codingProblems?.length || 0;
              const mcqCount = mod.mcqs?.length || 0;
              const isExpanded = Boolean(expandedModules[mod._id || mod.id]);

              return (
                <div
                  key={mod._id || mod.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-vcet-blue/50 transition-all overflow-hidden"
                >
                  {/* Module Card Header */}
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm shrink-0 border border-slate-200">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {mod.description || "No description provided."}
                        </p>

                        {/* Content Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Video Badge */}
                          {mod.hasVideo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-vcet-blue border border-blue-200/70">
                              <Video className="w-3.5 h-3.5" />
                              <span>{videoCount} Video{videoCount > 1 ? "s" : ""}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                                  mod.isVideoMandatory
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-blue-100/70 text-vcet-blue"
                                }`}
                              >
                                {mod.isVideoMandatory ? "Mandatory" : "Optional"}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                              No Video
                            </span>
                          )}

                          {/* Coding Badge */}
                          {mod.hasCoding ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/70">
                              <Code2 className="w-3.5 h-3.5" />
                              <span>{codingCount} Coding Challenge{codingCount > 1 ? "s" : ""}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                              No Coding
                            </span>
                          )}

                          {/* MCQ Badge */}
                          {mod.hasMCQ ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>{mcqCount} MCQ Question{mcqCount > 1 ? "s" : ""}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200/50">
                              No MCQ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => toggleModuleExpand(mod._id || mod.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isExpanded
                            ? "bg-blue-50 text-vcet-blue border-blue-200"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                        title="Toggle Content Preview"
                      >
                        <span>{isExpanded ? "Hide Preview" : "Preview Content"}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(mod)}
                        className="p-2 rounded-xl text-slate-600 hover:text-vcet-blue hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Module Content"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Content Inspector (Expanded Accordion) */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                      {/* 1. Videos Preview */}
                      {mod.hasVideo && (mod.videos?.length > 0 || mod.videoUrl) && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-vcet-blue flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" />
                            <span>Lecture Video Playlist ({mod.videos?.length || (mod.videoUrl ? 1 : 0)})</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {(mod.videos?.length > 0 ? mod.videos : [{ title: "Lecture Video", youtubeUrl: mod.videoUrl, duration: "30 mins" }]).map((v, vIdx) => (
                              <div
                                key={vIdx}
                                className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between gap-2 shadow-2xs"
                              >
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                    Video {vIdx + 1} • {v.duration || "20 mins"}
                                  </span>
                                  <h6 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                                    {v.title}
                                  </h6>
                                </div>
                                {v.youtubeUrl && (
                                  <a
                                    href={v.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Watch on YouTube</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Coding Problems Preview */}
                      {mod.hasCoding && mod.codingProblems?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Coding Challenges ({mod.codingProblems.length})</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {mod.codingProblems.map((cp, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between gap-2 shadow-2xs"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-bold text-purple-700 uppercase">
                                      Problem {cIdx + 1}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                        cp.difficulty === "Easy"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : cp.difficulty === "Hard"
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {cp.difficulty || "Medium"}
                                    </span>
                                  </div>
                                  <h6 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                                    {cp.title}
                                  </h6>
                                  {cp.description && (
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                      {cp.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. MCQ Questions Preview */}
                      {mod.hasMCQ && mod.mcqs?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>MCQ Assessment Questions ({mod.mcqs.length})</span>
                          </span>
                          <div className="space-y-2">
                            {mod.mcqs.map((q, qIdx) => (
                              <div
                                key={qIdx}
                                className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] font-black text-emerald-700 uppercase">
                                    Q{qIdx + 1}:
                                  </span>
                                  <p className="text-xs font-bold text-slate-900">
                                    {q.question}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] pt-1">
                                  {q.options?.map((opt, oIdx) => (
                                    <span
                                      key={oIdx}
                                      className={`px-2 py-0.5 rounded-lg border text-[10px] ${
                                        oIdx === q.correctAnswer
                                          ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                                          : "bg-slate-50 border-slate-200 text-slate-600"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + oIdx)}. {opt}
                                      {oIdx === q.correctAnswer && " ✓"}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!mod.hasVideo && !mod.hasCoding && !mod.hasMCQ && (
                        <p className="text-xs text-slate-500 italic">
                          No active content items configured. Click "Edit" above to add videos, coding problems, or MCQs.
                        </p>
                      )}
                    </div>
                  )}
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
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-vcet-blue-deep block">
                  {editingModule ? "EDIT MODULE CONTENT" : "CREATE NEW MODULE"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  {editingModule ? `Editing: ${editingModule.title}` : "Students Course Module Builder"}
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
            <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Basic Module Details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Module Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Module 1: Python Data Structures & Algorithms"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-vcet-blue-deep/20 focus:border-vcet-blue-deep"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Module Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe learning goals and topics covered in this module..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-vcet-blue-deep/20"
                  />
                </div>
              </div>

              {/* CONTENT OPTIONS SELECTOR */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vcet-blue-deep" />
                    <span>CONTENT OPTIONS</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Select active content components for this module
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Option 1: VIDEO (WITH MANDATORY / OPTIONAL BUTTON) */}
                  <div
                    onClick={() => {
                      const nextHasVideo = !formData.hasVideo;
                      setFormData({ ...formData, hasVideo: nextHasVideo });
                      if (nextHasVideo) setActiveTab("videos");
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                      formData.hasVideo
                        ? "bg-blue-50/80 border-blue-400"
                        : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.hasVideo}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({ ...formData, hasVideo: checked });
                          if (checked) setActiveTab("videos");
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 text-vcet-blue-deep rounded border-slate-300 cursor-pointer"
                      />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-vcet-blue-deep" />
                          <span className="text-xs font-extrabold text-slate-900">Video</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Lecture videos & playlists.
                        </p>
                      </div>
                    </div>

                    {formData.hasVideo ? (
                      <div
                        className="mt-3 pt-2.5 border-t border-blue-200/80 flex items-center justify-between gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Requirement:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              isVideoMandatory: !prev.isVideoMandatory,
                            }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                            formData.isVideoMandatory
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-300"
                              : "bg-white hover:bg-blue-50 text-blue-800 border border-blue-300"
                          }`}
                          title="Click to toggle whether students must complete the video before assessment"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${formData.isVideoMandatory ? "bg-white animate-pulse" : "bg-blue-600"}`} />
                          {formData.isVideoMandatory ? "Video Mandatory" : "Video Optional"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mt-2">
                        OPTIONAL (DISABLED)
                      </span>
                    )}
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
                {formData.hasVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("videos")}
                    className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                      activeTab === "videos"
                        ? "border-vcet-blue-deep text-vcet-blue-deep"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Module Videos</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-vcet-blue-deep">
                      {formData.videos.length}
                    </span>
                  </button>
                )}

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
                  TAB 1: VIDEO BUILDER (OPTIONAL)
                  --------------------------------------------------------------- */}
              {activeTab === "videos" && formData.hasVideo && (
                <div className="space-y-4">
                  {formData.videos.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <Video className="w-4 h-4 shrink-0 text-vcet-blue-deep" />
                      <span>No videos added yet. Add lecture videos to this module below.</span>
                    </div>
                  )}

                  {/* List of Added Videos */}
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          Added Module Videos ({formData.videos.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              isVideoMandatory: !prev.isVideoMandatory,
                            }));
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            formData.isVideoMandatory
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 ring-2 ring-amber-300"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                          title="Toggle whether students must complete videos to unlock the module test"
                        >
                          <span className={`w-2 h-2 rounded-full ${formData.isVideoMandatory ? "bg-white animate-pulse" : "bg-slate-400"}`} />
                          <span>Video Mandatory: <strong>{formData.isVideoMandatory ? "MANDATORY" : "OPTIONAL"}</strong></span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.videos.map((vid, vIdx) => (
                          <div
                            key={vIdx}
                            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                              editingVideoIdx === vIdx
                                ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <span className="text-[10px] font-bold text-vcet-blue-deep uppercase tracking-wider block">
                                Video {vIdx + 1} • {vid.duration || "20 mins"}
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
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditVideo(vIdx)}
                                className="p-1.5 text-slate-400 hover:text-vcet-blue-deep rounded-lg hover:bg-blue-50 transition-colors"
                                title="Edit Video Details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(vIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete Video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add/Edit Video Form */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      {editingVideoIdx !== null ? (
                        <>
                          <Edit className="w-4 h-4 text-vcet-blue-deep" />
                          <span>Edit Lecture Video #{editingVideoIdx + 1}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-vcet-blue-deep" />
                          <span>Add Lecture Video to Playlist</span>
                        </>
                      )}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="px-4 py-2 bg-vcet-blue-deep hover:bg-[#084282] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {editingVideoIdx !== null ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingVideoIdx !== null ? "Update Video" : "+ Add Video"}</span>
                      </button>
                      {editingVideoIdx !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditVideo}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
                            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                              editingCodingIdx === cIdx
                                ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
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
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditCoding(cIdx)}
                                className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                                title="Edit Coding Problem"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCodingProblem(cIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete Coding Problem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add/Edit Coding Problem Form */}
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
                    <h5 className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      {editingCodingIdx !== null ? (
                        <>
                          <Edit className="w-4 h-4 text-purple-700" />
                          <span>Edit Coding Challenge #{editingCodingIdx + 1}</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="w-4 h-4 text-purple-700" />
                          <span>Add Coding Challenge</span>
                        </>
                      )}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddCodingProblem}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {editingCodingIdx !== null ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingCodingIdx !== null ? "Update Challenge" : "+ Add Coding Problem"}</span>
                      </button>
                      {editingCodingIdx !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditCoding}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              editingMCQIdx === qIdx
                                ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
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
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditMCQ(qIdx)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Edit Question"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMCQ(qIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Add/Edit MCQ Form */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                    <h5 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      {editingMCQIdx !== null ? (
                        <>
                          <Edit className="w-4 h-4 text-emerald-700" />
                          <span>Edit MCQ Question #{editingMCQIdx + 1}</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-4 h-4 text-emerald-700" />
                          <span>Add Multiple Choice Question</span>
                        </>
                      )}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddMCQ}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {editingMCQIdx !== null ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{editingMCQIdx !== null ? "Update Question" : "+ Add MCQ Question"}</span>
                      </button>
                      {editingMCQIdx !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditMCQ}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls (Pinned Cleanly at the Bottom) */}
            <div className="p-4 sm:px-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                {formData.hasVideo && (
                  <span className="inline-flex items-center gap-1 text-vcet-blue-deep">
                    <Video className="w-3.5 h-3.5" />
                    {formData.videos.length} Video{formData.videos.length === 1 ? "" : "s"} ({formData.isVideoMandatory ? "Mandatory" : "Optional"})
                  </span>
                )}
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
                  className="px-6 py-2.5 rounded-xl bg-vcet-blue-deep hover:bg-[#084282] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
