import type {
  ApiOrganizationCompareResponse,
  ApiOrganizationDepartment,
  ApiOrganizationMember,
  OrganizationMetricValue,
  OrganizationData,
  Department,
  ChangeHistory,
} from "@/types/organization.types";

// ================================
// 30개 지표 목업 데이터 생성 헬퍼
// ================================

// 지표 코드 목록 (METRIC_CODE_NAMES 기준)
const METRIC_CODES = {
  // 코드품질 (9개)
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
  // 리뷰품질 (12개)
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
  // 개발효율 (9개)
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

// 지표별 목표값 및 범위 설정 (METRIC_CODE_NAMES 기준)
const METRIC_CONFIG: Record<
  string,
  { targetValue: number; min: number; max: number; isLowerBetter?: boolean }
> = {
  // 코드품질 (9개)
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
  // 리뷰품질 (12개)
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
  // 개발효율 (9개)
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

// 랜덤 값 생성 (소수점 1자리)
const randomValue = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

// 달성률 계산
const calculateAchievementRate = (
  value: number,
  targetValue: number,
  isLowerBetter?: boolean,
): number => {
  if (isLowerBetter) {
    // 낮을수록 좋은 지표: 목표값 대비 현재값 비율의 역수
    return targetValue === 0
      ? value === 0
        ? 100
        : 0
      : Math.round((targetValue / value) * 100);
  }
  // 높을수록 좋은 지표
  return targetValue === 0 ? 100 : Math.round((value / targetValue) * 100);
};

// 지표 코드 → 카테고리 매핑
const getMetricCategory = (
  metricCode: string,
): "code_quality" | "review_quality" | "development_efficiency" => {
  if (METRIC_CODES.codeQuality.includes(metricCode)) return "code_quality";
  if (METRIC_CODES.reviewQuality.includes(metricCode)) return "review_quality";
  return "development_efficiency";
};

// 30개 지표 데이터 생성 함수
const generateMetrics = (
  seed: number = 0,
  isUse: boolean = true,
): OrganizationMetricValue[] => {
  const metrics: OrganizationMetricValue[] = [];
  const allCodes = [
    ...METRIC_CODES.codeQuality,
    ...METRIC_CODES.reviewQuality,
    ...METRIC_CODES.developmentEfficiency,
  ];

  allCodes.forEach((metricCode, index) => {
    const config = METRIC_CONFIG[metricCode];

    // isUse가 false인 경우 값을 null로 설정
    if (!isUse) {
      metrics.push({
        metricCode,
        category: getMetricCategory(metricCode),
        isUse: false,
        value: null,
        targetValue: config.targetValue,
        achievementRate: null,
      });
      return;
    }

    // seed를 사용하여 각 조직마다 다른 값 생성
    const adjustedMin =
      config.min + (seed % 5) * ((config.max - config.min) / 10);
    const adjustedMax =
      config.max - ((seed + index) % 3) * ((config.max - config.min) / 10);
    const value = randomValue(
      Math.min(adjustedMin, adjustedMax),
      Math.max(adjustedMin, adjustedMax),
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

/**
 * 조직 비교 페이지 Mock 데이터
 * 조직도 이미지 참고하여 실제와 유사한 구조로 생성
 *
 * 조직 구조:
 * - IT부문 (82명) - Level 1
 *   - 코어플랫폼개발실 (21명) - Level 2
 *     - 자산플랫폼개발팀 (7명) - Level 3
 *     - 거래플랫폼개발팀 (7명) - Level 3
 *     - 공통플랫폼개발팀 (7명) - Level 3
 *   - 모바일App개발실 (15명) - Level 2
 *     - iOS개발팀 (7명) - Level 3
 *     - Android개발팀 (8명) - Level 3
 *   - 규제기술실 (7명) - Level 2
 *     - 규제개발팀 (7명) - Level 3
 *   - 서비스BE개발실 (26명) - Level 2
 *     - 금융상품개발팀 (10명) - Level 3
 *     - 회원인증개발팀 (8명) - Level 3
 *     - 거래주문개발팀 (8명) - Level 3
 *   - 웹FE개발실 (13명) - Level 2
 *     - 거래웹개발팀 (7명) - Level 3
 *     - 클라이언트웹개발팀 (6명) - Level 3
 */

// ================================
// 코어플랫폼개발실 하위 팀 멤버
// ================================

// 자산플랫폼개발팀 멤버
const assetPlatformDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "한영훈",
    employeeID: "younghun.han",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 87.9,
    reviewQuality: 87.9,
    developmentEfficiency: 84.9,
    bdpi: 85.9,
    changeRate: 4.1,
    email: "younghun.han@company.com",
    metrics: generateMetrics(1),
    change: [
      {
        changeType: "JOINED",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "입사",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "양기모",
    employeeID: "gimo.yang",
    role: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
    email: "gimo.yang@company.com",
    metrics: generateMetrics(2),
    change: [
      {
        changeType: "TRANSFERRED_IN",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "팀이동: 공통플랫폼개발팀 → 자산플랫폼개발팀",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "최유진",
    employeeID: "yujin.choi",
    role: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 87.9,
    reviewQuality: 82.9,
    developmentEfficiency: 82.9,
    bdpi: 83.9,
    changeRate: 0.6,
    email: "yujin.choi@company.com",
    metrics: generateMetrics(3),
    change: [],
  },
  {
    type: "member",
    name: "황동현",
    employeeID: "donghyun.hwang",
    role: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 87.9,
    reviewQuality: 82.9,
    developmentEfficiency: 82.9,
    bdpi: 83.9,
    changeRate: 0.6,
    email: "donghyun.hwang@company.com",
    metrics: generateMetrics(4),
    change: [
      {
        changeType: "RESIGNED",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "퇴사",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "김시현",
    employeeID: "sihyun.kim",
    role: "ASSISTANT_MANAGER",
    status: "ON_LEAVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: null,
    reviewQuality: null,
    developmentEfficiency: null,
    bdpi: null,
    changeRate: null,
    email: "sihyun.kim@company.com",
    metrics: generateMetrics(5, false), // 휴직 상태는 지표 미사용
    change: [
      {
        changeType: "ON_LEAVE",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "휴직",
        processedBy: "자동(LDAP)",
      },
    ],
  },
];

// 거래플랫폼개발팀 멤버
const tradingPlatformDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "김가은",
    employeeID: "gaeun.kim",
    role: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1002",
    departmentName: "거래플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 87.9,
    reviewQuality: 82.9,
    developmentEfficiency: 82.9,
    bdpi: 83.9,
    changeRate: 0.6,
    email: "gaeun.kim@company.com",
    metrics: generateMetrics(6),
    change: [],
  },
];

// 공통플랫폼개발팀 멤버
const commonPlatformDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "박흥부",
    employeeID: "hyeongbu.park",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 85.2,
    reviewQuality: 83.4,
    developmentEfficiency: 84.1,
    bdpi: 84.2,
    changeRate: 2.3,
    email: "hyeongbu.park@company.com",
    metrics: generateMetrics(7),
    change: [
      {
        changeType: "RESIGNED",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "퇴사",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "강놀부",
    employeeID: "nambu.park",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 85.2,
    reviewQuality: 83.4,
    developmentEfficiency: 84.1,
    bdpi: 84.2,
    changeRate: 2.3,
    email: "nambu.park@company.com",
    metrics: generateMetrics(8),
    change: [
      {
        changeType: "JOINED",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "입사",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "황한주",
    employeeID: "hanju.hwang",
    role: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 85.2,
    reviewQuality: 83.4,
    developmentEfficiency: 84.1,
    bdpi: 84.2,
    changeRate: 2.3,
    email: "hanju.hwang@company.com",
    metrics: generateMetrics(9),
    change: [],
  },
  {
    type: "member",
    name: "박덕훈",
    employeeID: "duckhun.park",
    role: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 85.2,
    reviewQuality: 83.4,
    developmentEfficiency: 84.1,
    bdpi: 84.2,
    changeRate: 2.3,
    email: "duckhun.park@company.com",
    metrics: generateMetrics(10),
    change: [
      {
        changeType: "RETURNED",
        changeDate: "2025-10-01T09:00:00.000Z",
        changeEndDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "복직",
        processedBy: "자동(LDAP)",
      },
      {
        changeType: "TRANSFERRED_OUT",
        changeDate: "2025-10-01T09:00:00.000Z",
        category: "HR",
        changeDetail: "팀이동: 자산플랫폼개발팀 → 공통플랫폼개발팀",
        processedBy: "자동(LDAP)",
      },
      {
        changeType: "CHANGED_ROLE",
        changeDate: "2025-10-01T09:00:00.000Z",
        category: "HR",
        changeDetail: "직급변경: 사원 → 대리",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "양기모",
    employeeID: "gimo.yang",
    role: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
    email: "gimo.yang@company.com",
    metrics: generateMetrics(11),
    change: [
      {
        changeType: "TRANSFERRED_OUT",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "팀이동: 공통플랫폼개발팀 → 자산플랫폼개발팀",
        processedBy: "자동(LDAP)",
      },
    ],
  },
  {
    type: "member",
    name: "임준서",
    employeeID: "junseo.lim",
    role: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 85.2,
    reviewQuality: 83.4,
    developmentEfficiency: 84.1,
    bdpi: 84.2,
    changeRate: 2.3,
    email: "junseo.lim@company.com",
    metrics: generateMetrics(12),
    change: [
      {
        changeType: "CHANGED_ROLE",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "직급변경: 사원 → 대리",
        processedBy: "자동(LDAP)",
      },
    ],
  },
];

// ================================
// 모바일App개발실 하위 팀 멤버
// ================================

// iOS개발팀 멤버
const iosDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "최유찬",
    employeeID: "yuchan.choi",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "2001",
    departmentName: "iOS개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 86.9,
    reviewQuality: 86.9,
    developmentEfficiency: 85.9,
    bdpi: 84.9,
    changeRate: 4.4,
    email: "yuchan.choi@company.com",
    metrics: generateMetrics(13),
    change: [],
  },
];

// Android개발팀 멤버
const androidDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "황동현",
    employeeID: "donghyun.hwang",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "2002",
    departmentName: "Android개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 87.9,
    reviewQuality: 82.9,
    developmentEfficiency: 82.9,
    bdpi: 83.9,
    changeRate: 0.6,
    email: "donghyun.hwang@company.com",
    metrics: generateMetrics(14),
    change: [],
  },
];

// ================================
// 규제기술실 하위 팀 멤버
// ================================

// 규제개발팀 멤버
const regulationDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "김시현",
    employeeID: "sihyun.kim",
    role: "STAFF",
    status: "JOINED",
    departmentCode: "3001",
    departmentName: "규제개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: null,
    reviewQuality: null,
    developmentEfficiency: null,
    bdpi: null,
    changeRate: null,
    email: "sihyun.kim@company.com",
    metrics: [], // 신입이라 지표 데이터 없음
    change: [
      {
        changeType: "JOINED",
        changeDate: "2025-11-20T09:00:00.000Z",
        category: "HR",
        changeDetail: "입사",
        processedBy: "자동(LDAP)",
      },
    ],
  },
];

// ================================
// 서비스BE개발실 하위 팀 멤버
// ================================

// 금융상품개발팀 멤버
const financialProductDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "강동현",
    employeeID: "donghyun.kang",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4001",
    departmentName: "금융상품개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
    email: "donghyun.kang@company.com",
    metrics: generateMetrics(15),
    change: [],
  },
];

// 회원인증개발팀 멤버
const memberAuthDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "김갑수",
    employeeID: "gapsu.kim",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4002",
    departmentName: "회원인증개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 78.5,
    reviewQuality: 79.2,
    developmentEfficiency: 77.8,
    bdpi: 78.5,
    changeRate: 1.2,
    email: "gapsu.kim@company.com",
    metrics: generateMetrics(16),
    change: [],
  },
];

// 거래주문개발팀 멤버
const orderDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "함현주",
    employeeID: "hyunju.ham",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4003",
    departmentName: "거래주문개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
    email: "hyunju.ham@company.com",
    metrics: generateMetrics(17),
    change: [],
  },
];

