import React from "react";
import { useLocation } from "react-router-dom";

// Pages where the VCET marquee should NOT appear
const HIDDEN_PATHS = [];


export default function AnnouncementMarquee() {
  const location = useLocation();

  // Hide on courses and prepzone pages (including sub-routes like /courses/:id)
  const isHidden = HIDDEN_PATHS.some((path) => location.pathname.startsWith(path));
  if (isHidden) return null;

  return (
    <>
      <style>{`
        .vcet-marquee-strip {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
          height: 48px;
          display: flex;
          align-items: center;
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
          z-index: 30;
        }

        .vcet-marquee-content {
          display: flex;
          align-items: center;
          gap: 32px;
          animation: vcetMarqueeScroll 20s linear infinite;
          will-change: transform;
          width: max-content;
        }

        .vcet-marquee-text {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0.25em;
          color: rgba(0, 98, 168, 0.12);
          line-height: 1;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          text-transform: uppercase;
        }

        .vcet-marquee-bullet {
          font-size: 14px;
          color: rgba(0, 98, 168, 0.25);
          line-height: 1;
        }

        @keyframes vcetMarqueeScroll {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>


      <div className="vcet-marquee-strip" aria-hidden="true">
        <div className="vcet-marquee-content">
          {Array.from({ length: 20 }).map((_, idx) => (
            <React.Fragment key={idx}>
              <span className="vcet-marquee-text">VCET</span>
              <span className="vcet-marquee-bullet">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
