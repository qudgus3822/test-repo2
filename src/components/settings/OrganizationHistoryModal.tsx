import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useOrgChangeHistory } from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import type {
  OrgHistoryItem,
  OrgHistoryFilterType,
} from "@/types/organization.types";
import { ChangeCategoryLabel } from "@/types/organization.types";

// 현재 월 가져오기 (YYYY-MM 형식)
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// ISO 날짜를 표시 형식으로 변환 (2025.12.15 17:25)
const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export const OrganizationHistoryModal = () => {
  const { isOrgHistoryModalOpen, closeOrgHistoryModal } = useSettingsStore();
  const { shouldRender, isAnimating } = useModalAnimation(
    isOrgHistoryModalOpen,
  );

  // 필터 상태
  const [selectedType, setSelectedType] = useState<OrgHistoryFilterType>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // API 호출 (현재 월 기준)
  const yearMonth = getCurrentYearMonth();
  const { data, isLoading, error } = useOrgChangeHistory(
    yearMonth,
    isOrgHistoryModalOpen,
  );

  // API 에러 시 confirm 메시지 표시
  useEffect(() => {
    if (error) {
      window.confirm("현재 서버에 해당 API가 없습니다.");
    }
  }, [error]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    const historyItems = data?.changes ?? [];
    let result = [...historyItems];

    // 유형 필터
    if (selectedType !== "ALL") {
      result = result.filter((item) => item.changeType === selectedType);
    }

    // 카테고리 필터
    if (selectedCategory !== "ALL") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    return result;
  }, [data?.changes, selectedType, selectedCategory]);

  // 페이지네이션 계산
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleClose = () => {
    closeOrgHistoryModal();
    // 모달 닫을 때 필터 초기화
    setSelectedType("ALL");
    setSelectedCategory("ALL");
    setCurrentPage(1);
  };

  if (!shouldRender) return null;

  return createPortal(
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-screen w-[800px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              조직도 변경 히스토리
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 필터 영역 - 추후 개발 예정*/}
          {/* <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">유형</span>
              <SelectDropdown
                value={selectedCategory}
                options={CATEGORY_FILTER_OPTIONS}
                onChange={handleCategoryChange}
              />
            </div>
          </div> */}

          {/* 테이블 */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0">
            {/* 고정 헤더 */}
            <div className="[scrollbar-gutter:stable] pr-[15px]">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[9%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[29%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="px-3 py-3 text-left font-medium">
                      변경일시
                    </th>
                    <th className="px-3 py-3 text-center font-medium">유형</th>
                    <th className="px-3 py-3 text-center font-medium">분류</th>
                    <th className="px-3 py-3 text-center font-medium">대상</th>
                    <th className="px-3 py-3 text-left font-medium">
                      변경내역
                    </th>
                    <th className="px-3 py-3 text-center font-medium">
                      처리자
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[9%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[29%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center text-gray-500 text-sm"
                        >
                          변경 이력이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(
                        (item: OrgHistoryItem, index: number) => (
                          <tr
                            key={`${item.target}-${item.changeDate}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-3 py-2.5 text-sm text-gray-900">
                              {formatDateTime(item.changeDate)}
                            </td>
                            <td className="px-3 py-2.5 text-center text-sm">
                              {ChangeCategoryLabel[item.category] ||
                                item.category}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <ChangeTypeBadge
                                type={item.changeType}
                                fixedWidth
                              />
                            </td>
                            <td
                              className="px-3 py-2.5 text-sm text-gray-900 text-center truncate"
                              title={item.name}
                            >
                              {item.name || "-"}
                            </td>
                            <td
                              className="px-3 py-2.5 text-sm text-gray-700 truncate"
                              title={item.changeDetail}
                            >
                              {item.changeDetail || "-"}
                            </td>
                            <td
                              className={`px-3 py-2.5 text-sm text-center truncate ${
                                item.processedBy &&
                                item.processedBy !== "자동(LDAP)"
                                  ? "text-blue-600 font-medium"
                                  : "text-gray-600"
                              }`}
                              title={item.processedBy}
                            >
                              {item.processedBy || "-"}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
