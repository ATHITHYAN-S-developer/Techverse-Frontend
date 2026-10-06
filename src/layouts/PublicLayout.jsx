import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VisitorCounter from "../components/VisitorCounter";
import ScrollToTop from "../components/ScrollToTop";
import VcetBanner from "../components/VcetBanner";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-vcet-dark selection:bg-vcet-blue selection:text-white font-sans relative">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-vcet-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <VcetBanner />

      <main id="main-content" className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <VisitorCounter />
      <Footer />
    </div>
  );
}
