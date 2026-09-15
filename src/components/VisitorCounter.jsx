/**
 * VisitorCounter Component for VCET Tech Hub (TechVerse)
 * Displays the real-time institutional visitor count permanently stored in MongoDB.
 * Increment triggered once per browser page load / refresh.
 * Fallback: "Visitors: --" if backend/database is temporarily unreachable.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";
import { recordAndGetVisitorCount } from "../services/visitorService";
import { SITE_NAME } from "../config/site";

export default function VisitorCounter() {
  const [stats, setStats] = useState({
    count: null,
    isLive: false,
    error: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initCounter() {
      try {
        await recordAndGetVisitorCount((updatedStats) => {
          if (isMounted) {
            setStats({
              count: updatedStats?.count ?? null,
              isLive: Boolean(updatedStats?.isLive),
              error: Boolean(updatedStats?.error),
            });
            setIsLoading(false);
          }
        });
      } catch (e) {
        if (isMounted) {
          setStats((prev) => ({ ...prev, error: true }));
          setIsLoading(false);
        }
      }
    }

    initCounter();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayCount =
    typeof stats.count === "number"
      ? Number(stats.count).toLocaleString()
      : stats.error
      ? "--"
      : "--";

  return (
    <aside
      aria-label="Visitor counter badge"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        className="group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#0062A8] text-white shadow-2xl shadow-[#0062A8]/35 border border-white/30 hover:border-white/60 transition-all duration-200 cursor-default"
        title={`Total visitors on ${SITE_NAME}`}
      >
        {/* Eye Icon with Live Pulse Indicator */}
        <div className="relative flex items-center justify-center">
          <FiEye className="w-4 h-4 text-white" />
          {stats.isLive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          )}
        </div>

        {/* Counter & Label */}
        <div className="flex items-baseline gap-1.5 font-mono text-xs sm:text-sm">
          {isLoading && stats.count === null ? (
            <div className="h-4 w-10 bg-white/30 rounded animate-pulse" />
          ) : (
            <span className="font-extrabold tracking-tight text-white">
              {displayCount}
            </span>
          )}
          <span className="text-[10px] sm:text-[11px] text-white/90 font-sans font-semibold uppercase tracking-wider">
            Visitors
          </span>
        </div>
      </motion.div>
    </aside>
  );
}
