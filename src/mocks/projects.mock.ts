import type {
  ProjectDashboardItem,
  ProjectDashboardResponse,
  ProjectDashboardSummary,
} from "@/types/project.types";

/** Mock TF 프로젝트 목록 */
const MOCK_TF_ITEMS: ProjectDashboardItem[] = [
  {
    projectId: "mock-tf-001",
    epicKey: "TF-101",
    epicSummary: "[TF] 바코드 플러스 2.0 차세대 개발",
    epicClassification: "TF",
    activeTicketCount: 24,
    updatedCount: 18,
    completedCount: 42,
    createdCount: 7,
    bugCount: 3,
    incidentCount: 1,
    mttr: 14400,
    mttd: 1800,
    timeToCauseIdentification: 3600,
    timeToRepair: 10800,
    createdAt: "2025-03-12",
  },
  {
    projectId: "mock-tf-002",
    epicKey: "TF-102",
    epicSummary: "[TF] 거래소 고도화 Phase 2",
    epicClassification: "TF",
    activeTicketCount: 15,
    updatedCount: 11,
    completedCount: 28,
    createdCount: 4,
    bugCount: 5,
    incidentCount: 2,
    mttr: 21600,
    mttd: 2700,
    timeToCauseIdentification: 5400,
    timeToRepair: 18000,
    createdAt: "2025-05-20",
  },
  {
    projectId: "mock-tf-003",
    epicKey: "TF-103",
    epicSummary: "[TF] 모바일 앱 리뉴얼",
    epicClassification: "TF",
    activeTicketCount: 31,
    updatedCount: 22,
    completedCount: 55,
    createdCount: 12,
    bugCount: 8,
    incidentCount: 0,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-06-01",
  },
  {
    projectId: "mock-tf-004",
    epicKey: "TF-104",
    epicSummary: "[TF] 내부 관리 시스템 개선",
    epicClassification: "TF",
    activeTicketCount: 9,
    updatedCount: 6,
    completedCount: 14,
    createdCount: 2,
    bugCount: 1,
    incidentCount: 0,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-07-15",
  },
  {
    projectId: "mock-tf-005",
    epicKey: "TF-105",
    epicSummary: "[TF] 데이터 파이프라인 재구축",
    epicClassification: "TF",
    activeTicketCount: 20,
    updatedCount: 13,
    completedCount: 33,
    createdCount: 9,
    bugCount: 2,
    incidentCount: 3,
    mttr: 7200,
    mttd: 900,
    timeToCauseIdentification: 1800,
    timeToRepair: 5400,
    createdAt: "2025-04-08",
  },
];

/** Mock 운영(OPR2) 에픽 목록 */
const MOCK_OPR2_ITEMS: ProjectDashboardItem[] = [
  {
    projectId: "mock-opr-001",
    epicKey: "OPR2-201",
    epicSummary: "[OPR2] API 서버 긴급 패치",
    epicClassification: "OPR2_NON_TF",
    activeTicketCount: 3,
    updatedCount: 5,
    completedCount: 8,
    createdCount: 2,
    bugCount: null,
    incidentCount: null,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-11-03",
  },
  {
    projectId: "mock-opr-002",
    epicKey: "OPR2-202",
    epicSummary: "[OPR2] DB 마이그레이션 운영 지원",
    epicClassification: "OPR2_NON_TF",
    activeTicketCount: 1,
    updatedCount: 3,
    completedCount: 6,
    createdCount: 1,
    bugCount: null,
    incidentCount: null,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-10-22",
  },
  {
    projectId: "mock-opr-003",
    epicKey: "OPR2-203",
    epicSummary: "[OPR2] 보안 취약점 긴급 대응",
    epicClassification: "OPR2_NON_TF",
    activeTicketCount: 5,
    updatedCount: 8,
    completedCount: 12,
    createdCount: 3,
    bugCount: null,
    incidentCount: null,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-11-15",
  },
  {
    projectId: "mock-opr-004",
    epicKey: "OPR2-204",
    epicSummary: "[OPR2] 결제 모듈 핫픽스 배포",
    epicClassification: "OPR2_NON_TF",
    activeTicketCount: 2,
    updatedCount: 4,
    completedCount: 7,
    createdCount: 1,
    bugCount: null,
    incidentCount: null,
    mttr: null,
    mttd: null,
    timeToCauseIdentification: null,
    timeToRepair: null,
    createdAt: "2025-12-01",
  },
];

/**
 * Mock TF 프로젝트 대시보드 응답 생성
 */
export const getMockTfProjectDashboard = (
  month: string,
  page: number = 1,
  limit: number = 15,
): ProjectDashboardResponse => {
  const start = (page - 1) * limit;
  const sliced = MOCK_TF_ITEMS.slice(start, start + limit);
  return {
    period: month,
    data: sliced,
    pagination: {
      page,
      limit,
      total: MOCK_TF_ITEMS.length,
      totalPages: Math.ceil(MOCK_TF_ITEMS.length / limit),
    },
  };
};

/**
 * Mock 운영(OPR2) 대시보드 응답 생성
 */
export const getMockOpr2Dashboard = (
  month: string,
  page: number = 1,
  limit: number = 15,
): ProjectDashboardResponse => {
  const start = (page - 1) * limit;
  const sliced = MOCK_OPR2_ITEMS.slice(start, start + limit);
  return {
    period: month,
    data: sliced,
    pagination: {
      page,
      limit,
      total: MOCK_OPR2_ITEMS.length,
      totalPages: Math.ceil(MOCK_OPR2_ITEMS.length / limit),
    },
  };
};

/**
 * Mock 프로젝트 대시보드 요약 응답 생성
 */
export const getMockProjectDashboardSummary = (
  month: string,
): ProjectDashboardSummary => ({
  period: month,
  avgBdpi: {
    value: 78,
    unit: "%",
    change: { value: 3, direction: "up" },
  },
  tfProjectCount: {
    value: MOCK_TF_ITEMS.length,
    unit: "개",
    change: { value: 1, direction: "up" },
    completedCount: 172,
    updatedCount: 70,
    createdCount: 34,
  },
  operationProjectCount: {
    value: MOCK_OPR2_ITEMS.length,
    unit: "개",
    change: { value: 0, direction: "same" },
    completedCount: 33,
    updatedCount: 20,
    createdCount: 7,
  },
  avgIncidentBugCount: {
    value: 3.8,
    unit: "건/월",
    change: { value: 0.5, direction: "down" },
  },
});