// ================================
// 웹FE개발실 하위 팀 멤버
// ================================

// 거래웹개발팀 멤버
const tradingWebDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "홍길동",
    employeeID: "gildong.hong",
    role: "MANAGER",
    position: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "5001",
    departmentName: "거래웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
    email: "gildong.hong@company.com",
    metrics: generateMetrics(18),
    change: [],
  },
  {
    type: "member",
    name: "강감찬",
    employeeID: "gamchan.kang",
    role: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "5001",
    departmentName: "거래웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    codeQuality: 87.9,
    reviewQuality: 87.9,
    developmentEfficiency: 84.9,
    bdpi: 85.9,
    changeRate: 4.1,
    email: "gamchan.kang@company.com",
    metrics: generateMetrics(19),
    change: [],
  },
];

// 클라이언트웹개발팀 멤버
const clientWebDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "이현수",
    employeeID: "hyeonsu.lee",
    role: "ASSISTANT_MANAGER",
    status: "CHANGED_ROLE",
    departmentCode: "5002",
    departmentName: "클라이언트웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    previousRole: "STAFF",
    codeQuality: 86.9,
    reviewQuality: 86.9,
    developmentEfficiency: 85.9,
    bdpi: 84.9,
    changeRate: 4.4,
    email: "hyeonsu.lee@company.com",
    metrics: generateMetrics(20),
    change: [
      {
        changeType: "CHANGED_ROLE",
        changeDate: "2025-11-28T09:00:00.000Z",
        category: "HR",
        changeDetail: "직급변경: 사원 → 대리",
        processedBy: "자동(LDAP)",
      },
    ],
  },
];

