import { GRAPH_COLORS, truncateText } from "@/utils/traceGraphPresentation.js";
import { formatMetricValue, formatCount } from "@/utils/traceability";
import type {
  PositionedNode,
  MetricInfo,
  MergeRequestMetricDetail,
} from "@/types/traceability.types";

// ── Node content Y-offset grid ────────────────────────────────────────────────
//
// All Y positions below are relative to node.y (top-left corner of the node).
// The grid is designed around the node heights defined in traceGraphLayout.ts:
//   DIVISION: 88px  TEAM: 82px  MEMBER: 74px  MR: 82px
//
// DIVISION / TEAM / MEMBER nodes (rx=12 rounded rect):
//   node.y + 20   Label text (name) -- centered at row 1
//   node.y + 38   Sub-label text (employee ID for MEMBER) -- centered at row 2
//   node.y + 40   Metrics row when no sub-label (DIVISION/TEAM)
//   node.y + 56   Metrics row when sub-label present (MEMBER)
//   node.x + 14   Horizontal indent for all left-aligned text
//
// MR nodes (rx=10 rounded rect, height 82px):
//   node.y + 16   MR title (iid + title)
//   node.y + 32   Repository name
//   node.y + 46   Branch info (source → target)
//   node.y + 60   Author name
//   node.y + 74   Metric detail (response time, etc.) — optional
//   node.x + 10   Horizontal indent for MR content

