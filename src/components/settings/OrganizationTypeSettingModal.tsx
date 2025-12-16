import { useState, useEffect, useMemo } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import {
  useOrgTypeSettings,
  useUpdateEvaluationTargetsBulk,
} from "@/api/hooks/useOrganizationTree";
import type { EvaluationTargetChange } from "@/api/organization";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDisplayDateTime } from "@/utils/date";
import type {
  OrgTypeSettingsNode,
  OrgTypeSettingsChange,
} from "@/types/organization.types";

interface OrganizationTypeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface OrgItemState {
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

// 조직 아이템 행 컴포넌트
const OrgItemRow = ({
  item,
  depth = 0,
  onToggle,
  onTypeChange,
  showCheckbox = false,
  parentIsEvaluationTarget = true,
}: {
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
}) => {
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

          {showCheckbox && !item.isBlacklisted && (
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

          <ChangesCategoryBadge changes={item.changes} />
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

// 현재 월과 전월 YYYY-MM 형식으로 가져오기
const getYearMonths = (): { currentMonth: string; prevMonth: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const prevYear = prevDate.getFullYear();
  const prevMonthNum = prevDate.getMonth() + 1;

  return {
    currentMonth: `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`,
    prevMonth: `${prevYear}-${String(prevMonthNum).padStart(2, "0")}`,
  };
};

// API 데이터를 OrgItemState로 변환하는 함수
const convertApiToOrgItemState = (
  tree: OrgTypeSettingsNode[],
): OrgItemState[] => {
  const convertNode = (
    node: OrgTypeSettingsNode,
    isFirstLevel = false,
  ): OrgItemState => {
    // children 변환
    const childNodes = (node.children || []).map((child) => convertNode(child));

    return {
      id: node.code,
      name: node.name,
      level: node.level,
      isEvaluationTarget: node.isEvaluationTarget,
      isBlacklisted: node.isBlacklisted ?? false,
      isExpanded: isFirstLevel || node.level === 1,
      children: childNodes,
      changes: node.changes,
    };
  };

  // Level 1 (부문)부터 시작
  return tree.map((root) => convertNode(root, true));
};

// 트리에서 모든 조직의 isEvaluationTarget 값을 추출하는 함수
const extractAllEvaluationTargets = (
  items: OrgItemState[],
): EvaluationTargetChange[] => {
  const result: EvaluationTargetChange[] = [];

  const traverse = (nodes: OrgItemState[]) => {
    for (const node of nodes) {
      // blacklisted가 아닌 항목만 포함
      if (!node.isBlacklisted) {
        result.push({
          code: node.id,
          isEvaluationTarget: node.isEvaluationTarget,
        });
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  };

  traverse(items);
  return result;
};

export const OrganizationTypeSettingModal = ({
  isOpen,
  onClose,
  onSave,
}: OrganizationTypeSettingModalProps) => {
  const [prevMonthData, setPrevMonthData] = useState<OrgItemState[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<OrgItemState[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 전월/당월 계산
  const { currentMonth, prevMonth } = useMemo(() => getYearMonths(), []);

  // 개발조직 일괄 변경 mutation
  const { mutate: updateEvaluationTargets, isPending: isSaving } =
    useUpdateEvaluationTargetsBulk();

  // API에서 전월/당월 조직 데이터 조회
  const { data: currentMonthApiData, isLoading: isCurrentLoading } =
    useOrgTypeSettings(currentMonth, isOpen);

  const { data: prevMonthApiData, isLoading: isPrevLoading } =
    useOrgTypeSettings(prevMonth, isOpen);

  const isLoading = isCurrentLoading || isPrevLoading;

  // API 데이터를 OrgItemState로 변환
  useEffect(() => {
    if (isOpen && currentMonthApiData?.tree) {
      setCurrentMonthData(convertApiToOrgItemState(currentMonthApiData.tree));
    }
  }, [isOpen, currentMonthApiData]);

  useEffect(() => {
    if (isOpen && prevMonthApiData?.tree) {
      setPrevMonthData(convertApiToOrgItemState(prevMonthApiData.tree));
    }
  }, [isOpen, prevMonthApiData]);

  // 애니메이션 처리
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 토글 핸들러
  const handleToggle = (
    data: OrgItemState[],
    setData: React.Dispatch<React.SetStateAction<OrgItemState[]>>,
    id: string,
  ) => {
    const toggleItem = (items: OrgItemState[]): OrgItemState[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };
    setData(toggleItem(data));
  };

  // 타입 변경 핸들러
  const handleTypeChange = (
    id: string,
    isEvaluationTarget: boolean,
    level: number,
  ) => {
    const updateType = (items: OrgItemState[]): OrgItemState[] => {
      return items.map((item) => {
        if (item.id === id) {
          // 실(level 2)인 경우, 하위 팀(level 3)도 함께 변경
          if (level === 2 && item.children) {
            const updatedChildren = item.children.map((child) => {
              if (child.level === 3 && !child.isBlacklisted) {
                return { ...child, isEvaluationTarget };
              }
              return child;
            });
            return { ...item, isEvaluationTarget, children: updatedChildren };
          }
          return { ...item, isEvaluationTarget };
        }
        if (item.children) {
          return { ...item, children: updateType(item.children) };
        }
        return item;
      });
    };
    setCurrentMonthData(updateType(currentMonthData));
  };

  const handleSave = () => {
    const changes = extractAllEvaluationTargets(currentMonthData);
    updateEvaluationTargets(
      { changes },
      {
        onSuccess: () => {
          onSave();
          onClose();
        },
        onError: (error) => {
          console.error("조직 유형 변경 실패:", error);
          alert("조직 유형 변경에 실패했습니다.");
        },
      },
    );
  };

  const handleCancel = () => {
    onClose();
  };

  if (!shouldRender) return null;

  // 현재 날짜 기준 전월/당월 라벨
  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const prevMonthLabel = `${prevMonthDate.getFullYear()}년 ${
    prevMonthDate.getMonth() + 1
  }월`;
  const currentMonthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  // 마지막 동기화 일자
  const lastSyncDate = formatDisplayDateTime(
    currentMonthApiData?.timestamp,
    "",
  );

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCancel}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[649px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  조직 유형 수정
                </h2>
                <p className="text-sm text-gray-500 mt-1 gap-1 flex items-center">
                  <span>마지막 동기화</span>
                  <span>{lastSyncDate}</span>
                  <span>(LDAP AD기준)</span>
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* 범례 */}
            <div className="flex items-center justify-end gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">구분</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 pointer-events-none"
                  />
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                    개발조직 포함
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 pointer-events-none"
                  />
                  <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                    개발조직 제외
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 콘텐츠 - 2단 레이아웃 */}
          <div className="flex-1 overflow-hidden flex">
            {/* 전월 */}
            <div className="flex-1 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">전월</span>
                  <span className="text-sm font-medium text-gray-900">
                    {prevMonthLabel}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <LoadingSpinner />
                  </div>
                ) : prevMonthData.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <p className="text-gray-500 text-sm">
                      해당 기간에는 수집된 데이터가 없습니다.
                    </p>
                  </div>
                ) : (
                  prevMonthData.map((item) => (
                    <OrgItemRow
                      key={item.id}
                      item={item}
                      onToggle={(id) =>
                        handleToggle(prevMonthData, setPrevMonthData, id)
                      }
                      showCheckbox={false}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 당월 */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">당월</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentMonthLabel}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <LoadingSpinner />
                  </div>
                ) : currentMonthData.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <p className="text-gray-500 text-">
                      해당 기간에는 수집된 데이터가 없습니다.
                    </p>
                  </div>
                ) : (
                  currentMonthData.map((item) => (
                    <OrgItemRow
                      key={item.id}
                      item={item}
                      onToggle={(id) =>
                        handleToggle(currentMonthData, setCurrentMonthData, id)
                      }
                      onTypeChange={handleTypeChange}
                      showCheckbox={true}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <Button
              variant="cancel"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "수정 완료"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationTypeSettingModal;
