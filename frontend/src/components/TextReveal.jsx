import React from "react";
import { motion } from "framer-motion";

/**
 * TextReveal Component
 * Premium staggered word-by-word reveal animation with exponential easing.
 */
export default function TextReveal({
  text,
  className = "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white",
  delay = 0.15,
  as = "h1",
}) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: "110%",
      rotateX: -40,
    },
    visible: {
      opacity: 1,
      y: "0%",
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const MotionComponent = motion[as] || motion.h1;

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-wrap gap-x-2.5 gap-y-1 ${className}`}
      style={{ perspective: 1000 }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden py-0.5">
          <motion.span variants={wordVariants} className="inline-block will-change-transform">
            {word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}
