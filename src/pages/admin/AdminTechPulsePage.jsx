/**
 * Admin Page: Tech Pulse Manager
 * Publishes link cards (feed/app links with an optional uploaded logo) that the
 * public /updates page and the home badge read from /api/tech-pulse.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2, Edit, ExternalLink, X, Upload, Star } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { techPulseService, resolveTechPulseLogo } from "../../services/techPulseService";
import ConfirmDialog from "../../components/ConfirmDialog";

const CATEGORIES = [
  "Technology News",
  "Developer Tools",
  "AI & Machine Learning",
  "Open Source",
  "Startup & Product",
  "General",
];

const EMPTY_FORM = {
  title: "",
  url: "",
  description: "",
  category: "Technology News",
  platform: "",
  tags: "",
  logo: null,
  featured: false,
  isPublished: true,
};

export default function AdminTechPulsePage() {
  const { showSuccess, showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setFormData({
      title: post.title || "",
      url: post.url || "",
      description: post.description || "",
      category: post.category || "Technology News",
      platform: post.platform || "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
      logo: null,
      featured: Boolean(post.featured),
      isPublished: post.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return showError("Please enter a title");
    if (!formData.url.trim()) return showError("Please enter the feed or app link");

    setSaving(true);
    try {
      if (editing) {
        await techPulseService.update(editing.id || editing._id, formData);
      } else {
        await techPulseService.create(formData);
      }
      setModalOpen(false);
      showSuccess(editing ? "Post updated" : "Post published");
      loadAll();
    } catch (err) {
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
    if (post.url) window.open(post.url, "_blank", "noopener,noreferrer");
  };

  const q = (searchTerm || "").toLowerCase().trim();
  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const haystack = [post.title, post.description, post.category, post.platform, (post.tags || []).join(" ")]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "published" && post.isPublished !== false) ||
        (statusFilter === "draft" && post.isPublished === false);
      return matchesSearch && matchesStatus;
    });
  }, [posts, q, statusFilter]);

  const logoPreview = formData.logo
    ? URL.createObjectURL(formData.logo)
    : editing?.logoUrl
      ? resolveTechPulseLogo(editing.logoUrl)
      : "";

  const publishedCount = posts.filter((p) => p.isPublished !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Tech Pulse Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish developer news feeds and apps shown on the public Tech Pulse wall.
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Post</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Platform</th>
                <th className="px-4 py-3.5">Tags</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading Tech Pulse posts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No Tech Pulse posts yet. Use &ldquo;Add Tech Pulse Post&rdquo; to publish the first one.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => {
                  const logo = resolveTechPulseLogo(post.logoUrl);
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 max-w-[22rem]">
                        <div className="flex items-start gap-3">
                          {logo ? (
                            <img src={logo} alt="" className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-vcet-blue/10 text-vcet-blue flex items-center justify-center font-black">
                              {(post.title || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                              <span className="line-clamp-1">{post.title}</span>
                              {post.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />}
                            </div>
                            {post.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{post.description}</p>
                            )}
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-vcet-blue hover:underline line-clamp-1 break-all"
                            >
                              {post.url}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{post.category || "—"}</td>
                      <td className="px-4 py-4">{post.platform || "—"}</td>
                      <td className="px-4 py-4 max-w-[12rem]">
                        <div className="flex flex-wrap gap-1">
                          {(post.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
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
                            className="p-1.5 text-slate-400 hover:text-vcet-blue hover:bg-vcet-blue/10 rounded-lg"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editing ? "Edit Tech Pulse Post" : "Publish Tech Pulse Post"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. TechCrunch"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-vcet-blue"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Feed / App Link *</label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Platform</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="Web / Android / iOS"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Logo (image, max 5MB)</label>
                <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-vcet-blue bg-slate-50 cursor-pointer">
                  <Upload className="w-4 h-4 text-vcet-blue" />
                  <span className="text-slate-600 font-semibold">
                    {formData.logo ? formData.logo.name : "Choose image..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                  />
                </label>
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={logoPreview} alt="logo preview" className="rounded-xl max-h-20 object-contain border border-slate-200" />
                    {editing?.logoUrl && !formData.logo && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing((p) => ({ ...p, logoUrl: "" }));
                          setFormData((f) => ({ ...f, removeLogo: true }));
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="One or two lines about what students will find here"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Startups, AI, Developer News"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-vcet-blue"
                  />
                  <span className="font-bold text-slate-700">Published (visible on /updates)</span>
                </label>
                <label className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-vcet-blue"
                  />
                  <span className="font-bold text-slate-700">Featured (wider card with highlight)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold shadow-md disabled:opacity-50"
                >
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
    </div>
  );
}
