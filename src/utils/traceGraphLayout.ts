/**
 * Pure layout functions for the trace graph overlay.
 * No React, no side effects. Fully unit-testable.
 *
 * Transforms TraceNode tree into a positioned SVG graph layout with:
 * - Parent-relative positioning: each child placed at parent.x + parent.width + H_GAP
 * - Contribution-rate edge weights via calculateSiblingWeights()
 * - CJK-aware text truncation
 */

import type {
  TraceNode,
  DivisionTraceNode,
  TeamTraceNode,
  MemberTraceNode,
  MergeRequestSummary,
  GraphTreeNode,
  GraphLayout,
  PositionedNode,
  PositionedEdge,
  MergeRequestMetricDetail,
  DailyUserMetric,
  EdgeTooltipData,
} from "@/types/traceability.types";
import type { DivisionLoadStatus } from "@/api/hooks/useSequentialDivisionLoader";
import { NODE_W, NODE_H } from "@/utils/traceGraphPresentation.js";

// ── Constants ──────────────────────────────────────────────────────────────────

const H_GAP = 80; // horizontal gap between parent and child nodes
const V_GAP = 20; // vertical gap between sibling nodes
const HEADER_OFFSET = 20; // top padding above the first node
const ROOT_X = 40; // X position for root nodes

// 8 MRs fill ~700px vertical space, matching a typical viewport height.
// Showing more than 8 causes the graph to overflow without meaningful gain.
const MAX_VISIBLE_MRS = 8;

// ── Sibling weight calculation ────────────────────────────────────────────────

/**
 * Calculates contribution weights for sibling nodes:
 *
 * - Non-MR children: rawValue × count / sum(rv × c)  [volume contribution]
 *   Falls back to 1/N if sum is 0.
 * - MR children: 1/N  [equal distribution, no metric data on MRs]
 *
 * Overflow nodes (id starts with 'mr-overflow-') are excluded from calculations.
 */
function calculateSiblingWeights(children: GraphTreeNode[]): void {
  const realChildren = children.filter((c) => !c.id.startsWith("mr-overflow-"));

  if (realChildren.length === 0) return;
  if (realChildren.length === 1) {
    realChildren[0].weight = 1;
    const only = realChildren[0];
    only.tooltipData = {
      weightStrategy: "volumeContribution",
      rawValue: only.metric?.rawValue ?? 0,
      count: only.metric?.count ?? 0,
      countLabel: only.metric?.countLabel ?? "ITEMS",
      rawValueSum: only.metric?.rawValue ?? 0,
      siblingsSameCount: true,
      numerator: 1,
      denominator: 1,
      siblingCount: 1,
    };
    return;
  }

  // MR children: always 1/N (no metric data on MRs)
  if (realChildren[0].type === "MR") {
    const N = realChildren.length;
    const eq = 1 / N;
    for (const child of realChildren) {
      child.weight = eq;
      // MR nodes have no metric data; use sentinel values for tooltip
      child.tooltipData = {
        weightStrategy: "equal",
        rawValue: 0,
        count: 0,
        countLabel: "ITEMS",
        rawValueSum: 0,
        siblingsSameCount: true,
        numerator: 1,
        denominator: N,
        siblingCount: N,
      };
    }
    return;
  }

  // Non-MR children: rawValue × count / sum(rv × c)
  const rvProducts = realChildren.map((c) => {
    const rv = c.metric?.rawValue ?? 0;
    const count = c.metric?.count ?? 1;
    return rv * count;
  });
  const rvSum = rvProducts.reduce((a, b) => a + b, 0);

  // Detect whether all siblings share the same count value.
  // Counts with missing metric are treated as 0. If a sibling has no metric,
  // it cannot be meaningfully compared, so we treat the group as mixed.
  const counts = realChildren.map((c) => c.metric?.count ?? 0);
  const sameCount = counts.length > 0 && counts.every((c) => c === counts[0]);

  // Sum of rawValues (used as denominator when sameCount is true, since count cancels out)
  const rawValueSum = realChildren.reduce(
    (s, c) => s + (c.metric?.rawValue ?? 0),
    0,
  );

  const siblingCount = realChildren.length;

  if (rvSum > 0) {
    for (let i = 0; i < realChildren.length; i++) {
      realChildren[i].weight = rvProducts[i] / rvSum;
      realChildren[i].tooltipData = {
        weightStrategy: "volumeContribution",
        rawValue: realChildren[i].metric?.rawValue ?? 0,
        count: realChildren[i].metric?.count ?? 0,
        countLabel: realChildren[i].metric?.countLabel ?? "ITEMS",
        rawValueSum,
        siblingsSameCount: sameCount,
        numerator: rvProducts[i],
        denominator: rvSum,
        siblingCount,
      };
    }
    return;
  }

  // Fallback: equal distribution (all rv × c are 0)
  const N = realChildren.length;
  const eq = 1 / N;
  for (const child of realChildren) {
    child.weight = eq;
    child.tooltipData = {
      weightStrategy: "equal",
      rawValue: 0,
      count: 0,
      countLabel: "ITEMS",
      rawValueSum: 0,
      siblingsSameCount: true,
      numerator: 1,
      denominator: N,
      siblingCount: N,
    };
  }
}

