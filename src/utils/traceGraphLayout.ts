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
  CompanyTraceNode,
  DivisionTraceNode,
  TeamTraceNode,
  MemberTraceNode,
  GraphTreeNode,
  GraphLayout,
  PositionedNode,
  PositionedEdge,
  EdgeTooltipData,
} from "@/types/traceability.types.js";
import type { DivisionLoadStatus } from "@/api/hooks/useSequentialDivisionLoader.js";
import { NODE_W, NODE_H } from "@/utils/traceGraphPresentation.js";
import { getItemTypeLabel, countItemsFromDetails } from "@/utils/traceMappingUtils.js";

// ── Constants ──────────────────────────────────────────────────────────────────

const H_GAP = 80; // horizontal gap between parent and child nodes
const V_GAP = 32; // vertical gap between sibling nodes
const HEADER_OFFSET = 20; // top padding above the first node
const ROOT_X = 40; // X position for root nodes

// ── Sibling weight calculation ────────────────────────────────────────────────

/**
 * Calculates contribution weights for sibling nodes:
 *
 * - rawValue × count / sum(rv × c)  [volume contribution]
 *   Falls back to 1/N if sum is 0.
 */
function calculateSiblingWeights(children: GraphTreeNode[]): void {
  if (children.length === 0) return;
  if (children.length === 1) {
    children[0].weight = 1;
    const only = children[0];
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

  // rawValue × count / sum(rv × c)
  const rvProducts = children.map((c) => {
    const rv = c.metric?.rawValue ?? 0;
    const count = c.metric?.count ?? 1;
    return rv * count;
  });
  const rvSum = rvProducts.reduce((a, b) => a + b, 0);

  // Detect whether all siblings share the same count value.
  // Counts with missing metric are treated as 0. If a sibling has no metric,
  // it cannot be meaningfully compared, so we treat the group as mixed.
  const counts = children.map((c) => c.metric?.count ?? 0);
  const sameCount = counts.length > 0 && counts.every((c) => c === counts[0]);

  // Sum of rawValues (used as denominator when sameCount is true, since count cancels out)
  const rawValueSum = children.reduce(
    (s, c) => s + (c.metric?.rawValue ?? 0),
    0,
  );

  const siblingCount = children.length;

  if (rvSum > 0) {
    for (let i = 0; i < children.length; i++) {
      children[i].weight = rvProducts[i] / rvSum;
      children[i].tooltipData = {
        weightStrategy: "volumeContribution",
        rawValue: children[i].metric?.rawValue ?? 0,
        count: children[i].metric?.count ?? 0,
        countLabel: children[i].metric?.countLabel ?? "ITEMS",
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
  const N = children.length;
  const eq = 1 / N;
  for (const child of children) {
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

// ── Tree node builders ────────────────────────────────────────────────────────

function buildMemberNode(
  member: MemberTraceNode,
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
): GraphTreeNode {
  // For commit-type metrics, count items from rawDailyData (MR count is irrelevant for commits).
  // For mergeRequest-type metrics, use the mergeRequests array length.
  const itemCount = itemType === 'commit' && validPath
    ? countItemsFromDetails(member.rawDailyData, validPath)
    : (member.mergeRequests?.length ?? 0);

  // Build MR_SUMMARY child when traceMapping provides an itemType and items exist.
  // traceNode stores the parent MemberTraceNode so handleDetailClick can find the member.
  const summaryChild: GraphTreeNode | undefined =
    itemType && itemCount > 0
      ? {
          id: `summary-${member.memberId}`,
          type: "MR_SUMMARY",
          label: `${getItemTypeLabel(itemType)} ${itemCount}건`,
          traceNode: member,
          weight: 1,
        }
      : undefined;

  return {
    id: member.memberId,
    type: "MEMBER",
    label: member.memberName,
    subLabel: member.memberEmployeeId,
    tag: "개인",
    traceNode: member,
    metric: member.metric,
    children: summaryChild ? [summaryChild] : undefined,
    weight: 0, // will be set by calculateSiblingWeights in parent
  };
}

/**
 * Builds children for a division node.
 * Virtual teams (same departmentCode as division) are kept as regular TEAM nodes
 * but given a prefixed ID to avoid collision with the parent division node.
 */
function buildDivisionChildren(
  division: DivisionTraceNode,
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
): GraphTreeNode[] {
  const teamNodes = (division.children ?? []).map((team) => {
    const node = buildTeamNode(team, itemType, validPath);
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

function buildTeamNode(
  team: TeamTraceNode,
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
): GraphTreeNode {
  const memberChildren = (team.children ?? []).map((m) => buildMemberNode(m, itemType, validPath));
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
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
): GraphTreeNode {
  // Check sequential loader state for this division
  const status = divisionStates?.get(division.departmentCode);

  if (status) {
    if (status.state === "loaded" && status.data?.root?.level === "DIVISION") {
      // Use detailed data from sequential loader
      const detailedDiv = status.data.root as DivisionTraceNode;
      const allChildren = buildDivisionChildren(detailedDiv, itemType, validPath);
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
  const allChildren = buildDivisionChildren(division, itemType, validPath);
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

// ── buildCompanyNode ──────────────────────────────────────────────────────────

// COMPANY root is rendered as a reserved synthetic node
// (id = "__company_root__") whose metric comes from response.root.metric
// and whose children are the response.root.children DIVISIONs.
// Label is supplied by the caller via companyLabel (the clicked
// department name from TraceOverlayContext).
function buildCompanyNode(
  company: CompanyTraceNode,
  companyLabel: string,
  divisionStates?: Map<string, DivisionLoadStatus>,
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
): GraphTreeNode {
  const divisionChildren = company.children.map((div) =>
    buildDivisionNode(div, divisionStates, itemType, validPath),
  );
  if (divisionChildren.length > 0) {
    calculateSiblingWeights(divisionChildren);
  }
  return {
    id: "__company_root__",
    type: "COMPANY",
    label: companyLabel,
    tag: "회사",
    metric: company.metric,
    aggregationMethod: company.aggregationMethod,
    children: divisionChildren.length > 0 ? divisionChildren : undefined,
    weight: 0,
  };
}

// ── Public API: buildGraphTree ─────────────────────────────────────────────────

/**
 * Transforms TraceNode tree into GraphTreeNode tree with:
 * 1. MEMBER nodes may have a single MR_SUMMARY child when itemType is defined and items exist
 * 2. Contribution-rate edge weights computed by calculateSiblingWeights()
 *
 * For COMPANY root, returns a single-element array with the COMPANY node as root,
 * with DIVISION children nested beneath it (id = "__company_root__").
 * For other roots, returns a single-element array.
 */
export function buildGraphTree(
  root: TraceNode,
  divisionStates?: Map<string, DivisionLoadStatus>,
  itemType?: 'mergeRequest' | 'commit',
  validPath?: string,
  companyLabel?: string,
): GraphTreeNode[] {
  switch (root.level) {
    case "COMPANY":
      return [buildCompanyNode(
        root as CompanyTraceNode,
        companyLabel ?? "회사",
        divisionStates,
        itemType,
        validPath,
      )];
    case "DIVISION":
      return [buildDivisionNode(root as DivisionTraceNode, divisionStates, itemType, validPath)];
    case "TEAM":
      return [buildTeamNode(root as TeamTraceNode, itemType, validPath)];
    case "MEMBER":
      return [buildMemberNode(root as MemberTraceNode, itemType, validPath)];
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
      ids.push("__company_root__");
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

  const hasChildren = !!node.children && node.children.length > 0;
  // MEMBER nodes with children (MR_SUMMARY) are always expanded — no toggle needed
  const isExpanded = node.type === "MEMBER" ? hasChildren : expandedNodes.has(node.id);

  if (!hasChildren || !isExpanded) {
    // Leaf or collapsed: place at yStart.
    const nodeY = yStart;
    const positioned: PositionedNode = {
      id: node.id,
      type: node.type,
      x,
      y: nodeY,
      width: w,
      height: h,
      cx: x + w / 2,
      cy: nodeY + h / 2,
      graphNode: node,
      hasChildren,
      isExpanded,
      loadState: node.loadState,
    };
    outNodes.push(positioned);
    nodeMap.set(node.id, positioned);
    return { bottom: yStart + h };
  }

  const childX = x + w + H_GAP;

  // Has expanded children: position children first, then center parent
  let cy = yStart;
  let maxBottom = yStart;
  const childPositions: { cy: number }[] = [];

  // Snapshot counts before children are positioned so we can shift the subtree if needed
  const nodesBeforeChildren = outNodes.length;
  const edgesBeforeChildren = outEdges.length;

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

  // Center parent among children; clamp so parent never drifts above yStart.
  // When the child subtree is shorter than the parent node, centering can push
  // parentY below yStart, eating into V_GAP with the previous sibling.
  // In that case, shift all already-positioned child nodes (and their edges) down
  // by the deficit to maintain the centering relationship while keeping parentY >= yStart.
  const firstChildCy = childPositions[0]?.cy ?? yStart;
  const lastChildCy = childPositions[childPositions.length - 1]?.cy ?? yStart;
  const parentCy = (firstChildCy + lastChildCy) / 2;
  let parentY = parentCy - h / 2;

  if (parentY < yStart) {
    const shift = yStart - parentY;
    for (const n of outNodes.slice(nodesBeforeChildren)) {
      n.y += shift;
      n.cy += shift;
    }
    for (const e of outEdges.slice(edgesBeforeChildren)) {
      e.y1 += shift;
      e.y2 += shift;
    }
    parentY = yStart;
    maxBottom += shift;
  }

  // After potential clamping, recompute the actual vertical center of the parent node
  const actualParentCy = parentY + h / 2;

  const positioned: PositionedNode = {
    id: node.id,
    type: node.type,
    x,
    y: parentY,
    width: w,
    height: h,
    cx: x + w / 2,
    cy: actualParentCy,
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
        y1: actualParentCy,
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
