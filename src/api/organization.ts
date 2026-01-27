import type {
  OrganizationCompareResponse,
  OrgHistoryResponse,
  OrgTypeSettingsResponse,
  TabType,
  AggregationType,
  FormatType,
  FlatViewType,
} from "@/types/organization.types";
import { apiGet, apiPatch, apiPut } from "@/libs/fetch";

// 개발조직 일괄 변경 요청 타입
export interface EvaluationTargetChange {
  code: string;
  isEvaluationTarget: boolean;
}

export interface BulkEvaluationTargetRequest {
  changes: EvaluationTargetChange[];
}

/**
 * 탭 타입별 API 엔드포인트 매핑
 * - UI 탭 ID (codeQuality 등) → API 엔드포인트 (quality 등)
 */
const TAB_ENDPOINT_MAP: Record<TabType, string> = {
  all: "bdpi", // 전체 탭은 bdpi 엔드포인트 사용
  bdpi: "bdpi",
  codeQuality: "quality",
  reviewQuality: "review",
  developmentEfficiency: "efficiency",
};

/**
 * 월별 조직도 트리 조회 API (기본 - tree 엔드포인트)
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 조직 트리 데이터
 */
export const fetchOrganizationTree = async (
  yearMonth: string,
): Promise<OrganizationCompareResponse> => {
  return apiGet<OrganizationCompareResponse>(
    `/departments/monthly/tree?yearMonth=${yearMonth}`,
  );
};

/**
 * 탭별 조직 지표 데이터 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param tab - 탭 타입 (bdpi, codeQuality, reviewQuality, developmentEfficiency)
 * @returns 조직 트리 데이터 (탭별 지표 포함)
 */
export const fetchOrganizationByTab = async (
  yearMonth: string,
  tab: TabType,
): Promise<OrganizationCompareResponse> => {
  const endpoint = TAB_ENDPOINT_MAP[tab];
  return apiGet<OrganizationCompareResponse>(
    `/departments/monthly/${endpoint}?yearMonth=${yearMonth}`,
  );
};

/**
 * 전체 지표 API 요청 파라미터 타입
 */
