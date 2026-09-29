import React from "react";
import { motion } from "framer-motion";

export function TextReveal({ text, className = "", delay = 0, as = "h1" }) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i }
    })
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 100
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(6px)",
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 100
      }
    }
  };

  const Tag = motion[as] || motion.h1;

  return (
    <Tag
      className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block transform-gpu"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

export function FadeInUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
