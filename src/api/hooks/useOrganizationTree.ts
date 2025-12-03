import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationTree } from "@/api/organization";
import type {
  ApiOrganizationCompareResponse,
  ApiOrganizationDepartment,
  ApiOrganizationNode,
  OrganizationMetricValue,
  OrganizationMetricCategory,
} from "@/types/organization.types";

// Query Keys
export const organizationTreeKeys = {
  all: ["organizationTree"] as const,
  byMonth: (yearMonth: string) =>
    [...organizationTreeKeys.all, yearMonth] as const,
};

// ================================
// 임시 지표 데이터 생성 (API 연동 전까지 사용)
// ================================

// 지표 코드 목록
const METRIC_CODES = {
  codeQuality: [
    "TECH_DEBT",
    "CODE_COMPLEXITY",
    "CODE_DUPLICATION",
    "CODE_SMELL",
    "TEST_COVERAGE",
    "SECURITY_VULNERABILITIES",
    "CODE_COUPLING",
    "BUG_COUNT",
    "INCIDENT_COUNT",
  ],
  reviewQuality: [
    "REVIEW_SPEED",
    "REVIEW_RESPONSE_RATE",
    "REVIEW_PARTICIPATION_RATE",
    "REVIEW_ACCEPTANCE_RATE",
    "REVIEW_FEEDBACK_CONCRETENESS",
    "REVIEW_REVIEWER_DIVERSE",
    "REVIEW_REQUEST_COUNT",
    "REVIEW_PARTICIPATION_COUNT",
    "REVIEW_PASS_RATE",
    "REVIEW_PARTICIPATION_NUMBER",
    "REVIEW_FEEDBACK_TIME",
    "REVIEW_COMPLETION_TIME",
  ],
  developmentEfficiency: [
    "DEPLOYMENT_FREQUENCY",
    "COMMIT_FREQUENCY",
    "LEAD_TIME",
    "FAILURE_DETECTION_TIME",
    "FAILURE_DIAGNOSIS_TIME",
    "FAILURE_RECOVERY_TIME",
    "DEPLOYMENT_SUCCESS_RATE",
    "MR_SIZE",
    "CODE_LINE_COUNT_PER_COMMIT",
  ],
};

// 지표별 목표값 및 범위 설정
const METRIC_CONFIG: Record<
  string,
  { targetValue: number; min: number; max: number; isLowerBetter?: boolean }
> = {
  TECH_DEBT: { targetValue: 40, min: 30, max: 60, isLowerBetter: true },
  CODE_COMPLEXITY: { targetValue: 5, min: 3, max: 8, isLowerBetter: true },
  CODE_DUPLICATION: { targetValue: 3, min: 1, max: 6, isLowerBetter: true },
  CODE_SMELL: { targetValue: 10, min: 5, max: 20, isLowerBetter: true },
  TEST_COVERAGE: { targetValue: 80, min: 60, max: 95 },
  SECURITY_VULNERABILITIES: {
    targetValue: 0,
    min: 0,
    max: 5,
    isLowerBetter: true,
  },
  CODE_COUPLING: { targetValue: 20, min: 10, max: 30, isLowerBetter: true },
  BUG_COUNT: { targetValue: 5, min: 0, max: 10, isLowerBetter: true },
  INCIDENT_COUNT: { targetValue: 2, min: 0, max: 5, isLowerBetter: true },
  REVIEW_SPEED: { targetValue: 24, min: 12, max: 36, isLowerBetter: true },
  REVIEW_RESPONSE_RATE: { targetValue: 85, min: 65, max: 98 },
  REVIEW_PARTICIPATION_RATE: { targetValue: 75, min: 55, max: 95 },
  REVIEW_ACCEPTANCE_RATE: { targetValue: 80, min: 60, max: 95 },
  REVIEW_FEEDBACK_CONCRETENESS: { targetValue: 80, min: 60, max: 95 },
  REVIEW_REVIEWER_DIVERSE: { targetValue: 70, min: 50, max: 90 },
  REVIEW_REQUEST_COUNT: { targetValue: 40, min: 20, max: 60 },
  REVIEW_PARTICIPATION_COUNT: { targetValue: 30, min: 15, max: 50 },
  REVIEW_PASS_RATE: { targetValue: 80, min: 60, max: 95 },
  REVIEW_PARTICIPATION_NUMBER: { targetValue: 50, min: 30, max: 80 },
  REVIEW_FEEDBACK_TIME: {
    targetValue: 16,
    min: 8,
    max: 24,
    isLowerBetter: true,
  },
  REVIEW_COMPLETION_TIME: {
    targetValue: 24,
    min: 12,
    max: 48,
    isLowerBetter: true,
  },
  DEPLOYMENT_FREQUENCY: { targetValue: 5, min: 2, max: 12 },
  COMMIT_FREQUENCY: { targetValue: 20, min: 10, max: 35 },
  LEAD_TIME: { targetValue: 48, min: 24, max: 72, isLowerBetter: true },
  FAILURE_DETECTION_TIME: {
    targetValue: 10,
    min: 5,
    max: 30,
    isLowerBetter: true,
  },
  FAILURE_DIAGNOSIS_TIME: {
    targetValue: 15,
    min: 5,
    max: 40,
    isLowerBetter: true,
  },
  FAILURE_RECOVERY_TIME: {
    targetValue: 30,
    min: 10,
    max: 60,
    isLowerBetter: true,
  },
  DEPLOYMENT_SUCCESS_RATE: { targetValue: 90, min: 75, max: 100 },
  MR_SIZE: { targetValue: 200, min: 50, max: 500, isLowerBetter: true },
  CODE_LINE_COUNT_PER_COMMIT: {
    targetValue: 100,
    min: 20,
    max: 300,
    isLowerBetter: true,
  },
};

