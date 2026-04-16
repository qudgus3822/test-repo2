import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  buildGraphTree,
  computeGraphLayout,
} from "@/utils/traceGraphLayout.js";
import { useGraphPanZoom } from "@/hooks/useGraphPanZoom.js";
import { GraphNode } from "./graph/GraphNode.js";
import { GraphEdge } from "./graph/GraphEdge.js";
import { EdgeTooltip } from "./graph/EdgeTooltip.js";
import { ZoomControls } from "./graph/ZoomControls.js";
import type {
  TraceNode,
  MetricInfo,
  MemberTraceNode,
  PositionedEdge,
  PositionedNode,
} from "@/types/traceability.types.js";
import type { DivisionLoadStatus } from "@/api/hooks/useSequentialDivisionLoader.js";

const TOOLTIP_OFFSET = 8;

interface TraceGraphProps {
  root: TraceNode | null;
  metricInfo: MetricInfo;
  /** Expand/collapse state owned by TraceOverlay */
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  /** Only provided for company-level traces */
  divisionStates?: Map<string, DivisionLoadStatus>;
  retryDivision?: (departmentCode: string) => void;
  /** Callback when a member node is selected for detail view */
  onSelectMember?: (member: MemberTraceNode) => void;
  /** Currently selected node ID (for visual highlight) */
  selectedNodeId?: string | null;
  /** Item type from traceMapping — gates MR_SUMMARY child creation on MEMBER nodes */
  itemType?: 'mergeRequest' | 'commit';
  /** Valid item path from traceMapping.itemsLocation — used for commit item counting */
  validPath?: string;
  /** True once all sequential division loads have settled (loaded or error). Triggers a second fit. */
  allDivisionsSettled?: boolean;
  /** Label for the COMPANY root node (from clicked dept name in TraceOverlayContext). */
  companyLabel?: string;
}

/**
 * Pure SVG graph renderer. Owns NO expand/collapse state (all lifted to TraceOverlay).
 * Computes layout via memoized buildGraphTree + computeGraphLayout.
 */
