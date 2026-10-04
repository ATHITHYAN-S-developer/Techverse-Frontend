import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../components/dashboard/useDashboardData";
import WelcomeHero from "../components/dashboard/WelcomeHero";
import MetricStrip from "../components/dashboard/MetricStrip";
import CourseLedger from "../components/dashboard/CourseLedger";
import CircularsWidget from "../components/dashboard/CircularsWidget";
import PrepZoneBand from "../components/dashboard/PrepZoneBand";
import ProfilePage from "./ProfilePage";
import { fadeUp } from "../components/dashboard/motion";

export default function DashboardPage() {
  const { user, streak, gamificationLoading } = useAuth();
  const location = useLocation();
  const { courses, announcements, certificatesCount, loading } =
    useDashboardData();
  const reduceMotion = useReducedMotion();

  // `/api/courses` returns the whole published catalog, not the student's own
  // courses, so this has to be derived from the enrollment on each row. Counting
  // the catalog instead reported 5 "active courses" to a student enrolled in 2.
  const enrolledCourses = courses.filter((course) => Boolean(course.enrollment));
  const activeCourses = enrolledCourses.filter(
    (course) => (course.progress || 0) < 100
  ).length;

  useEffect(() => {
    if (location.hash === "#profile") {
      document.getElementById("profile")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-full bg-profile-paper font-body">
      <WelcomeHero user={user} streak={streak} />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <MetricStrip
          streak={streak}
          activeCourses={activeCourses}
          certificatesCount={certificatesCount}
          loading={loading}
          gamificationLoading={gamificationLoading}
        />

        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-3 lg:gap-10">
          <motion.div
            className="space-y-10 lg:col-span-2"
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <CourseLedger courses={courses} loading={loading} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <PrepZoneBand />
            </motion.div>
          </motion.div>

          <motion.aside
            className="space-y-10"
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <CircularsWidget announcements={announcements} loading={loading} />
            </motion.div>
          </motion.aside>
        </div>
      </div>

      <ProfilePage embedded />
    </div>
  );
}