// ── MR detail data enrichment ─────────────────────────────────────────────────

/**
 * Joins MR detail data from rawDailyData by matching iid + repositoryId.
 * Uses Number() coercion on both sides — the JSON deserializer may produce strings.
 */
function findMRDetailData(
  rawDailyData: DailyUserMetric[] | null,
  iid: number,
  repositoryId: number,
): MergeRequestMetricDetail | null {
  if (!rawDailyData) return null;
  for (const day of rawDailyData) {
    if (!day.details) continue;
    const detailMRs = (day.details as Record<string, unknown>)["mergeRequests"];
    if (!Array.isArray(detailMRs)) continue;
    for (const dmr of detailMRs) {
      const rec = dmr as Record<string, unknown>;
      if (Number(rec.id) === iid && Number(rec.repositoryId) === repositoryId) {
        return rec as MergeRequestMetricDetail;
      }
    }
  }
  return null;
}

// ── Tree node builders ────────────────────────────────────────────────────────

function buildMRNode(
  mr: MergeRequestSummary,
  member: MemberTraceNode,
): GraphTreeNode {
  const detailData = findMRDetailData(
    member.rawDailyData,
    mr.iid,
    mr.repositoryId,
  );
  return {
    // Include memberId to prevent ID collision when the same MR appears under multiple reviewers
    id: `mr-${member.memberId}-${mr.iid}-${mr.repositoryId}`,
    type: "MR",
    label: mr.title,
    subLabel: mr.repositoryName,
    tag: "MR",
    mergeRequest: mr,
    mrMetricData: detailData,
    weight: 0, // will be set by calculateSiblingWeights
  };
}

function buildMemberNode(member: MemberTraceNode): GraphTreeNode {
  let mrNodes: GraphTreeNode[] = (member.mergeRequests ?? []).map((mr) =>
    buildMRNode(mr, member),
  );

  if (mrNodes.length > MAX_VISIBLE_MRS) {
    const overflow = mrNodes.length - MAX_VISIBLE_MRS;
    mrNodes = mrNodes.slice(0, MAX_VISIBLE_MRS);
    mrNodes.push({
      id: `mr-overflow-${member.memberId}`,
      type: "MR",
      label: `+${overflow}건 더보기`,
      subLabel: "",
      tag: "",
      weight: 0, // overflow node has no edge weight
    });
  }

  if (mrNodes.length > 0) {
    calculateSiblingWeights(mrNodes);
  }

  return {
    id: member.memberId,
    type: "MEMBER",
    label: member.memberName,
    subLabel: member.memberEmployeeId,
    tag: "개인",
    traceNode: member,
    metric: member.metric,
    children: mrNodes.length > 0 ? mrNodes : undefined,
    weight: 0, // will be set by calculateSiblingWeights in parent
  };
}

/**
 * Builds children for a division node.
 * Virtual teams (same departmentCode as division) are kept as regular TEAM nodes
 * but given a prefixed ID to avoid collision with the parent division node.
 */