interface GraphNodeProps {
  node: PositionedNode;
  metricInfo: MetricInfo;
  onClick: (nodeId: string) => void;
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
  const width = tag.length * 8 + 10;
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

/** Formats a numeric value to 2 decimal places if it has more precision. */
function formatToTwoDecimals(value: number): string {
  if (Number.isInteger(value)) return String(value);
  const fixed = value.toFixed(2);
  // Avoid trailing zeros beyond what toFixed provides — keep exactly 2 decimal places
  return fixed;
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
  const my = gn.subLabel ? node.y + 56 : node.y + 40;

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
  const maxWidth = node.width; // - 28; // 14px padding on each side
  const fullMetrics = `${displayValue} · ${displayScore} · ${countStr}`;
  const truncatedMetrics = truncateText(fullMetrics, maxWidth);
  const fullTooltip = `${fullValueStr} · ${fullScore} · ${countStr}`;

  return (
    <g>
      <text
        x={node.x + 14}
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

// ── MR metric detail extraction ───────────────────────────────────────────────

function extractMRMetricDisplay(
  data?: MergeRequestMetricDetail | null,
): string | null {
  if (!data) return null;
  if (data.responseTimeFormatted) return data.responseTimeFormatted;
  if (data.reviewRequestTime) return `리뷰요청: ${data.reviewRequestTime}`;
  if (data.firstResponseTime) return `첫 응답: ${data.firstResponseTime}`;
  // Last resort: look for any *Formatted field from the extensible portion
  for (const key of Object.keys(data)) {
    if (key.endsWith("Formatted") && typeof data[key] === "string") {
      return data[key] as string;
    }
  }
  return null;
}

// ── MR node (distinct from other types) ──────────────────────────────────────

const MRNodeContent = ({
  node,
  colors,
}: {
  node: PositionedNode;
  colors: (typeof GRAPH_COLORS)["MR"];
}) => {
  const gn = node.graphNode;
  const mr = gn.mergeRequest;

  // Overflow indicator node ("+N건 더보기") — has no mergeRequest data
  if (!mr) {
    return (
      <g className="node-group">
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={10}
          fill="#F3F4F6"
        />
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={10}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={node.x + node.width / 2}
          y={node.y + node.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fill="#6B7280"
          fontWeight={500}
        >
          {gn.label}
        </text>
      </g>
    );
  }

  const metricDisplay = extractMRMetricDisplay(gn.mrMetricData);

  return (
    <g className="node-group">
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={10}
        fill={colors.fill}
      />
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={10}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1}
      />
      {/* MR title */}
      <text
        x={node.x + 10}
        y={node.y + 16}
        fontSize={11}
        fill={colors.text}
        fontWeight={500}
        dominantBaseline="central"
      >
        {truncateText(`!${mr.iid} ${mr.title}`, node.width - 20)}
      </text>
      {/* Repository name */}
      <text
        x={node.x + 10}
        y={node.y + 32}
        fontSize={10}
        fill={colors.text}
        opacity={0.6}
        dominantBaseline="central"
      >
        {truncateText(mr.repositoryName, node.width - 20)}
      </text>
      {/* Branch info */}
      <text
        x={node.x + 10}
        y={node.y + 46}
        fontSize={9}
        fill={colors.text}
        opacity={0.5}
        dominantBaseline="central"
        fontFamily="monospace"
      >
        {truncateText(
          `${mr.sourceBranch} → ${mr.targetBranch}`,
          node.width - 20,
        )}
      </text>
      {/* Author */}
      <text
        x={node.x + 10}
        y={node.y + 60}
        fontSize={9}
        fill={colors.text}
        opacity={0.5}
        dominantBaseline="central"
      >
        {mr.author}
      </text>
      {/* Metric detail */}
      {metricDisplay && (
        <text
          x={node.x + 10}
          y={node.y + 74}
          fontSize={10}
          fill={colors.text}
          fontWeight={500}
          opacity={0.8}
          dominantBaseline="central"
          fontFamily="monospace"
        >
          {metricDisplay}
        </text>
      )}
      <title>{`!${mr.iid} ${mr.title}\n${mr.repositoryName}\n${mr.sourceBranch} → ${mr.targetBranch}\n${mr.author}`}</title>
    </g>
  );
};

// ── Main GraphNode component ──────────────────────────────────────────────────

/**
 * Renders a single SVG node group.
 * - MR: distinct amber styling with title/repo/branch/author/metric
 * - DIVISION/TEAM/MEMBER: colored rect with label, tag badge, sublabel, metrics row
 */
export const GraphNode = ({ node, metricInfo, onClick }: GraphNodeProps) => {
  const colors = GRAPH_COLORS[node.type];
  const gn = node.graphNode;

  if (node.type === "MR") {
    return <MRNodeContent node={node} colors={GRAPH_COLORS.MR} />;
  }

  const handleClick = () => {
    if (node.hasChildren || node.loadState === "error") {
      onClick(node.id);
    }
  };

  const isError = node.loadState === "error";
  const borderColor = isError ? "#EF4444" : colors.stroke;
  const borderWidth = isError ? 2 : 1;

  return (
    <g
      className="node-group"
      onClick={handleClick}
      style={{ cursor: node.hasChildren || isError ? "pointer" : "default" }}
    >
      {/* Background rect */}
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={12}
        fill={isError ? "#FEF2F2" : colors.fill}
      />
      {/* Border rect */}
      <rect
        className="node-border"
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={12}
        fill="none"
        stroke={borderColor}
        strokeWidth={borderWidth}
      />
      {/* Label */}
      <text
        x={node.x + 14}
        y={node.y + 20}
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
          y={node.y + 20}
          tag={gn.tag}
          colors={colors}
        />
      )}
      {/* Sub label (employeeId for MEMBER) */}
      {gn.subLabel && (
        <text
          x={node.x + 14}
          y={node.y + 38}
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
      {/* Expand/collapse indicator */}
      {node.hasChildren && !isError && (
        <g opacity={0.5}>
          <rect
            x={node.x + node.width - 28}
            y={node.y + node.height - 24}
            width={20}
            height={16}
            rx={4}
            fill={colors.badge}
          />
          <text
            x={node.x + node.width - 18}
            y={node.y + node.height - 16}
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
          y={node.y + node.height - 14}
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
          height={node.height}
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
          height={node.height}
          rx={12}
          fill="#F3F4F6"
          opacity={0.6}
        />
      )}
    </g>
  );
};
