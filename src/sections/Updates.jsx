/**
 * Updates Apps Section Component for VCET Tech Hub
 * #updates
 */

import React from "react";
import { motion } from "framer-motion";
import { FaBell } from "react-icons/fa";
import ResourceCard from "../components/ResourceCard";

export default function Updates({ resources }) {
  const updateResources = resources.filter((item) => item.type === "updates");

  return (
    <section
      id="updates"
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-vcet-gray-light/60 border-b border-vcet-gray-border/60 scroll-mt-16 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vcet-blue/10 text-vcet-blue text-xs uppercase tracking-widest font-bold mb-3">
              <FaBell size={13} />
              <span>Section 02 • Real-Time Feeds</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-vcet-dark tracking-tight mb-2">
              Tech Pulse — Apps for Tech Updates
            </h2>
            <p className="text-sm sm:text-base text-vcet-dark/80 max-w-xl font-normal leading-relaxed">
              Catch the latest technology news, AI developments, industry trends and innovations.
            </p>
          </div>

          <div className="text-xs uppercase tracking-wider font-bold text-vcet-dark bg-white px-4 py-2 rounded-xl border border-vcet-gray-border/70 self-start md:self-auto">
            AI News • Dev Discussions • Tech Alerts
          </div>
        </div>

        {/* Resources Grid */}
        {updateResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {updateResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-vcet-gray-border">
            <p className="text-vcet-dark text-sm">
              No tech update resources match the current filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