function buildDivisionChildren(division: DivisionTraceNode): GraphTreeNode[] {
  const teamNodes = (division.children ?? []).map((team) => {
    const node = buildTeamNode(team);
    // Virtual team has same departmentCode as division -- prefix to avoid ID collision
    if (team.departmentCode === division.departmentCode) {
      node.id = `vteam-${team.departmentCode}`;
    }
    return node;
  });

  if (teamNodes.length > 0) {
    calculateSiblingWeights(teamNodes);
  }

  return teamNodes;
}

function buildTeamNode(team: TeamTraceNode): GraphTreeNode {
  const memberChildren = (team.children ?? []).map((m) => buildMemberNode(m));
  if (memberChildren.length > 0) {
    calculateSiblingWeights(memberChildren);
  }
  return {
    id: team.departmentCode,
    type: "TEAM",
    label: team.departmentName,
    tag: "팀",
    traceNode: team,
    metric: team.metric,
    aggregationMethod: team.aggregationMethod,
    children: memberChildren.length > 0 ? memberChildren : undefined,
    weight: 0, // will be set by calculateSiblingWeights in parent
  };
}

function buildDivisionNode(
  division: DivisionTraceNode,
  divisionStates?: Map<string, DivisionLoadStatus>,
): GraphTreeNode {
  // Check sequential loader state for this division
  const status = divisionStates?.get(division.departmentCode);

  if (status) {
    if (status.state === "loaded" && status.data?.root?.level === "DIVISION") {
      // Use detailed data from sequential loader
      const detailedDiv = status.data.root as DivisionTraceNode;
      const allChildren = buildDivisionChildren(detailedDiv);
      return {
        id: detailedDiv.departmentCode,
        type: "DIVISION",
        label: detailedDiv.departmentName,
        tag: "부문/실",
        traceNode: detailedDiv,
        metric: detailedDiv.metric,
        aggregationMethod: detailedDiv.aggregationMethod,
        children: allChildren.length > 0 ? allChildren : undefined,
        weight: 0, // root division nodes have no parent edge; weight unused
        loadState: "loaded",
      };
    }

    // pending / loading / error: use shallow division data
    return {
      id: division.departmentCode,
      type: "DIVISION",
      label: division.departmentName,
      tag: "부문/실",
      traceNode: division,
      metric: division.metric,
      aggregationMethod: division.aggregationMethod,
      weight: 0, // root division nodes have no parent edge; weight unused
      loadState: status.state,
    };
  }

  // No sequential loader — build from the division's own children (may be null for shallow)
  const allChildren = buildDivisionChildren(division);
  return {
    id: division.departmentCode,
    type: "DIVISION",
    label: division.departmentName,
    tag: "부문/실",
    traceNode: division,
    metric: division.metric,
    aggregationMethod: division.aggregationMethod,
    children: allChildren.length > 0 ? allChildren : undefined,
    weight: 0, // root division nodes have no parent edge; weight unused
  };
}

// ── Public API: buildGraphTree ─────────────────────────────────────────────────

/**
 * Transforms TraceNode tree into GraphTreeNode tree with:
 * 1. MR leaf nodes derived from member.mergeRequests[]
 * 2. Contribution-rate edge weights computed by calculateSiblingWeights()
 * 3. Enriched MR detail data joined from rawDailyData
 *
 * IMPORTANT: Company-level root is NOT included as a graph node.
 * For COMPANY root, returns an array of division GraphTreeNodes.
 * For other roots, returns a single-element array.
 */
export function buildGraphTree(
  root: TraceNode,
  divisionStates?: Map<string, DivisionLoadStatus>,
): GraphTreeNode[] {
  switch (root.level) {
    case "COMPANY":
      return root.children.map((div) => buildDivisionNode(div, divisionStates));
    case "DIVISION":
      return [buildDivisionNode(root as DivisionTraceNode, divisionStates)];
    case "TEAM":
      return [buildTeamNode(root as TeamTraceNode)];
    case "MEMBER":
      return [buildMemberNode(root as MemberTraceNode)];
  }
}

// ── collectAllNodeIds ─────────────────────────────────────────────────────────

