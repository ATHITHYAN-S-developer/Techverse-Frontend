/**
 * Admin Page: Tech Pulse Manager
 * Publishes link cards across four kinds — youtube | website | app | roadmap —
 * that the public /updates page and the home badge read from /api/tech-pulse.
 *
 * The content type is chosen with a segmented control; the fields below it swap
 * per kind, and a roadmap is edited with an ordered step builder (order = array
 * index, so reordering rewrites the array).
 */

import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  X,
  Upload,
  Star,
  Youtube,
  Globe,
  Smartphone,
  Map,
  ArrowUp,
  ArrowDown,
  GripVertical,
  AlertCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import { techPulseService, resolveTechPulseLogo } from "../../services/techPulseService";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  TECH_PULSE_KINDS,
  KIND_LABELS,
  APP_PLATFORMS,
  ROADMAP_LEVELS,
  RESOURCE_TYPES,
  ROADMAP_MAX_STEPS,
  LIMITS,
  validateTechPulsePayload,
  parseYouTubeId,
  youtubeThumb,
  faviconUrl,
  hostFromUrl,
} from "../../utils/techPulse";

const CATEGORIES = [
  "Technology News",
  "Developer Tools",
  "AI & Machine Learning",
  "Open Source",
  "Startup & Product",
  "General",
];

const KIND_ICONS = {
  youtube: Youtube,
  website: Globe,
  app: Smartphone,
  roadmap: Map,
};

const emptyStep = () => ({ title: "", url: "", description: "", resourceType: "Article" });

const EMPTY_FORM = {
  kind: "website",
  title: "",
  url: "",
  description: "",
  category: "Technology News",
  platform: "",
  tags: "",
  logo: null,
  removeLogo: false,
  featured: false,
  isPublished: true,
  // youtube
  videoUrl: "",
  channelName: "",
  duration: "",
  // website
  sourceName: "",
  // app
  appName: "",
  playStoreUrl: "",
  appStoreUrl: "",
  webUrl: "",
  // roadmap
  level: "Beginner",
  durationText: "",
  steps: [emptyStep()],
};

const formFromPost = (post) => ({
  kind: post.kind || "website",
  title: post.title || "",
  url: post.url || "",
  description: post.description || "",
  category: post.category || "Technology News",
  platform: post.platform || "",
  tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
  logo: null,
  removeLogo: false,
  featured: Boolean(post.featured),
  isPublished: post.isPublished !== false,
  videoUrl: post.videoUrl || post.url || "",
  channelName: post.channelName || "",
  duration: post.duration || "",
  sourceName: post.sourceName || "",
  appName: post.appName || "",
  playStoreUrl: post.playStoreUrl || "",
  appStoreUrl: post.appStoreUrl || "",
  webUrl: post.webUrl || "",
  level: post.level || "Beginner",
  durationText: post.durationText || "",
  steps:
    Array.isArray(post.steps) && post.steps.length
      ? post.steps.map((step) => ({ ...step }))
      : [emptyStep()],
});

const inputClass =
  "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-vcet-blue focus:ring-2 focus:ring-vcet-blue/15";

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="font-bold text-slate-700 block mb-1">
      {children}
      {required && <span className="text-rose-500"> *</span>}
    </label>
  );
}

