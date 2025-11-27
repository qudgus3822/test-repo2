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
