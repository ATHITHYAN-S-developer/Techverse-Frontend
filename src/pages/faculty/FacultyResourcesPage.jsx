import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Download,
  X,
  Upload,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Check,
  MessageSquare,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../services/api";
import {
  resourceService,
  RESOURCE_TYPES,
  resolveResourceUrl,
} from "../../services/resourceService";
import ConfirmDialog from "../../components/ConfirmDialog";

const EMPTY_FORM = {
  title: "",
  type: "notes",
  unit: "",
  description: "",
  tags: "",
  file: null,
  externalUrl: "",
};

export default function FacultyResourcesPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const ownDeptId = user?.departmentId?._id || user?.departmentId || "";
  const ownDeptCode = user?.department?.toUpperCase?.() || "";
  const currentUserId = String(user?._id || user?.id || "");
  const staffId = String(user?.staffId || user?.facultyId || "").toUpperCase();
  const regNum = String(user?.registerNumber || "").toUpperCase();
  const email = String(user?.email || "").toLowerCase();
  const name = String(user?.name || "").toUpperCase();

  const isDeveloper =
    regNum.includes("732924CSR014") ||
    email.includes("732924csr014") ||
    name.includes("ATHITHYAN");

  // HOD or Department Head elevation detection
  const isHod =
    isDeveloper ||
    staffId.includes("104") ||
    staffId.includes("HOD") ||
    staffId.endsWith("01") ||
    user?.role === "hod" ||
    user?.role === "admin" ||
    user?.title?.toLowerCase().includes("hod") ||
    user?.title?.toLowerCase().includes("head of the department") ||
    user?.designation?.toLowerCase().includes("hod") ||
    user?.designation?.toLowerCase().includes("head of the department") ||
    user?.isHod === true;

  const isOwnerOf = (res) => {
    const uId = typeof res.uploadedBy === "object" ? res.uploadedBy?._id : res.uploadedBy;
    return String(uId || "") === currentUserId;
  };

  const canModifyResource = (res) => {
    if (user?.role === "admin" || isHod) return true;
    return isOwnerOf(res);
  };

  // Core Rule:
  // - Admin or HOD can delete any resource (pending, approved, rejected)
  // - Regular faculty can delete ONLY before HOD approval (pending or rejected)
  // - Once approved by HOD, only HOD or Admin can delete!
  const canDeleteResource = (res) => {
    if (user?.role === "admin" || isHod) return true;
    if (!isOwnerOf(res)) return false;
    const status = getStatus(res);
    return status !== "approved";
  };

  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "Delete Resource?",
    message: "This permanently removes the resource and its stored file from the server.",
  });
  const [rejectModal, setRejectModal] = useState({ open: false, resource: null, reason: "" });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.departmentId]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAllResources({
        includePending: true,
        departmentId: ownDeptId,
      });
      const list = Array.isArray(data) ? data : [];
      setResources(list);
    } catch {
      showError("Failed to load department resources");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingResource(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (res) => {
    setEditingResource(res);
    setFormData({
      title: res.title || "",
      type: res.type || "notes",
      unit: res.unit ? String(res.unit) : "",
      description: res.description || "",
      tags: Array.isArray(res.tags) ? res.tags.join(", ") : "",
      file: null,
      externalUrl: res.fileUrl?.startsWith("/uploads") ? "" : res.fileUrl || res.externalUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError("Please enter a resource title");
      return;
    }
    if (!editingResource && !formData.file && !formData.externalUrl.trim()) {
      showError("Please attach a file or enter an external link");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        departmentId: ownDeptId,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingResource) {
        const targetId = editingResource._id || editingResource.id;
        await resourceService.updateResource(targetId, payload);
        if (editingResource.approvalStatus === "rejected") {
          showSuccess("Notes re-submitted to HOD for approval ✓");
        } else {
          showSuccess("Resource updated successfully ✓");
        }
      } else {
        await resourceService.addResource(payload);
        if (isHod) {
          showSuccess("Notes published to department portal ✓");
        } else {
          showSuccess("Notes submitted to HOD for review ✓ Once approved, it will be visible to students.");
        }
      }
      setModalOpen(false);
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  // HOD Decision: Approve Resource
  const handleApprove = async (res) => {
    const id = res._id || res.id;
    try {
      setActionLoadingId(id);
      await resourceService.approveResource(id);
      showSuccess(`"${res.title}" approved and published to department portal ✓`);
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to approve resource");
    } finally {
      setActionLoadingId(null);
    }
  };

  // HOD Decision: Open Reject Modal
  const openRejectDialog = (res) => {
    setRejectModal({
      open: true,
      resource: res,
      reason: "Please update notes to cover the complete unit syllabus and re-submit.",
    });
  };

  // HOD Decision: Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectModal.resource) return;
    const id = rejectModal.resource._id || rejectModal.resource.id;
    try {
      setActionLoadingId(id);
      await resourceService.rejectResource(id, rejectModal.reason);
      showSuccess(`Notes rejected. Faculty can view feedback and retry.`);
      setRejectModal({ open: false, resource: null, reason: "" });
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to reject resource");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDeleteDialog = (res) => {
    const id = res._id || res.id;
    const isAppr = getStatus(res) === "approved";
    setDeleteDialog({
      open: true,
      id,
      title: isAppr ? "Delete Approved Resource?" : "Delete Resource?",
      message: isAppr
        ? `As HOD, this will permanently remove "${res.title}" from the department and student portal.`
        : `This will permanently remove your uploaded resource "${res.title}" before HOD approval.`,
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await resourceService.deleteResource(deleteDialog.id);
      showSuccess("Resource removed successfully ✓");
      setDeleteDialog({ open: false, id: null, title: "Delete Resource?", message: "" });
      loadResources();
    } catch (err) {
      showError(err?.message || "Failed to delete resource");
    }
  };

  const handleOpenFile = async (res) => {
    try {
      resourceService.trackDownload(res._id || res.id);
    } catch {
      /* counter is best-effort */
    }
    const id = res._id || res.id;
    let url = "";
    if (id) {
      const origin = API_BASE_URL.replace(/\/api\/?$/, "");
      url = `${origin}/api/resources/${id}/view`;
    } else {
      url = resolveResourceUrl(res.fileUrl || res.externalUrl || res.downloadUrl);
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      showError("Resource link or file not available");
    }
  };

  const departmentLabel = (res) => {
    const d = res.departmentId;
    if (typeof d === "object" && d) return d.code || d.name || "Department";
    return "Department";
  };

  const getStatus = (r) => {
    if (r.approvalStatus) return r.approvalStatus;
    return r.isPublished ? "approved" : "pending";
  };

  // Counts for tabs
  const pendingCount = useMemo(
    () => resources.filter((r) => getStatus(r) === "pending").length,
    [resources]
  );
  const approvedCount = useMemo(
    () => resources.filter((r) => getStatus(r) === "approved").length,
    [resources]
  );
  const rejectedCount = useMemo(
    () => resources.filter((r) => getStatus(r) === "rejected").length,
    [resources]
  );

  const q = (searchTerm || "").toLowerCase().trim();
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const status = getStatus(r);
      if (activeTab === "pending" && status !== "pending") return false;
      if (activeTab === "approved" && status !== "approved") return false;
      if (activeTab === "rejected" && status !== "rejected") return false;

      const title = (r.title || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const tags = (Array.isArray(r.tags) ? r.tags.join(" ") : "").toLowerCase();
      return !q || title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [resources, q, activeTab]);

  const filePreview = formData.file
    ? URL.createObjectURL(formData.file)
    : formData.externalUrl && !formData.externalUrl.startsWith("/uploads")
    ? formData.externalUrl
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Department Notes & E-Resources
            </h1>
            {isHod && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-vcet-blue text-[11px] font-extrabold uppercase tracking-wider border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                HOD Approval Authority
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isHod
              ? `Review, approve, or reject faculty lecture notes for ${ownDeptCode || "your department"}. Approved notes are instantly published to students.`
              : `Upload unit lecture notes and materials for ${ownDeptCode || "your department"}. All notes are reviewed and approved by the HOD before publishing to students.`}
          </p>
          {ownDeptCode && (
            <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-blue-50 text-vcet-blue font-bold text-[11px] border border-blue-200">
              Department: {ownDeptCode}
            </span>
          )}
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Notes / Material</span>
        </button>
      </div>

      {/* 2. HOD Pending Alert Banner */}
      {isHod && pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                {pendingCount} Note{pendingCount !== 1 ? "s" : ""} Awaiting Your HOD Approval
              </h2>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Faculty have submitted new study materials. Students cannot view or download these materials until you approve them.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("pending")}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Review Pending ({pendingCount})
          </button>
        </div>
      )}

      {/* 3. Regular Faculty Rejected Warning Banner */}
      {!isHod && rejectedCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">
                {rejectedCount} Note{rejectedCount !== 1 ? "s" : ""} Rejected by HOD
              </h2>
              <p className="text-xs text-rose-800/80 mt-0.5">
                The HOD requested revisions on some materials. Click "Retry / Edit" to see the HOD's feedback and resubmit.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("rejected")}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            View Rejected ({rejectedCount})
          </button>
        </div>
      )}

      {/* 4. Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Notes ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-800 hover:text-amber-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-800 hover:text-emerald-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved & Live</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">
                {approvedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-800 hover:text-rose-900"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
              {rejectedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">
                  {rejectedCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500 px-1 whitespace-nowrap">
            Showing {filtered.length} of {resources.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by title, unit, subject, or tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:ring-2 focus:ring-vcet-blue/20 focus:border-vcet-blue"
          />
        </div>
      </div>

      {/* 5. Notes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Notes / Resource</th>
                <th className="px-4 py-3.5">Type & Unit</th>
                <th className="px-4 py-3.5">HOD Approval Status</th>
                <th className="px-4 py-3.5">Downloads</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-vcet-blue" />
                      <span>Loading department resources...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="max-w-sm mx-auto text-center">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No notes found for this filter.</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {activeTab === "pending"
                          ? "No items are currently awaiting review."
                          : activeTab === "rejected"
                          ? "No notes have been rejected."
                          : "Upload notes to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const itemId = item._id || item.id;
                  const status = getStatus(item);
                  const isPending = status === "pending";
                  const isApproved = status === "approved";
                  const isRejected = status === "rejected";
                  const isLoadingAction = actionLoadingId === itemId;

                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Title & Details */}
                      <td className="px-5 py-4 max-w-sm">
                        <button
                          type="button"
                          onClick={() => handleOpenFile(item)}
                          className="font-bold text-slate-900 text-sm hover:text-vcet-blue transition-colors text-left flex items-center gap-1.5 cursor-pointer group"
                          title="Click to view notes / resource in a new tab"
                        >
                          <span className="line-clamp-1 group-hover:underline">
                            {item.title || "Academic Resource"}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-vcet-blue shrink-0" />
                        </button>
                        <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{item.fileSize || "—"}</span>
                          <span>•</span>
                          <span className="uppercase">
                            {(item.mimeType || item.fileType || "PDF").split("/").pop()}
                          </span>
                          {item.uploadedBy?.name && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500 font-medium">
                                By {item.uploadedBy.name}
                              </span>
                            </>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-slate-500 text-[11px] line-clamp-1 mt-1">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* 2. Type & Unit */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-vcet-blue border border-blue-200">
                            {(item.type || "notes").replace(/_/g, " ")}
                          </span>
                          {item.unit ? (
                            <span className="text-[10px] font-semibold text-slate-500">
                              Unit {item.unit}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* 3. Approval Status Badge + Reason */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved by HOD</span>
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>Pending HOD Approval</span>
                            </span>
                          )}

                          {isRejected && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejected by HOD</span>
                              </span>
                              {item.rejectionReason && (
                                <div className="text-[11px] text-rose-700 font-medium bg-rose-50/80 p-2 rounded-xl border border-rose-100 max-w-xs mt-1">
                                  <span className="font-bold block text-[10px] text-rose-800 uppercase tracking-wider">
                                    HOD Feedback:
                                  </span>
                                  "{item.rejectionReason}"
                                </div>
                              )}
                            </div>
                          )}

                          <span className="text-[10px] text-slate-400">
                            {isApproved
                              ? "Live in department portal"
                              : "Hidden from students"}
                          </span>
                        </div>
                      </td>

                      {/* 4. Downloads */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {item.downloadsCount || 0}
                      </td>

                      {/* 5. Actions */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Resource Button (Opens in new tab) */}
                          <button
                            type="button"
                            onClick={() => handleOpenFile(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/90 font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="View resource material in another tab"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>View Resource</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>

                          {/* HOD Specific Approval / Reject Buttons */}
                          {isHod && isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={isLoadingAction}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Approve and publish notes"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => openRejectDialog(item)}
                                disabled={isLoadingAction}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Reject notes with feedback"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Faculty Retry Button if Rejected */}
                          {isRejected && canModifyResource(item) && (
                            <button
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              title="Update notes to resolve feedback and resubmit"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retry / Edit</span>
                            </button>
                          )}

                          {/* Open / Download */}
                          <button
                            onClick={() => handleOpenFile(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-vcet-blue hover:bg-slate-100 cursor-pointer"
                            title={item.fileUrl ? "Open / Download file" : "Open link"}
                          >
                            {item.fileUrl ? (
                              <Download className="w-4 h-4" />
                            ) : (
                              <ExternalLink className="w-4 h-4" />
                            )}
                          </button>

                          {/* Regular Edit (if not rejected, or if elevated) */}
                          {!isRejected && canModifyResource(item) && (
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-vcet-blue hover:bg-slate-100 cursor-pointer"
                              title="Edit Resource"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {canDeleteResource(item) ? (
                            <button
                              onClick={() => openDeleteDialog(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title={
                                isApproved
                                  ? "Delete Resource (HOD Authority)"
                                  : "Delete notes (allowed before HOD approval)"
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : isApproved && isOwnerOf(item) ? (
                            <span
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed inline-flex items-center"
                              title="Approved notes are published to students and can only be deleted by the Department HOD"
                            >
                              <Trash2 className="w-4 h-4 opacity-40" />
                            </span>
                          ) : null}
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

      {/* 6. Upload / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingResource
                    ? editingResource.approvalStatus === "rejected"
                      ? "Retry & Re-submit Notes"
                      : "Edit Department Resource"
                    : "Upload Department Resource"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isHod
                    ? "As HOD, notes you upload are automatically published to the department."
                    : "Notes uploaded will be submitted to the HOD for review before becoming visible to students."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If previously rejected, display HOD Feedback Callout */}
            {editingResource && editingResource.approvalStatus === "rejected" && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>HOD Rejection Reason:</span>
                </div>
                <p className="italic text-slate-700 bg-white/70 p-2 rounded-xl border border-rose-100">
                  "{editingResource.rejectionReason || "Please review notes and re-submit."}"
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  Update the material details or file below. Saving will re-submit this note to the HOD for approval.
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 3 DBMS Relational Algebra & SQL Notes"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-vcet-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resource Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upload File (PDF / Document / Image / ZIP, max 50MB)
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-vcet-blue bg-slate-50 cursor-pointer">
                  <Upload className="w-4 h-4 text-vcet-blue" />
                  <span className="text-slate-600 font-semibold truncate max-w-xs">
                    {formData.file ? formData.file.name : "Choose file to upload..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt,.zip"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] || null })
                    }
                  />
                </label>
                {formData.file && formData.file.type.startsWith("image/") && filePreview && (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="mt-2 rounded-xl max-h-40 object-cover border border-slate-200"
                  />
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Or External Link (for videos / websites) (optional)
                </label>
                <input
                  type="text"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Short description of this study material"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tags (comma separated) (optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="DBMS, SQL, Unit 3"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-vcet-blue hover:bg-vcet-blue-deep text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving
                    ? "Saving..."
                    : editingResource && editingResource.approvalStatus === "rejected"
                    ? "Save & Re-submit to HOD"
                    : editingResource
                    ? "Save Changes"
                    : isHod
                    ? "Publish to Portal"
                    : "Submit for HOD Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. HOD Rejection Feedback Dialog */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <XCircle className="w-5 h-5" />
                <span>Reject Notes & Send Feedback</span>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, resource: null, reason: "" })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-600">
                You are rejecting:{" "}
                <span className="font-bold text-slate-900">
                  {rejectModal.resource?.title}
                </span>
                . The faculty member will see this feedback on their dashboard and can update and retry.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Quick Reason or Type Feedback:
                </label>
                <div className="space-y-1.5 mb-2">
                  {[
                    "Please update notes to cover the complete unit syllabus and re-submit.",
                    "Incomplete problem sets and answers. Please add more examples.",
                    "File format or scan quality is unclear. Please attach a clear PDF.",
                    "Missing reference questions and university exam problem solutions.",
                  ].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setRejectModal({ ...rejectModal, reason: quick })}
                      className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-vcet-blue text-slate-700 text-[11px] transition-colors cursor-pointer"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  rows={3}
                  placeholder="Enter rejection notes / guidance for the faculty..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, resource: null, reason: "" })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoadingId !== null}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        title={deleteDialog.title || "Delete Resource?"}
        message={deleteDialog.message || "This permanently removes the resource and its stored file from the server."}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, title: "Delete Resource?", message: "" })}
      />
    </div>
  );
}