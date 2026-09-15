/**
 * Dedicated Page: Tech Pulse (Apps for Tech Updates)
 * Path: /updates
 * Alternating full-width scrollytelling vertical list view.
 */

import React from "react";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function UpdatesPage() {
  const updateResources = RESOURCES.filter((item) => item.type === "updates");

  return (
    <ResourceListView
      resources={updateResources}
      pageTitle="Tech Pulse — Apps for Tech Updates"
    />
  );
}
