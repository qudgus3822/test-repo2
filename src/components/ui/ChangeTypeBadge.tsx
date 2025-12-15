import { CHANGE_TYPE_BADGE_COLORS } from "@/styles/colors";
import type {
  OrgHistoryChangeType,
  PolicyStatus,
  ChangeCategory,
} from "@/types/organization.types";
import {
  OrgHistoryChangeTypeLabel,
  PolicyStatusLabel,
  MemberStatusLabel,
  DepartmentStatusLabel,
} from "@/types/organization.types";

// 변경 유형 타입 (OrgHistoryChangeType + PolicyStatus + MemberStatus/DepartmentStatus 등)
type ChangeType = OrgHistoryChangeType | PolicyStatus | string;

// 테두리 스타일 적용 대상 타입 (type 기반 판단용)
const OUTLINE_TYPES: string[] = [
  "DELETED",
  "CREATED",
  "RENAMED",
  "ADD",
  "EXCLUDE",
];

interface ChangeTypeBadgeProps {
  type: ChangeType;
  category?: ChangeCategory; // category가 제공되면 category 기반 variant 결정
  fixedWidth?: boolean;
  className?: string;
}

// changeType별 색상 가져오기
const getBadgeColor = (type: ChangeType): string => {
  // TRANSFERRED는 TRANSFERRED_IN으로 매핑
  const colorKey = type === "TRANSFERRED" ? "TRANSFERRED_IN" : type;
  return (
    CHANGE_TYPE_BADGE_COLORS[colorKey as keyof typeof CHANGE_TYPE_BADGE_COLORS] ||
    CHANGE_TYPE_BADGE_COLORS.default
  );
};

// changeType별 라벨 가져오기
const getLabel = (type: ChangeType): string => {
  // PolicyStatusLabel에서 찾기
  if (type === "ADD" || type === "EXCLUDE") {
    return PolicyStatusLabel[type];
  }
  // MemberStatusLabel에서 찾기
  if (type in MemberStatusLabel) {
    return MemberStatusLabel[type as keyof typeof MemberStatusLabel];
  }
  // DepartmentStatusLabel에서 찾기
  if (type in DepartmentStatusLabel) {
    return DepartmentStatusLabel[type as keyof typeof DepartmentStatusLabel];
  }
  // OrgHistoryChangeTypeLabel에서 찾기
  if (type in OrgHistoryChangeTypeLabel) {
    return OrgHistoryChangeTypeLabel[type as OrgHistoryChangeType];
  }
  return type;
};

// 테두리 스타일 여부 확인 (type 또는 category 기반)
const isOutlineStyle = (type: ChangeType, category?: ChangeCategory): boolean => {
  // category가 제공되면 category 기반 판단: GROUP → outlined, HR/POLICY → filled
  if (category) {
    return category === "GROUP";
  }
  // category가 없으면 type 기반 판단
  return OUTLINE_TYPES.includes(type);
};

/**
 * 변경 유형 배지 컴포넌트
 * 스타일 결정 방식:
 * - category prop 제공 시: GROUP → outline 스타일, HR/POLICY → filled 스타일
 * - category prop 미제공 시: DELETED, CREATED, RENAMED, ADD, EXCLUDE → outline 스타일, 그 외 → filled 스타일
 * - fixedWidth: 4글자 기준 고정 너비 (58px)
 */
export const ChangeTypeBadge = ({
  type,
  category,
  fixedWidth = false,
  className = "",
}: ChangeTypeBadgeProps) => {
  const color = getBadgeColor(type);
  const useOutline = isOutlineStyle(type, category);

  return (
    <span
      className={`inline-block py-0.5 text-xs rounded-xl font-medium text-center ${
        fixedWidth ? "w-[58px]" : "px-2"
      } ${useOutline ? "bg-white border" : ""} ${className}`}
      style={
        useOutline
          ? { color: color, borderColor: color }
          : { backgroundColor: color, color: "#E7E7E7" }
      }
    >
      {getLabel(type)}
    </span>
  );
};

export default ChangeTypeBadge;
