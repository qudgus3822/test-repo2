// ── Query Parameters ──

export interface TraceQuery {
  metricName: string;
  periodKey: string; // "YYYYMMDD" (DAILY) or "YYYY-MM" (MONTHLY)
  aggregationLevel: 'MEMBER' | 'TEAM' | 'DIVISION' | 'COMPANY';
  memberId?: string;
  employeeId?: string;
  departmentCode?: string;
  excludeMergeRequests?: boolean;
}

// ── Metric Metadata ──

export type TimeUnitConversion = 'seconds_to_hours' | 'minutes_to_hours' | 'none';

export interface MetricInfo {
  title: string;
  category: string;
  aggregationType: string;
  rawUnit: string;
  displayUnit: string;
  timeUnitConversion: TimeUnitConversion | string;
}

// ── Metric Snapshot ──

export interface MetricSnapshot {
  value: number;
  rawValue: number;
  score: number;
  weightedScore: number;
  count: number;
  countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS';
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
  level: 'MEMBER';
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberEmployeeId: string;
  metric: MetricSnapshot;
  rawDailyData: DailyUserMetric[] | null;
  mergeRequests: MergeRequestSummary[] | null;
}

export interface TeamTraceNode {
  level: 'TEAM';
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: MemberTraceNode[] | null;
}

export interface DivisionTraceNode {
  level: 'DIVISION';
  departmentCode: string;
  departmentName: string;
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: TeamTraceNode[] | null; // null in COMPANY shallow response
}

export interface CompanyTraceNode {
  level: 'COMPANY';
  metric: MetricSnapshot;
  aggregationMethod: 'WEIGHTED_AVERAGE' | 'SUM';
  children: DivisionTraceNode[];
}

export type TraceNode = CompanyTraceNode | DivisionTraceNode | TeamTraceNode | MemberTraceNode;

// ── Response ──

export interface TraceResult {
  metricInfo: MetricInfo;
  query: {
    metricName: string;
    periodKey: string;
    period: 'DAILY' | 'MONTHLY';
    aggregationLevel: 'MEMBER' | 'TEAM' | 'DIVISION' | 'COMPANY';
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
    mergeRequestsExcludedReason?: 'COMPANY_LEVEL' | 'USER_OPTED_OUT';
    isShallowResponse?: boolean;
  };
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
  aggregationLevel: 'MEMBER' | 'TEAM' | 'DIVISION';
  /** department code -- available from OrganizationDepartment.code */
  departmentCode?: string;
  /** department name for display */
  departmentName?: string;
  /** member employee ID -- available from OrganizationMember.employeeID */
  memberId?: string;
  /** member name for display */
  memberName?: string;
}