// ================================
// Level 3: 팀 단위
// ================================

// 코어플랫폼개발실 > 자산플랫폼개발팀
const assetPlatformDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "자산플랫폼개발팀",
  code: "1001",
  level: 3,
  displayName: "자산플랫폼개발팀[1001]",
  parentCode: "1000",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: assetPlatformDevTeamMembers,
  isExpanded: false,
  codeQuality: 86.1,
  reviewQuality: 83.4,
  developmentEfficiency: 85.2,
  bdpi: 84.9,
  changeRate: 2.9,
  metrics: generateMetrics(101),
  change: [
    {
      changeType: "CREATED",
      changeDate: "2025-11-28T09:00:00.000Z",
      category: "GROUP",
      changeDetail: "조직생성",
      processedBy: "자동(LDAP)",
    },
  ],
};

// 코어플랫폼개발실 > 거래플랫폼개발팀
const tradingPlatformDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "거래플랫폼개발팀",
  code: "1002",
  level: 3,
  displayName: "거래플랫폼개발팀[1002]",
  parentCode: "1000",
  sortOrder: 2,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: tradingPlatformDevTeamMembers,
  isExpanded: false,
  codeQuality: 87.9,
  reviewQuality: 82.9,
  developmentEfficiency: 82.9,
  bdpi: 83.9,
  changeRate: 0.6,
  metrics: generateMetrics(102),
  change: [],
};

