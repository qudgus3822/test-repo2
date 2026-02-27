import { useState, useEffect, useMemo } from "react";
import { X, Info } from "lucide-react";
import { OrgTypeLegend } from "@/components/ui/OrgTypeLegend";
import { OrgItemRow, type OrgItemState } from "@/components/ui/OrgItemRow";
import { ChangeHistoryList } from "@/components/ui/ChangeHistoryList";
import { useOrgTypeSettings } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDashboardStore } from "@/store/useDashboardStore";
import type { OrgTypeSettingsNode } from "@/types/organization.types";

// 조직도 팝업용 칼럼 너비
// [변경: 2026-01-28 14:05, 임도휘 수정] 반응형 말줄임 적용으로 칼럼 너비 조정
const orgHistoryColWidths = {
  bullet: "3%",
  date: "16%",
  divider: "2%",
  processedBy: "17%",
  changeType: "9%",
  orgType: "9%",
  name: "18%",
  detail: "26%",
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

interface OrgChangeHistoryModalProps {
  targetMonth?: string; // [변경: 2026-01-08 12:00, 김병현 수정] YYYY-MM 형식의 대상 월
}

export const OrgChangeHistoryModal = ({
  targetMonth,
}: OrgChangeHistoryModalProps) => {
  const isOrgHistoryModalOpen = useDashboardStore(
    (state) => state.isOrgHistoryModalOpen,
  );
  const setOrgHistoryModal = useDashboardStore(
    (state) => state.setOrgHistoryModal,
  );

  const [currentMonthData, setCurrentMonthData] = useState<OrgItemState[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // [변경: 2026-01-08 12:00, 김병현 수정] targetMonth가 없으면 현재 월 사용
  const currentMonth = useMemo(() => {
    return targetMonth ?? getCurrentYearMonth();
  }, [targetMonth]);

  // [변경: 2026-01-08 12:00, 김병현 수정] targetMonth에 대한 조직 데이터 조회
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

  // [변경: 2026-01-08 12:05, 김병현 수정] targetMonth(currentMonth) 기준으로 라벨 생성
  const [year, month] = currentMonth.split("-").map(Number);
  const currentMonthLabel = `${year}년 ${month}월`;

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
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-1.5">
                  조직도
                  <span className="group relative cursor-pointer">
                    <Info className="w-4 h-4 text-gray-400" />
                    <div className="absolute left-0 top-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
                      현재 조직 구조와 당월 실/팀 변경 이력을 확인할 수 있습니다.
                    </div>
                  </span>
                </h2>
              <div className="flex items-center gap-4">
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
            <div className="w-[400px] h-full shrink-0 border-r border-gray-200 flex flex-col">
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
            <div className="w-[750px] h-full shrink-0 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    실/팀 변경 이력
                  </span>
                </div>
              </div>
              {/* [변경: 2026-01-28 14:05, 임도휘 수정] 스크롤바 여백 추가 */}
              <div className="flex-1 overflow-y-auto py-2 pr-1">
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
