/**
 * Dedicated Page: Tech Vision (Tech YouTube Channels)
 * Path: /youtube
 * Alternating full-width scrollytelling vertical list view.
 */

import React from "react";
import { RESOURCES } from "../data/resources";
import ResourceListView from "../components/ResourceListView";

export default function YouTubePage() {
  const youtubeResources = RESOURCES.filter((item) => item.type === "youtube");

  return (
    <ResourceListView
      resources={youtubeResources}
      pageTitle="Tech Vision — Tech YouTube Channels"
    />
  );
}
