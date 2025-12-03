/**
 * 조직 비교 페이지 관련 타입 정의
 */

// ================================
// 새로운 API 구조 타입 정의
// ================================

// 멤버 상태 타입 (API: status)
export type ApiMemberStatus =
  | "ACTIVE" // 재직
  | "TRANSFERRED_IN" // 이동 전
  | "TRANSFERRED_OUT" // 이동 후
  | "JOINED" // 입사
  | "RESIGNED" // 퇴사
  | "ON_LEAVE" // 휴직
  | "RETURNED" // 복직
  | "CHANGED_ROLE" // 직급변경
  | "CHANGED_POSITION"; // 직책변경

export const ApiMemberStatusLabel = {
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
// 직급 타입 (API: role)
export type ApiMemberRole =
  | "STAFF" // 사원
  | "ASSISTANT_MANAGER" // 대리
  | "MANAGER" // 과장
  | "DEPUTY_MANAGER" // 차장
  | "GENERAL_MANAGER"; // 부장

export const ApiMemberRoleLabel = {
  STAFF: "사원",
  ASSISTANT_MANAGER: "대리",
  MANAGER: "과장",
  DEPUTY_MANAGER: "차장",
  GENERAL_MANAGER: "부장",
};

// 직책 타입 (API: position)
export type ApiMemberPosition =
  | "TEAM_LEADER" // 팀장
  | "DEPARTMENT_HEAD" // 실장
  | "OVERALL_MANAGER"; // 총괄

export const ApiMemberPositionLabel = {
  TEAM_LEADER: "팀장",
  DEPARTMENT_HEAD: "실장",
  OVERALL_MANAGER: "총괄",
};

// 부서 상태 타입 (API: deptStatus)
export type ApiDepartmentStatus =
  | "ACTIVE" // 활성
  | "CREATED" // 생성
  | "DELETED" // 삭제
  | "RENAMED"; // 변경

export const ApiDepartmentStatusLabel = {
  ACTIVE: "활성",
  CREATED: "조직생성",
  DELETED: "조직삭제",
  RENAMED: "정보변경",
};

// 정책 변경 타입
export type ApiPolicyStatus =
  | "ADD" // 유형추가
  | "EXCLUDE"; // 유형제외

export const ApiPolicyStatusLabel = {
  ADD: "유형추가",
  EXCLUDE: "유형제외",
};

// 지표 카테고리 타입 (metrics.types.ts의 MetricCategory와 동일)
export type OrganizationMetricCategory =
  | "code_quality"
  | "review_quality"
  | "development_efficiency";

// 개별 지표 값 타입
export interface OrganizationMetricValue {
  metricCode: string; // 지표 코드 (예: "TECH_DEBT")
  category: OrganizationMetricCategory; // 지표 카테고리
  isUse: boolean; // 지표 사용 여부 (false면 데이터 없음)
  value: number | null; // 현재값
  targetValue?: number | null; // 목표값
  achievementRate?: number | null; // 달성률 (%)
}

// 점수 메트릭 (부서/멤버 공통)
export interface ScoreMetrics {
  codeQuality: number | null;
  reviewQuality: number | null;
  developmentEfficiency: number | null;
  bdpi: number | null;
  changeRate: number | null; // 전월비교 (%)
  metrics?: OrganizationMetricValue[]; // 30개 개별 지표 값
}

// 변경 카테고리 타입
export type ChangeCategory = "HR" | "GROUP" | "POLICY";

// 변경 사항 정보
export interface ChangeInfo {
  changeType?: string; // 변경 유형 (입사, 퇴사, 팀 삭제, 개발조직 추가 등)
  changeDate?: string; // 변경 일자 (ISO 8601 형식)
  changeEndDate?: string; // 변경 종료 일자 (RETURNED 등 기간 표시 필요시만 사용)
  category?: ChangeCategory; // 카테고리 (인사, 조직, 정책)
  classification?: string; // 분류 (조직/정책 변경 시)
  changeDetail?: string; // 변경 상세
  processedBy?: string; // 처리자 (자동(LDAP), 수동 등)
}

// 조직 멤버 정보 (API: type === "member")
export interface ApiOrganizationMember extends ScoreMetrics {
  type: "member";
  name: string;
  employeeID: string; // 직원 고유 ID
  role: ApiMemberRole; // 직급 (사원, 대리, 과장, 차장, 부장)
  position?: ApiMemberPosition; // 직책 (팀장, 실장)
  status: ApiMemberStatus;
  departmentCode: string;
  departmentName: string;
  level: number; // 조직 레벨 (소속 부서와 동일)
  isEvaluationTarget: boolean;
  isManager: boolean;
  changeDate?: string; // 상태 변경일 (yyyy-MM-dd)
  previousRole?: ApiMemberRole; // 이전 직급 (승진 시)
  // 화면 표시용 추가 필드
  email?: string; // 이메일 주소
  change?: ChangeInfo[]; // 변경 사항 (인사 변경 등) - 복수 가능
}

// 조직(팀/부서) 정보 (API: type === "department")
export interface ApiOrganizationDepartment extends ScoreMetrics {
  type: "department";
  name: string;
  code: string; // 부서 코드
  level: number; // 조직 레벨 (2: 부문, 3: 실, 4: 팀)
  displayName: string; // 표시명 (예: "IT부문[3000]")
  parentCode?: string; // 상위 부서 코드
  sortOrder: number; // 정렬 순서
  isEvaluationTarget: boolean;
  deptStatus: ApiDepartmentStatus;
  existedDays: number; // 해당 월에 존재한 일수
  memberCount: number;
  children?: ApiOrganizationNode[]; // 하위 조직 또는 멤버
  isExpanded?: boolean; // UI 상태 (클라이언트 전용)
  change?: ChangeInfo[]; // 변경 사항 (조직 변경, 정책 변경 등) - 복수 가능
}

// 조직 트리 노드 (부서 또는 멤버)
export type ApiOrganizationNode =
  | ApiOrganizationDepartment
  | ApiOrganizationMember;

// 기간 정보
export interface Period {
  year: number;
  month: number;
}

// 조직 비교 API 요청 파라미터
export interface OrganizationCompareRequest {
  yearMonth: string; // "yyyy-MM" 형식
}

// 조직 비교 API 응답 타입 (새로운 구조)
export interface ApiOrganizationCompareResponse {
  period: Period;
  tree: ApiOrganizationDepartment[];
}

// ================================
// UI/공통 타입 정의
// ================================

// 조직 비교 탭 타입
export type OrganizationTabType =
  | "bdpi"
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

/**
 * 조직도 관리 관련 타입 정의
 */

// 직급/직책 타입
export type PositionLevel = "팀장" | "책임" | "선임" | "주임" | "사원";

// 역할 타입
export type RoleType = "개발" | "비개발";

// 조직 유형
export type OrganizationType = "개발실" | "비개발실";

// 멤버 상태
export type MemberStatus = "active" | "inactive" | "leave";

// 개인 정보
export interface Member {
  id: string;
  name: string;
  email: string;
  position: PositionLevel;
  role?: RoleType;
  profileImage?: string;
  isNew?: boolean; // 신규 입사자 여부
  joinDate?: string; // 입사일 또는 팀 합류일
  leaveDate?: string; // 퇴사 예정일 (있는 경우)
  status: MemberStatus;
}

// 팀 정보
export interface Team {
  id: string;
  name: string;
  type: RoleType;
  memberCount: number;
  members: Member[];
}

// 실(부서) 정보
export interface Department {
  id: string;
  name: string;
  type: OrganizationType;
  leader: string; // 실장 이름
  teamCount: number;
  memberCount: number;
  teams: Team[];
}

// 조직도 전체 데이터
export interface OrganizationData {
  departments: Department[];
  totalDepartments: number;
  totalTeams: number;
  totalMembers: number;
  lastSyncDate: string; // 마지막 동기화 일시
  syncSource: string; // 동기화 소스 (예: "LDAP AD기준")
}

// 변경 이력
export interface ChangeHistory {
  id: string;
  date: string;
  type: "create" | "update" | "delete" | "move";
  targetType: "department" | "team" | "member";
  targetName: string;
  description: string;
  changedBy?: string;
}

// 조직도 관리 상태
export interface OrganizationState {
  selectedDepartmentId: string | null;
  selectedTeamId: string | null;
  selectedMemberId: string | null;
  isAutoSyncEnabled: boolean;
}
