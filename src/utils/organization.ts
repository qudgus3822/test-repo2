import type {
  MemberStatus,
  MemberRole,
  MemberPosition,
  DepartmentStatus,
  ChangeInfo,
} from "@/types/organization.types";
import {
  MemberStatusLabel,
  DepartmentStatusLabel,
  PolicyStatusLabel,
} from "@/types/organization.types";
import { CHANGE_TYPE_BADGE_COLORS } from "@/styles/colors";

/**
 * 조직 비교 페이지 관련 유틸리티 함수
 */

/**
 * 멤버 상태(status)를 한글 라벨로 변환합니다.
 *
 * @param status - MemberStatus 값
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getMemberStatusLabel } from "@/utils/organization";
 *
 * const label = getMemberStatusLabel("ACTIVE");
 * // Returns: "재직"
 *
 * const label2 = getMemberStatusLabel("PROMOTED");
 * // Returns: "승진"
 * ```
 */
export const getMemberStatusLabel = (status: MemberStatus): string => {
  const labels: Record<MemberStatus, string> = {
    ACTIVE: "재직",
    TRANSFERRED_IN: "이동후",
    TRANSFERRED_OUT: "이동전",
    JOINED: "입사",
    RESIGNED: "퇴사",
    ON_LEAVE: "휴직",
    RETURNED: "복직",
    CHANGED_ROLE: "직급변경",
    CHANGED_POSITION: "직책변경",
  };
  return labels[status] || status;
};

/**
 * 직급(role)을 한글 라벨로 변환합니다.
 *
 * @param role - MemberRole 값
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getMemberRoleLabel } from "@/utils/organization";
 *
 * const label = getMemberRoleLabel("MANAGER");
 * // Returns: "과장"
 *
 * const label2 = getMemberRoleLabel("GENERAL_MANAGER");
 * // Returns: "부장"
 * ```
 */
export const getMemberRoleLabel = (role: MemberRole): string => {
  const labels: Record<MemberRole, string> = {
    STAFF: "사원",
    ASSISTANT_MANAGER: "대리",
    MANAGER: "과장",
    DEPUTY_MANAGER: "차장",
    GENERAL_MANAGER: "부장",
  };
  return labels[role] || role;
};

/**
 * 직책(position)을 한글 라벨로 변환합니다.
 *
 * @param position - MemberPosition 값
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getMemberPositionLabel } from "@/utils/organization";
 *
 * const label = getMemberPositionLabel("TEAM_LEADER");
 * // Returns: "팀장"
 *
 * const label2 = getMemberPositionLabel("DEPARTMENT_HEAD");
 * // Returns: "실장"
 * ```
 */
export const getMemberPositionLabel = (
  position?: MemberPosition,
): string => {
  if (!position) return "";
  const labels: Record<MemberPosition, string> = {
    TEAM_LEADER: "팀장",
    DEPARTMENT_HEAD: "실장",
    OVERALL_MANAGER: "총괄",
  };
  return labels[position] || position;
};

/**
 * 직급과 직책을 조합하여 표시 라벨을 반환합니다.
 * 직책이 있으면 "직책 | 직급" 형태로, 없으면 직급만 반환합니다.
 *
 * @param role - MemberRole 값 또는 한글 직급
 * @param position - MemberPosition 값 또는 한글 직책 (optional)
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getMemberRoleOrPositionLabel } from "@/utils/organization";
 *
 * const label = getMemberRoleOrPositionLabel("MANAGER", "TEAM_LEADER");
 * // Returns: "팀장 | 과장"
 *
 * const label2 = getMemberRoleOrPositionLabel("MANAGER");
 * // Returns: "과장"
 *
 * const label3 = getMemberRoleOrPositionLabel("부장", "팀장");
 * // Returns: "팀장 | 부장"
 * ```
 */
export const getMemberRoleOrPositionLabel = (
  role: MemberRole | string,
  position?: MemberPosition | string,
): string => {
  const roleLabel = getMemberRoleLabel(role as MemberRole);
  if (position) {
    const positionLabel = getMemberPositionLabel(position as MemberPosition);
    return `${positionLabel} | ${roleLabel}`;
  }
  return roleLabel;
};

/**
 * 부서 상태(deptStatus)를 한글 라벨로 변환합니다.
 *
 * @param deptStatus - DepartmentStatus 값
 * @returns 한글 라벨 문자열
 *
 * @example
 * ```typescript
 * import { getDepartmentStatusLabel } from "@/utils/organization";
 *
 * const label = getDepartmentStatusLabel("ACTIVE");
 * // Returns: "활성"
 *
 * const label2 = getDepartmentStatusLabel("CREATED");
 * // Returns: "생성"
 * ```
 */
export const getDepartmentStatusLabel = (
  deptStatus: DepartmentStatus,
): string => {
  const labels: Record<DepartmentStatus, string> = {
    ACTIVE: "활성",
    CREATED: "생성",
    DELETED: "삭제",
    RENAMED: "명칭변경",
  };
  return labels[deptStatus] || deptStatus;
};