// 시드 기반 랜덤 값 생성 (일관된 결과를 위해)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 랜덤 값 생성 (소수점 1자리)
const randomValue = (min: number, max: number, seed: number): number => {
  return Math.round((seededRandom(seed) * (max - min) + min) * 10) / 10;
};

// 달성률 계산
const calculateAchievementRate = (
  value: number,
  targetValue: number,
  isLowerBetter?: boolean,
): number => {
  if (isLowerBetter) {
    return targetValue === 0
      ? value === 0
        ? 100
        : 0
      : Math.round((targetValue / value) * 100);
  }
  return targetValue === 0 ? 100 : Math.round((value / targetValue) * 100);
};

// 지표 코드 → 카테고리 매핑
const getMetricCategory = (
  metricCode: string,
): OrganizationMetricCategory => {
  if (METRIC_CODES.codeQuality.includes(metricCode)) return "code_quality";
  if (METRIC_CODES.reviewQuality.includes(metricCode)) return "review_quality";
  return "development_efficiency";
};

// 30개 지표 데이터 생성 함수
const generateMetrics = (seed: number = 0): OrganizationMetricValue[] => {
  const metrics: OrganizationMetricValue[] = [];
  const allCodes = [
    ...METRIC_CODES.codeQuality,
    ...METRIC_CODES.reviewQuality,
    ...METRIC_CODES.developmentEfficiency,
  ];

  allCodes.forEach((metricCode, index) => {
    const config = METRIC_CONFIG[metricCode];
    const adjustedMin =
      config.min + (seed % 5) * ((config.max - config.min) / 10);
    const adjustedMax =
      config.max - ((seed + index) % 3) * ((config.max - config.min) / 10);
    const value = randomValue(
      Math.min(adjustedMin, adjustedMax),
      Math.max(adjustedMin, adjustedMax),
      seed * 100 + index,
    );
    const achievementRate = calculateAchievementRate(
      value,
      config.targetValue,
      config.isLowerBetter,
    );

    metrics.push({
      metricCode,
      category: getMetricCategory(metricCode),
      isUse: true,
      value,
      targetValue: config.targetValue,
      achievementRate,
    });
  });

  return metrics;
};

// 코드에서 시드 생성 (문자열 → 숫자)
const generateSeedFromCode = (code: string): number => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// 노드에 임시 지표 필드 추가
const addMockMetricsToNode = (
  node: ApiOrganizationNode,
): ApiOrganizationNode => {
  const seed = generateSeedFromCode(
    node.type === "department" ? node.code : node.employeeID,
  );
  const metrics = generateMetrics(seed);

  // 카테고리별 평균 점수 계산
  const codeQualityMetrics = metrics.filter(
    (m) => m.category === "code_quality" && m.achievementRate !== null,
  );
  const reviewQualityMetrics = metrics.filter(
    (m) => m.category === "review_quality" && m.achievementRate !== null,
  );
  const devEfficiencyMetrics = metrics.filter(
    (m) => m.category === "development_efficiency" && m.achievementRate !== null,
  );

  const avgScore = (arr: OrganizationMetricValue[]) =>
    arr.length > 0
      ? Math.round(
          (arr.reduce((sum, m) => sum + (m.achievementRate || 0), 0) /
            arr.length) *
            10,
        ) / 10
      : null;

  const codeQuality = avgScore(codeQualityMetrics);
  const reviewQuality = avgScore(reviewQualityMetrics);
  const developmentEfficiency = avgScore(devEfficiencyMetrics);

  // BDPI = 3개 카테고리 평균
  const scores = [codeQuality, reviewQuality, developmentEfficiency].filter(
    (s): s is number => s !== null,
  );
  const bdpi =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      : null;

  // 전월비교 (임시로 -5 ~ +5 랜덤)
  const changeRate =
    Math.round((seededRandom(seed + 999) * 10 - 5) * 10) / 10;

  if (node.type === "department") {
    const dept = node as ApiOrganizationDepartment;
    return {
      ...dept,
      codeQuality,
      reviewQuality,
      developmentEfficiency,
      bdpi,
      changeRate,
      metrics,
      children: dept.children?.map(addMockMetricsToNode),
    };
  } else {
    return {
      ...node,
      codeQuality,
      reviewQuality,
      developmentEfficiency,
      bdpi,
      changeRate,
      metrics,
    };
  }
};

// API 응답에 임시 지표 필드 추가
const addMockMetricsToResponse = (
  response: ApiOrganizationCompareResponse,
): ApiOrganizationCompareResponse => {
  return {
    ...response,
    tree: response.tree.map(
      (dept) => addMockMetricsToNode(dept) as ApiOrganizationDepartment,
    ),
  };
};

/**
 * 월별 조직도 트리 조회 Hook
 * @param yearMonth - 조회 연월 (YYYY-MM 형식)
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useOrganizationTree = (
  yearMonth: string,
  enabled: boolean = true,
) => {
  return useQuery<ApiOrganizationCompareResponse, Error>({
    queryKey: organizationTreeKeys.byMonth(yearMonth),
    queryFn: async () => {
      const response = await fetchOrganizationTree(yearMonth);
      // TODO: API에서 지표 데이터 제공 시 아래 라인 제거
      return addMockMetricsToResponse(response);
    },
    enabled: enabled && !!yearMonth,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
