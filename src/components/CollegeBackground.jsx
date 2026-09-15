/**
 * College Background Slideshow Component for VCET Tech Hub
 * Implements continuous cinematic slow zoom + crossfade between real VCET campus images
 * Timing: 6 seconds per slide with smooth 2.2s crossfade
 * Layer 1: Campus Image | Layer 2: Dark Gray (#444445) + VCET Blue (#0062A8) Overlay
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import campus1 from "../assets/college/campus-01.jpg";
import campus2 from "../assets/college/campus-02.jpg";
import campus3 from "../assets/college/campus-03.jpg";
import campus4 from "../assets/college/campus-04.jpg";
import campus5 from "../assets/college/campus-05.jpg";
import campus6 from "../assets/college/campus-06.jpg";
import campus7 from "../assets/college/campus-07.jpg";
import campus8 from "../assets/college/campus-08.jpg";
import campus9 from "../assets/college/campus-09.jpg";
import campus10 from "../assets/college/campus-10.jpg";
import campus11 from "../assets/college/campus-11.jpg";
import campus12 from "../assets/college/campus-12.jpg";
import campus13 from "../assets/college/campus-13.jpg";
import campus14 from "../assets/college/campus-14.jpg";
import campus15 from "../assets/college/campus-15.jpg";
import campus16 from "../assets/college/campus-16.jpg";
import campus17 from "../assets/college/campus-17.jpg";
import campus18 from "../assets/college/campus-18.jpg";

const CAMPUS_IMAGES = [
  { src: campus1, alt: "VCET Campus - Main Academic Block" },
  { src: campus2, alt: "VCET Campus - Engineering Quadrangle" },
  { src: campus3, alt: "VCET Campus - Administrative Complex" },
  { src: campus4, alt: "VCET Campus - Research & Innovation Center" },
  { src: campus5, alt: "VCET Campus - Central Technology Labs" },
  { src: campus6, alt: "VCET Campus - Computing & Network Hub" },
  { src: campus7, alt: "VCET Campus - Central Library & Learning Hub" },
  { src: campus8, alt: "VCET Campus - Smart Seminar Halls" },
  { src: campus9, alt: "VCET Campus - Auditorium & Events Center" },
  { src: campus10, alt: "VCET Campus - Sports & Athletics Complex" },
  { src: campus11, alt: "VCET Campus - Student Innovation Spaces" },
  { src: campus12, alt: "VCET Campus - Advanced Robotics Lab" },
  { src: campus13, alt: "VCET Campus - Mechanical & Mechatronics Workshops" },
  { src: campus14, alt: "VCET Campus - Electronics & IoT Laboratories" },
  { src: campus15, alt: "VCET Campus - Green Campus & Walkways" },
  { src: campus16, alt: "VCET Campus - Academic Courtyard" },
  { src: campus17, alt: "VCET Campus - Modern Classroom Facilities" },
  { src: campus18, alt: "VCET Campus - Engineering Entrance" },
];

const SLIDE_INTERVAL_MS = 6500; // 6.5s per image as per prompt (5-7 seconds)

export default function CollegeBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAMPUS_IMAGES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const currentImage = CAMPUS_IMAGES[currentIndex];

  return (
    <div className="absolute inset-0 [clip-path:inset(0)] overflow-hidden pointer-events-none select-none z-0">
      {/* Fixed Viewport Layer for Motionless Background while Scrolling */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        {/* Layer 1: Continuous Crossfade + Slow Zoom Slideshow */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.0 }}
            animate={{ opacity: 1, scale: 1.08 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2.2, ease: "easeInOut" },
              scale: { duration: 7.5, ease: "easeOut" },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentImage.src})`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Layer 2: Balanced Lighter Overlay (~0.40-0.48) with clear center reveal */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-[#0062A8]/12 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55 pointer-events-none" />
      </div>
    </div>
  );
}