/**
 * Collects all collapsible node IDs (departments and members) from a TraceNode tree.
 * Walks TraceNode directly instead of rebuilding the full GraphTreeNode tree,
 * avoiding the overhead of MR enrichment just to extract IDs.
 *
 * IDs collected:
 * - COMPANY: skipped (not a graph node itself)
 * - DIVISION: departmentCode (and recursively teams)
 * - TEAM: departmentCode (and recursively members)
 * - MEMBER: memberId
 *
 * Loaded division details from divisionStates are also walked.
 */
export function collectAllNodeIds(
  root: TraceNode,
  divisionStates?: Map<string, DivisionLoadStatus>,
): string[] {
  const ids: string[] = [];

  function walkTeam(team: TeamTraceNode): void {
    ids.push(team.departmentCode);
    for (const member of team.children ?? []) {
      ids.push(member.memberId);
    }
  }

  function walkDivision(div: DivisionTraceNode): void {
    ids.push(div.departmentCode);
    for (const team of div.children ?? []) {
      // Virtual teams get a prefixed ID to match graph node IDs
      const teamId =
        team.departmentCode === div.departmentCode
          ? `vteam-${team.departmentCode}`
          : team.departmentCode;
      ids.push(teamId);
      for (const member of team.children ?? []) {
        ids.push(member.memberId);
      }
    }
  }

  switch (root.level) {
    case "COMPANY":
      for (const div of root.children) {
        // Use detailed division data from sequential loader if available
        const status = divisionStates?.get(div.departmentCode);
        const detailed =
          status?.state === "loaded" && status.data?.root?.level === "DIVISION"
            ? (status.data.root as DivisionTraceNode)
            : div;
        walkDivision(detailed);
      }
      break;
    case "DIVISION":
      walkDivision(root as DivisionTraceNode);
      break;
    case "TEAM":
      walkTeam(root as TeamTraceNode);
      break;
    case "MEMBER":
      ids.push((root as MemberTraceNode).memberId);
      break;
  }

  return ids;
}

// ── Layout helpers ────────────────────────────────────────────────────────────

/**
 * Recursively positions a node and all its visible children.
 * Uses parent-relative positioning: children are placed at xStart + parent.width + H_GAP.
 *
 * @param node - the tree node to position
 * @param xStart - left edge X for this node (determined by parent's position and width)
 * @param yStart - top Y for the first child (or this node if leaf/collapsed)
 */
