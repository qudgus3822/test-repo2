import { forwardRef } from "react";
import type { PositionedEdge } from "@/types/traceability.types.js";
import { COUNT_UNITS } from "@/utils/traceGraphPresentation.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Safe toFixed that guards against NaN / Infinity values from missing metric data.
 * Returns '-' as a missing-data sentinel so the tooltip clearly signals absent data
 * rather than silently displaying a misleading zero.
 */
function safeFixed(val: number, digits: number): string {
  return Number.isFinite(val) ? val.toFixed(digits) : '-';
}

/**
 * Formats tooltip lines using adaptive display logic:
 *
 * - equal cascade (MR equal distribution): shows "균등 배분 1/N = pct%"
 * - siblingsSameCount (common case): shows "rawValue / sum(rawValue) = pct%"
 *   because count cancels out algebraically when all siblings share the same count.
 * - different counts (rare -- members with different active periods or measurement
 *   windows, e.g. a new hire with 10 days vs. 22 for others): explicitly decomposes
 *   the multiplication to explain WHY the percentage is calculated that way.
 */
function formatTooltipLines(edge: PositionedEdge, rawUnit: string): { line1: string; line2: string } {
  const { tooltip, weight } = edge;
  const { weightStrategy, numerator, denominator, siblingsSameCount, rawValue, count, countLabel, rawValueSum } = tooltip;
  const pct = Math.round(weight * 100);

  if (weightStrategy === 'equal') {
    return {
      line1: '기여: 균등 배분',
      line2: `1 / 전체(${denominator}) = ${pct}%`,
    };
  }

  if (siblingsSameCount) {
    // Count cancels out: show rawValue / sum(rawValue) directly
    const rv = safeFixed(rawValue, 2);
    const rvSum = safeFixed(rawValueSum, 2);
    return {
      line1: `기여: ${rv}${rawUnit}`,
      line2: `${rv}${rawUnit} / 전체(${rvSum}${rawUnit}) = ${pct}%`,
    };
  }

  // Different counts: decompose the multiplication so users understand
  // why the displayed numbers differ from the raw per-person values
  const rv = safeFixed(rawValue, 2);
  const countUnit = COUNT_UNITS[countLabel] ?? '건';
  const product = safeFixed(numerator, 0);
  const den = safeFixed(denominator, 0);
  return {
    line1: `기여: ${rv}${rawUnit} × ${count}${countUnit}`,
    line2: `${product}${rawUnit} / 전체(${den}${rawUnit}) = ${pct}%`,
  };
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface EdgeTooltipProps {
  visible: boolean;
  edge: PositionedEdge | null;
  rawUnit: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * Cursor-following tooltip for edge contribution rate badges.
 * Position is updated imperatively via the forwarded ref to avoid re-renders on mousemove.
 * Only re-renders when visible or edge changes (mouseenter/mouseleave events).
 */
export const EdgeTooltip = forwardRef<HTMLDivElement, EdgeTooltipProps>(
  ({ visible, edge, rawUnit }, ref) => {
    if (!visible || !edge) {
      return (
        <div
          ref={ref}
          className="absolute pointer-events-none hidden z-[100]"
        />
      );
    }

    const { line1, line2 } = formatTooltipLines(edge, rawUnit);

    return (
      <div
        ref={ref}
        className="absolute pointer-events-none z-[100] bg-white border border-gray-200 rounded shadow-md px-3 py-2 text-xs"
      >
        <div className="text-gray-600 mb-0.5">
          {edge.parentLabel} → {edge.childLabel}
        </div>
        <div className="font-semibold text-gray-800 mb-0.5">{line1}</div>
        <div className="text-gray-500 font-mono">{line2}</div>
      </div>
    );
  },
);

EdgeTooltip.displayName = 'EdgeTooltip';
