import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { OrgTypeLegend } from "@/components/ui/OrgTypeLegend";
import { OrgItemRow, type OrgItemState } from "@/components/ui/OrgItemRow";
import { LastSyncInfo } from "@/components/ui/LastSyncInfo";
import { ChangeHistoryList } from "@/components/ui/ChangeHistoryList";
import { useOrgTypeSettings } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDisplayDateTime } from "@/utils/date";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { OrgTypeSettingsNode } from "@/types/organization.types";

// 조직도 팝업용 칼럼 너비
const orgHistoryColWidths = {
  bullet: "3%",
  date: "15%",
  divider: "2%",
  processedBy: "19%",
  changeType: "9%",
  orgType: "9%",
  name: "14%",
  detail: "27%",
};

// 현재 월 YYYY-MM 형식으로 가져오기
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  return `${currentYear}-${String(currentMonthNum).padStart(2, "0")}`;
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
      // 이 팝업에서는 level 2(실)까지 펼침
      isExpanded: isFirstLevel || node.level === 1 || node.level === 2,
      children: childNodes,
      changes: node.changes,
    };
  };

  // Level 1 (부문)부터 시작
  return tree.map((root) => convertNode(root, true));
};

export const OrgChangeHistoryModal = () => {
  const { isOrgHistoryModalOpen, setOrgHistoryModal } = useDashboardStore();

  const [currentMonthData, setCurrentMonthData] = useState<OrgItemState[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 당월 계산
  const currentMonth = useMemo(() => getCurrentYearMonth(), []);

  // API에서 당월 조직 데이터 조회
  const { data: currentMonthApiData, isLoading } = useOrgTypeSettings(
    currentMonth,
    isOrgHistoryModalOpen,
  );

  // API 데이터를 OrgItemState로 변환
  useEffect(() => {
    if (isOrgHistoryModalOpen && currentMonthApiData?.tree) {
      setCurrentMonthData(convertApiToOrgItemState(currentMonthApiData.tree));
    }
  }, [isOrgHistoryModalOpen, currentMonthApiData]);

  // 애니메이션 처리
  useEffect(() => {
    if (isOrgHistoryModalOpen) {
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
  }, [isOrgHistoryModalOpen]);

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

  const handleClose = () => {
    setOrgHistoryModal(false);
  };

  if (!shouldRender) return null;

  // 현재 날짜 기준 당월 라벨
  const now = new Date();
  const currentMonthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  // 마지막 동기화 일자
  const lastSyncDate = formatDisplayDateTime(currentMonthApiData?.timestamp);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[1150px] h-[649px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">조직도</h2>
              <div className="flex items-center gap-4">
                <LastSyncInfo syncDate={lastSyncDate} />
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 콘텐츠 - 2단 레이아웃 */}
          <div className="flex-1 overflow-hidden flex w-full">
            {/* 당월 */}
            <div className="w-[400px] shrink-0 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {currentMonthLabel}
                    </span>
                  </div>
                  {/* 범례 */}
                  <OrgTypeLegend />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <LoadingSpinner />
                  </div>
                ) : currentMonthData.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <p className="text-gray-500 text-sm">
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
                    />
                  ))
                )}
              </div>
            </div>

            {/* 실/팀 변경 이력 */}
            <div className="w-[750px] shrink-0 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    실/팀 변경 이력
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <ChangeHistoryList
                  yearMonth={currentMonth}
                  colWidths={orgHistoryColWidths}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrgChangeHistoryModal;
