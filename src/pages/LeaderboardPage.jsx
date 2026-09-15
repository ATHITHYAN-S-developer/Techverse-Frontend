import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Star,
  Award,
  Crown,
  Medal,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function LeaderboardPage() {
  const { user, points, streak } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("overall"); // "overall" | "monthly" | "weekly"

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        const res = await api.get("/users?role=student");
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.users || res?.data || [];
          const sorted = list
            .map((s, idx) => ({
              id: s._id || s.id || `stu-${idx}`,
              name: s.name || "Student",
              regNo: s.registerNumber || s.regNo || `732924CSE00${idx + 1}`,
              department: s.department || "CSE",
              year: s.year || "III Year",
              streak: s.streak || 0,
              points: s.points || 0,
              coursesCompleted: s.coursesCompleted || 0
            }))
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .map((s, idx) => ({ ...s, rank: idx + 1 }));
          setStudents(sorted);
        }
      } catch (e) {
        if (isMounted) setStudents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStudents();
    return () => { isMounted = false; };
  }, []);

  const filtered = students.filter(
    (s) => deptFilter === "ALL" || s.department === deptFilter
  );

  const top3 = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* 1. Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>TechVerse Champions Arena</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Student Leaderboard & Streaks
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Rankings updated dynamically based on daily tests, self-paced course modules, and coding challenges.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {["overall", "monthly", "weekly"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeFilter === tf
                  ? "bg-white text-[#0062A8] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="AI&DS">AI&DS</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
        </select>
      </div>

      {/* 3. Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
          {/* Rank 2 - Silver */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm text-center flex flex-col items-center space-y-3 order-2 sm:order-1 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider">
              #2 Silver
            </div>
            <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-200 shadow" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{top3[1].name}</h3>
              <p className="text-[11px] text-slate-500">{top3[1].department} • {top3[1].regNo}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {top3[1].points} pts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {top3[1].streak}d
              </span>
            </div>
          </div>

          {/* Rank 1 - Gold (Elevated) */}
          <div className="bg-gradient-to-b from-amber-50/80 to-white rounded-3xl border-2 border-amber-300 p-6 shadow-md text-center flex flex-col items-center space-y-3 order-1 sm:order-2 relative sm:-translate-y-4">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
              <Crown className="w-3 h-3" /> #1 Champion
            </div>
            <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-300 shadow-md" />
            <div>
              <h3 className="text-base font-black text-slate-900">{top3[0].name}</h3>
              <p className="text-xs text-slate-500">{top3[0].department} • {top3[0].regNo}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400" /> {top3[0].points} pts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" /> {top3[0].streak}d
              </span>
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm text-center flex flex-col items-center space-y-3 order-3 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-black uppercase tracking-wider">
              #3 Bronze
            </div>
            <img src={top3[2].avatar} alt={top3[2].name} className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-200 shadow" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{top3[2].name}</h3>
              <p className="text-[11px] text-slate-500">{top3[2].department} • {top3[2].regNo}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {top3[2].points} pts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {top3[2].streak}d
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Complete Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Streak</th>
                <th className="px-4 py-3.5">Certificates</th>
                <th className="px-4 py-3.5 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const isCurrentUser = s.regNo === user?.registerNumber;
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? "bg-blue-50/80 font-bold text-[#0062A8]"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="px-5 py-4 font-black text-sm">
                      {s.rank <= 3 ? (
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                          s.rank === 1 ? "bg-amber-500" : s.rank === 2 ? "bg-slate-400" : "bg-orange-500"
                        }`}>
                          {s.rank}
                        </span>
                      ) : (
                        <span className="text-slate-400 pl-2">#{s.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-400 text-[10px] font-mono">{s.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                        {s.department}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {s.streak}d
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        {s.certificatesEarned} Earned
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-sm text-slate-900">
                      {s.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
