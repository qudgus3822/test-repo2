/**
 * StatusBadge 컴포넌트
 * - 조직/구성원의 변경 이력(changes) 배지를 표시
 * - 모든 Organization 테이블에서 공통으로 사용
 * [변경: 2026-01-22 12:00, 김병현 수정] 공통 컴포넌트로 분리
 */

import type { ChangeInfo } from "@/types/organization.types";
import {
  hasChangeInfo,
  formatChangeDate,
  getChangeDetailWithSuffix,
} from "@/utils/organization";
import { Tooltip } from "@/components/ui/Tooltip";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";

const MAX_BADGE_COUNT = 4;

// 변경 정보 툴팁 내용 생성
const getCombinedTooltipContent = (changes: ChangeInfo[]): string => {
  return changes
    .map((item) => {
      const formattedDate = formatChangeDate(item.changeDate);
      const detailWithSuffix = getChangeDetailWithSuffix(
        item.changeDetail,
        item.category,
        item.changeType,
      );
      return `[${formattedDate}] ${detailWithSuffix}`;
    })
    .join("\n");
};

interface StatusBadgeProps {
  change?: ChangeInfo[];
}

export const StatusBadge = ({ change }: StatusBadgeProps) => {
  if (!hasChangeInfo(change)) return null;
  const sortedChanges = [...change!].sort((a, b) => {
    const dateA = a.changeDate ? new Date(a.changeDate).getTime() : 0;
    const dateB = b.changeDate ? new Date(b.changeDate).getTime() : 0;
    return dateA - dateB;
  });
  const displayChanges = sortedChanges.slice(0, MAX_BADGE_COUNT);
  const tooltipContent = getCombinedTooltipContent(displayChanges);

  // [변경: 2026-01-22 12:00, 김병현 수정] 첫 번째 배지만 표시하도록 수정
  const item = displayChanges.find(() => true);
  const badges = (
    <div className="inline-flex items-center">
      <ChangeTypeBadge
        type={item?.changeType || "UNKNOWN"}
        category={item?.category}
        className="ml-2 cursor-default"
      />
    </div>
  );

  return (
    <Tooltip content={tooltipContent} color="#6B7280">
      {badges}
    </Tooltip>
  );
};
