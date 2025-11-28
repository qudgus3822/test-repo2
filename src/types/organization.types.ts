/**
 * 조직 비교 페이지 관련 타입 정의
 */

// 조직 비교 탭 타입
export type OrganizationTabType =
  | "bdpi"
  | "codeQuality"
  | "reviewQuality"
  | "developmentEfficiency";

// 멤버 역할 타입
export type MemberRole =
  | "실장"
  | "팀장"
  | "과장"
  | "책임"
  | "선임"
  | "주임"
  | "사원";

// 멤버 상태 타입
export type MemberStatus = "재직" | "휴직" | "입사" | "직급변경" | "퇴사";

// 비교 그룹 타입
export interface CompareGroup {
  id: string;
  label: string; // "비교 A", "비교 B" 등
  color: string;
}

// 조직 멤버 정보
export interface OrganizationMember {
  id: string;
  name: string;
  role: MemberRole;
  status?: MemberStatus;
  previousRole?: MemberRole; // 직급변경 시 이전 직급
  email: string;
  joinDate?: string; // 입사일, 퇴사일, 직급변경일 등 상태 관련 날짜
  codeQuality: number | null;
  reviewQuality: number | null;
  developmentEfficiency: number | null;
  bdpi: number | null;
  changeRate: number | null; // 전월비교 (%)
}

// 조직(팀/부서) 정보
export interface OrganizationUnit {
  id: string;
  name: string;
  memberCount: number;
  codeQuality: number;
  reviewQuality: number;
  developmentEfficiency: number;
  bdpi: number;
  changeRate: number; // 전월비교 (%)
  isExpanded?: boolean;
  children?: OrganizationUnit[]; // 하위 조직
  members?: OrganizationMember[]; // 멤버 목록
}

// 점수 등급 타입
export type ScoreLevel = "excellent" | "good" | "danger";

// 점수 범위 설정
export interface ScoreThreshold {
  excellent: number; // 80% 이상
  good: number; // 70% 이상
}

// 조직 비교 필터 타입
export type OrganizationFilterType = "all" | "excellent" | "good" | "danger";

// 조직 비교 API 응답 타입
export interface OrganizationCompareResponse {
  month: string;
  organizations: OrganizationUnit[];
}
