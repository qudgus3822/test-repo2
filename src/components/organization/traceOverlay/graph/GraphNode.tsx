import { memo } from "react";
import { GRAPH_COLORS, truncateText } from "@/utils/traceGraphPresentation.js";
import { formatMetricValue, formatCount } from "@/utils/traceability.js";
import type {
  PositionedNode,
  MetricInfo,
} from "@/types/traceability.types.js";

// ── Node content Y-offset grid ────────────────────────────────────────────────
//
// All Y positions below are relative to node.y (top-left corner of the node).
// The grid is designed around the node heights defined in traceGraphPresentation.ts:
//   DIVISION: 88px  TEAM: 82px  MEMBER: 74px  MR_SUMMARY: 36px
//
// DIVISION / TEAM / MEMBER nodes (rx=12 rounded rect):
//   node.y + Y_LABEL             Label text (name) -- centered at row 1
//   node.y + Y_SUBLABEL          Sub-label text (employee ID for MEMBER) -- centered at row 2
//   node.y + Y_METRICS           Metrics row when no sub-label (DIVISION/TEAM)
//   node.y + Y_METRICS_WITH_SUB  Metrics row when sub-label present (MEMBER)
//   node.x + X_PADDING           Horizontal indent for all left-aligned text

const Y_LABEL = 20;
const Y_SUBLABEL = 38;
const Y_METRICS = 40;
const Y_METRICS_WITH_SUB = 56;
const X_PADDING = 14;

