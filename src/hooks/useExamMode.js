import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useExamMode Hook
 * Enforces fullscreen, anti-copy/paste, tab-switch and blur detection,
 * tracks violation counts, and triggers callbacks.
 */
export function useExamMode({
  isActive = false,
  maxViolations = 3,
  onAutoSubmit,
  onViolationRecorded,
  enableAntiCopy = true,
  enableAntiPaste = true,
  enableFullscreen = true,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState([]);
  const [latestViolation, setLatestViolation] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const isAutoSubmittingRef = useRef(false);

  // Request browser fullscreen mode
  const enterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn("Fullscreen request declined or not supported:", err);
      return false;
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
      setIsFullscreen(false);
    } catch (err) {
      // Ignored
    }
  }, []);

  // Record a security event violation
  const triggerViolation = useCallback(
    (type, details = "") => {
      if (!isActive || isAutoSubmittingRef.current) return;

      const newViolation = {
        type,
        timestamp: new Date().toISOString(),
        details,
      };

      setViolations((prev) => {
        const nextViolations = [...prev, newViolation];
        const count = nextViolations.length;

        setLatestViolation({
          ...newViolation,
          count,
          maxViolations,
          isFinalStrike: count >= maxViolations,
        });
        setShowWarningModal(true);

        if (onViolationRecorded) {
          onViolationRecorded(type, details, count);
        }

        // Automatic submission on reaching threshold
        if (count >= maxViolations) {
          isAutoSubmittingRef.current = true;
          if (onAutoSubmit) {
            setTimeout(() => {
              onAutoSubmit(nextViolations, "auto_violation");
            }, 1000);
          }
        }

        return nextViolations;
      });
    },
    [isActive, maxViolations, onAutoSubmit, onViolationRecorded]
  );

  // Event Listeners for Exam Mode Security
  useEffect(() => {
    if (!isActive) return;

    // 1. Fullscreen Change Handler
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && enableFullscreen) {
        triggerViolation("FULLSCREEN_EXIT", "Student exited fullscreen mode during exam session.");
      }
    };

    // 2. Tab Switch & Visibility Change Handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("TAB_SWITCH", "Student switched tab or minimized browser window.");
      }
    };

    // 3. Window Blur Handler (Focus loss)
    const handleWindowBlur = () => {
      triggerViolation("WINDOW_BLUR", "Browser window lost focus.");
    };

    // 4. Clipboard Restrictions
    const handleCopy = (e) => {
      if (enableAntiCopy) {
        e.preventDefault();
        triggerViolation("COPY_ATTEMPT", "Clipboard copy action was intercepted and blocked.");
      }
    };

    const handlePaste = (e) => {
      if (enableAntiPaste) {
        // Intercept paste but don't break code typing if not standard paste
        e.preventDefault();
        triggerViolation("PASTE_ATTEMPT", "Clipboard paste action was intercepted and blocked.");
      }
    };

    const handleCut = (e) => {
      if (enableAntiCopy) {
        e.preventDefault();
        triggerViolation("CUT_ATTEMPT", "Clipboard cut action was intercepted and blocked.");
      }
    };

    // 5. Context Menu (Right Click) Restriction
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation("CONTEXT_MENU", "Right-click context menu was intercepted and blocked.");
    };

    // Attach listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    isActive,
    enableFullscreen,
    enableAntiCopy,
    enableAntiPaste,
    triggerViolation,
  ]);

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
    if (!isFullscreen && enableFullscreen) {
      enterFullscreen();
    }
  }, [isFullscreen, enableFullscreen, enterFullscreen]);

  return {
    isFullscreen,
    violations,
    violationCount: violations.length,
    latestViolation,
    showWarningModal,
    dismissWarning,
    enterFullscreen,
    exitFullscreen,
    triggerViolation,
  };
}
