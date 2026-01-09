/**
 * 프로젝트/운영 관련 타입 정의
 */

/** 프로젝트 유형 */
export type ProjectType = "tf" | "operation";

/** 프로젝트 요약 통계 */
export interface ProjectSummary {
  /** 프로젝트 수 */
  count: number;
  /** 완료된 티켓 수 */
  completed: number;
  /** 업데이트된 티켓 수 */
  updated: number;
  /** 생성된 티켓 수 */
  created: number;
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
  activeTicketCount: number;
  /** 버그 발생수 */
  bugCount: number;
  /** 장애 발생수 */
  incidentCount: number;
  /** 평균장애 해결시간 (초) */
  avgResolutionTime: number | null;
  /** 평균장애 탐지시간 (초) */
  avgDetectionTime: number | null;
  /** 평균장애 진단시간 (초) */
  avgDiagnosisTime: number | null;
  /** 평균장애 복구시간 (초) */
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
  activeTicketCount: number;
  /** 업데이트 수 */
  updatedCount: number;
  /** 완료 티켓수 */
  completedCount: number;
  /** 생성 티켓수 */
  createdCount: number;
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
