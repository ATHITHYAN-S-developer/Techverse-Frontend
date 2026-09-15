/**
 * Dedicated Page: Tech Explorer (Websites to Improve Tech Knowledge)
 * Path: /technology
 * Alternating full-width scrollytelling vertical list view.
 */

import React from "react";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function TechnologyPage() {
  const techResources = RESOURCES.filter((item) => item.type === "technology");

  return (
    <ResourceListView
      resources={techResources}
      pageTitle="Tech Explorer — Websites to Improve Tech Knowledge"
    />
  );
}