// 코어플랫폼개발실 > 공통플랫폼개발팀
const commonPlatformDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "공통플랫폼개발팀",
  code: "1003",
  level: 3,
  displayName: "공통플랫폼개발팀[1003]",
  parentCode: "1000",
  sortOrder: 3,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: commonPlatformDevTeamMembers,
  isExpanded: false,
  codeQuality: 85.2,
  reviewQuality: 83.4,
  developmentEfficiency: 84.1,
  bdpi: 84.2,
  changeRate: 2.3,
  metrics: generateMetrics(103),
  change: [],
};

// 모바일App개발실 > iOS개발팀
const iosDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "iOS개발팀",
  code: "2001",
  level: 3,
  displayName: "iOS개발팀[2001]",
  parentCode: "2000",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: iosDevTeamMembers,
  isExpanded: false,
  codeQuality: 86.9,
  reviewQuality: 86.9,
  developmentEfficiency: 85.9,
  bdpi: 84.9,
  changeRate: 4.4,
  metrics: generateMetrics(104),
  change: [],
};

// 모바일App개발실 > Android개발팀
const androidDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "Android개발팀",
  code: "2002",
  level: 3,
  displayName: "Android개발팀[2002]",
  parentCode: "2000",
  sortOrder: 2,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 8,
  children: androidDevTeamMembers,
  isExpanded: false,
  codeQuality: 87.9,
  reviewQuality: 82.9,
  developmentEfficiency: 82.9,
  bdpi: 83.9,
  changeRate: 0.6,
  metrics: generateMetrics(105),
  change: [],
};

