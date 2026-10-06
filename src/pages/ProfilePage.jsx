import React, { useEffect, useState } from "react";
import { Flame, Save, KeyRound, Eye, EyeOff, X, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function ProfilePage({ embedded = false }) {
  const { user, role, streak, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const isFaculty = role === "faculty" || role === "teacher" || role === "hod" || window.location.pathname.startsWith("/faculty");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [phone, setPhone] = useState(user?.phone || user?.contactPhone || "+91 98421 54320");
  const [bio, setBio] = useState(user?.bio || "Aspiring Software Engineer passionate about Cloud Systems, Python, and Full-Stack Development.");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.phone || user?.contactPhone) setPhone(user.phone || user.contactPhone);
    if (user?.bio) setBio(user.bio);
  }, [user]);

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
      await updateProfile({
        phone,
        bio,
        email: email.trim(),
      });
      showSuccess("Profile information updated successfully ✓");
    } catch (error) {
      showError(error.message || "Could not update profile information.");
    } finally {
      setSaving(false);
    }
  };

  const staffId = String(user?.registerNumber || user?.staffId || user?.facultyId || "").toUpperCase();

  const isHod =
    staffId.includes("104") ||
    staffId.includes("HOD") ||
    role === "hod" ||
    user?.role === "hod" ||
    user?.designation?.toLowerCase().includes("hod") ||
    user?.title?.toLowerCase().includes("hod") ||
    user?.isHod === true;

  const roleLabel =
    role === "admin"
      ? "Institutional Administrator"
      : isHod
        ? "Head of the Department (HOD)"
        : role === "faculty" || role === "teacher"
          ? "Faculty Member"
          : "Enrolled Student";

  const labelCls =
    "block font-body text-xs font-medium text-profile-ink/55";
  const underlineBase =
    "mt-1.5 block w-full border-0 border-b border-profile-rule bg-transparent px-0 py-2 font-body text-[15px] transition-colors focus:border-profile-main focus:outline-none focus:ring-0";
  const saveButtonCls =
    "group inline-flex items-center gap-2 border border-profile-main bg-profile-main px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-transparent hover:text-profile-main";

  return (
    <section
      id={embedded ? "profile" : undefined}
      className={`bg-profile-paper font-body text-profile-ink ${embedded ? "scroll-mt-20 border-t border-profile-rule" : "min-h-full"}`}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
        <header className="flex flex-col gap-9 border-b border-profile-rule pb-10 sm:flex-row sm:items-end sm:justify-between sm:pb-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-profile-main font-serif text-3xl text-white ring-1 ring-profile-light">
              {user?.name?.charAt(0) || "U"}
            </span>

            <div>
              <span className="inline-flex w-fit items-center rounded-full border border-profile-rule px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-profile-main">
                {roleLabel}
              </span>
              <h1 className="mt-3 font-serif text-3xl font-medium leading-none tracking-tight text-profile-ink sm:text-4xl">
                {user?.name || "Student User"}
              </h1>
              <p className="mt-2.5 font-body text-xs text-profile-ink/55">
                <span className="font-mono tabular-nums">
                  {user?.registerNumber || user?.staffId || user?.facultyId || user?.adminId || "732924CSE001"}
                </span>
                {" · "}
                {user?.department || "Computer Science & Engineering"}
              </p>
            </div>
          </div>

          {role === "student" && (
            <div className="flex shrink-0 items-center gap-7 sm:gap-9">
              <div>
                <span className="block font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-profile-ink/40">
                  Streak
                </span>
                <span className="mt-1 flex items-baseline gap-1.5">
                  <Flame className="h-4 w-4 self-center text-profile-main" />
                  <span className="font-serif text-2xl font-medium tabular-nums text-profile-ink">
                    {streak?.currentStreak || 0}
                  </span>
                  <span className="text-xs text-profile-ink/45">days</span>
                </span>
              </div>
            </div>
          )}
        </header>

        <form onSubmit={handleSave}>
          <section className="border-b border-profile-rule py-10 sm:py-12">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-profile-ink sm:text-[1.7rem]">
              Academic Identity &amp; Credentials
            </h2>
            <span aria-hidden="true" className="mt-3 block h-px w-12 bg-profile-main" />

            <div className="mt-9 grid grid-cols-1 gap-x-12 gap-y-9 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className={labelCls}>
                  Full Legal Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  disabled
                  value={user?.name || "Student"}
                  className={`${underlineBase} cursor-not-allowed text-profile-ink/60 disabled:cursor-not-allowed`}
                />
                <span className="mt-1.5 block font-body text-[11px] italic text-profile-ink/40">
                  Protected academic registration field.
                </span>
              </div>

              <div>
                <label htmlFor="profile-reg" className={labelCls}>
                  {role === "faculty" || role === "teacher" || role === "hod" ? "Faculty Staff ID" : "Register / Roll Number"}
                </label>
                <input
                  id="profile-reg"
                  type="text"
                  disabled
                  value={user?.registerNumber || user?.staffId || user?.facultyId || "732924CSE001"}
                  className={`${underlineBase} font-mono tabular-nums text-profile-ink/60`}
                />
              </div>

              <div>
                <label htmlFor="profile-dept" className={labelCls}>
                  Department
                </label>
                <input
                  id="profile-dept"
                  type="text"
                  disabled
                  value={user?.department || "Computer Science & Engineering"}
                  className={`${underlineBase} text-profile-ink/60`}
                />
              </div>

              <div>
                <label htmlFor="profile-email" className={labelCls}>
                  Institutional Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vcet.ac.in"
                  className={`${underlineBase} font-mono tabular-nums text-profile-ink`}
                />
              </div>
            </div>
          </section>

          <section className="border-b border-profile-rule py-10 sm:py-12">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-profile-ink sm:text-[1.7rem]">
              Contact &amp; Biography
            </h2>
            <span aria-hidden="true" className="mt-3 block h-px w-12 bg-profile-main" />

            <div className="mt-9 max-w-lg space-y-9">
              <div>
                <label htmlFor="profile-phone" className={labelCls}>
                  Contact Phone
                </label>
                <input
                  id="profile-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${underlineBase} text-profile-ink`}
                />
              </div>

              <div>
                <label htmlFor="profile-bio" className={labelCls}>
                  About / Bio
                </label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`${underlineBase} resize-none leading-relaxed text-profile-ink`}
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {isFaculty ? (
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 font-body text-xs font-bold uppercase tracking-wider transition-all rounded-lg shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <KeyRound className="h-4 w-4 text-vcet-blue" />
                  <span>Reset Password</span>
                </button>
              ) : <div />}

              <button type="submit" disabled={saving} className={`${saveButtonCls} disabled:cursor-wait disabled:opacity-60`}>
                <Save
                  className="h-4 w-4 transition-colors group-hover:text-profile-main"
                  aria-hidden="true"
                />
                <span>{saving ? "Saving..." : "Save Profile Updates"}</span>
              </button>
            </div>
          </section>
        </form>
      </div>

      {/* Password Reset Modal for Faculty Only */}
      {resetModalOpen && isFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-vcet-blue">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Reset Faculty Password</h3>
                  <p className="text-xs text-slate-400">
                    {user?.name} · {user?.staffId || user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 4 characters)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-vcet-blue hover:bg-[#004f88] text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {resetting ? "Resetting..." : "Confirm & Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}