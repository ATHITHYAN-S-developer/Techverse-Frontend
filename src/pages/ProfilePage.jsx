import React, { useState } from "react";
import { User, Shield, Flame, Star, Award, Mail, Phone, Lock, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProfilePage() {
  const { user, role, streak, points, updateProfile } = useAuth();
  const { showSuccess } = useToast();

  const [phone, setPhone] = useState("+91 98421 54320");
  const [bio, setBio] = useState("Aspiring Software Engineer passionate about Cloud Systems, Python, and Full-Stack Development.");

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ phone, bio });
    showSuccess("Profile information updated successfully ✓");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-[#0062A8] text-white text-3xl font-black flex items-center justify-center shadow-lg shrink-0">
          {user?.name?.charAt(0) || "U"}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0062A8] text-[11px] font-bold uppercase tracking-wider">
            {role === "admin" ? "Institutional Administrator" : role === "faculty" ? "Faculty Member" : "Enrolled Student"}
          </div>
          <h1 className="text-2xl font-black text-slate-900">{user?.name || "Student User"}</h1>
          <p className="text-xs text-slate-500 font-mono">
            {user?.registerNumber || user?.facultyId || user?.adminId || "732924CSE001"} • {user?.department || "Computer Science & Engineering"}
          </p>
        </div>

        {role === "student" && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Streak</span>
              <span className="text-base font-black text-amber-900 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> {streak}d
              </span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#0062A8] block">Points</span>
              <span className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {points}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Academic & Contact Details Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Academic Identity & Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Full Legal Name</label>
            <input
              type="text"
              disabled
              value={user?.name || "Student"}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Protected academic registration field.</span>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              {role === "faculty" ? "Faculty Staff ID" : "Register / Roll Number"}
            </label>
            <input
              type="text"
              disabled
              value={user?.registerNumber || user?.facultyId || "732924CSE001"}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Department</label>
            <input
              type="text"
              disabled
              value={user?.department || "Computer Science & Engineering"}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">Institutional Email</label>
            <input
              type="email"
              disabled
              value={user?.email || "student@vcet.ac.in"}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">
          Contact & Biography
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full sm:w-80 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">About / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0062A8] hover:bg-[#0B4A8F] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
}
