import React, { useEffect, useState } from "react";
import {
  Flame,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  Phone,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  QrCode,
  Building2,
  Calendar,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function ProfilePage({ embedded = false }) {
  const { user, role, streak, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const isFaculty =
    role === "faculty" ||
    role === "teacher" ||
    role === "hod" ||
    window.location.pathname.startsWith("/faculty");

  // Faculty Password Reset
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState(user?.phone || user?.contactPhone || "+91 98421 54320");
  const [bio, setBio] = useState(
    user?.bio || "Aspiring Software Engineer passionate about Cloud Systems, Python, and Full-Stack Development."
  );
  const [email, setEmail] = useState(() => {
    if (role === "student") {
      const savedCustom = localStorage.getItem(`student_custom_email_${user?._id || user?.id}`);
      if (savedCustom) return savedCustom;
      if (user?.studentEnteredEmail || user?.hasCustomEmail) {
        return user.studentEnteredEmail || "";
      }
      return "";
    }
    return user?.email || "";
  });

  const [saving, setSaving] = useState(false);
  const [copiedRegNo, setCopiedRegNo] = useState(false);

  useEffect(() => {
    if (role === "student") {
      const savedCustom = localStorage.getItem(`student_custom_email_${user?._id || user?.id}`);
      if (savedCustom) {
        setEmail(savedCustom);
      } else if (user?.studentEnteredEmail || user?.hasCustomEmail) {
        setEmail(user.studentEnteredEmail || "");
      } else {
        setEmail("");
      }
    } else {
      if (user?.email) setEmail(user.email);
    }
    if (user?.phone || user?.contactPhone) setPhone(user.phone || user.contactPhone);
    if (user?.bio) setBio(user.bio);
  }, [user, role]);

  const handleCopyRegNo = (val) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedRegNo(true);
    showSuccess("Register number copied to clipboard");
    setTimeout(() => setCopiedRegNo(false), 2000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showError("Password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("New password and confirmation do not match.");
      return;
    }

    setResetting(true);
    try {
      const identifier = user?.staffId || user?.email || user?.username;
      await api.post("/auth/faculty-reset-password", {
        identifier,
        newPassword,
      });
      showSuccess("Faculty password has been reset successfully ✓");
      setResetModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showError(err.response?.data?.message || err.message || "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (role === "student") {
        if (email.trim()) {
          localStorage.setItem(`student_custom_email_${user?._id || user?.id}`, email.trim());
        } else {
          localStorage.removeItem(`student_custom_email_${user?._id || user?.id}`);
        }
      }
      await updateProfile({
        phone: phone.trim(),
        bio: bio.trim(),
        email: email.trim(),
        hasCustomEmail: Boolean(email.trim()),
        studentEnteredEmail: email.trim(),
      });
      showSuccess("Profile information updated successfully ✓");
    } catch (error) {
      showError(error.message || "Could not update profile information.");
    } finally {
      setSaving(false);
    }
  };

  const regOrStaffId =
    user?.registerNumber ||
    user?.staffId ||
    user?.facultyId ||
    user?.adminId ||
    "732924CSR014";

  const departmentName =
    user?.departmentName ||
    user?.department ||
    user?.departmentCode ||
    user?.courseName ||
    "Computer Science & Engineering";

  const yearDisplay = user?.year
    ? `${user.year}${typeof user.year === "number" ? " Year" : ""}`
    : "III Year";

  const sectionDisplay = user?.section ? ` · Sec ${user.section}` : "";

  const roleLabel =
    role === "admin"
      ? "Institutional Admin"
      : isFaculty
      ? "Faculty Member"
      : "Enrolled Student";

  const studentInitial = (user?.name?.charAt(0) || "A").toUpperCase();

  return (
    <section
      id={embedded ? "profile" : undefined}
      className={`font-body text-slate-800 ${
        embedded ? "scroll-mt-20 py-8 sm:py-12" : "min-h-full py-8 sm:py-12"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* SECTION HEADER (Minimal & Clean) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {roleLabel}
              </span>
              <span className="text-xs text-slate-400">• Institutional Profile</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {role === "student" ? "Student Profile & Preferences" : "Faculty Account & Credentials"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal contact details, email, and academic biography.
            </p>
          </div>

          {role === "student" && (
            <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streak?.currentStreak || 0} Day Streak</span>
            </div>
          )}
        </div>

        {/* CLEAN MINIMAL PROFILE CARD (No Blue Box) */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            {/* Top Identity Summary */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                {studentInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {user?.name || "Student User"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {roleLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono flex-wrap">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {regOrStaffId}
                  </span>
                  <span>•</span>
                  <span>{departmentName}</span>
                  <span>•</span>
                  <span>{yearDisplay} {sectionDisplay}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5 pt-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Contact Information &amp; Preferences</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal email, phone number, and brief technical bio.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Institutional or Personal Email</span>
                  </label>
                  <div className="relative">
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === "student"
                          ? "Enter your email (e.g. yourname@gmail.com or @vcet.ac.in)"
                          : "faculty@vcet.ac.in"
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used for course certificates, contest notifications, and academic circulars.
                  </span>
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98421 XXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Bio / About */}
                <div>
                  <label
                    htmlFor="profile-bio"
                    className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>About / Bio</span>
                  </label>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief overview of your technical interests, coding journey, and goals..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-none leading-relaxed placeholder:text-slate-400"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Markdown supported</span>
                    <span>{bio.length} characters</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {isFaculty ? (
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Reset Password</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? "Saving Changes..." : "Save Profile Updates"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================
          FACULTY PASSWORD RESET MODAL
      ======================================================== */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span>Reset Account Password</span>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a new secure password for staff ID <strong className="text-slate-800">{regOrStaffId}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 4 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {resetting ? "Resetting..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}