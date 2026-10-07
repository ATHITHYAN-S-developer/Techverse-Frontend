/**
 * HomePage Component for VCET Tech Hub (TechVerse)
 * Includes the campus slideshow hero and the four resource domains.
 */

import React, { useState, useEffect, useCallback } from "react";
import { AlertOctagon } from "lucide-react";
import Hero from "../components/Hero";
import Domains from "../sections/Domains";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { resourceService } from "../services/resourceService";

function DomainsSkeleton() {
  return (
    <section aria-hidden="true" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="h-8 w-64 rounded-lg bg-vcet-surface animate-pulse" />
      <div className="mt-4 h-4 w-96 max-w-full rounded bg-vcet-surface animate-pulse" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl border border-vcet-line bg-vcet-surface animate-pulse" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [resources, setResources] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const fetchResources = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await resourceService.getAllResources();
      setResources(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch (e) {
      console.warn("Error fetching homepage resources:", e);
      setResources([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <div className="flex-grow">
      {/* 1. Hero Showcase with Continuous VCET Campus Background Slideshow */}
      <Hero />

      {/* 2. Four Main Resource Domains */}
      {status === "loading" && <DomainsSkeleton />}

      {status === "error" && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
          <EmptyState
            icon={AlertOctagon}
            title="We couldn't load the resource counts"
            description="The resource service didn't respond. You can retry, or continue browsing the site — the hero and navigation still work."
            action={
              <button
                type="button"
                onClick={fetchResources}
                className="rounded-xl bg-vcet-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vcet-blue-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vcet-blue focus-visible:ring-offset-2"
              >
                Retry
              </button>
            }
          />
        </section>
      )}

      {status === "ready" && <Domains resources={resources} />}
    </div>
  );
}
