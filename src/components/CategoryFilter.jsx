/**
 * CategoryFilter Component for VCET Tech Hub
 * Displays dynamic filter pills with active state and smooth transitions.
 * Palette: VCET Blue (#0062A8), Dark Gray (#444445), Light Gray (#C9C9C9), White (#FFFFFF)
 */

import React from "react";

const DEFAULT_CATEGORIES = [
  "All",
  "AI",
  "Programming",
  "Cybersecurity",
  "Cloud",
  "Career",
  "Aptitude",
  "Technology News",
  "Research",
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
}) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2 select-none">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0062A8] ${
              isSelected
                ? "bg-[#0062A8] text-white shadow-sm font-bold scale-[1.02]"
                : "bg-white text-[#444445] hover:bg-[#F4F4F4] border border-[#C9C9C9] hover:border-[#0062A8]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