export const TraceGraph = ({
  root,
  metricInfo,
  expandedNodes,
  onToggleNode,
  divisionStates,
  retryDivision,
  onSelectMember,
  selectedNodeId,
  itemType,
  validPath,
  allDivisionsSettled = false,
  companyLabel,
}: TraceGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    transformStr,
    zoomLevel,
    handlers,
    zoomIn,
    zoomOut,
    resetView,
    fitContent,
    isPanning,
    isUserZoomed,
  } = useGraphPanZoom(containerRef);

  // Tooltip state — only hoveredEdge needs React state (mouseenter/leave)
  // Position is updated imperatively to avoid re-renders on every mousemove
  const [hoveredEdge, setHoveredEdge] = useState<PositionedEdge | null>(null);
  const tooltipDivRef = useRef<HTMLDivElement>(null);

  const handleEdgeEnter = useCallback((edge: PositionedEdge) => {
    setHoveredEdge(edge);
  }, []);

  const handleEdgeLeave = useCallback(() => {
    setHoveredEdge(null);
  }, []);

  const handleEdgeMove = useCallback((e: MouseEvent) => {
    if (tooltipDivRef.current && containerRef.current) {
      // The modal has CSS transform (scale-100) which creates a new containing
      // block for position:fixed descendants. Convert viewport coords to
      // container-local coords so the tooltip aligns with the cursor.
      const rect = containerRef.current.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const x = localX + TOOLTIP_OFFSET;
      const y = localY + TOOLTIP_OFFSET;
      const tooltipWidth = tooltipDivRef.current.offsetWidth;
      const tooltipHeight = tooltipDivRef.current.offsetHeight;
      const adjustedX =
        x + tooltipWidth > rect.width ? localX - tooltipWidth - TOOLTIP_OFFSET : x;
      const adjustedY =
        y + tooltipHeight > rect.height ? localY - tooltipHeight - TOOLTIP_OFFSET : y;
      tooltipDivRef.current.style.left = `${adjustedX}px`;
      tooltipDivRef.current.style.top = `${adjustedY}px`;
    }
  }, []);

  // Stable ref so handleNodeClick does not need layout in its dependency array
  const nodeMapRef = useRef<Map<string, PositionedNode> | undefined>(undefined);

  const isCompanyLevel = root?.level === "COMPANY";

  const layout = useMemo(() => {
    if (!root) return null;
    const graphTrees = buildGraphTree(
      root,
      isCompanyLevel ? divisionStates : undefined,
      itemType,
      validPath,
      companyLabel,
    );
    return computeGraphLayout(graphTrees, expandedNodes);
  }, [root, expandedNodes, divisionStates, isCompanyLevel, itemType, validPath, companyLabel]);

  // Keep nodeMapRef in sync with layout so handleNodeClick has stable O(1) lookup
  useEffect(() => {
    nodeMapRef.current = layout?.nodeMap;
  }, [layout]);

  // Fit #1: immediately on first layout (may be shallow for COMPANY).
  // A2: set latch BEFORE fitContent to stay idempotent across concurrent effect ticks.
  const hasInitialFitRef = useRef(false);
  useEffect(() => {
    if (!layout || hasInitialFitRef.current) return;
    hasInitialFitRef.current = true;                 // A2: latch first
    fitContent(layout.contentWidth, layout.contentHeight);
  }, [layout, fitContent]);

  // Fit #2: once more when all sequential divisions have settled (loaded/errored).
  // A2: set latch BEFORE fitContent to stay idempotent across concurrent effect ticks.
  // A3: skip if user has zoomed/panned since last programmatic fit.
  const hasSettledFitRef = useRef(false);
  useEffect(() => {
    if (!layout || !allDivisionsSettled || hasSettledFitRef.current) return;
    hasSettledFitRef.current = true;                 // A2: latch first
    if (isUserZoomed()) return;                      // A3: preserve user gesture
    fitContent(layout.contentWidth, layout.contentHeight);
  }, [layout, allDivisionsSettled, fitContent, isUserZoomed]);

  // Reset both guards on a new trace query
  useEffect(() => {
    hasInitialFitRef.current = false;
    hasSettledFitRef.current = false;
  }, [root]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Error nodes trigger retry instead of toggle
      // Use nodeMapRef for O(1) lookup without adding layout to dependency array
      if (retryDivision && nodeMapRef.current) {
        const clickedNode = nodeMapRef.current.get(nodeId);
        if (clickedNode?.loadState === "error") {
          retryDivision(nodeId);
          return;
        }
      }

      onToggleNode(nodeId);
    },
    [onToggleNode, retryDivision],
  );

  const handleDetailClick = useCallback(
    (nodeId: string) => {
      if (!onSelectMember || !nodeMapRef.current) return;
      const clickedNode = nodeMapRef.current.get(nodeId);
      if (!clickedNode) return;

      // MR_SUMMARY nodes store the parent MemberTraceNode in traceNode
      if (clickedNode.type === "MR_SUMMARY") {
        const memberTrace = clickedNode.graphNode.traceNode as MemberTraceNode | undefined;
        if (memberTrace) {
          onSelectMember(memberTrace);
        }
      }
    },
    [onSelectMember],
  );

  if (!root || !layout) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handlers.onMouseDown}
      onMouseMove={handlers.onMouseMove}
      onMouseUp={handlers.onMouseUp}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      <svg className="w-full h-full">
        <defs>
          <style>{`
            .node-group:hover .node-border { stroke-width: 2; }
            .edge { transition: opacity 0.2s; }
            .edge:hover { opacity: 1; }
          `}</style>
        </defs>
        <g transform={transformStr}>
          {/* Edges first (behind nodes) */}
          {layout.edges.map((edge) => (
            <GraphEdge
              key={edge.id}
              edge={edge}
              onMouseEnter={handleEdgeEnter}
              onMouseLeave={handleEdgeLeave}
              onMouseMove={handleEdgeMove}
            />
          ))}
          {/* Nodes on top */}
          {layout.nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              metricInfo={metricInfo}
              onClick={handleNodeClick}
              isSelected={node.id === selectedNodeId}
              onDetailClick={handleDetailClick}
            />
          ))}
        </g>
      </svg>
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
      />
      <EdgeTooltip
        ref={tooltipDivRef}
        visible={hoveredEdge !== null}
        edge={hoveredEdge}
        rawUnit={metricInfo.rawUnit}
      />
    </div>
  );
};