export default function AdminTechPulsePage() {
  const { showSuccess, showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [dirty, setDirty] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [kindDialog, setKindDialog] = useState({ open: false, nextKind: null });
  const modalRef = useRef(null);

  // 300ms-equivalent debounce without another dependency.
  const deferredSearch = useDeferredValue(searchTerm);

  const loadAll = async () => {
    try {
      const list = await techPulseService.getAllAdmin();
      setPosts(list);
    } catch {
      showError("Failed to load Tech Pulse posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes the editor (after the dirty check), and focus starts inside.
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => modalRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, dirty]);

  const resetDialogs = () => {
    setFieldErrors({});
    setSubmitted(false);
    setTouched({});
    setDirty(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    resetDialogs();
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setFormData(formFromPost(post));
    resetDialogs();
    setModalOpen(true);
  };

  /** Safe close: an edited form asks before discarding. */
  const requestClose = () => {
    if (dirty) {
      setCloseDialog(true);
      return;
    }
    setModalOpen(false);
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const blurField = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  /** Where the live validator looks for a given error key's value. */
  const valueFor = (key) => {
    if (key === "steps") return "";
    if (key.startsWith("steps.")) {
      const [, index, field] = key.split(".");
      return formData.steps[Number(index)]?.[field];
    }
    return formData[key];
  };

  /**
   * An error shows once its field has been touched or the form was submitted.
   * Before that, only surface errors for a value the admin actually typed —
   * so a fresh modal does not greet you with "Title is required".
   */
  const visibleError = (key) => {
    if (submitted || touched[key]) return fieldErrors[key] || liveErrors[key];
    const value = valueFor(key);
    return String(value ?? "").trim() ? liveErrors[key] : undefined;
  };

  // Live client-side validation keeps the inline errors in step with what the
  // API would reject (same rules, same messages).
  const { errors: liveErrors } = useMemo(
    () => validateTechPulsePayload({ ...formData, steps: formData.steps }),
    [formData]
  );

  const previewVideoId = parseYouTubeId(formData.videoUrl);
  const faviconSource =
    faviconUrl(formData.webUrl) ||
    faviconUrl(formData.playStoreUrl) ||
    faviconUrl(formData.appStoreUrl) ||
    faviconUrl(formData.url);

  const logoPreview = formData.logo
    ? URL.createObjectURL(formData.logo)
    : editing?.logoUrl && !formData.removeLogo
      ? resolveTechPulseLogo(editing.logoUrl)
      : "";

  const changeKind = (nextKind) => {
    if (nextKind === formData.kind) return;
    if (editing) {
      // Switching kind on an existing post drops the other kind's fields, so
      // it always asks first.
      setKindDialog({ open: true, nextKind });
      return;
    }
    applyKind(nextKind);
  };

  const applyKind = (nextKind) => {
    setFormData((prev) => ({
      ...prev,
      kind: nextKind,
      // A platform string only means something for apps.
      platform: nextKind === "app" && !APP_PLATFORMS.includes(prev.platform) ? "" : prev.platform,
      steps: nextKind === "roadmap" && prev.steps.length ? prev.steps : [emptyStep()],
    }));
    setDirty(true);
  };

  const updateStep = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, idx) => (idx === index ? { ...step, [key]: value } : step)),
    }));
    setDirty(true);
  };

  const addStep = () => {
    setFormData((prev) =>
      prev.steps.length >= ROADMAP_MAX_STEPS ? prev : { ...prev, steps: [...prev.steps, emptyStep()] }
    );
    setDirty(true);
  };

  const removeStep = (index) => {
    setFormData((prev) => {
      const steps = prev.steps.filter((_, idx) => idx !== index);
      return { ...prev, steps: steps.length ? steps : [emptyStep()] };
    });
    setDirty(true);
  };

  const moveStep = (index, direction) => {
    setFormData((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.steps.length) return prev;
      const steps = [...prev.steps];
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...prev, steps };
    });
    setDirty(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const { errors } = validateTechPulsePayload(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showError(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      if (editing) {
        await techPulseService.update(editing.id || editing._id, formData);
      } else {
        await techPulseService.create(formData);
      }
      setModalOpen(false);
      setDirty(false);
      showSuccess(editing ? "Post updated" : "Post published");
      loadAll();
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      showError(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;
    try {
      await techPulseService.remove(id);
      showSuccess("Post removed");
      setDeleteDialog({ open: false, id: null });
      loadAll();
    } catch (err) {
      showError(err.message || "Failed to delete post");
    }
  };

  const openLink = (post) => {
    const target = post.url || post.webUrl || post.playStoreUrl || post.appStoreUrl;
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  };

  const q = (deferredSearch || "").toLowerCase().trim();
  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.description,
        post.category,
        post.platform,
        (post.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "published" && post.isPublished !== false) ||
        (statusFilter === "draft" && post.isPublished === false);
      const matchesKind = !kindFilter || (post.kind || "website") === kindFilter;
      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [posts, q, statusFilter, kindFilter]);

  const publishedCount = posts.filter((p) => p.isPublished !== false).length;
  const activeKind = formData.kind;

  const kindFields = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKind}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="space-y-3"
      >
        {activeKind === "youtube" && (
          <>
            <div>
              <FieldLabel required>YouTube link</FieldLabel>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                onBlur={() => blurField("videoUrl")}
                placeholder="https://youtu.be/... or youtube.com/watch?v=..."
                className={`${inputClass} font-mono text-[11px]`}
              />
              <FieldError message={visibleError("videoUrl")} />
              {previewVideoId && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={youtubeThumb(previewVideoId)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-20 w-36 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="text-[11px] text-slate-500">
                    <p className="font-bold text-slate-700">Video found</p>
                    <p className="font-mono">id: {previewVideoId}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Channel name</FieldLabel>
                <input
                  type="text"
                  value={formData.channelName}
                  maxLength={LIMITS.channelName}
                  onChange={(e) => updateField("channelName", e.target.value)}
                  placeholder="e.g. Fireship"
                  className={inputClass}
                />
                <FieldError message={visibleError("channelName")} />
              </div>
              <div>
                <FieldLabel>Duration</FieldLabel>
                <input
                  type="text"
                  value={formData.duration}
                  maxLength={LIMITS.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="e.g. 10:32"
                  className={inputClass}
                />
                <FieldError message={visibleError("duration")} />
              </div>
            </div>
          </>
        )}

        {activeKind === "website" && (
          <>
            <div>
              <FieldLabel required>Website link</FieldLabel>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => updateField("url", e.target.value)}
                onBlur={() => blurField("url")}
                placeholder="https://techcrunch.com"
                className={`${inputClass} font-mono text-[11px]`}
              />
              <FieldError message={visibleError("url")} />
              {faviconUrl(formData.url) && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img
                    src={faviconUrl(formData.url)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
                  />
                  <span className="text-[11px] text-slate-500">
                    {hostFromUrl(formData.url)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <FieldLabel>Source name</FieldLabel>
              <input
                type="text"
                value={formData.sourceName}
                maxLength={LIMITS.sourceName}
                onChange={(e) => updateField("sourceName", e.target.value)}
                placeholder="e.g. TechCrunch"
                className={inputClass}
              />
              <FieldError message={visibleError("sourceName")} />
            </div>
          </>
        )}

        {activeKind === "app" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>App name</FieldLabel>
                <input
                  type="text"
                  value={formData.appName}
                  maxLength={LIMITS.appName}
                  onChange={(e) => updateField("appName", e.target.value)}
                  placeholder="e.g. Spotify"
                  className={inputClass}
                />
                <FieldError message={visibleError("appName")} />
              </div>
              <div>
                <FieldLabel required>Platform</FieldLabel>
                <select
                  value={formData.platform}
                  onChange={(e) => updateField("platform", e.target.value)}
                  onBlur={() => blurField("platform")}
                  className={inputClass}
                >
                  <option value="">Choose platform…</option>
                  {APP_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <FieldError message={visibleError("platform")} />
              </div>
            </div>
            <div>
              <FieldLabel>Play Store link</FieldLabel>
              <input
                type="text"
                value={formData.playStoreUrl}
                onChange={(e) => updateField("playStoreUrl", e.target.value)}
                onBlur={() => blurField("playStoreUrl")}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className={`${inputClass} font-mono text-[11px]`}
              />
              <FieldError message={visibleError("playStoreUrl")} />
            </div>
            <div>
              <FieldLabel>App Store link</FieldLabel>
              <input
                type="text"
                value={formData.appStoreUrl}
                onChange={(e) => updateField("appStoreUrl", e.target.value)}
                onBlur={() => blurField("appStoreUrl")}
                placeholder="https://apps.apple.com/..."
                className={`${inputClass} font-mono text-[11px]`}
              />
              <FieldError message={visibleError("appStoreUrl")} />
            </div>
            <div>
              <FieldLabel required>Website link</FieldLabel>
              <input
                type="text"
                value={formData.webUrl}
                onChange={(e) => updateField("webUrl", e.target.value)}
                onBlur={() => blurField("webUrl")}
                placeholder="https://..."
                className={`${inputClass} font-mono text-[11px]`}
              />
              <FieldError message={visibleError("webUrl")} />
            </div>
            {faviconSource && (
              <div className="flex items-center gap-2.5">
                <img
                  src={faviconSource}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
                />
                <span className="text-[11px] text-slate-500">Link preview</span>
              </div>
            )}
          </>
        )}

        {activeKind === "roadmap" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Level</FieldLabel>
                <select
                  value={formData.level}
                  onChange={(e) => updateField("level", e.target.value)}
                  className={inputClass}
                >
                  {ROADMAP_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Typical duration</FieldLabel>
                <input
                  type="text"
                  value={formData.durationText}
                  maxLength={LIMITS.durationText}
                  onChange={(e) => updateField("durationText", e.target.value)}
                  placeholder="e.g. 12 weeks"
                  className={inputClass}
                />
                <FieldError message={visibleError("durationText")} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <FieldLabel required>Steps</FieldLabel>
                <span className="text-[11px] font-semibold text-slate-400">
                  {formData.steps.length}/{ROADMAP_MAX_STEPS}
                </span>
              </div>
              <FieldError message={visibleError("steps")} />

              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      <span className="text-[11px] font-black text-vcet-blue">
                        Step {index + 1}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveStep(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move step ${index + 1} up`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-vcet-blue disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 1)}
                          disabled={index === formData.steps.length - 1}
                          aria-label={`Move step ${index + 1} down`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-vcet-blue disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          disabled={formData.steps.length <= 1}
                          aria-label={`Remove step ${index + 1}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <input
                          type="text"
                          value={step.title}
                          maxLength={LIMITS.stepTitle}
                          onChange={(e) => updateStep(index, "title", e.target.value)}
                          onBlur={() => blurField(`steps.${index}.title`)}
                          placeholder="Step title (required)"
                          aria-label={`Step ${index + 1} title`}
                          className={`${inputClass} bg-white`}
                        />
                        <FieldError
                          message={
                            visibleError(`steps.${index}.title`)
                          }
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={step.url}
                          onChange={(e) => updateStep(index, "url", e.target.value)}
                          onBlur={() => blurField(`steps.${index}.url`)}
                          placeholder="https://... (required)"
                          aria-label={`Step ${index + 1} link`}
                          className={`${inputClass} bg-white font-mono text-[11px]`}
                        />
                        <FieldError
                          message={
                            visibleError(`steps.${index}.url`)
                          }
                        />
                      </div>
                      <textarea
                        value={step.description}
                        rows={2}
                        maxLength={LIMITS.stepDescription}
                        onChange={(e) => updateStep(index, "description", e.target.value)}
                        placeholder="What happens at this step? (optional)"
                        aria-label={`Step ${index + 1} description`}
                        className={`${inputClass} bg-white`}
                      />
                      <select
                        value={step.resourceType}
                        onChange={(e) => updateStep(index, "resourceType", e.target.value)}
                        aria-label={`Step ${index + 1} resource type`}
                        className={`${inputClass} bg-white`}
                      >
                        {RESOURCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addStep}
                disabled={formData.steps.length >= ROADMAP_MAX_STEPS}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:border-vcet-blue hover:text-vcet-blue disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="h-3.5 w-3.5" />
                Add step
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Tech Pulse Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish YouTube videos, websites, apps and learning roadmaps shown on the public
            Tech Pulse wall.
          </p>
          <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            {publishedCount} Published / {posts.length} Total
          </span>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tech Pulse Post</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, description, category or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-vcet-blue/20 focus:border-vcet-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            aria-label="Filter by content type"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Types</option>
            {TECH_PULSE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABELS[kind]}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <span className="text-xs font-semibold text-slate-500 ml-auto">
            {filtered.length} post{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Desktop table — the header stays pinned while the rows scroll. */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr className="bg-slate-50">
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-5 py-3.5">
                  Post
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  Kind
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  Category
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  Platform
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  Tags
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading Tech Pulse posts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No Tech Pulse posts yet. Use &ldquo;Add Tech Pulse Post&rdquo; to publish the
                    first one.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => {
                  const logo = resolveTechPulseLogo(post.logoUrl);
                  const kind = post.kind || "website";
                  const KindIcon = KIND_ICONS[kind] || Globe;
                  const target = post.url || post.webUrl || post.playStoreUrl || post.appStoreUrl;
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 max-w-[22rem]">
                        <div className="flex items-start gap-3">
                          {logo ? (
                            <img
                              src={logo}
                              alt=""
                              loading="lazy"
                              className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-vcet-blue/10 text-vcet-blue flex items-center justify-center font-black">
                              {(post.title || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                              <span className="line-clamp-1">{post.title}</span>
                              {post.featured && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                              )}
                            </div>
                            {post.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {post.description}
                              </p>
                            )}
                            {target && (
                              <span className="text-[11px] text-vcet-blue line-clamp-1 break-all">
                                {target}
                              </span>
                            )}
                            {kind === "roadmap" && (
                              <span className="text-[11px] text-slate-400">
                                {post.steps?.length || 0} steps
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-vcet-blue/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-vcet-blue">
                          <KindIcon className="h-3 w-3" aria-hidden="true" />
                          {KIND_LABELS[kind]}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {post.category || "—"}
                      </td>
                      <td className="px-4 py-4">{post.platform || "—"}</td>
                      <td className="px-4 py-4 max-w-[12rem]">
                        <div className="flex flex-wrap gap-1">
                          {(post.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            post.isPublished !== false
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {post.isPublished !== false ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openLink(post)}
                            title="Open link"
                            disabled={!target}
                            className="p-1.5 text-slate-400 hover:text-vcet-blue hover:bg-vcet-blue/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(post)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, id: post.id })}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: stacked cards instead of a squeezed table. */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-sm text-slate-400">
            Loading Tech Pulse posts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-sm text-slate-400">
            No Tech Pulse posts yet.
          </div>
        ) : (
          filtered.map((post) => {
            const logo = resolveTechPulseLogo(post.logoUrl);
            const kind = post.kind || "website";
            const KindIcon = KIND_ICONS[kind] || Globe;
            const target = post.url || post.webUrl || post.playStoreUrl || post.appStoreUrl;
            return (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      loading="lazy"
                      className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-vcet-blue/10 text-vcet-blue flex items-center justify-center font-black shrink-0">
                      {(post.title || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="line-clamp-1">{post.title}</span>
                      {post.featured && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                      )}
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-vcet-blue/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-vcet-blue">
                      <KindIcon className="h-3 w-3" aria-hidden="true" />
                      {KIND_LABELS[kind]}
                    </span>
                    {post.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5">
                        {post.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      post.isPublished !== false
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {post.isPublished !== false ? "Published" : "Draft"}
                  </span>
                  {post.platform && (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {post.platform}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                  <button
                    onClick={() => openLink(post)}
                    disabled={!target}
                    aria-label={`Open ${post.title}`}
                    className="rounded-lg p-2.5 text-slate-400 hover:text-vcet-blue hover:bg-vcet-blue/10 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    aria-label={`Edit ${post.title}`}
                    className="rounded-lg p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, id: post.id })}
                    aria-label={`Delete ${post.title}`}
                    className="rounded-lg p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm sm:p-4">
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tech-pulse-modal-title"
            className="flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl max-h-[94vh] sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <h3 id="tech-pulse-modal-title" className="text-base font-bold text-slate-900">
                {editing ? "Edit Tech Pulse Post" : "Publish Tech Pulse Post"}
              </h3>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-4 text-xs">
                <div>
                  <FieldLabel>Content type</FieldLabel>
                  <div
                    role="radiogroup"
                    aria-label="Content type"
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {TECH_PULSE_KINDS.map((kind) => {
                      const Icon = KIND_ICONS[kind];
                      const selected = kind === activeKind;
                      return (
                        <button
                          key={kind}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => changeKind(kind)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-bold transition-colors min-h-[44px] ${
                            selected
                              ? "border-vcet-blue bg-vcet-blue text-white"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-vcet-blue/40 hover:text-vcet-blue"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {KIND_LABELS[kind]}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError message={visibleError("kind")} />
                </div>

                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    maxLength={LIMITS.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    onBlur={() => blurField("title")}
                    placeholder="e.g. TechCrunch"
                    className={inputClass}
                  />
                  <FieldError message={visibleError("title")} />
                </div>

                {kindFields}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <select
                      value={formData.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Tags (comma separated)</FieldLabel>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => updateField("tags", e.target.value)}
                      placeholder="Startups, AI, Developer News"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Logo (image, max 5MB)</FieldLabel>
                  <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-vcet-blue bg-slate-50 cursor-pointer min-h-[44px]">
                    <Upload className="w-4 h-4 text-vcet-blue" />
                    <span className="text-slate-600 font-semibold">
                      {formData.logo ? formData.logo.name : "Choose image..."}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          logo: e.target.files?.[0] || null,
                          removeLogo: false,
                        }))
                      }
                    />
                  </label>
                  {logoPreview && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={logoPreview}
                        alt="logo preview"
                        className="rounded-xl max-h-20 object-contain border border-slate-200"
                      />
                      {editing?.logoUrl && !formData.logo && (
                        <button
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, removeLogo: true }))}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Remove logo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={formData.description}
                    rows={3}
                    maxLength={LIMITS.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    onBlur={() => blurField("description")}
                    placeholder="One or two lines about what students will find here"
                    className={inputClass}
                  />
                  <FieldError message={visibleError("description")} />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => updateField("isPublished", e.target.checked)}
                      className="w-4 h-4 accent-vcet-blue"
                    />
                    <span className="font-bold text-slate-700">
                      Published (visible on /updates)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => updateField("featured", e.target.checked)}
                      className="w-4 h-4 accent-vcet-blue"
                    />
                    <span className="font-bold text-slate-700">
                      Featured (wider card with highlight)
                    </span>
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-3 sm:px-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={requestClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold shadow-md disabled:opacity-50 min-h-[44px]"
                >
                  {saving && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {saving ? "Saving..." : editing ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Tech Pulse Post?"
        message="This removes the post and its uploaded logo from the server immediately."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />

      <ConfirmDialog
        isOpen={kindDialog.open}
        title="Switch content type?"
        message={`Changing to “${KIND_LABELS[kindDialog.nextKind] || ""}” clears the fields that only apply to ${
          KIND_LABELS[formData.kind] || "the current type"
        }. This cannot be undone.`}
        confirmLabel="Switch type"
        confirmVariant="danger"
        onConfirm={() => {
          applyKind(kindDialog.nextKind);
          setKindDialog({ open: false, nextKind: null });
        }}
        onCancel={() => setKindDialog({ open: false, nextKind: null })}
      />

      <ConfirmDialog
        isOpen={closeDialog}
        title="Discard changes?"
        message="You have unsaved edits in this post. Closing now will discard them."
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={() => {
          setDirty(false);
          setCloseDialog(false);
          setModalOpen(false);
        }}
        onCancel={() => setCloseDialog(false)}
      />
    </div>
  );
}
