import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VisitorCounter from "../components/VisitorCounter";
import ScrollToTop from "../components/ScrollToTop";
import VcetBanner from "../components/VcetBanner";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#444445] selection:bg-[#0062A8] selection:text-white font-sans relative">
      <ScrollToTop />
      <Navbar />
      <VcetBanner />

      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <VisitorCounter />
      <Footer />
    </div>
  );
}
