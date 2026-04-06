import { useState, useCallback } from "react";
import type { TraceOverlayContext } from "@/types/traceability.types";

/**
 * Manages trace overlay open/close state and the current trace context.
 * Follows the `useDetailModal` pattern exactly.
 *
 * Context is cleared immediately in closeOverlay (not after animation) to
 * prevent stale data flash on reopen. The useModalAnimation hook's shouldRender
 * flag controls rendering during the exit animation.
 */
export const useTraceOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<TraceOverlayContext | null>(null);

  const openOverlay = useCallback((ctx: TraceOverlayContext) => {
    setContext(ctx);
    setIsOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOpen(false);
    // Clear context immediately on close.
    // This prevents stale data flash on reopen.
    // The animation hides the flash because `shouldRender` in useModalAnimation
    // controls whether the component renders at all -- once shouldRender becomes
    // false (after exit animation), the component unmounts. When it remounts on
    // next open, it gets fresh context.
    setContext(null);
  }, []);

  return {
    isOpen,
    context,
    openOverlay,
    closeOverlay,
  };
};
