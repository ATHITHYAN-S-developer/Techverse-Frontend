import React, { useEffect, useState } from "react";
import {
  Trophy,
  Search,
  Flame,
  Crown,
  Medal,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

const DEPARTMENTS = ["All Departments", "CSE", "AI&DS", "ECE", "IT", "EEE", "MECH", "CIVIL"];

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

const rankByStreak = (entries) =>
  [...entries]
    .sort((a, b) => b.streak - a.streak)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

/** Map a leaderboard API entry onto the view model this page renders. */
const toLeaderboardView = (entry, index) => ({
  rank: entry.rank ?? index + 1,
  id: entry._id,
  name: entry.name || "Student",
  regNo: entry.registerNumber || "—",
  department: entry.department || "VCET",
  streak: entry.streak ?? 0,
  longestStreak: entry.longestStreak ?? 0,
  certificatesEarned: entry.certificatesEarned ?? 0,
  avatar: entry.profileImage || FALLBACK_AVATAR,
});

export default function AdminLeaderboardPage() {
  const { showSuccess, showError } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const loadLeaderboard = async ({ announce = false } = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/users/leaderboard?limit=100");
      const list = res?.leaderboard || res?.data?.leaderboard || [];
      setLeaderboard(list.map(toLeaderboardView));
      if (announce) showSuccess("Leaderboard refreshed from live streak data.");
    } catch (err) {
      console.debug("Load leaderboard note:", err);
      setLeaderboard([]);
      showError("Could not load the leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = leaderboard.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All Departments" || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 font-black text-xs shadow-xs">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-black text-xs shadow-xs">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-black text-xs shadow-xs">
            <Medal className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Institutional Hall of Fame & Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student rankings by current learning streak, with certificates earned for context.
          </p>
        </div>

        <button
          onClick={() => loadLeaderboard({ announce: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all border border-slate-200 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-vcet-blue" />
          <span>Refresh Rankings</span>
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {leaderboard.slice(0, 3).map((item, idx) => (
            <div
              key={item.id || item.regNo}
              className={`rounded-2xl p-5 border relative overflow-hidden flex flex-col items-center text-center shadow-xs transition-all ${
                idx === 0
                  ? "bg-gradient-to-b from-amber-50/60 via-white to-white border-amber-300 md:-translate-y-2 shadow-amber-500/5"
                  : idx === 1
                  ? "bg-gradient-to-b from-slate-50/80 via-white to-white border-slate-200"
                  : "bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200"
              }`}
            >
              <div className="absolute top-3 right-3">{getRankBadge(item.rank)}</div>

              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 mb-3 shadow-xs">
                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {item.regNo} • {item.department}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                  <Flame className="w-3.5 h-3.5" />
                  {item.streak}d Streak
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leaderboard by student name or register number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-vcet-blue focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 focus:bg-white"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Current Streak</th>
                <th className="px-4 py-3.5">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    Loading leaderboard…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No students match your filters yet.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id || s.regNo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">{getRankBadge(s.rank)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{s.regNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-vcet-blue">{s.department}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                        <Flame className="w-3.5 h-3.5" />
                        {s.streak} Days
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{s.certificatesEarned} earned</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
