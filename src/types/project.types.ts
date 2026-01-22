/**
 * 프로젝트/운영 관련 타입 정의
 */

/** 프로젝트 유형 */
export type ProjectType = "tf" | "operation";

/** 전월대비 변화 방향 */
export type ChangeDirection = "up" | "down" | "same" | "new" | "no_data";

/** 전월대비 변화 정보 */
export interface MonthlyChange {
  /** 변화값 (절대값 또는 퍼센트) */
  value: number;
  /** 변화 방향 */
  direction: ChangeDirection;
}

/** 요약 카드 항목 (API 응답) */
export interface SummaryCardItem {
  /** 현재 값 */
  value: number;
  /** 단위 (개, 건/월 등) */
  unit?: string | null;
  /** 전월대비 변화 정보 */
  change?: MonthlyChange | null;
}

/** 프로젝트 수 요약 카드 항목 (API 응답) - 완료/업데이트/생성 카운트 포함 */
export interface ProjectCountSummaryItem extends SummaryCardItem {
  /** 완료된 티켓 수 */
  completedCount?: number | null;
  /** 업데이트된 티켓 수 */
  updatedCount?: number | null;
  /** 생성된 티켓 수 */
  createdCount?: number | null;
}

/** 프로젝트 대시보드 요약 API 응답 */
export interface ProjectDashboardSummary {
  /** 조회 기간 (YYYY-MM) */
  period: string;
  /** 전체 BDPI 평균 */
  avgBdpi: SummaryCardItem;
  /** TF 프로젝트 수 */
  tfProjectCount: ProjectCountSummaryItem;
  /** 운영(OPR2_NON_TF) 프로젝트 수 */
  operationProjectCount: ProjectCountSummaryItem;
  /** 장애/버그 발생 평균 (건/월) */
  avgIncidentBugCount: SummaryCardItem;
}

/** 프로젝트 요약 통계 */
export interface ProjectSummary {
  /** 프로젝트 수 */
  count: number;
  /** 완료된 티켓 수 */
  completed?: number | null;
  /** 업데이트된 티켓 수 */
  updated?: number | null;
  /** 생성된 티켓 수 */
  created?: number | null;
}

/** 프로젝트 항목 */
export interface ProjectItem {
  /** 프로젝트 ID */
  id: string;
  /** 프로젝트명 */
  name: string;
  /** EPIC ID */
  epicId: string;
  /** EPIC URL */
  epicUrl: string;
  /** 활성 티켓수 */
  activeTicketCount: number | null;
  /** 업데이트 수 */
  updatedCount: number | null;
  /** 완료 티켓수 */
  completedCount: number | null;
  /** 생성 티켓수 */
  createdCount: number | null;
  /** 버그 발생수 */
  bugCount: number | null;
  /** 장애 발생수 */
  incidentCount: number | null;
  /** 평균장애 해결시간 (시) */
  avgResolutionTime: number | null;
  /** 평균장애 탐지시간 (시) */
  avgDetectionTime: number | null;
  /** 평균장애 진단시간 (시) */
  avgDiagnosisTime: number | null;
  /** 평균장애 복구시간 (시) */
  avgRecoveryTime: number | null;
  /** 생성일자 */
  createdAt: string;
}

/** 운영 에픽 항목 */
export interface OperationItem {
  /** 에픽 ID */
  id: string;
  /** 운영 에픽명 */
  name: string;
  /** EPIC ID (예: OPR2-1234) */
  epicId: string;
  /** EPIC URL */
  epicUrl: string;
  /** 활성 티켓 수 */
  activeTicketCount: number | null;
  /** 업데이트 수 */
  updatedCount: number | null;
  /** 완료 티켓수 */
  completedCount: number | null;
  /** 생성 티켓수 */
  createdCount: number | null;
  /** 생성일자 */
  createdAt: string;
}

/** 프로젝트/운영 페이지 데이터 */
export interface ProjectPageData {
  /** TF 프로젝트 요약 */
  tfSummary: ProjectSummary;
  /** 운영 요약 */
  operationSummary: ProjectSummary;
  /** TF 프로젝트 목록 */
  tfProjects: ProjectItem[];
  /** 운영 에픽 목록 */
  operationItems: OperationItem[];
}

/** Epic 분류 타입 */
export type EpicClassification = "TF" | "OPR2_NON_TF" | "GENERAL";

/** 프로젝트 대시보드 항목 (API 응답) */
export interface ProjectDashboardItem {
  /** 프로젝트 ID (MongoDB ObjectId) */
  projectId: string;
  /** Epic 키 (예: "OPR2-123") */
  epicKey: string;
  /** Epic 요약 (프로젝트명) */
  epicSummary: string;
  /** Epic 분류 (TF / OPR2_NON_TF / GENERAL) */
  epicClassification: EpicClassification | null;
  /** 활성 티켓수 */
  activeTicketCount: number | null;
  /** 업데이트 수 */
  updatedCount: number | null;
  /** 완료 티켓수 */
  completedCount: number | null;
  /** 생성 티켓수 */
  createdCount: number | null;
  /** 버그 발생 건수 */
  bugCount: number | null;
  /** 장애 발생 건수 */
  incidentCount: number | null;
  /** 평균 장애 해결시간 (시) */
  mttr: number | null;
  /** 평균 장애 탐지시간 (시) */
  mttd: number | null;
  /** 평균 장애 진단시간 (시) */
  timeToCauseIdentification: number | null;
  /** 평균 장애 복구시간 (시) */
  timeToRepair: number | null;
  /** Epic 생성일 (YYYY-MM-DD) */
  createdAt: string | null;
}

/** 프로젝트 대시보드 목록 API 응답 */
export interface ProjectDashboardResponse {
  /** 조회 기간 (YYYY-MM) */
  period: string;
  /** 전체 프로젝트 수 */
  totalCount: number;
  /** 프로젝트 목록 (활성 티켓수 오름차순) */
  projects: ProjectDashboardItem[];
}

/** 프로젝트 대시보드 조회 파라미터 */
export interface ProjectDashboardParams {
  /** 조회 기간 (YYYY-MM) */
  month: string;
  /** Epic 분류 필터 (TF / OPR2_NON_TF) */
  classification?: "TF" | "OPR2_NON_TF";
  /** 검색어 (프로젝트명 또는 에픽키) */
  search?: string;
}
