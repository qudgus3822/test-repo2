/**
 * Custom hook for SVG pan and zoom.
 * Uses mutable refs to avoid re-renders on every mouse movement.
 *
 * Critical: wheel event is a native listener (not React synthetic) so we can
 * call preventDefault() to stop page scroll -- React's synthetic onWheel is
 * passive by default and does NOT support preventDefault.
 */

import { useState, useRef, useCallback, useEffect } from "react";

interface UseGraphPanZoomReturn {
  /** SVG transform string: "translate(x,y) scale(z)" */
  transformStr: string;
  /** Current zoom level (0.2 - 3.0) */
  zoomLevel: number;
  /** Attach these to the canvas wrapper div */
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitContent: (contentWidth: number, contentHeight: number) => void;
  isPanning: boolean;
  /** Returns true if the user has panned/zoomed since the last programmatic fitContent call. */
  isUserZoomed: () => boolean;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3.0;

export function useGraphPanZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseGraphPanZoomReturn {
  // Mutable state -- does NOT trigger re-renders on mouse move
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const lastTouchesRef = useRef<React.Touch[] | null>(null);

  // Snapshot of the last values fitContent wrote. Null means "never fit".
  // Used to detect whether the user has panned/zoomed since the last programmatic fit.
  const lastProgrammaticRef = useRef<{ zoom: number; panX: number; panY: number } | null>(null);

  // Render state -- only updated by zoom/fit operations or after pan ends
  const [transformStr, setTransformStr] = useState("translate(0,0) scale(1)");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  // raf for smooth pan updates during drag
  const rafRef = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    const str = `translate(${panRef.current.x},${panRef.current.y}) scale(${zoomRef.current})`;
    setTransformStr(str);
    setZoomLevel(zoomRef.current);
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyTransform();
    });
  }, [applyTransform]);

  // Cleanup raf on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Native wheel listener with { passive: false } so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * delta));

      if (newZoom === zoomRef.current) return;

      // Zoom toward mouse cursor position
      const svgMouseX = (mouseX - panRef.current.x) / zoomRef.current;
      const svgMouseY = (mouseY - panRef.current.y) / zoomRef.current;

      zoomRef.current = newZoom;
      panRef.current.x = mouseX - svgMouseX * newZoom;
      panRef.current.y = mouseY - svgMouseY * newZoom;

      scheduleUpdate();
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [containerRef, scheduleUpdate]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Do not start panning when clicking on graph nodes or edges
    if ((e.target as Element).closest(".node-group,.edge")) return;

    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panOriginRef.current = { x: panRef.current.x, y: panRef.current.y };
    setIsPanning(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    panRef.current.x = panOriginRef.current.x + (e.clientX - panStartRef.current.x);
    panRef.current.y = panOriginRef.current.y + (e.clientY - panStartRef.current.y);
    scheduleUpdate();
  }, [scheduleUpdate]);

  const onMouseUp = useCallback(() => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  // Touch handlers for pinch-to-zoom and single-touch pan
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    lastTouchesRef.current = Array.from(e.touches);
    if (e.touches.length === 1) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panOriginRef.current = { x: panRef.current.x, y: panRef.current.y };
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanningRef.current) {
      panRef.current.x = panOriginRef.current.x + (e.touches[0].clientX - panStartRef.current.x);
      panRef.current.y = panOriginRef.current.y + (e.touches[0].clientY - panStartRef.current.y);
      scheduleUpdate();
    } else if (e.touches.length === 2 && lastTouchesRef.current && lastTouchesRef.current.length === 2) {
      // Pinch to zoom
      const prevDist = Math.hypot(
        lastTouchesRef.current[0].clientX - lastTouchesRef.current[1].clientX,
        lastTouchesRef.current[0].clientY - lastTouchesRef.current[1].clientY,
      );
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (prevDist > 0) {
        const scale = newDist / prevDist;
        zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * scale));
        scheduleUpdate();
      }
      lastTouchesRef.current = Array.from(e.touches);
    }
  }, [scheduleUpdate]);

  const onTouchEnd = useCallback(() => {
    isPanningRef.current = false;
    lastTouchesRef.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    zoomRef.current = Math.min(MAX_ZOOM, zoomRef.current * 1.25);
    applyTransform();
  }, [applyTransform]);

  const zoomOut = useCallback(() => {
    zoomRef.current = Math.max(MIN_ZOOM, zoomRef.current * 0.8);
    applyTransform();
  }, [applyTransform]);

  const resetView = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    applyTransform();
  }, [applyTransform]);

  const fitContent = useCallback((contentWidth: number, contentHeight: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = rect.width / (contentWidth + 60);
    const scaleY = rect.height / (contentHeight + 60);
    zoomRef.current = Math.min(scaleX, scaleY, 1.2);
    panRef.current.x = (rect.width - contentWidth * zoomRef.current) / 2;
    panRef.current.y = (rect.height - contentHeight * zoomRef.current) / 2;
    // Snapshot the values we just programmed so isUserZoomed can detect user divergence.
    lastProgrammaticRef.current = {
      zoom: zoomRef.current,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    applyTransform();
  }, [containerRef, applyTransform]);

  // Returns true if the user has panned or zoomed since the last programmatic fitContent call.
  // False if fitContent was never called or if live values still match the last programmatic snapshot.
  const isUserZoomed = useCallback((): boolean => {
    const p = lastProgrammaticRef.current;
    if (!p) return false;
    const eps = 1e-3;
    return (
      Math.abs(zoomRef.current - p.zoom) > eps ||
      Math.abs(panRef.current.x - p.panX) > eps ||
      Math.abs(panRef.current.y - p.panY) > eps
    );
  }, []);

  return {
    transformStr,
    zoomLevel,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    zoomIn,
    zoomOut,
    resetView,
    fitContent,
    isPanning,
    isUserZoomed,
  };
}