// 규제기술실 > 규제개발팀
const regulationDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "규제개발팀",
  code: "3001",
  level: 3,
  displayName: "규제개발팀[3001]",
  parentCode: "3000",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: regulationDevTeamMembers,
  isExpanded: false,
  codeQuality: 68.5,
  reviewQuality: 70.8,
  developmentEfficiency: 69.3,
  bdpi: 69.5,
  changeRate: -1.5,
  metrics: generateMetrics(106),
  change: [],
};

// 서비스BE개발실 > 금융상품개발팀
const financialProductDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "금융상품개발팀",
  code: "4001",
  level: 3,
  displayName: "금융상품개발팀[4001]",
  parentCode: "4000",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 10,
  children: financialProductDevTeamMembers,
  isExpanded: false,
  codeQuality: 72.9,
  reviewQuality: 74.9,
  developmentEfficiency: 76.9,
  bdpi: 76.9,
  changeRate: 0.1,
  metrics: generateMetrics(107),
  change: [
    {
      changeType: "RENAMED",
      changeDate: "2025-11-28T09:00:00.000Z",
      category: "GROUP",
      changeDetail: "정보변경: 모바일UI/UX팀 → 금융상품개발팀",
      processedBy: "자동(LDAP)",
    },
  ],
};

// 서비스BE개발실 > 회원인증개발팀
const memberAuthDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "회원인증개발팀",
  code: "4002",
  level: 3,
  displayName: "회원인증개발팀[4002]",
  parentCode: "4000",
  sortOrder: 2,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 8,
  children: memberAuthDevTeamMembers,
  isExpanded: false,
  codeQuality: 78.5,
  reviewQuality: 79.2,
  developmentEfficiency: 77.8,
  bdpi: 78.5,
  changeRate: 1.2,
  metrics: generateMetrics(108),
  change: [],
};

// 서비스BE개발실 > 거래주문개발팀
const orderDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "거래주문개발팀",
  code: "4003",
  level: 3,
  displayName: "거래주문개발팀[4003]",
  parentCode: "4000",
  sortOrder: 3,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 8,
  children: orderDevTeamMembers,
  isExpanded: false,
  codeQuality: 72.9,
  reviewQuality: 74.9,
  developmentEfficiency: 76.9,
  bdpi: 76.9,
  changeRate: 0.1,
  metrics: generateMetrics(109),
  change: [],
};

