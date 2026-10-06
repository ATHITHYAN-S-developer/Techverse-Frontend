import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  CheckCircle2,
  Ban,
  Star,
  X,
  Award,
  Upload,
  Image as ImageIcon,
  Clock,
  User,
  RefreshCw,
  Eye,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Check,
  EyeOff,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { courseService, getCourseImageUrl } from "../../services/courseService";
import { departmentService } from "../../services/departmentService";

/**
 * Client-side canvas image compression to WebP/JPEG before upload.
 * Reduces 5MB-10MB cover images to ~100KB without visible quality loss.
 */
async function compressImage(file, { maxWidth = 1280, maxHeight = 720, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], fileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function AdminCoursesPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const staffId = String(user?.staffId || user?.facultyId || "").toUpperCase();
  const isHod =
    user?.role === "hod" ||
    staffId.includes("104") ||
    staffId.includes("HOD") ||
    (user?.designation && (user.designation.includes("HOD") || user.designation.includes("Head of the Department")));

  const canCreateCourse = user?.role === "admin" || isHod;
  const isFacultyOnly = !canCreateCourse;
  const isFaculty = isFacultyOnly;
  const moduleManagerBaseUrl = user?.role === "admin" ? "/admin/modules" : "/faculty/modules";

  const deptCode =
    user?.departmentId?.code ||
    user?.departmentCode ||
    (staffId.includes("CSE") ? "CSE" : staffId.includes("AIDS") ? "AI&DS" : staffId.includes("IT") ? "IT" : "CSE");

  const deptName =
    user?.departmentId?.name ||
    user?.departmentName ||
    (deptCode === "CSE" ? "Computer Science & Engineering" : null) ||
    deptCode;

  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Cover image & compression state
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);

  // Faculty searchable dropdown state
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [facultyDropdownOpen, setFacultyDropdownOpen] = useState(false);
  const facultyDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    level: "Beginner to Intermediate",
    passingPercentage: 50,
    instructor: "",
    assignedFacultyId: "",
    assignedFacultyName: "",
    thumbnailUrl: "",
    description: "",
    targetAudience: "department", // "department" | "all"
    isDepartmentOnly: true,
  });

  // Close faculty dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (facultyDropdownRef.current && !facultyDropdownRef.current.contains(event.target)) {
        setFacultyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadCourses();
    if (canCreateCourse) {
      loadFacultyList();
    }
  }, [canCreateCourse]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = user?.role === "admin"
        ? await courseService.getAllCourses()
        : await courseService.getMyCourses();
      setCourses(data);
    } catch (err) {
      console.debug("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyList = async () => {
    try {
      if (isHod && user?.role !== "admin") {
        const res = await api.get("/courses/department-faculty");
        const list = res?.faculty || res?.data?.faculty || [];
        setFacultyList(Array.isArray(list) ? list : []);
      } else {
        const res = await api.get("/admin/users?role=faculty&limit=100");
        const users = res?.users || res?.data?.users || [];
        setFacultyList(Array.isArray(users) ? users : []);
      }
    } catch (err) {
      console.debug("Error loading faculty list:", err);
    }
  };

  // Live faculty search filter (by Name or Staff ID or email)
  const searchedFacultyList = facultyList.filter((fac) => {
    if (!facultySearchQuery.trim()) return true;
    const q = facultySearchQuery.toLowerCase().trim();
    const name = (fac.name || "").toLowerCase();
    const staffId = (fac.staffId || "").toLowerCase();
    const email = (fac.email || "").toLowerCase();
    const desig = (fac.designation || "").toLowerCase();
    return name.includes(q) || staffId.includes(q) || email.includes(q) || desig.includes(q);
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Please select a valid image file (PNG, JPG, WebP)");
        return;
      }
      try {
        const origKB = Math.round(file.size / 1024);
        const compressed = await compressImage(file, { maxWidth: 1280, maxHeight: 720, quality: 0.82 });
        const compKB = Math.round(compressed.size / 1024);
        setImageFile(compressed);
        setImagePreview(URL.createObjectURL(compressed));
        setCompressionInfo({
          originalKB: origKB,
          compressedKB: compKB,
          ratio: Math.max(0, Math.round(((origKB - compKB) / (origKB || 1)) * 100)),
        });
      } catch {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setImageFile(null);
    setImagePreview(null);
    setCompressionInfo(null);
    setSelectedFaculty(null);
    setFacultySearchQuery("");
    setFacultyDropdownOpen(false);
    setFormData({
      title: "",
      category: "Programming",
      level: "Beginner to Intermediate",
      passingPercentage: 50,
      instructor: isFaculty ? (user?.name || "Faculty") : "",
      assignedFacultyId: "",
      assignedFacultyName: "",
      thumbnailUrl: "",
      description: "",
      targetAudience: "department",
      isDepartmentOnly: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setImageFile(null);
    setCompressionInfo(null);
    setImagePreview(getCourseImageUrl(course.thumbnailUrl, course.thumbnail));
    const facId = course.assignedFacultyId?._id || course.assignedFacultyId || "";
    const matchedFaculty = facultyList.find((f) => String(f._id || f.id) === String(facId));
    setSelectedFaculty(matchedFaculty || (facId ? { _id: facId, name: course.assignedFacultyName } : null));
    setFacultySearchQuery("");
    setFacultyDropdownOpen(false);
    setFormData({
      title: course.title || "",
      category: course.category || "Programming",
      level: course.level || "Beginner to Intermediate",
      passingPercentage: course.passingPercentage || course.passingScore || 50,
      instructor: course.instructor || course.instructorName || "Faculty Coordinator",
      assignedFacultyId: facId,
      assignedFacultyName: course.assignedFacultyName || matchedFaculty?.name || "",
      thumbnailUrl: course.thumbnailUrl || "",
      description: course.description || "",
      targetAudience: course.targetAudience || (course.isDepartmentOnly ? "department" : "all"),
      isDepartmentOnly: course.isDepartmentOnly ?? (course.targetAudience === "department"),
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showError("Please provide both title and description");
      return;
    }

    if (!isFaculty && !editingCourse && !formData.assignedFacultyId) {
      showError("Faculty assignment is compulsory. Please select a faculty member.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("level", formData.level);
      form.append("duration", "Self-Paced");
      form.append("passingScore", String(formData.passingPercentage));
      form.append("passingPercentage", String(formData.passingPercentage));
      form.append("targetAudience", formData.targetAudience || "department");
      form.append("isDepartmentOnly", String(formData.isDepartmentOnly ?? true));
      form.append("instructor", formData.instructor || formData.assignedFacultyName || "VCET Faculty");
      form.append("certificateEnabled", "true");

      if (!isFaculty && formData.assignedFacultyId) {
        form.append("assignedFacultyId", formData.assignedFacultyId);
        if (formData.assignedFacultyName) {
          form.append("assignedFacultyName", formData.assignedFacultyName);
        }
      }

      if (imageFile) {
        form.append("thumbnail", imageFile);
      } else if (formData.thumbnailUrl) {
        form.append("thumbnailUrl", formData.thumbnailUrl);
      }

      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id || editingCourse.id, form);
        showSuccess(`Course "${formData.title}" updated successfully!`);
      } else {
        await courseService.createCourse(form);
        showSuccess("Course created as Draft! Assigned faculty can now add modules and publish when ready.");
      }
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      showError(err.message || "Failed to save course");
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublish = async (course) => {
    const courseId = course._id || course.id;
    setTogglingId(courseId);
    try {
      const newStatus = !course.isPublished;
      await courseService.togglePublishStatus(courseId, newStatus);
      showSuccess(
        newStatus
          ? `🎉 "${course.title}" published! Visible to students in PrepZone.`
          : `"${course.title}" unpublished and moved back to Draft.`
      );
      setCourses((prev) =>
        prev.map((c) => ((c._id || c.id) === courseId ? { ...c, isPublished: newStatus } : c))
      );
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "Failed to update publication status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this course and all associated modules?")) return;
    try {
      await courseService.deleteCourse(id);
      showSuccess("Course removed successfully ✓");
      setCourses((prev) => prev.filter((c) => String(c._id || c.id) !== String(id)));
    } catch (err) {
      showError(err?.response?.data?.message || err.message || "Failed to delete course");
    }
  };

  const visibleCourses = unassignedOnly
    ? courses.filter((c) => !c.assignedFacultyId)
    : courses;

  const unassignedCount = courses.filter((c) => !c.assignedFacultyId).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#0062A8]" />
              {isFacultyOnly
                ? "My Assigned Courses & Modules"
                : isHod
                ? `Department Courses — ${deptCode}`
                : "Course Catalog Management"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isFacultyOnly
              ? "Add and manage syllabus modules, video lectures, and assessments for courses assigned to you by the HOD."
              : isHod
              ? `Create courses for ${deptName || deptCode} students or all VCETians, and assign faculty to manage modules.`
              : "Manage courses, passing benchmarks, faculty assignment, and syllabus modules."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCourses}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Courses"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {canCreateCourse && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          )}
        </div>
      </div>

      {canCreateCourse && courses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Filter:
          </span>
          <button
            onClick={() => setUnassignedOnly(false)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
              !unassignedOnly
                ? "bg-[#0062A8] text-white border-[#0062A8]"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            All ({courses.length})
          </button>
          <button
            onClick={() => setUnassignedOnly(true)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
              unassignedOnly
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-amber-600 border-amber-200 hover:border-amber-400"
            }`}
          >
            Unassigned ({unassignedCount})
          </button>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {isFacultyOnly ? "No Courses Assigned to You Yet" : "No Courses Created Yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFacultyOnly
              ? "You will see courses here once the Head of Department (HOD) assigns a course to you."
              : "Click Create Course to add a new course, set passing benchmark, and assign a faculty member to manage modules."}
          </p>
          {canCreateCourse && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-[#0062A8] text-white font-bold text-xs rounded-xl shadow hover:bg-[#00528c] cursor-pointer"
            >
              Create Course
            </button>
          )}
        </div>
      ) : visibleCourses.length === 0 && unassignedOnly ? (
        <div className="bg-white border border-amber-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">All courses have assigned faculty</h3>
          <p className="text-xs text-slate-500">
            Every course has an assigned faculty coordinator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCourses.map((course) => {
            const courseId = course.slug || course.id || course._id;
            const courseUrl = `/courses/${courseId}`;
            const coverImage = getCourseImageUrl(course.thumbnailUrl, course.thumbnail);
            const totalMods = course.totalModules || course.modulesCount || course.modules?.length || 0;
            const isDeptOnly = course.targetAudience === "department" || course.isDepartmentOnly;

            return (
              <div
                key={course._id || course.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Course Cover Image */}
                <Link to={courseUrl} className="aspect-video w-full overflow-hidden bg-slate-100 relative block group">
                  <img
                    src={coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold bg-[#0062A8] text-white rounded-full shadow-sm">
                    {course.category}
                  </span>

                  {/* Audience Badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md flex items-center gap-1 text-white ${
                      isDeptOnly ? "bg-amber-600/80" : "bg-emerald-600/80"
                    }`}
                  >
                    {isDeptOnly ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Only {deptCode}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>All VCETians</span>
                      </>
                    )}
                  </span>

                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 text-[10px] font-bold bg-white/90 backdrop-blur-sm text-slate-800 rounded-lg">
                    {totalMods} Modules Configured
                  </span>

                  {/* Publish Status Badge */}
                  <span
                    className={`absolute bottom-3 right-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md flex items-center gap-1.5 text-white shadow-sm ${
                      course.isPublished ? "bg-emerald-600/90" : "bg-amber-600/90"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        course.isPublished ? "bg-white animate-pulse" : "bg-white"
                      }`}
                    />
                    <span>{course.isPublished ? "Live in PrepZone" : "Draft"}</span>
                  </span>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link to={courseUrl} className="block">
                      <h3 className="text-base font-bold text-slate-900 hover:text-[#0062A8] transition-colors leading-snug">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-600">
                      Level: <strong className="text-slate-900">{course.level}</strong>
                    </span>
                    <span className="text-slate-600">
                      Pass Benchmark: <strong className="text-emerald-600">{course.passingPercentage || course.passingScore || 50}%</strong>
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[11px] text-slate-600 font-medium truncate">
                      By {course.instructor || course.instructorName || "Faculty"}
                    </span>
                    {course.assignedFacultyName ? (
                      <span
                        className="text-[10px] text-[#0062A8] font-semibold truncate flex items-center gap-1 mt-0.5"
                        title={`Assigned to ${course.assignedFacultyName}`}
                      >
                        <User className="w-3 h-3 shrink-0" />
                        <span>Assigned: {course.assignedFacultyName}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold truncate mt-0.5">
                        ⚠️ Faculty not assigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Publish/Unpublish Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(course)}
                      disabled={togglingId === (course._id || course.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        course.isPublished
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                      }`}
                      title={course.isPublished ? "Unpublish course so students cannot see it" : "Publish course to PrepZone"}
                    >
                      {togglingId === (course._id || course.id) ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : course.isPublished ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      <span>{course.isPublished ? "Unpublish" : "Publish"}</span>
                    </button>

                    <Link
                      to={`${moduleManagerBaseUrl}?courseId=${course._id || course.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0062A8] hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all"
                      title="Manage Modules & Curriculum"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Modules</span>
                    </Link>

                    {canCreateCourse && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
                          title="Edit Course Details & Reassign Faculty"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(course._id || course.id)}
                          className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0062A8]" />
              {editingCourse ? "Edit Course" : "Create a Course"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Cover Image Upload Area with Compression */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Course Cover Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {/* Image Preview Box */}
                  <div className="w-full sm:w-36 h-24 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-[#0062A8] text-slate-700 hover:text-[#0062A8] rounded-xl font-bold shadow-xs transition-all text-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#0062A8]" />
                        <span>{imageFile ? "Change Image" : "Upload Cover Image"}</span>
                      </button>

                      {compressionInfo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>Compressed: {compressionInfo.originalKB}KB → {compressionInfo.compressedKB}KB (-{compressionInfo.ratio}%)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Images are automatically compressed & optimized to high-efficiency WebP before saving.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Programming Masterclass"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive walkthrough of modern concepts, problem solving, and real-world projects..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity & Networks">Cybersecurity & Networks</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Passing Score Benchmark */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Passing Score Benchmark (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passingPercentage}
                    onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Students must score at least {formData.passingPercentage}% in each module assessment to pass and unlock the next module.
                </p>
              </div>

              {/* Course Audience Selector (Only for CSE Students vs Open to VCETians) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Course Target Audience *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, targetAudience: "department", isDepartmentOnly: true }))
                    }
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.targetAudience === "department"
                        ? "bg-[#0062A8] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 bg-transparent"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Only for {deptCode || "CSE"} Students</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, targetAudience: "all", isDepartmentOnly: false }))
                    }
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.targetAudience === "all"
                        ? "bg-[#0062A8] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 bg-transparent"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Open to VCETians</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formData.targetAudience === "department"
                    ? `Restricted exclusively to enrolled students in ${deptName || deptCode}.`
                    : "Available to all Velalar College of Engineering and Technology students across all departments."}
                </p>
              </div>

              {/* Searchable Faculty Selector */}
              {canCreateCourse ? (
                <div ref={facultyDropdownRef} className="space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">
                      Assign Faculty Coordinator * <span className="text-[10px] text-amber-600 font-medium">(Adds & manages modules)</span>
                    </label>
                    {facultyList.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {facultyList.length} faculty in {deptCode}
                      </span>
                    )}
                  </div>

                  {selectedFaculty ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 border border-sky-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0062A8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {selectedFaculty.name?.charAt(0) || "F"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                            <span>{selectedFaculty.name}</span>
                            {selectedFaculty.staffId && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[#0062A8] font-mono text-[10px] font-bold">
                                {selectedFaculty.staffId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {selectedFaculty.designation || "Assistant Professor"} • {selectedFaculty.departmentName || deptCode}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFaculty(null);
                          setFormData((prev) => ({
                            ...prev,
                            assignedFacultyId: "",
                            assignedFacultyName: "",
                          }));
                          setFacultySearchQuery("");
                          setFacultyDropdownOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer border border-slate-200"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={facultySearchQuery}
                          onChange={(e) => {
                            setFacultySearchQuery(e.target.value);
                            setFacultyDropdownOpen(true);
                          }}
                          onFocus={() => setFacultyDropdownOpen(true)}
                          placeholder="Search faculty by name or Staff ID (e.g. Senthamarai or 105)..."
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>

                      {facultyDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                          {searchedFacultyList.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No faculty found matching &ldquo;<span className="font-semibold text-slate-600">{facultySearchQuery}</span>&rdquo;.
                              <div className="text-[10px] text-slate-400 mt-1">Try searching by name or Staff ID.</div>
                            </div>
                          ) : (
                            searchedFacultyList.map((fac) => (
                              <button
                                key={fac._id || fac.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFaculty(fac);
                                  setFormData((prev) => ({
                                    ...prev,
                                    assignedFacultyId: fac._id || fac.id,
                                    assignedFacultyName: fac.name,
                                    instructor: `${fac.name}${fac.staffId ? ` (${fac.staffId})` : ""}`,
                                  }));
                                  setFacultyDropdownOpen(false);
                                  setFacultySearchQuery("");
                                }}
                                className="w-full p-2.5 text-left hover:bg-sky-50/70 rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0062A8]/10 text-slate-700 group-hover:text-[#0062A8] flex items-center justify-center font-bold text-xs shrink-0">
                                    {fac.name?.charAt(0) || "F"}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-900 truncate">
                                      {fac.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {fac.designation || "Assistant Professor"} • {fac.departmentName || fac.departmentCode || deptCode}
                                    </div>
                                  </div>
                                </div>
                                {fac.staffId && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-sky-100 text-slate-600 group-hover:text-[#0062A8] font-mono text-[10px] font-bold shrink-0">
                                    {fac.staffId}
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                editingCourse && formData.assignedFacultyName && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Course Ownership:</span>
                    <span className="font-bold text-[#0062A8] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Assigned to {formData.assignedFacultyName}
                    </span>
                  </div>
                )
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || (!isFaculty && !editingCourse && !formData.assignedFacultyId)}
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  title={!isFaculty && !editingCourse && !formData.assignedFacultyId ? "Please assign a faculty member first" : ""}
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCourse ? "Update Course" : "Publish Course"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
