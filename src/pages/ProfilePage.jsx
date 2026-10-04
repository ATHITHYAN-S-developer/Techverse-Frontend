import React, { useEffect, useState } from "react";
import { Flame, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProfilePage({ embedded = false }) {
  const { user, role, streak, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [phone, setPhone] = useState("+91 98421 54320");
  const [bio, setBio] = useState("Aspiring Software Engineer passionate about Cloud Systems, Python, and Full-Stack Development.");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        phone,
        bio,
        ...(role === "student" ? { email: email.trim() } : {}),
      });
      showSuccess("Profile information updated successfully ✓");
    } catch (error) {
      showError(error.message || "Could not update profile information.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel =
    role === "admin"
      ? "Institutional Administrator"
      : role === "hod"
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
                  required={role === "student"}
                  disabled={role !== "student"}
                  value={role === "student" ? email : user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${underlineBase} font-mono tabular-nums ${role === "student" ? "text-profile-ink" : "cursor-not-allowed text-profile-ink/60"}`}
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

            <div className="mt-10 flex justify-end">
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
    </section>
  );
}