// 웹FE개발실 > 거래웹개발팀
const tradingWebDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "거래웹개발팀",
  code: "5001",
  level: 3,
  displayName: "거래웹개발팀[5001]",
  parentCode: "5000",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: tradingWebDevTeamMembers,
  isExpanded: false,
  codeQuality: 80.4,
  reviewQuality: 81.4,
  developmentEfficiency: 80.9,
  bdpi: 81.4,
  changeRate: 2.1,
  metrics: generateMetrics(110),
  change: [
    {
      changeType: "ADD",
      changeDate: "2025-11-11T09:00:00.000Z",
      category: "POLICY",
      changeDetail: "개발유형추가",
      processedBy: "{수정한 사용자}",
    },
  ],
};

// 웹FE개발실 > 클라이언트웹개발팀
const clientWebDevTeam: ApiOrganizationDepartment = {
  type: "department",
  name: "클라이언트웹개발팀",
  code: "5002",
  level: 3,
  displayName: "클라이언트웹개발팀[5002]",
  parentCode: "5000",
  sortOrder: 2,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 6,
  children: clientWebDevTeamMembers,
  isExpanded: false,
  codeQuality: 86.9,
  reviewQuality: 86.9,
  developmentEfficiency: 85.9,
  bdpi: 84.9,
  changeRate: 4.4,
  metrics: generateMetrics(111),
  change: [
    {
      changeType: "EXCLUDE",
      changeDate: "2025-11-11T09:00:00.000Z",
      category: "POLICY",
      changeDetail: "개발유형제외",
      processedBy: "{수정한 사용자}",
    },
  ],
};

// ================================
// Level 2: 실 단위
// ================================

// 코어플랫폼개발실 실장
const corePlatformDevDeptHead: ApiOrganizationMember = {
  type: "member",
  name: "강준서",
  employeeID: "junseo.kang",
  role: "GENERAL_MANAGER",
  position: "DEPARTMENT_HEAD",
  status: "ACTIVE",
  departmentCode: "1000",
  departmentName: "코어플랫폼개발실",
  level: 2,
  isEvaluationTarget: true,
  isManager: true,
  codeQuality: 88.5,
  reviewQuality: 87.2,
  developmentEfficiency: 86.8,
  bdpi: 87.5,
  changeRate: 3.2,
  email: "junseo.kang@company.com",
  metrics: generateMetrics(21),
  change: [
    {
      changeType: "CHANGED_POSITION",
      changeDate: "2025-11-20T09:00:00.000Z",
      category: "HR",
      changeDetail: "직책변경: (없음) → 팀장",
      processedBy: "자동(LDAP)",
    },
  ],
};

// 코어플랫폼개발실
const corePlatformDevDept: ApiOrganizationDepartment = {
  type: "department",
  name: "코어플랫폼개발실",
  code: "1000",
  level: 2,
  displayName: "코어플랫폼개발실[1000]",
  parentCode: "IT01",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 21,
  children: [
    corePlatformDevDeptHead,
    assetPlatformDevTeam,
    tradingPlatformDevTeam,
    commonPlatformDevTeam,
  ],
  isExpanded: false,
  codeQuality: 86.4,
  reviewQuality: 83.2,
  developmentEfficiency: 84.1,
  bdpi: 84.3,
  changeRate: 1.9,
  metrics: generateMetrics(201),
  change: [],
};

// 모바일App개발실
const mobileAppDevDept: ApiOrganizationDepartment = {
  type: "department",
  name: "모바일App개발실",
  code: "2000",
  level: 2,
  displayName: "모바일App개발실[2000]",
  parentCode: "IT01",
  sortOrder: 2,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 15,
  children: [iosDevTeam, androidDevTeam],
  isExpanded: false,
  codeQuality: 87.4,
  reviewQuality: 84.9,
  developmentEfficiency: 84.4,
  bdpi: 84.4,
  changeRate: 2.5,
  metrics: generateMetrics(202),
  change: [],
};

