import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useOrgChangeHistory } from "@/api/hooks/useOrganizationTree";
// import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CHANGE_TYPE_BADGE_COLORS } from "@/styles/colors";
import type {
  OrgHistoryItem,
  OrgHistoryChangeType,
  ChangeCategory,
  OrgHistoryFilterType,
} from "@/types/organization.types";
import {
  OrgHistoryChangeTypeLabel,
  ChangeCategoryLabel,
} from "@/types/organization.types";

// 현재 월 가져오기 (YYYY-MM 형식)
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// ISO 날짜를 표시 형식으로 변환
const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 유형 필터 옵션
const TYPE_FILTER_OPTIONS: { value: OrgHistoryFilterType; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "JOINED", label: "입사" },
  { value: "RESIGNED", label: "퇴사" },
  { value: "TRANSFERRED", label: "이동" },
  { value: "CHANGED_ROLE", label: "직급변경" },
  { value: "CHANGED_POSITION", label: "직책변경" },
  { value: "ON_LEAVE", label: "휴직" },
  { value: "RETURNED", label: "복직" },
  { value: "CREATED", label: "조직생성" },
  { value: "DELETED", label: "조직삭제" },
  { value: "RENAMED", label: "정보변경" },
];

// 카테고리 필터 옵션
const CATEGORY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "HR", label: "인사" },
  { value: "GROUP", label: "조직" },
  { value: "POLICY", label: "정책" },
];

// 유형 배지 색상 매핑
const getTypeBadgeColor = (type: OrgHistoryChangeType): string => {
  switch (type) {
    case "JOINED":
      return CHANGE_TYPE_BADGE_COLORS.JOINED;
    case "RESIGNED":
      return CHANGE_TYPE_BADGE_COLORS.RESIGNED;
    case "TRANSFERRED":
      return CHANGE_TYPE_BADGE_COLORS.TRANSFERRED_IN;
    case "CHANGED_ROLE":
      return CHANGE_TYPE_BADGE_COLORS.CHANGED_ROLE;
    case "CHANGED_POSITION":
      return CHANGE_TYPE_BADGE_COLORS.CHANGED_POSITION;
    case "ON_LEAVE":
      return CHANGE_TYPE_BADGE_COLORS.ON_LEAVE;
    case "RETURNED":
      return CHANGE_TYPE_BADGE_COLORS.RETURNED;
    case "CREATED":
      return CHANGE_TYPE_BADGE_COLORS.CREATED;
    case "DELETED":
      return CHANGE_TYPE_BADGE_COLORS.DELETED;
    case "RENAMED":
      return CHANGE_TYPE_BADGE_COLORS.RENAMED;
    default:
      return CHANGE_TYPE_BADGE_COLORS.default;
  }
};

// 유형 뱃지 컴포넌트
const TypeBadge = ({ type }: { type: OrgHistoryChangeType }) => {
  const color = getTypeBadgeColor(type);
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {OrgHistoryChangeTypeLabel[type] || type}
    </span>
  );
};

// 카테고리 뱃지 컴포넌트
const CategoryBadge = ({ category }: { category: ChangeCategory }) => {
  const colorMap: Record<ChangeCategory, string> = {
    HR: "bg-blue-100 text-blue-700",
    GROUP: "bg-purple-100 text-purple-700",
    POLICY: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        colorMap[category] || "bg-gray-100 text-gray-700"
      }`}
    >
      {ChangeCategoryLabel[category] || category}
    </span>
  );
};

// 드롭다운 Select 컴포넌트
const SelectDropdown = ({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                  option.value === value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
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

  // API 데이터 또는 빈 배열
  const historyItems = data?.changes ?? [];

  // 필터링된 데이터
  const filteredData = useMemo(() => {
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
  }, [historyItems, selectedType, selectedCategory]);

  // 페이지네이션 계산
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 필터 변경 시 페이지 초기화
  const handleTypeChange = (value: string) => {
    setSelectedType(value as OrgHistoryFilterType);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

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
        className={`fixed top-0 right-0 h-screen w-[900px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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

          {/* 필터 영역 */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">팀 선택</span>
              <SelectDropdown
                value="ALL"
                options={[{ value: "ALL", label: "전체" }]}
                onChange={() => {}}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">유형</span>
              <SelectDropdown
                value={selectedType}
                options={TYPE_FILTER_OPTIONS}
                onChange={handleTypeChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">카테고리</span>
              <SelectDropdown
                value={selectedCategory}
                options={CATEGORY_FILTER_OPTIONS}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0">
            {/* 고정 헤더 */}
            <div className="[scrollbar-gutter:stable] pr-[15px]">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12%]" />
                  <col className="w-[30%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="px-3 py-3 text-left font-medium">
                      변경일시
                    </th>
                    <th className="px-3 py-3 text-center font-medium">유형</th>
                    <th className="px-3 py-3 text-center font-medium">
                      카테고리
                    </th>
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
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[30%]" />
                    <col className="w-[18%]" />
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
                            <td className="px-3 py-2.5 text-center">
                              <TypeBadge type={item.changeType} />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <CategoryBadge category={item.category} />
                            </td>
                            <td className="px-3 py-2.5 text-sm text-gray-900 text-center">
                              {item.name}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-gray-700 truncate">
                              {item.changeDetail || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-center text-gray-600">
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
