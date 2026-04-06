// ── Query Parameters ──

export interface TraceQuery {
  metricName: string;
  periodKey: string; // "YYYYMMDD" (DAILY) or "YYYY-MM" (MONTHLY)
  aggregationLevel: "MEMBER" | "TEAM" | "DIVISION" | "COMPANY";
  memberId?: string;
  employeeId?: string;
  departmentCode?: string;
  excludeMergeRequests?: boolean;
}

// ── Metric Metadata ──

export type TimeUnitConversion =
  | "seconds_to_hours"
  | "minutes_to_hours"
  | "none";

export interface MetricInfo {
  title: string;
  category: string;
  aggregationType: string;
  rawUnit: string;
  displayUnit: string;
  timeUnitConversion: TimeUnitConversion | string;
  direction: "FORWARD" | "REVERSE";
}

// ── Metric Snapshot ──

export interface MetricSnapshot {
  value: number;
  rawValue: number;
  score: number;
  weightedScore: number;
  count: number;
  countLabel: "ITEMS" | "DAYS" | "MEMBERS";
  unit?: string;
}

// ── MR ──

export interface MergeRequestSummary {
  iid: number;
  repositoryId: number;
  repositoryName: string;
  title: string;
  author: string;
  authorEmail: string;
  reviewers: string[];
  sourceBranch: string;
  targetBranch: string;
  createdAt: string; // ISO date string (Date -> string in JSON)
  mergedAt?: string;
  projectEpicKey?: string;
  projectName?: string;
}

// ── Daily Data ──

export interface DailyUserMetric {
  date: string; // YYYYMMDD
  value: number;
  totalCount: number;
  relatedMergeRequests: Array<{ iid: number; repositoryId: number }>;
  details: Record<string, unknown> | null;
}

// ── Tree Nodes (discriminated union on level) ──

export interface MemberTraceNode {
  level: "MEMBER";
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberEmployeeId: string;
  metric: MetricSnapshot;
  rawDailyData: DailyUserMetric[] | null;
  mergeRequests: MergeRequestSummary[] | null;
}

export interface TeamTraceNode {
  level: "TEAM";
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: "WEIGHTED_AVERAGE" | "SUM";
  children: MemberTraceNode[] | null;
}

export interface DivisionTraceNode {
  level: "DIVISION";
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: "WEIGHTED_AVERAGE" | "SUM";
  children: TeamTraceNode[] | null; // null in COMPANY shallow response
}

export interface CompanyTraceNode {
  level: "COMPANY";
  metric: MetricSnapshot;
  aggregationMethod: "WEIGHTED_AVERAGE" | "SUM";
  children: DivisionTraceNode[];
}

export type TraceNode =
  | CompanyTraceNode
  | DivisionTraceNode
  | TeamTraceNode
  | MemberTraceNode;

// ── Response ──

export interface TraceResult {
  metricInfo: MetricInfo;
  query: {
    metricName: string;
    periodKey: string;
    period: "DAILY" | "MONTHLY";
    aggregationLevel: "MEMBER" | "TEAM" | "DIVISION" | "COMPANY";
  };
  root: TraceNode | null;
  rawDailyMetric: {
    dateStart: string;
    dateEnd: string;
    documentCount: number;
    totalUsers: number;
  } | null;
  metadata: {
    supportsMemberLevel: boolean;
    lowestTraceLevel: string;
    mergeRequestsIncluded: boolean;
    mergeRequestsExcludedReason?: "COMPANY_LEVEL" | "USER_OPTED_OUT";
    isShallowResponse?: boolean;
  };
}

// -- Graph Layout Types --

export type GraphNodeType = "DIVISION" | "TEAM" | "MEMBER" | "MR";

/**
 * Opaque bundle of tooltip data for an edge's contribution rate display.
 * Constructed by calculateSiblingWeights(), passed through the layout engine
 * as-is, and consumed only by EdgeTooltip. The layout engine does not need to
 * know the internal shape.
 */
export interface EdgeTooltipData {
  /** Weight distribution strategy: volume-weighted or equal (MR / zero-sum fallback) */
  weightStrategy: 'volumeContribution' | 'equal';
  /** The node's own rawValue (not multiplied by count) */
  rawValue: number;
  /** The node's own count */
  count: number;
  /** "DAYS" | "MEMBERS" | "ITEMS" */
  countLabel: string;
  /** Sum of siblings' rawValues (used as denominator when all siblings share the same count) */
  rawValueSum: number;
  /** Whether all siblings share the same count value */
  siblingsSameCount: boolean;
  /** Numerator of the weight fraction (rawValue × count for volume, 1 for equal) */
  numerator: number;
  /** Denominator of the weight fraction */
  denominator: number;
}