export interface FetchAllMetricsParams {
  yearMonth: string;
  aggregation?: AggregationType;
  format?: FormatType;
  type?: FlatViewType;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * 전체 지표 포함 조직 데이터 조회 API
 * - 30개 개별 지표 + BDPI 포함
 * @param params - API 요청 파라미터
 * @returns 조직 트리 데이터 (전체 지표 포함)
 */
export const fetchOrganizationAllMetrics = async (
  params: FetchAllMetricsParams | string,
): Promise<OrganizationCompareResponse> => {
  // 하위 호환: string으로 yearMonth만 전달된 경우
  const normalizedParams: FetchAllMetricsParams =
    typeof params === "string" ? { yearMonth: params } : params;

  const {
    yearMonth,
    aggregation = "avg",
    format = "tree",
    type,
    sortBy,
    order,
    page,
    limit,
    search,
  } = normalizedParams;

  // URL 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  queryParams.set("yearMonth", yearMonth);
  queryParams.set("aggregation", aggregation);

  if (format) queryParams.set("format", format);
  if (type && format === "list") queryParams.set("type", type);
  if (sortBy && format === "list") queryParams.set("sortBy", sortBy);
  if (order) queryParams.set("order", order);
  if (page && format === "list") queryParams.set("page", String(page));
  if (limit && format === "list") queryParams.set("limit", String(limit));
  if (search) queryParams.set("search", search);

  // 실제 API 호출
  return apiGet<OrganizationCompareResponse>(
    `/departments/monthly/metrics?${queryParams.toString()}`,
  );
};

/**
 * BDPI 지표 조직 데이터 조회 API
 * - 코드품질, 리뷰품질, 개발효율, BDPI, 전월대비 포함
 * @param params - API 요청 파라미터
 * @returns 조직 트리 데이터 (BDPI 지표 포함)
 */
export const fetchOrganizationBdpiMetrics = async (
  params: FetchAllMetricsParams,
): Promise<OrganizationCompareResponse> => {
  const {
    yearMonth,
    aggregation = "avg",
    format = "tree",
    type,
    search,
  } = params;

  // URL 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  queryParams.set("yearMonth", yearMonth);
  queryParams.set("aggregation", aggregation);
  queryParams.set("format", format);

  if (type && format === "list") queryParams.set("type", type);
  if (search) queryParams.set("search", search);

  return apiGet<OrganizationCompareResponse>(
    `/departments/monthly/bdpi?${queryParams.toString()}`,
  );
};

/**
 * 조직도 변경 이력 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식), 미입력시 전체 기간 조회
 * @returns 변경 이력 데이터
 */
export const fetchOrgChangeHistory = async (
  yearMonth?: string,
): Promise<OrgHistoryResponse> => {
  const params = new URLSearchParams();
  params.append("limit", "2000");
  if (yearMonth) {
    params.append("yearMonth", yearMonth);
  }
  return apiGet<OrgHistoryResponse>(
    `/departments/change-history?${params.toString()}`,
  );
};

/**
 * 조직 유형 설정 조회 API
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 조직 유형 설정 트리 데이터
 */
export const fetchOrgTypeSettings = async (
  yearMonth: string,
): Promise<OrgTypeSettingsResponse> => {
  return apiGet<OrgTypeSettingsResponse>(
    `/departments/org-type-settings?yearMonth=${yearMonth}`,
  );
};

/**
 * 개발조직 포함/제외 일괄 변경 API
 * @param request - 변경할 조직 목록
 * @returns 성공 여부
 */
export const updateEvaluationTargetsBulk = async (
  request: BulkEvaluationTargetRequest,
): Promise<void> => {
  return apiPut<void>(`/departments/evaluation-targets/bulk`, request);
};

// 개인별 지표 순위 API 응답 타입
export interface MemberMetricRanking {
  metricName: string;
  achievementRate: number | null;
  category: string;
}

export interface MemberMetricRankingsResponse {
  employeeId: string;
  name: string;
  yearMonth: string;
  rankings: MemberMetricRanking[];
}

/**
 * 개인별 지표 순위 조회 API
 * @param employeeId - 사원 ID
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @returns 개인별 지표 순위 데이터
 */
export const fetchMemberMetricRankings = async (
  employeeId: string,
  yearMonth: string,
): Promise<MemberMetricRankingsResponse> => {
  return apiGet<MemberMetricRankingsResponse>(
    `/departments/members/${employeeId}/metric-rankings?yearMonth=${yearMonth}`,
  );
};

// 지표 추세 타입
export interface MetricTrend {
  direction: "up" | "down" | "same" | "new" | "no_data" | null;
  currentValue: number | null;
  previousValue: number | null;
  changeRate: number | null;
}

// 지표 정의 API 응답 타입
export interface MetricDefinitionResponse {
  metricCode: string;
  title: string;
  unit: string;
  targetValue: string | null;
  description: string;
  tooltip: string | null;
  formula: string | null;
  trend: MetricTrend | null;
  value: number | null;
  avgRate?: number | null;
  status: string | null;
}

/**
 * 지표 정의 조회 API
 * @param metricCode - 지표 코드
 * @returns 지표 정의 데이터
 */
export const fetchMetricDefinition = async (
  metricCode: string,
): Promise<MetricDefinitionResponse> => {
  return apiGet<MetricDefinitionResponse>(`/metrics/definitions/${metricCode}`);
};

// 지표 순서 응답 타입
export interface MetricOrderResponse {
  order: string[];
}

// 지표 순서 변경 요청 타입
export interface UpdateMetricOrderRequest {
  fromIndex: number;
  toIndex: number;
}

/**
 * 지표 순서 조회 API
 * @returns 지표 순서 배열
 */
export const fetchMetricOrder = async (): Promise<MetricOrderResponse> => {
  return apiGet<MetricOrderResponse>(`/metrics/order`);
};

/**
 * 지표 순서 변경 API
 * @param fromIndex - 이동할 지표의 현재 인덱스
 * @param toIndex - 이동할 지표의 목표 인덱스
 * @returns 변경된 지표 순서 배열
 */
export const updateMetricOrder = async (
  fromIndex: number,
  toIndex: number,
): Promise<MetricOrderResponse> => {
  return apiPatch<MetricOrderResponse>(`/metrics/order`, {
    fromIndex,
    toIndex,
  });
};
