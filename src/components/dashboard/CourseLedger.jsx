import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
import ProgressRule from "./ProgressRule";
import SectionHeading from "./SectionHeading";
import { fadeUp, staggerParent } from "./motion";

/**
 * Courses as ledger rows rather than cards: title and instructor on the left, a
 * thin progress rule and the CTA on the right, rows divided by hairlines.
 *
 * Only courses the student is actually enrolled in are listed. `/api/courses`
 * returns the whole published catalog, so an unenrolled course arrives with
 * `enrollment: null` and `progress: 0` and must not be presented as theirs.
 */
export default function CourseLedger({ courses, loading }) {
  const reduceMotion = useReducedMotion();

  const enrolled = (courses || []).filter((course) => Boolean(course.enrollment));

  return (
    <section>
      <SectionHeading
        aside={
          <Link
            to="/courses"
            className="text-xs font-medium text-profile-ink/50 transition-colors hover:text-profile-main"
          >
            View all courses
          </Link>
        }
      >
        Enrolled Courses &amp; Modules
      </SectionHeading>

      {loading ? (
        <div className="divide-y divide-profile-rule border-t border-profile-rule">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-6 py-5">
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-24 rounded bg-profile-ink/8" />
                <div className="h-3.5 w-2/3 rounded bg-profile-ink/8" />
              </div>
              <div className="h-[3px] w-24 rounded-full bg-profile-ink/8" />
            </div>
          ))}
        </div>
      ) : enrolled.length === 0 ? (
        <EmptyCourses />
      ) : (
        <motion.ul
          className="divide-y divide-profile-rule border-t border-profile-rule"
          variants={staggerParent(0.07)}
          initial="hidden"
          animate="visible"
        >
          {enrolled.slice(0, 4).map((course, index) => (
            <CourseRow
              key={course._id || course.id}
              course={course}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.ul>
      )}
    </section>
  );
}

function CourseRow({ course, index, reduceMotion }) {
  const id = course._id || course.id;
  const progress = Math.max(0, Math.min(100, Math.round(course.progress || 0)));
  const status = course.enrollment?.status;
  const done = course.enrollment?.completedModulesCount ?? 0;
  const total = course.totalModules ?? course.modulesCount ?? 0;
  const isComplete = status === "completed" || progress >= 100;

  return (
    <motion.li variants={fadeUp} className="group relative">
      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-profile-ink">
              {course.category || "Engineering"}
            </p>
            {isComplete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Completed
              </span>
            )}
          </div>

          <h3 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-profile-ink transition-colors group-hover:text-profile-main">
            <Link to={`/courses/${id}`} className="before:absolute before:inset-0">
              {course.title}
            </Link>
          </h3>

          <p className="mt-1 text-xs text-profile-ink/45">
            {course.instructor || "VCET Faculty"}
            {total > 0 && (
              <span className="text-profile-ink/30">
                {" "}
                &middot; {done} of {total} modules
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5 sm:w-64">
          <div className="flex-1">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-profile-ink/40">
                Progress
              </span>
              <span className="font-serif text-xs font-semibold tabular-nums text-profile-ink">
                {progress}%
              </span>
            </div>
            <ProgressRule value={progress} delay={index * 120} reduceMotion={reduceMotion} />
          </div>

          {/* Whole-row link target lives on the title, so this CTA only carries
              the label and sits above it via z-index. */}
          <span className="relative z-10 shrink-0 whitespace-nowrap rounded-full border border-profile-rule px-4 py-2 text-xs font-semibold text-profile-ink transition-colors duration-300 group-hover:border-profile-main group-hover:bg-profile-main group-hover:text-white">
            {isComplete ? "Review" : progress > 0 ? "Resume" : "Start"}
          </span>
        </div>
      </div>
    </motion.li>
  );
}

function EmptyCourses() {
  return (
    <div className="border-t border-profile-rule py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-profile-main/10">
        <BookOpen className="h-5 w-5 text-profile-ink" />
      </span>
      <h3 className="mt-4 font-serif text-sm font-semibold text-profile-ink">
        No enrolled courses yet
      </h3>
      <p className="mx-auto mt-1.5 max-w-xs text-xs text-profile-ink/45">
        Explore institutional courses to start learning and earn certificates.
      </p>
      <Link
        to="/courses"
        className="group mt-5 inline-flex items-center gap-2 rounded-full bg-profile-main px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-profile-hover"
      >
        Explore course catalog
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