function positionNode(
  node: GraphTreeNode,
  xStart: number,
  yStart: number,
  expandedNodes: Set<string>,
  outNodes: PositionedNode[],
  outEdges: PositionedEdge[],
  nodeMap: Map<string, PositionedNode>,
): { bottom: number } {
  const w = NODE_W[node.type];
  const h = NODE_H[node.type];
  const x = xStart;

  const isExpanded = node.type === "MR" ? false : expandedNodes.has(node.id);
  const hasChildren = !!node.children && node.children.length > 0;

  if (!hasChildren || !isExpanded) {
    // Leaf or collapsed: place at yStart
    const positioned: PositionedNode = {
      id: node.id,
      type: node.type,
      x,
      y: yStart,
      width: w,
      height: h,
      cx: x + w / 2,
      cy: yStart + h / 2,
      graphNode: node,
      hasChildren,
      isExpanded,
      loadState: node.loadState,
    };
    outNodes.push(positioned);
    nodeMap.set(node.id, positioned);
    return { bottom: yStart + h };
  }

  // Children's X is parent's right edge + H_GAP
  const childX = x + w + H_GAP;

  // Has expanded children: position children first, then center parent
  let cy = yStart;
  let maxBottom = yStart;
  const childPositions: { cy: number }[] = [];

  for (const child of node.children!) {
    const result = positionNode(
      child,
      childX,
      cy,
      expandedNodes,
      outNodes,
      outEdges,
      nodeMap,
    );
    const childPositioned = nodeMap.get(child.id);
    if (childPositioned) {
      childPositions.push({ cy: childPositioned.cy });
    }
    cy = result.bottom + V_GAP;
    maxBottom = result.bottom;
  }

  // Center parent among children naturally (no clamping here).
  // computeGraphLayout() shifts the entire subtree down if any node ends up above
  // HEADER_OFFSET, which preserves correct edge alignment between parent and children.
  const firstChildCy = childPositions[0]?.cy ?? yStart;
  const lastChildCy = childPositions[childPositions.length - 1]?.cy ?? yStart;
  const parentCy = (firstChildCy + lastChildCy) / 2;
  const parentY = parentCy - h / 2;

  const positioned: PositionedNode = {
    id: node.id,
    type: node.type,
    x,
    y: parentY,
    width: w,
    height: h,
    cx: x + w / 2,
    cy: parentCy,
    graphNode: node,
    hasChildren: true,
    isExpanded: true,
    loadState: node.loadState,
  };
  outNodes.push(positioned);
  nodeMap.set(node.id, positioned);

  // Create edges from parent to each child
  for (const child of node.children!) {
    const childPositioned = nodeMap.get(child.id);
    if (childPositioned) {
      const defaultTooltipData: EdgeTooltipData = {
        weightStrategy: "equal",
        rawValue: 0,
        count: 0,
        countLabel: "ITEMS",
        rawValueSum: 0,
        siblingsSameCount: true,
        numerator: 1,
        denominator: 1,
        siblingCount: 1,
      };
      outEdges.push({
        id: `${node.id}->${child.id}`,
        parentId: node.id,
        childId: child.id,
        parentType: node.type,
        childType: child.type,
        x1: x + w, // parent right edge
        y1: parentCy,
        x2: childPositioned.x, // child left edge
        y2: childPositioned.cy,
        weight: child.weight ?? 1,
        parentLabel: node.label,
        childLabel: child.label,
        tooltip: child.tooltipData ?? defaultTooltipData,
      });
    }
  }

  return { bottom: Math.max(maxBottom, parentY + h) };
}

// ── Public API: computeGraphLayout ────────────────────────────────────────────

/**
 * Positions all nodes using parent-relative layout (left-to-right tree).
 *
 * Algorithm:
 * 1. Root nodes start at ROOT_X (40px)
 * 2. Each child is positioned at parent.x + parent.width + H_GAP
 * 3. Parent is centered vertically among its children
 * 4. Collect all edges between parent-child pairs
 * 5. contentWidth is derived from the rightmost node's right edge + 40px padding
 */
export function computeGraphLayout(
  roots: GraphTreeNode[],
  expandedNodes: Set<string>,
): GraphLayout {
  const nodeMap = new Map<string, PositionedNode>();
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];

  let yStart = HEADER_OFFSET;

  for (const root of roots) {
    const nodesBeforeCount = nodes.length;
    const edgesBeforeCount = edges.length;

    const result = positionNode(
      root,
      ROOT_X,
      yStart,
      expandedNodes,
      nodes,
      edges,
      nodeMap,
    );

    // After positioning, find minimum Y among newly-added nodes in this subtree.
    // If any node would render above HEADER_OFFSET, shift the entire subtree down
    // to preserve natural centering while keeping all nodes below the header.
    const subtreeNodes = nodes.slice(nodesBeforeCount);
    const subtreeEdges = edges.slice(edgesBeforeCount);
    const minY = subtreeNodes.reduce((min, n) => Math.min(min, n.y), Infinity);
    if (minY < HEADER_OFFSET) {
      const shift = HEADER_OFFSET - minY;
      for (const n of subtreeNodes) {
        n.y += shift;
        n.cy += shift;
      }
      for (const e of subtreeEdges) {
        e.y1 += shift;
        e.y2 += shift;
      }
      yStart = result.bottom + shift + V_GAP;
    } else {
      yStart = result.bottom + V_GAP;
    }
  }

  // Content width from actual node positions (rightmost node's right edge + padding)
  let maxRight = 0;
  for (const node of nodes) {
    const right = node.x + node.width;
    if (right > maxRight) maxRight = right;
  }

  const contentWidth = maxRight + 40;
  const contentHeight = yStart;

  return { nodes, edges, contentWidth, contentHeight, nodeMap };
}
