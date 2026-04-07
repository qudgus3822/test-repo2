import { memo } from "react";
import type { MouseEvent } from "react";
import { GRAPH_COLORS } from "@/utils/traceGraphPresentation.js";
import type { PositionedEdge } from "@/types/traceability.types.js";

interface GraphEdgeProps {
  edge: PositionedEdge;
  onMouseEnter?: (edge: PositionedEdge) => void;
  onMouseLeave?: () => void;
  onMouseMove?: (e: MouseEvent) => void;
}

/**
 * Renders a single SVG bezier curve edge from parent right edge to child left edge.
 * Badge is shown for all multi-child edges (siblingCount > 1) regardless of weight value.
 * Single children (siblingCount=1) do not show a badge since 100% is implied.
 */
export const GraphEdge = memo(({ edge, onMouseEnter, onMouseLeave, onMouseMove }: GraphEdgeProps) => {
  const colors = GRAPH_COLORS[edge.parentType];
  const midX = edge.x1 + (edge.x2 - edge.x1) * 0.5;
  const midY = (edge.y1 + edge.y2) / 2;

  const isMultiChild = edge.tooltip.siblingCount > 1;
  const strokeWidth = isMultiChild
    ? Math.max(1.5, edge.weight * 6)
    : 2;
  const opacity = isMultiChild
    ? Math.max(0.4, 0.25 + edge.weight * 0.55)
    : 0.6;
  const showBadge = isMultiChild;

  const badgeText = `${Math.round(edge.weight * 100)}%`;
  const badgeWidth = Math.max(32, badgeText.length * 7 + 8);

  const d = `M${edge.x1} ${edge.y1} C${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`;

  return (
    <g className="edge" style={{ opacity }}>
      <path
        d={d}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {showBadge && (
        <g
          className="cursor-pointer"
          onMouseEnter={() => onMouseEnter?.(edge)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <rect
            x={midX - badgeWidth / 2}
            y={midY - 9}
            width={badgeWidth}
            height={18}
            rx={9}
            fill={colors.badge}
            stroke={colors.stroke}
            strokeWidth={0.5}
          />
          <text
            x={midX}
            y={midY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill={colors.text}
            fontWeight={500}
            fontFamily="monospace"
          >
            {badgeText}
          </text>
        </g>
      )}
    </g>
  );
});

GraphEdge.displayName = "GraphEdge";
