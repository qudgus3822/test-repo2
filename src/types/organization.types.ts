/**
 * 조직 비교 페이지 관련 타입 정의
 */

// ================================
// 새로운 API 구조 타입 정의
// ================================

// 멤버 상태 타입
export type MemberStatus =
  | "ACTIVE" // 재직
  | "TRANSFERRED_IN" // 이동 전
  | "TRANSFERRED_OUT" // 이동 후
  | "JOINED" // 입사
  | "RESIGNED" // 퇴사
  | "ON_LEAVE" // 휴직
  | "RETURNED" // 복직
  | "CHANGED_ROLE" // 직급변경
  | "CHANGED_POSITION"; // 직책변경

export const MemberStatusLabel = {
  ACTIVE: "재직",
  TRANSFERRED_IN: "이동 전",
  TRANSFERRED_OUT: "이동 후",
  JOINED: "입사",
  RESIGNED: "퇴사",
  ON_LEAVE: "휴직",
  RETURNED: "복직",
  CHANGED_ROLE: "직급",
  CHANGED_POSITION: "직책",
};
// 직급 타입
export type MemberRole =
  | "STAFF" // 사원
  | "ASSISTANT_MANAGER" // 대리
  | "MANAGER" // 과장
  | "DEPUTY_MANAGER" // 차장
  | "GENERAL_MANAGER"; // 부장

export const MemberRoleLabel = {
  STAFF: "사원",
  ASSISTANT_MANAGER: "대리",
  MANAGER: "과장",
  DEPUTY_MANAGER: "차장",
  GENERAL_MANAGER: "부장",
};

// 직책 타입
export type MemberPosition =
  | "TEAM_LEADER" // 팀장
  | "DEPARTMENT_HEAD" // 실장
  | "OVERALL_MANAGER"; // 총괄

export const MemberPositionLabel = {
  TEAM_LEADER: "팀장",
  DEPARTMENT_HEAD: "실장",
  OVERALL_MANAGER: "총괄",
};

// 부서 상태 타입
export type DepartmentStatus =
  | "ACTIVE" // 활성
  | "CREATED" // 생성
  | "DELETED" // 삭제
  | "RENAMED"; // 변경

export const DepartmentStatusLabel = {
  ACTIVE: "활성",
  CREATED: "조직생성",
  DELETED: "조직삭제",
  RENAMED: "정보변경",
};

// 정책 변경 타입
export type PolicyStatus =
  | "ADD" // 유형추가
  | "EXCLUDE"; // 유형제외

export const PolicyStatusLabel = {
  ADD: "유형추가",
  EXCLUDE: "유형제외",
};

// 지표 카테고리 키 타입 (API metrics 객체의 키로 사용)
export type MetricCategoryKey =
  | "code_quality"
  | "review_quality"
  | "development_efficiency";

// 개별 지표 값 타입 (상세 지표용 - 코드품질, 리뷰품질, 개발효율 탭)
export interface MetricScoreValue {
  score: number;
  isUsed: boolean;
}

// 카테고리 점수 타입 (BDPI 탭용)
export interface CategoryScoreValue {
  score: number;
}

// 전월대비 타입
export type MonthlyComparisonDirection = "up" | "down" | "same";

export interface MonthlyComparison {
  changePercent: number;
  direction: MonthlyComparisonDirection;
}

// BDPI 탭용 metrics 타입
export interface BdpiMetrics {
  codeQuality: CategoryScoreValue;
  reviewQuality: CategoryScoreValue;
  efficiency: CategoryScoreValue;
  bdpi: CategoryScoreValue;
  monthlyComparison: MonthlyComparison; // 전월대비
}

// 코드품질 탭용 metrics 타입
export interface CodeQualityMetrics {
  TECH_DEBT: MetricScoreValue;
  CODE_COMPLEXITY: MetricScoreValue;
  CODE_DUPLICATION: MetricScoreValue;
  CODE_SMELL: MetricScoreValue;
  TEST_COVERAGE: MetricScoreValue;
  SECURITY_VULNERABILITIES: MetricScoreValue;
  CODE_DEFECT_DENSITY: MetricScoreValue;
  BUG_COUNT: MetricScoreValue;
  INCIDENT_COUNT: MetricScoreValue;
}

// 리뷰품질 탭용 metrics 타입
export interface ReviewQualityMetrics {
  REVIEW_SPEED: MetricScoreValue;
  REVIEW_RESPONSE_RATE: MetricScoreValue;
  REVIEW_PARTICIPATION_RATE: MetricScoreValue;
  REVIEW_ACCEPTANCE_RATE: MetricScoreValue;
  REVIEW_FEEDBACK_CONCRETENESS: MetricScoreValue;
  REVIEW_REVIEWER_DIVERSE: MetricScoreValue;
  REVIEW_REQUEST_COUNT: MetricScoreValue;
  REVIEW_PARTICIPATION_COUNT: MetricScoreValue;
  REVIEW_PASS_RATE: MetricScoreValue;
  REVIEW_PARTICIPATION_NUMBER: MetricScoreValue;
  REVIEW_FEEDBACK_TIME: MetricScoreValue;
  REVIEW_COMPLETION_TIME: MetricScoreValue;
}