/**
 * 멤버의 표시명을 생성합니다. (이름 + 직급)
 *
 * @param name - 멤버 이름
 * @param role - 직급 (MemberRole)
 * @returns 표시명 문자열 (예: "홍길동 팀장", "김철수 대리")
 *
 * @example
 * ```typescript
 * import { getMemberDisplayName } from "@/utils/organization";
 *
 * const displayName = getMemberDisplayName("홍길동", "TEAM_LEADER");
 * // Returns: "홍길동 팀장"
 *
 * const displayName2 = getMemberDisplayName("김철수", "ASSISTANT_MANAGER");
 * // Returns: "김철수 대리"
 * ```
 */
export const getMemberDisplayName = (
  name: string,
  role: MemberRole,
): string => {
  return `${name} ${getMemberRoleLabel(role)}`;
};

/**
 * 변경 이력이 있는지 확인합니다.
 *
 * @param change - ChangeInfo 배열
 * @returns 변경 이력 존재 여부
 */
export const hasChangeInfo = (change?: ChangeInfo[]): boolean => {
  if (!change || !Array.isArray(change)) return false;
  return change.length > 0 && change.some((c) => Object.keys(c).length > 0);
};

/**
 * changeType에 따른 뱃지 배경색을 반환합니다.
 * MemberStatus, DepartmentStatus, PolicyStatus 모두 지원합니다.
 *
 * @param type - changeType 값
 * @returns 색상 코드 문자열
 */
export const getChangeTypeBadgeColor = (type?: string): string => {
  if (!type) return CHANGE_TYPE_BADGE_COLORS.default;
  return (
    CHANGE_TYPE_BADGE_COLORS[type as keyof typeof CHANGE_TYPE_BADGE_COLORS] ||
    CHANGE_TYPE_BADGE_COLORS.default
  );
};

/**
 * changeType을 한글 라벨로 변환합니다.
 * MemberStatus, DepartmentStatus, PolicyStatus 모두 지원합니다.
 *
 * @param type - changeType 값
 * @returns 한글 라벨 문자열
 */
export const getChangeTypeLabel = (type?: string): string => {
  if (!type) return "";
  // MemberStatusLabel에서 찾기
  if (type in MemberStatusLabel) {
    return MemberStatusLabel[type as keyof typeof MemberStatusLabel];
  }
  // DepartmentStatusLabel에서 찾기
  if (type in DepartmentStatusLabel) {
    return DepartmentStatusLabel[
      type as keyof typeof DepartmentStatusLabel
    ];
  }
  // PolicyStatusLabel에서 찾기
  if (type in PolicyStatusLabel) {
    return PolicyStatusLabel[type as keyof typeof PolicyStatusLabel];
  }
  return type;
};

/**
 * ISO 8601 날짜 문자열을 yyyy-MM-dd 형식으로 변환합니다.
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns yyyy-MM-dd 형식의 날짜 문자열
 */
export const formatChangeDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * employeeID로부터 이메일 주소를 생성합니다.
 *
 * @param employeeID - 직원 ID
 * @returns 이메일 주소 문자열
 *
 * @example
 * ```typescript
 * import { getMemberEmail } from "@/utils/organization";
 *
 * const email = getMemberEmail("gildong.hong");
 * // Returns: "gildong.hong@bithumbcorp.com"
 * ```
 */
export const getMemberEmail = (employeeID: string): string => {
  if (!employeeID) return "";
  return `${employeeID}@bithumbcorp.com`;
};

/**
 * 변경 상세 내용에 자동/수동 텍스트를 추가합니다.
 * - POLICY 카테고리: (수동)
 * - GROUP 카테고리 && CREATED/DELETED: (자동)
 * - GROUP 카테고리 && RENAMED: suffix 없음
 *
 * @param changeDetail - 변경 상세 내용
 * @param category - 변경 카테고리 (GROUP, POLICY, HR 등)
 * @param changeType - 변경 유형 (CREATED, DELETED, RENAMED 등)
 * @returns suffix가 추가된 변경 상세 내용
 *
 * @example
 * ```typescript
 * import { getChangeDetailWithSuffix } from "@/utils/organization";
 *
 * getChangeDetailWithSuffix("조직 생성됨", "GROUP", "CREATED");
 * // Returns: "조직 생성됨 (자동)"
 *
 * getChangeDetailWithSuffix("유형 추가됨", "POLICY", "ADD");
 * // Returns: "유형 추가됨 (수동)"
 *
 * getChangeDetailWithSuffix("명칭 변경됨", "GROUP", "RENAMED");
 * // Returns: "명칭 변경됨"
 * ```
 */
export const getChangeDetailWithSuffix = (
  changeDetail: string | undefined,
  category: string,
  changeType: string,
): string => {
  const detail = changeDetail || "-";

  // POLICY 카테고리는 수동
  if (category === "POLICY") {
    return `${detail} (수동)`;
  }

  // GROUP 카테고리
  if (category === "GROUP") {
    // CREATED, DELETED는 자동
    if (changeType === "CREATED" || changeType === "DELETED") {
      return `${detail} (자동)`;
    }
    // RENAMED는 suffix 없음
    return detail;
  }

  return detail;
};
