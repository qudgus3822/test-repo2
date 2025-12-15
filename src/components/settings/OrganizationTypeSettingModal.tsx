import { useState, useEffect, useMemo } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import { useOrgTypeSettings } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type {
  OrgTypeSettingsNode,
  OrgTypeSettingsChange,
} from "@/types/organization.types";

interface OrganizationTypeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type ChangeType = "신설" | "삭제" | null;

interface OrgItemState {
  id: string;
  name: string;
  isEvaluationTarget: boolean;
  isBlacklisted: boolean;
  changeType: ChangeType;
  changeDate?: string;
  isExpanded?: boolean;
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
    (c) => c.category === "GROUP" || c.category === "POLICY"
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

// 변경 유형 배지 컴포넌트 (신설/삭제)
const ChangeBadge = ({
  changeType,
  date,
}: {
  changeType: ChangeType;
  date?: string;
}) => {
  if (!changeType) return null;

  const isNew = changeType === "신설";
  return (
    <span className="flex items-center gap-1 text-xs">
      <span
        className={`px-1.5 py-0.5 rounded ${
          isNew ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {changeType}
      </span>
      {date && <span className="text-gray-500">{date}</span>}
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
}: {
  item: OrgItemState;
  depth?: number;
  onToggle?: (id: string) => void;
  onTypeChange?: (id: string, isEvaluationTarget: boolean) => void;
  showCheckbox?: boolean;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = depth * 20 + 12;
  const hasDeletedChange = item.changes?.some((c) => c.changeType === "DELETED");
  const isDisabled = item.isBlacklisted || hasDeletedChange;

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

          {item.changeType === "신설" && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}

          <ChangeBadge changeType={item.changeType} date={item.changeDate} />
          <ChangesCategoryBadge changes={item.changes} />
        </div>

        {showCheckbox &&
          (isDisabled ? (
            <div className="w-4.5 h-4.5 flex items-center justify-center border border-gray-300 rounded bg-gray-100">
              <X className="w-5 h-5 text-gray-300" />
            </div>
          ) : (
            <input
              type="checkbox"
              checked={item.isEvaluationTarget}
              onChange={() => onTypeChange?.(item.id, !item.isEvaluationTarget)}
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
  let nodeIndex = 0;

  const convertNode = (
    node: OrgTypeSettingsNode,
    isFirstLevel = false,
  ): OrgItemState => {
    // children 변환
    const childNodes = (node.children || []).map((child) => convertNode(child));

    // TODO: 임시 테스트 데이터 - API 연동 후 삭제 필요
    const testChanges: OrgTypeSettingsChange[] | undefined = (() => {
      nodeIndex++;
      // 3번째 노드: 정보변경 (outline)
      if (nodeIndex === 3) {
        return [
          { changeType: "RENAMED" as const, category: "GROUP" as const },
        ];
      }
      // 5번째 노드: 조직생성 (outline)
      if (nodeIndex === 5) {
        return [
          { changeType: "CREATED" as const, category: "GROUP" as const },
        ];
      }
      // 7번째 노드: 조직삭제 (outline)
      if (nodeIndex === 7) {
        return [{ changeType: "DELETED" as const, category: "GROUP" as const }];
      }
      // 9번째 노드: 유형추가 (outline)
      if (nodeIndex === 9) {
        return [{ changeType: "ADD" as const, category: "POLICY" as const }];
      }
      // 11번째 노드: 유형제외 (outline)
      if (nodeIndex === 11) {
        return [{ changeType: "EXCLUDE" as const, category: "POLICY" as const }];
      }
      return node.changes;
    })();

    return {
      id: node.code,
      name: node.name,
      isEvaluationTarget: node.isEvaluationTarget,
      isBlacklisted: node.isBlacklisted ?? false,
      changeType: null,
      isExpanded: isFirstLevel || node.level === 1,
      children: childNodes,
      changes: testChanges,
    };
  };

  // Level 1 (부문)부터 시작
  return tree.map((root) => convertNode(root, true));
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
  const handleTypeChange = (id: string, isEvaluationTarget: boolean) => {
    const updateType = (items: OrgItemState[]): OrgItemState[] => {
      return items.map((item) => {
        if (item.id === id) {
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
    onSave();
    onClose();
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
  const lastSyncDate = currentMonthApiData?.timestamp
    ? (() => {
        const date = new Date(currentMonthApiData.timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}.${month}.${day} ${hours}:${minutes}`;
      })()
    : "";

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
                <p className="text-sm text-gray-500 mt-1">
                  LDAP 자동 동기화 {lastSyncDate}
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
              <span className="text-sm text-gray-600">구분</span>
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
                      조직 데이터가 없습니다.
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
                      조직 데이터가 없습니다.
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
            <Button variant="cancel" size="sm" onClick={handleCancel}>
              취소
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              수정 완료
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationTypeSettingModal;