/**
 * Typed structure for MR-level metric detail data from rawDailyData.
 * Fields are based on the known API response structure.
 * The index signature allows extensibility for other metric types.
 */
export interface MergeRequestMetricDetail {
  responseTime?: number;
  responseTimeFormatted?: string;
  reviewRequestTime?: string;
  firstResponseTime?: string;
  [key: string]: unknown; // extensible for other metrics
}

/**
 * Intermediate tree node used by the graph layout engine.
 * Wraps TraceNode data and MR data into a uniform structure.
 * Built by buildGraphTree() from TraceNode + expand state.
 */
export interface GraphTreeNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subLabel?: string; // employeeId for MEMBER, repoName for MR
  tag?: string; // "부문/실", "팀", "개인", "MR"
  // Source data references
  traceNode?: DivisionTraceNode | TeamTraceNode | MemberTraceNode;
  mergeRequest?: MergeRequestSummary;
  mrMetricData?: MergeRequestMetricDetail | null; // Enriched detail from rawDailyData
  // Metrics for display
  metric?: MetricSnapshot;
  aggregationMethod?: "WEIGHTED_AVERAGE" | "SUM";
  // Tree structure
  children?: GraphTreeNode[];
  /**
   * Edge weight from parent (0-1).
   * Set by calculateSiblingWeights() to the node's volume contribution share
   * (rawValue × count / sum) or 1/N for equal distribution.
   * Defaults to 0 before calculateSiblingWeights runs; root nodes leave it unused.
   */
  weight?: number;
  /**
   * Opaque tooltip data bundle set by calculateSiblingWeights().
   * Passed through the layout engine without inspection; consumed only by EdgeTooltip.
   */
  tooltipData?: EdgeTooltipData;
  // Loading state for sequential loader placeholders
  loadState?: "pending" | "loading" | "loaded" | "error";
}

/**
 * A node with computed screen coordinates from the layout engine.
 */
export interface PositionedNode {
  id: string;
  type: GraphNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number; // center x
  cy: number; // center y
  // Source data for rendering
  graphNode: GraphTreeNode;
  // Whether this node has children (for expand/collapse indicator)
  hasChildren: boolean;
  // Whether this node is currently expanded
  isExpanded: boolean;
  // Loading state (for sequential loader placeholders)
  loadState?: "pending" | "loading" | "loaded" | "error";
}

/**
 * An edge with computed screen coordinates from the layout engine.
 */
export interface PositionedEdge {
  id: string; // `${parentId}->${childId}`
  parentId: string;
  childId: string;
  parentType: GraphNodeType;
  childType: GraphNodeType;
  x1: number; // parent right edge center
  y1: number;
  x2: number; // child left edge center
  y2: number;
  weight: number; // 0-1, currently always 1.0
  // Identity labels (not tooltip data -- used to display parent → child header in tooltip)
  parentLabel: string;
  childLabel: string;
  /** Opaque tooltip data bundle passed through from GraphTreeNode.tooltipData */
  tooltip: EdgeTooltipData;
}

/**
 * Complete layout result from computeGraphLayout().
 */
export interface GraphLayout {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  contentWidth: number;
  contentHeight: number;
  /** O(1) node lookup by ID -- use instead of linear scan on nodes[] */
  nodeMap: Map<string, PositionedNode>;
}

/**
 * HeatmapCell click -> overlay data flow context.
 * Constructed by the row components and passed to the overlay.
 */
export interface TraceOverlayContext {
  /** metricCode from HeatmapCell (e.g. "REVIEW_SPEED") -- this is the key in the metrics record */
  metricCode: string;
  /** Resolved API metricName from MetricVisibleInfoResponse.enumCode (e.g. "technical_debt") */
  metricApiName: string;
  /** metricName for display (Korean name, e.g. "리뷰 속도") */
  metricDisplayName?: string;
  /** aggregation level determined by which row type was clicked */
  aggregationLevel: "MEMBER" | "TEAM" | "DIVISION";
  /** department code -- available from OrganizationDepartment.code */
  departmentCode?: string;
  /** department name for display */
  departmentName?: string;
  /** member employee ID -- available from OrganizationMember.employeeID */
  memberId?: string;
  /** member name for display */
  memberName?: string;
}
