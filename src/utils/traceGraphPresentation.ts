/**
 * Presentation-layer constants and utilities for the trace graph overlay.
 * Handles colors, node dimensions, and text rendering concerns.
 * Kept separate from traceGraphLayout.ts so the layout engine has no
 * dependency on presentation decisions.
 */

import type { GraphNodeType } from "@/types/traceability.types.js";

// ── Node dimensions ────────────────────────────────────────────────────────────

export const NODE_W: Record<GraphNodeType, number> = {
  DIVISION: 220,
  TEAM: 200,
  MEMBER: 190,
  MR: 180,
};

export const NODE_H: Record<GraphNodeType, number> = {
  DIVISION: 88,
  TEAM: 82,
  MEMBER: 74,
  MR: 82,
};

// ── Colors ─────────────────────────────────────────────────────────────────────

export const GRAPH_COLORS = {
  DIVISION: {
    fill: '#F5F0FF', stroke: '#8B5CF6', text: '#5B21B6', badge: '#EDE9FE',
  },
  TEAM: {
    fill: '#ECFDF5', stroke: '#10B981', text: '#065F46', badge: '#D1FAE5',
  },
  MEMBER: {
    fill: '#EFF6FF', stroke: '#3B82F6', text: '#1E40AF', badge: '#DBEAFE',
  },
  MR: {
    fill: '#FFFBEB', stroke: '#F59E0B', text: '#92400E', badge: '#FEF3C7',
  },
} as const;

// ── Text helpers ───────────────────────────────────────────────────────────────

// CJK characters are ~1.7x wider than Latin at the same font size.
// Estimate: Latin/digit ~7px, CJK (Korean/Chinese/Japanese) ~12px at 11px font.
const CJK_REGEX = /[\u3000-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;

export function truncateText(text: string, maxWidth: number): string {
  let estimatedWidth = 0;
  for (let i = 0; i < text.length; i++) {
    estimatedWidth += CJK_REGEX.test(text[i]) ? 12 : 7;
    if (estimatedWidth > maxWidth) {
      return text.slice(0, Math.max(1, i)) + '…';
    }
  }
  return text;
}
