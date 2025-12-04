import type {
  ApiOrganizationCompareResponse,
  ApiOrganizationDepartment,
  ApiOrganizationMember,
  BdpiMetrics,
  MonthlyComparisonDirection,
  OrganizationData,
  Department,
  ChangeHistory,
} from "@/types/organization.types";

// ================================
// BDPI 탭용 metrics 목업 데이터 생성 헬퍼
// ================================

// 랜덤 점수 생성 (0-100)
const randomScore = (seed: number, index: number): number => {
  // seed와 index를 조합하여 일관된 랜덤 값 생성
  const base = 60 + ((seed * 7 + index * 13) % 35);
  return Math.round(base * 10) / 10;
};

// 랜덤 전월대비 생성
const randomMonthlyComparison = (
  seed: number,
): { changePercent: number; direction: MonthlyComparisonDirection } => {
  const changePercent = Math.round(((seed * 3 + 7) % 20) - 10) / 10; // -10 ~ 10
  const direction: MonthlyComparisonDirection =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "same";
  return { changePercent: Math.abs(changePercent), direction };
};

// BDPI 탭용 metrics 생성 함수
const generateBdpiMetrics = (seed: number = 0): BdpiMetrics => {
  return {
    codeQuality: { score: randomScore(seed, 0) },
    reviewQuality: { score: randomScore(seed, 1) },
    efficiency: { score: randomScore(seed, 2) },
    bdpi: { score: randomScore(seed, 3) },
    monthlyComparison: randomMonthlyComparison(seed),
  };
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
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "younghun.han@company.com",
    metrics: generateBdpiMetrics(1),
    changes: [
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
    title: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "gimo.yang@company.com",
    metrics: generateBdpiMetrics(2),
    changes: [
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
    title: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "yujin.choi@company.com",
    metrics: generateBdpiMetrics(3),
    changes: [],
  },
  {
    type: "member",
    name: "황동현",
    employeeID: "donghyun.hwang",
    title: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "donghyun.hwang@company.com",
    metrics: generateBdpiMetrics(4),
    changes: [
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
    title: "ASSISTANT_MANAGER",
    status: "ON_LEAVE",
    departmentCode: "1001",
    departmentName: "자산플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "sihyun.kim@company.com",
    metrics: generateBdpiMetrics(5), // 휴직 상태도 metrics 구조는 동일
    changes: [
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
    title: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1002",
    departmentName: "거래플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "gaeun.kim@company.com",
    metrics: generateBdpiMetrics(6),
    changes: [],
  },
];

// 공통플랫폼개발팀 멤버
const commonPlatformDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "박흥부",
    employeeID: "hyeongbu.park",
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "hyeongbu.park@company.com",
    metrics: generateBdpiMetrics(7),
    changes: [
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
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "nambu.park@company.com",
    metrics: generateBdpiMetrics(8),
    changes: [
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
    title: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "hanju.hwang@company.com",
    metrics: generateBdpiMetrics(9),
    changes: [],
  },
  {
    type: "member",
    name: "박덕훈",
    employeeID: "duckhun.park",
    title: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "duckhun.park@company.com",
    metrics: generateBdpiMetrics(10),
    changes: [
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
    title: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "gimo.yang@company.com",
    metrics: generateBdpiMetrics(11),
    changes: [
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
    title: "MANAGER",
    status: "ACTIVE",
    departmentCode: "1003",
    departmentName: "공통플랫폼개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "junseo.lim@company.com",
    metrics: generateBdpiMetrics(12),
    changes: [
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
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "2001",
    departmentName: "iOS개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "yuchan.choi@company.com",
    metrics: generateBdpiMetrics(13),
    changes: [],
  },
];

// Android개발팀 멤버
const androidDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "황동현",
    employeeID: "donghyun.hwang",
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "2002",
    departmentName: "Android개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "donghyun.hwang@company.com",
    metrics: generateBdpiMetrics(14),
    changes: [],
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
    title: "STAFF",
    status: "JOINED",
    departmentCode: "3001",
    departmentName: "규제개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "sihyun.kim@company.com",
    metrics: generateBdpiMetrics(0), // 신입이라도 metrics 구조는 동일
    changes: [
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
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4001",
    departmentName: "금융상품개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "donghyun.kang@company.com",
    metrics: generateBdpiMetrics(15),
    changes: [],
  },
];

// 회원인증개발팀 멤버
const memberAuthDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "김갑수",
    employeeID: "gapsu.kim",
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4002",
    departmentName: "회원인증개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "gapsu.kim@company.com",
    metrics: generateBdpiMetrics(16),
    changes: [],
  },
];

// 거래주문개발팀 멤버
const orderDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "함현주",
    employeeID: "hyunju.ham",
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "4003",
    departmentName: "거래주문개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "hyunju.ham@company.com",
    metrics: generateBdpiMetrics(17),
    changes: [],
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
    title: "MANAGER",
    personalTitle: "TEAM_LEADER",
    status: "ACTIVE",
    departmentCode: "5001",
    departmentName: "거래웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: true,
    email: "gildong.hong@company.com",
    metrics: generateBdpiMetrics(18),
    changes: [],
  },
  {
    type: "member",
    name: "강감찬",
    employeeID: "gamchan.kang",
    title: "ASSISTANT_MANAGER",
    status: "ACTIVE",
    departmentCode: "5001",
    departmentName: "거래웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    email: "gamchan.kang@company.com",
    metrics: generateBdpiMetrics(19),
    changes: [],
  },
];

// 클라이언트웹개발팀 멤버
const clientWebDevTeamMembers: ApiOrganizationMember[] = [
  {
    type: "member",
    name: "이현수",
    employeeID: "hyeonsu.lee",
    title: "ASSISTANT_MANAGER",
    status: "CHANGED_ROLE",
    departmentCode: "5002",
    departmentName: "클라이언트웹개발팀",
    level: 3,
    isEvaluationTarget: true,
    isManager: false,
    previousTitle: "STAFF",
    email: "hyeonsu.lee@company.com",
    metrics: generateBdpiMetrics(20),
    changes: [
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
  metrics: generateBdpiMetrics(101),
  changes: [
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
  metrics: generateBdpiMetrics(102),
  changes: [],
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
  metrics: generateBdpiMetrics(103),
  changes: [],
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
  metrics: generateBdpiMetrics(104),
  changes: [],
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
  metrics: generateBdpiMetrics(105),
  changes: [],
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
  metrics: generateBdpiMetrics(106),
  changes: [],
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
  metrics: generateBdpiMetrics(107),
  changes: [
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
  metrics: generateBdpiMetrics(108),
  changes: [],
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
  metrics: generateBdpiMetrics(109),
  changes: [],
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
  metrics: generateBdpiMetrics(110),
  changes: [
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
  metrics: generateBdpiMetrics(111),
  changes: [
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
  title: "GENERAL_MANAGER",
  personalTitle: "DEPARTMENT_HEAD",
  status: "ACTIVE",
  departmentCode: "1000",
  departmentName: "코어플랫폼개발실",
  level: 2,
  isEvaluationTarget: true,
  isManager: true,
  email: "junseo.kang@company.com",
  metrics: generateBdpiMetrics(21),
  changes: [
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
  metrics: generateBdpiMetrics(201),
  changes: [],
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
  metrics: generateBdpiMetrics(202),
  changes: [],
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
  metrics: generateBdpiMetrics(203),
  changes: [
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
  metrics: generateBdpiMetrics(204),
  changes: [],
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
  metrics: generateBdpiMetrics(205),
  changes: [],
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
  metrics: generateBdpiMetrics(301),
  changes: [],
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