// 규제기술실
const regulationTechDept: ApiOrganizationDepartment = {
  type: "department",
  name: "규제기술실",
  code: "3000",
  level: 2,
  displayName: "규제기술실[3000]",
  parentCode: "IT01",
  sortOrder: 3,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 7,
  children: [regulationDevTeam],
  isExpanded: false,
  codeQuality: 68.5,
  reviewQuality: 70.8,
  developmentEfficiency: 69.3,
  bdpi: 69.5,
  changeRate: -1.5,
  metrics: generateMetrics(203),
  change: [
    {
      changeType: "DELETED",
      changeDate: "2025-11-28T09:00:00.000Z",
      category: "GROUP",
      changeDetail: "실삭제",
      processedBy: "자동(LDAP)",
    },
  ],
};

// 서비스BE개발실
const serviceBEDevDept: ApiOrganizationDepartment = {
  type: "department",
  name: "서비스BE개발실",
  code: "4000",
  level: 2,
  displayName: "서비스BE개발실[4000]",
  parentCode: "IT01",
  sortOrder: 4,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 26,
  children: [financialProductDevTeam, memberAuthDevTeam, orderDevTeam],
  isExpanded: false,
  codeQuality: 74.8,
  reviewQuality: 76.3,
  developmentEfficiency: 77.2,
  bdpi: 77.4,
  changeRate: 0.5,
  metrics: generateMetrics(204),
  change: [],
};

// 웹FE개발실
const webFEDevDept: ApiOrganizationDepartment = {
  type: "department",
  name: "웹FE개발실",
  code: "5000",
  level: 2,
  displayName: "웹FE개발실[5000]",
  parentCode: "IT01",
  sortOrder: 5,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 13,
  children: [tradingWebDevTeam, clientWebDevTeam],
  isExpanded: false,
  codeQuality: 82.6,
  reviewQuality: 83.1,
  developmentEfficiency: 82.6,
  bdpi: 82.6,
  changeRate: 2.9,
  metrics: generateMetrics(205),
  change: [],
};

// ================================
// Level 1: 부문 단위
// ================================

// IT부문
const itDivision: ApiOrganizationDepartment = {
  type: "department",
  name: "IT부문",
  code: "IT01",
  level: 1,
  displayName: "IT부문[IT01]",
  sortOrder: 1,
  isEvaluationTarget: true,
  deptStatus: "ACTIVE",
  existedDays: 30,
  memberCount: 82,
  children: [
    corePlatformDevDept,
    mobileAppDevDept,
    regulationTechDept,
    serviceBEDevDept,
    webFEDevDept,
  ],
  isExpanded: true,
  codeQuality: 80.3,
  reviewQuality: 78.7,
  developmentEfficiency: 79.6,
  bdpi: 79.5,
  changeRate: 1.8,
  metrics: generateMetrics(301),
  change: [],
};

// ================================
// API Mock 응답
// ================================

export const mockApiOrganizationCompare: ApiOrganizationCompareResponse = {
  period: {
    year: 2025,
    month: 11,
  },
  tree: [itDivision],
};

// ================================
// 조직도 관리 화면용 Mock 데이터
// ================================