// 개발효율 탭용 metrics 타입
export interface DevelopmentEfficiencyMetrics {
  DEPLOYMENT_FREQUENCY: MetricScoreValue;
  COMMIT_FREQUENCY: MetricScoreValue;
  LEAD_TIME: MetricScoreValue;
  FAILURE_DETECTION_TIME: MetricScoreValue;
  FAILURE_DIAGNOSIS_TIME: MetricScoreValue;
  FAILURE_RECOVERY_TIME: MetricScoreValue;
  DEPLOYMENT_SUCCESS_RATE: MetricScoreValue;
  MR_SIZE: MetricScoreValue;
  CODE_LINE_COUNT_PER_COMMIT: MetricScoreValue;
}

// 통합 metrics 타입 (API 응답에서 탭에 따라 다른 구조)
export type OrganizationMetrics =
  | BdpiMetrics
  | CodeQualityMetrics
  | ReviewQualityMetrics
  | DevelopmentEfficiencyMetrics;

// 점수 메트릭 (부서/멤버 공통)
export interface ScoreMetrics {
  metrics: OrganizationMetrics; // 탭에 따라 다른 구조의 metrics (monthlyComparison 포함)
}

// 변경 카테고리 타입
export type ChangeCategory = "HR" | "GROUP" | "POLICY";

// 변경 사항 정보
export interface ChangeInfo {
  changeType: string; // 변경 유형 (입사, 퇴사, 팀 삭제, 개발조직 추가 등)
  changeDate: string; // 변경 일자 (ISO 8601 형식)
  changeEndDate?: string; // 변경 종료 일자 (RETURNED 등 기간 표시 필요시만 사용)
  category: ChangeCategory; // 카테고리 (인사, 조직, 정책)
  changeDetail: string; // 변경 상세
  processedBy: string; // 처리자 (자동(LDAP), 수동 등)
}

// 조직 멤버 정보
export interface OrganizationMember extends ScoreMetrics {
  type: "member";
  name: string; // 멤버 이름
  employeeID: string; // 직원 고유 ID
  title: MemberRole; // 직급 (사원, 대리, 과장, 차장, 부장)
  personalTitle: MemberPosition; // 직책 (팀장, 실장)
  status: MemberStatus; // 상태 (재직, 이동 전, 이동 후, 입사, 퇴사, 휴직, 복직, 직급변경, 직책변경)
  departmentCode: string; // 소속 부서 코드
  departmentName: string; // 소속 부서 이름
  level: number; // 조직 레벨 (소속 부서와 동일)
  isEvaluationTarget: boolean; // 평가 대상 여부
  isManager: boolean; // 실장/팀장 여부 (personalTitle 코드로 넘어오는 값과 동일)
  changes?: ChangeInfo[]; // 변경 사항 (인사 변경 등) - 복수 가능
  // 화면 표시용 추가 필드
  email?: string; // 이메일 주소
}

// 조직(팀/부서) 정보
export interface OrganizationDepartment extends ScoreMetrics {
  type: "department";
  name: string; // 부서 이름
  code: string; // 부서 코드
  level: number; // 조직 레벨 (1: 부문, 2: 실, 3: 팀 추후 파트 추가 가능성 있음)
  displayName: string; // 표시명 (예: "IT부문[3000]")
  parentCode?: string; // 상위 부서 코드
  sortOrder: number; // 정렬 순서
  isEvaluationTarget: boolean; // 평가 대상 여부
  deptStatus: DepartmentStatus; // 부서 상태 (활성, 생성, 삭제, 변경)
  existedDays: number; // 해당 월에 존재한 일수
  memberCount: number; // 멤버 수
  children?: OrganizationNode[]; // 하위 조직 또는 멤버
  isExpanded?: boolean; // UI 상태 (클라이언트 전용)
  changes?: ChangeInfo[]; // 변경 사항 (조직 변경, 정책 변경 등) - 복수 가능
}

// 조직 트리 노드 (부서 또는 멤버)
export type OrganizationNode = OrganizationDepartment | OrganizationMember;

// 기간 정보
export interface Period {
  year: number;
  month: number;
}

// 조직 비교 API 요청 파라미터
export interface OrganizationCompareRequest {
  yearMonth: string; // "yyyy-MM" 형식
}

// 조직 비교 API 응답 타입
export interface OrganizationCompareResponse {
  period: Period;
  tree: OrganizationDepartment[];
}

// ================================
// UI/공통 타입 정의
// ================================

/**
 * 통합 탭 타입
 * - 조직비교/지표 공통: bdpi(전체), codeQuality, reviewQuality, developmentEfficiency
 */
export type TabType =
  | "bdpi" // BDPI (전체)
  | "codeQuality"
  | "reviewQuality"
  | "developmentEfficiency";

// 비교 그룹 타입
export interface CompareGroup {
  id: string;
  label: string; // "비교 A", "비교 B" 등
  color: string;
}

// 점수 등급 타입
export type ScoreLevel = "excellent" | "good" | "danger";

// 조직 비교 필터 타입
export type OrganizationFilterType = "all" | "excellent" | "good" | "danger";
