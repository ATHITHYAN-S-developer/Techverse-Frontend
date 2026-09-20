import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
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
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { courseService, getCourseImageUrl } from "../../services/courseService";

export default function AdminCoursesPage() {
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const isFaculty = location.pathname.startsWith("/faculty");
  const moduleManagerBaseUrl = isFaculty ? "/faculty/modules" : "/admin/modules";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    level: "Beginner to Intermediate",
    duration: "30 Days",
    passingPercentage: 50,
    instructor: "Dr. K. Sathish Kumar (CSE)",
    thumbnailUrl: "",
    description: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.debug("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Please select a valid image file (PNG, JPG, WebP)");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      title: "",
      category: "Programming",
      level: "Beginner to Intermediate",
      duration: "30 Days",
      passingPercentage: 50,
      instructor: "Dr. K. Sathish Kumar (CSE)",
      thumbnailUrl: "",
      description: "",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setImageFile(null);
    setImagePreview(getCourseImageUrl(course.thumbnailUrl, course.thumbnail));
    setFormData({
      title: course.title || "",
      category: course.category || "Programming",
      level: course.level || "Beginner to Intermediate",
      duration: course.duration || "30 Days",
      passingPercentage: course.passingPercentage || course.passingScore || 50,
      instructor: course.instructor || course.instructorName || "Faculty Coordinator",
      thumbnailUrl: course.thumbnailUrl || "",
      description: course.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showError("Please provide both title and description");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("level", formData.level);
      form.append("duration", formData.duration);
      form.append("passingScore", String(formData.passingPercentage));
      form.append("passingPercentage", String(formData.passingPercentage));
      form.append("instructor", formData.instructor);
      form.append("certificateEnabled", "true");

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
        showSuccess("Course with cover image published to MongoDB database ✓");
      }
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      showError(err.message || "Failed to save course");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course and all associated modules from MongoDB?")) return;
    try {
      await courseService.deleteCourse(id);
      showSuccess("Course removed from MongoDB database ✓");
      loadCourses();
    } catch (err) {
      showError("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#0062A8]">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Technical Course Catalog Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure courses with real cover uploads, passing benchmarks, and syllabus modules stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCourses}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Courses from DB"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Loading courses from MongoDB...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Courses in Database</h3>
          <p className="text-xs text-slate-500">Create your first course with custom thumbnail and syllabus modules.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#0062A8] text-white font-bold text-xs rounded-xl shadow hover:bg-[#00528c] cursor-pointer"
          >
            Create First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const courseId = course.slug || course.id || course._id;
            const courseUrl = `/courses/${courseId}`;
            const coverImage = getCourseImageUrl(course.thumbnailUrl, course.thumbnail);
            const totalMods = course.totalModules || course.modulesCount || course.modules?.length || 0;

            return (
              <div
                key={course._id || course.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Course Cover Image - Clickable */}
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
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono bg-slate-900/60 backdrop-blur-sm text-white rounded-md">
                    {course.duration || "30 Days"}
                  </span>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 text-[10px] font-bold bg-white/90 backdrop-blur-sm text-slate-800 rounded-lg">
                    {totalMods} Modules Configured
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
                      Pass: <strong className="text-emerald-600">{course.passingPercentage || course.passingScore || 50}%</strong>
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600 font-medium truncate max-w-[120px]">
                    By {course.instructor || course.instructorName || "Faculty"}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`${moduleManagerBaseUrl}?courseId=${course._id || course.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0062A8] hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all"
                      title="Manage Modules & Curriculum"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Modules</span>
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 transition-colors"
                      title="Edit Course Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(course._id || course.id)}
                      className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors"
                      title="Delete Course from MongoDB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Modal with Image Upload */}
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
              {editingCourse ? "Edit Technical Course" : "Create Technical Course in MongoDB"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Cover Image Upload Area */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Course Cover Image (Stored in DB / Uploads)
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-[#0062A8] text-slate-700 hover:text-[#0062A8] rounded-xl font-bold shadow-xs transition-all text-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0062A8]" />
                      <span>{imageFile ? "Change Image" : "Upload Cover Image"}</span>
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WebP up to 10MB. Stored directly on backend disk & referenced in MongoDB.
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Course Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30 Days"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.passingPercentage}
                    onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructor Name & Department</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Dr. K. Sathish Kumar (CSE)"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-[#0062A8] hover:bg-[#00528c] text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <span>{editingCourse ? "Update Course in DB" : "Publish Course to DB"}</span>
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