// 목업 조직도 데이터
export const mockOrganizationData: OrganizationData = {
  departments: [
    {
      id: "dept-1",
      name: "서비스BE개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 3,
      memberCount: 26,
      teams: [
        {
          id: "team-1-1",
          name: "개발팀",
          type: "개발",
          memberCount: 10,
          members: [
            {
              id: "member-1",
              name: "김보라",
              email: "v.s77@company.com",
              position: "팀장",
              status: "active",
            },
            {
              id: "member-2",
              name: "황소율",
              email: "hm82@company.com",
              position: "책임",
              isNew: true,
              joinDate: "2025.10.04",
              status: "active",
            },
            {
              id: "member-3",
              name: "임아인",
              email: "gjr6@company.com",
              position: "책임",
              status: "active",
            },
            {
              id: "member-4",
              name: "황동현",
              email: "bo51@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-5",
              name: "홍은서",
              email: "fll38@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-6",
              name: "서지우",
              email: "4ks77@company.com",
              position: "주임",
              role: "비개발",
              joinDate: "2025.10.10",
              leaveDate: "~",
              status: "active",
            },
            {
              id: "member-7",
              name: "최서윤",
              email: "csw@company.com",
              position: "사원",
              status: "active",
            },
          ],
        },
        {
          id: "team-1-2",
          name: "백오피스기획팀",
          type: "개발",
          memberCount: 7,
          members: [],
        },
        {
          id: "team-1-3",
          name: "규제 데이터팀",
          type: "개발",
          memberCount: 7,
          members: [],
        },
      ],
    },
    {
      id: "dept-2",
      name: "코어플랫폼개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 21,
      teams: [
        {
          id: "team-2-1",
          name: "플랫폼팀",
          type: "개발",
          memberCount: 12,
          members: [],
        },
        {
          id: "team-2-2",
          name: "인프라팀",
          type: "개발",
          memberCount: 9,
          members: [],
        },
      ],
    },
    {
      id: "dept-3",
      name: "모바일App개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 21,
      teams: [
        {
          id: "team-3-1",
          name: "iOS팀",
          type: "개발",
          memberCount: 10,
          members: [],
        },
        {
          id: "team-3-2",
          name: "Android팀",
          type: "개발",
          memberCount: 11,
          members: [],
        },
      ],
    },
    {
      id: "dept-4",
      name: "웹FE개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 18,
      teams: [
        {
          id: "team-4-1",
          name: "웹프론트팀",
          type: "개발",
          memberCount: 10,
          members: [],
        },
        {
          id: "team-4-2",
          name: "디자인시스템팀",
          type: "개발",
          memberCount: 8,
          members: [],
        },
      ],
    },
    {
      id: "dept-5",
      name: "규제기술실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 1,
      memberCount: 21,
      teams: [
        {
          id: "team-5-1",
          name: "개발팀",
          type: "개발",
          memberCount: 21,
          members: [
            {
              id: "member-8",
              name: "김보라",
              email: "v.s77@company.com",
              position: "팀장",
              status: "active",
            },
            {
              id: "member-9",
              name: "황소율",
              email: "hm82@company.com",
              position: "책임",
              isNew: true,
              joinDate: "2025.10.04",
              status: "active",
            },
            {
              id: "member-10",
              name: "임아인",
              email: "gjr6@company.com",
              position: "책임",
              status: "active",
            },
            {
              id: "member-11",
              name: "황동현",
              email: "bo51@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-12",
              name: "홍은서",
              email: "fll38@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-13",
              name: "서지우",
              email: "4ks77@company.com",
              position: "주임",
              role: "비개발",
              joinDate: "2025.10.10",
              leaveDate: "~",
              status: "active",
            },
            {
              id: "member-14",
              name: "최서윤",
              email: "csw@company.com",
              position: "사원",
              status: "active",
            },
          ],
        },
      ],
    },
  ],
  totalDepartments: 9,
  totalTeams: 17,
  totalMembers: 127,
  lastSyncDate: "2025.11.21 02:00",
  syncSource: "LDAP AD기준",
};

// 변경 이력 목업 데이터
export const mockChangeHistory: ChangeHistory[] = [];

// 헬퍼 함수: 부서 찾기
export const findDepartmentById = (id: string): Department | undefined => {
  return mockOrganizationData.departments.find((dept) => dept.id === id);
};

// 헬퍼 함수: 팀 찾기
export const findTeamById = (departmentId: string, teamId: string) => {
  const department = findDepartmentById(departmentId);
  return department?.teams.find((team) => team.id === teamId);
};
