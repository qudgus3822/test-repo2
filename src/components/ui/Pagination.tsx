import { ChevronLeft, ChevronRight } from "lucide-react";

type ButtonDisplayMode = "both" | "icon" | "text";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  displayMode?: ButtonDisplayMode; // 버튼 표시 모드 (기본값: "both")
}

/**
 * 페이지네이션 컴포넌트
 *
 * 이전/다음 버튼과 현재 페이지 정보를 표시합니다.
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 * />
 *
 * @example
 * // 화살표 아이콘만 표시
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 *   displayMode="icon"
 * />
 *
 * @example
 * // 텍스트만 표시
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 *   displayMode="text"
 * />
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  displayMode = "both",
}: PaginationProps) => {
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const handlePrevious = () => {
    if (!isPrevDisabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isNextDisabled) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handlePrevious}
        disabled={isPrevDisabled}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] transition-colors ${
          isPrevDisabled
            ? "bg-gray-100 opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 bg-[#FFFFFF] cursor-pointer"
        }`}
        aria-label="이전"
      >
        {(displayMode === "both" || displayMode === "icon") && (
          <ChevronLeft
            className={`w-4 h-4 ${
              isPrevDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          />
        )}
        {(displayMode === "both" || displayMode === "text") && (
          <span
            className={`text-sm ${
              isPrevDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            이전
          </span>
        )}
      </button>
      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] transition-colors ${
          isNextDisabled
            ? "bg-gray-100 opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 bg-[#FFFFFF] cursor-pointer"
        }`}
        aria-label="다음"
      >
        {(displayMode === "both" || displayMode === "text") && (
          <span
            className={`text-sm ${
              isNextDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            다음
          </span>
        )}
        {(displayMode === "both" || displayMode === "icon") && (
          <ChevronRight
            className={`w-4 h-4 ${
              isNextDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          />
        )}
      </button>
    </div>
  );
};