interface GraphNodeProps {
  node: PositionedNode;
  metricInfo: MetricInfo;
  onClick: (nodeId: string) => void;
  isSelected?: boolean;
  onDetailClick?: (nodeId: string) => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const TagBadge = ({
  x,
  y,
  tag,
  colors,
}: {
  x: number;
  y: number;
  tag: string;
  colors: { badge: string; text: string };
}) => {
  const width = tag.length * 8 + 10; // ~8px per char at fontSize 10, plus 10px horizontal padding
  const tx = x - width; // right-aligned
  return (
    <>
      <rect
        x={tx}
        y={y - 9}
        width={width}
        height={18}
        rx={4}
        fill={colors.badge}
      />
      <text
        x={tx + width / 2}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill={colors.text}
        fontWeight={500}
      >
        {tag}
      </text>
    </>
  );
};

// ── Metric formatting helpers ──────────────────────────────────────────────────

/**
 * Formats a numeric value for compact node display.
 * Integers are returned without decimals; all other values are fixed to 2 decimal places.
 * Note: toFixed(2) always produces exactly 2 decimal digits (e.g. "1.50", not "1.5").
 *
 * Local helper — intentionally not shared since MetricsRow is the only consumer.
 */
function formatToTwoDecimals(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

const MetricsRow = ({
  node,
  metricInfo,
  colors,
}: {
  node: PositionedNode;
  metricInfo: MetricInfo;
  colors: { text: string };
}) => {
  const gn = node.graphNode;
  if (!gn.metric) return null;

  // Y position: if subLabel exists (employeeId for members), shift down
  const my = gn.subLabel ? node.y + Y_METRICS_WITH_SUB : node.y + Y_METRICS;

  const formatted = formatMetricValue(
    gn.metric.value,
    gn.metric.rawValue,
    metricInfo.displayUnit,
    metricInfo.rawUnit,
    metricInfo.timeUnitConversion,
  );

  // Truncate value and score to 2 decimal places for display; preserve full values for tooltip
  const fullValueStr = formatted.display;
  const valueNum = gn.metric.value;
  const displayValue = `${formatToTwoDecimals(valueNum)}${metricInfo.displayUnit}`;

  const score = gn.metric.score;
  const displayScore = `${formatToTwoDecimals(score)}점`;
  const fullScore = `${score}점`;

  const countStr = formatCount(gn.metric.count, gn.metric.countLabel);

  // Build full metrics string to check if it fits within the node
  const maxWidth = node.width;
  const fullMetrics = `${displayValue} · ${displayScore} · ${countStr}`;
  const truncatedMetrics = truncateText(fullMetrics, maxWidth);
  const fullTooltip = `${fullValueStr} · ${fullScore} · ${countStr}`;

  return (
    <g>
      <text
        x={node.x + X_PADDING}
        y={my}
        fontSize={11}
        fill={colors.text}
        opacity={0.65}
        dominantBaseline="central"
        fontFamily="monospace"
      >
        {truncatedMetrics}
        <title>{fullTooltip}</title>
      </text>
    </g>
  );
};

// ── MR_SUMMARY node content ────────────────────────────────────────────────────

const SummaryNodeContent = ({
  node,
  onDetailClick,
}: {
  node: PositionedNode;
  onDetailClick?: (nodeId: string) => void;
}) => {
  const colors = GRAPH_COLORS.MR_SUMMARY;
  const label = node.graphNode.label || "항목";

  return (
    <g className="node-group">
      <rect
        x={node.x} y={node.y}
        width={node.width} height={node.height}
        rx={8}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1}
      />
      <text
        x={node.x + X_PADDING}
        y={node.y + node.height / 2}
        fontSize={11}
        fill={colors.text}
        fontWeight={500}
        dominantBaseline="central"
      >
        {label}
      </text>
      {onDetailClick && (
        <g
          onClick={(e) => { e.stopPropagation(); onDetailClick(node.id); }}
          className="cursor-pointer"
        >
          <rect
            x={node.x + node.width - 58}
            y={node.y + 4}
            width={50}
            height={node.height - 8}
            rx={4}
            fill={colors.badge}
          />
          <text
            x={node.x + node.width - 33}
            y={node.y + node.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill={colors.text}
            fontWeight={500}
          >
            상세보기
          </text>
        </g>
      )}
    </g>
  );
};

// ── Main GraphNode component ──────────────────────────────────────────────────

/**
 * Renders a single SVG node group.
 * - DIVISION/TEAM/MEMBER: colored rect with label, tag badge, sublabel, metrics row
 * - MR_SUMMARY: compact amber node with item count and "상세보기" button
 */
export const GraphNode = memo(({ node, metricInfo, onClick, isSelected, onDetailClick }: GraphNodeProps) => {
  if (node.type === "MR_SUMMARY") {
    return <SummaryNodeContent node={node} onDetailClick={onDetailClick} />;
  }

  const colors = GRAPH_COLORS[node.type];
  const gn = node.graphNode;

  const handleClick = () => {
    if (node.hasChildren || node.loadState === "error") {
      onClick(node.id);
    }
  };

  const isError = node.loadState === "error";
  const borderColor = isError ? "#EF4444" : colors.stroke;
  const borderWidth = isError ? 2 : 1;

  const rectHeight = node.height;
  const toggleY = node.y + node.height - 24;

  return (
    <g
      className="node-group"
      onClick={node.type !== "MEMBER" ? handleClick : undefined}
      style={{
        cursor: node.type !== "MEMBER" && (node.hasChildren || isError)
          ? "pointer"
          : "default",
      }}
    >
      {/* Background rect */}
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={rectHeight}
        rx={12}
        fill={isError ? "#FEF2F2" : colors.fill}
      />
      {/* Border rect */}
      <rect
        className="node-border"
        x={node.x}
        y={node.y}
        width={node.width}
        height={rectHeight}
        rx={12}
        fill="none"
        stroke={borderColor}
        strokeWidth={borderWidth}
      />
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={node.x - 2}
          y={node.y - 2}
          width={node.width + 4}
          height={node.height + 4}
          rx={14}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.8}
        />
      )}
      {/* Label */}
      <text
        x={node.x + X_PADDING}
        y={node.y + Y_LABEL}
        fontSize={13}
        fill={isError ? "#991B1B" : colors.text}
        fontWeight={500}
        dominantBaseline="central"
      >
        {truncateText(gn.label, node.width - 40)}
      </text>
      {/* Tag badge */}
      {gn.tag && (
        <TagBadge
          x={node.x + node.width - 10}
          y={node.y + Y_LABEL}
          tag={gn.tag}
          colors={colors}
        />
      )}
      {/* Sub label (employeeId for MEMBER) */}
      {gn.subLabel && (
        <text
          x={node.x + X_PADDING}
          y={node.y + Y_SUBLABEL}
          fontSize={11}
          fill={colors.text}
          opacity={0.5}
          dominantBaseline="central"
          fontFamily="monospace"
        >
          {gn.subLabel}
        </text>
      )}
      {/* Metrics row */}
      <MetricsRow node={node} metricInfo={metricInfo} colors={colors} />
      {/* Expand/collapse indicator — hidden for MEMBER (MR_SUMMARY children are always visible) */}
      {node.hasChildren && !isError && node.type !== "MEMBER" && (
        <g opacity={0.5} onClick={(e) => { e.stopPropagation(); onClick(node.id); }} className="cursor-pointer">
          <rect
            x={node.x + node.width - 28}
            y={toggleY}
            width={20}
            height={16}
            rx={4}
            fill={colors.badge}
          />
          <text
            x={node.x + node.width - 18}
            y={toggleY + 8}
            textAnchor="middle"
            fontSize={12}
            fill={colors.text}
            fontWeight={600}
            dominantBaseline="central"
          >
            {node.isExpanded ? "−" : "+"}
          </text>
        </g>
      )}
      {/* Error retry hint */}
      {isError && (
        <text
          x={node.x + node.width / 2}
          y={node.y + rectHeight - 14}
          textAnchor="middle"
          fontSize={10}
          fill="#EF4444"
          opacity={0.7}
          dominantBaseline="central"
        >
          재시도 클릭
        </text>
      )}
      {/* Loading pulse overlay */}
      {node.loadState === "loading" && (
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={rectHeight}
          rx={12}
          fill={colors.fill}
          opacity={0.5}
        >
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      {/* Pending grey overlay */}
      {node.loadState === "pending" && (
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={rectHeight}
          rx={12}
          fill="#F3F4F6"
          opacity={0.6}
        />
      )}
    </g>
  );
});

GraphNode.displayName = "GraphNode";
