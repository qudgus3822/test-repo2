import { ChevronRight, ChevronDown, X } from "lucide-react";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import type { OrgTypeSettingsChange } from "@/types/organization.types";
import { StatusBadge } from "../organization/StatusBadge";

export interface OrgItemState {
  id: string;
  name: string;
  isEvaluationTarget: boolean;
  isBlacklisted: boolean;
  isExpanded?: boolean;
  level: number;
  children?: OrgItemState[];
  changes?: OrgTypeSettingsChange[];
}

// 변경 유형 배지 컴포넌트 (GROUP, POLICY 카테고리만 표시)
const ChangesCategoryBadge = ({
  changes,
}: {
  changes?: OrgTypeSettingsChange[];
}) => {
  if (!changes || changes.length === 0) return null;

  // GROUP, POLICY 카테고리만 필터링
  const filteredChanges = changes.filter(
    (c) => c.category === "GROUP" || c.category === "POLICY",
  );

  if (filteredChanges.length === 0) return null;

  return (
    <span className="flex items-center gap-1">
      {filteredChanges.map((change, index) => (
        <ChangeTypeBadge
          key={`${change.category}-${change.changeType}-${index}`}
          type={change.changeType}
          fixedWidth
        />
      ))}
    </span>
  );
};

interface OrgItemRowProps {
  item: OrgItemState;
  depth?: number;
  onToggle?: (id: string) => void;
  onTypeChange?: (
    id: string,
    isEvaluationTarget: boolean,
    level: number,
  ) => void;
  showCheckbox?: boolean;
  parentIsEvaluationTarget?: boolean;
}

export const OrgItemRow = ({
  item,
  depth = 0,
  onToggle,
  onTypeChange,
  showCheckbox = false,
  parentIsEvaluationTarget = true,
}: OrgItemRowProps) => {
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = depth * 20 + 12;
  const hasDeletedChange = item.changes?.some(
    (c) => c.changeType === "DELETED",
  );
  const isDisabled = item.isBlacklisted || hasDeletedChange;
  const isDepartment: boolean = item.level === 2;
  const isTeam: boolean = item.level === 3;
  // 팀인 경우, 상위 실이 체크 해제 상태면 체크박스 비활성화
  const isTeamDisabledByParent = isTeam && !parentIsEvaluationTarget;

  return (
    <>
      <div
        className={`flex items-center justify-between py-2 px-3 border-b border-gray-100 ${
          isDisabled ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <button
              onClick={() => onToggle?.(item.id)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {!item.isBlacklisted && (
            <OrgTypeBadge
              isEvaluationTarget={item.isEvaluationTarget}
              fixedWidth
            />
          )}

          <span
            className={`text-sm ${
              isDisabled ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {item.name}
          </span>

          <StatusBadge change={item.changes} />
        </div>

        {showCheckbox &&
          (isDisabled || isTeamDisabledByParent ? (
            <div className="w-4.5 h-4.5 flex items-center justify-center border border-gray-300 rounded bg-gray-100">
              <X className="w-5 h-5 text-gray-300" />
            </div>
          ) : (
            <input
              type="checkbox"
              checked={item.isEvaluationTarget}
              onChange={() =>
                onTypeChange?.(item.id, !item.isEvaluationTarget, item.level)
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          ))}
      </div>

      {hasChildren && item.isExpanded && (
        <>
          {item.children!.map((child) => (
            <OrgItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              onToggle={onToggle}
              onTypeChange={onTypeChange}
              showCheckbox={showCheckbox}
              parentIsEvaluationTarget={
                isDepartment
                  ? item.isEvaluationTarget
                  : parentIsEvaluationTarget
              }
            />
          ))}
        </>
      )}
    </>
  );
};

export default OrgItemRow;
