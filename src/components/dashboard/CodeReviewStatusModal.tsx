import { useState, useMemo } from "react";
import { X, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useDashboardStore } from "@/store/useDashboardStore";
import { mockCodeReviewData } from "@/mocks/codeReviewData.mock";
import { formatDateString } from "@/utils/date";
import {
  CODE_REVIEW_COLORS,
  REVIEW_STATUS_BADGE_COLORS,
} from "@/styles/colors";
import { Pagination } from "@/components/ui/Pagination";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  REVIEW_STATUS_LABEL,
  type ReviewItem,
  type ReviewerInfo,
  type ReviewStatus,
} from "@/types/codeReviewMetric";

// 정렬 가능한 컬럼 타입
type SortableColumn =
  | "date"
  | "mrId"
  | "author"
  | "mrApproval"
  | "reviewRequest"
  | "reviewApproval"
  | "mrReopen"
  | "status";

// 정렬 방향 타입
type SortDirection = "asc" | "desc";

// 상태 뱃지 컴포넌트
const StatusBadge = ({ status }: { status: ReviewStatus }) => {
  const colors = REVIEW_STATUS_BADGE_COLORS[status];
  return (
    <span
      className="inline-block w-14 py-1 rounded text-sm font-medium text-center"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {REVIEW_STATUS_LABEL[status]}
    </span>
  );
};

// 테이블 헤더 컴포넌트
const SortableHeader = ({
  label,
  column,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: React.ReactNode;
  column: SortableColumn;
  currentSort: SortableColumn;
  currentDirection: SortDirection;
  onSort: (column: SortableColumn) => void;
}) => {
  const isActive = currentSort === column;
  return (
    <th
      className="px-3 py-3 text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-center gap-1">
        <span>{label}</span>
        {isActive ? (
          currentDirection === "asc" ? (
            <ChevronUp className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          )
        ) : (
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );
};

export const CodeReviewStatusModal = () => {
  const { isCodeReviewModalOpen, closeCodeReviewModal } = useDashboardStore();
  const { shouldRender, isAnimating } = useModalAnimation(
    isCodeReviewModalOpen,
  );

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<SortableColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 목업 데이터 사용
  const data = mockCodeReviewData;

  // 정렬된 데이터
  const sortedItems = useMemo(() => {
    const items = [...data.items];
    items.sort((a, b) => {
      let aValue: string | number = a[sortColumn];
      let bValue: string | number = b[sortColumn];

      // 문자열 비교
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue, "ko")
          : bValue.localeCompare(aValue, "ko");
      }

      // 숫자 비교
      aValue = Number(aValue);
      bValue = Number(bValue);
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
    return items;
  }, [data.items, sortColumn, sortDirection]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 정렬 핸들러
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // MR 링크 클릭 핸들러
  const handleMrClick = (mrId: string) => {
    window.open(`https://gitlab.example.com/merge_requests/${mrId}`, "_blank");
  };

  // 리뷰어 목록을 툴팁 문자열로 변환
  const formatReviewerListTooltip = (list: ReviewerInfo[]): string => {
    if (list.length === 0) return "";
    return list.map((r) => `• ${r.name}(${r.team})`).join("\n");
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCodeReviewModal}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={closeCodeReviewModal}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[900px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              코드 리뷰 진행 현황
            </h2>
            <button
              onClick={closeCodeReviewModal}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-hidden px-6 py-3 flex flex-col gap-3">
            {/* 총 MR 수 */}
            <div className="gap-4 flex items-center">
              <span className="text-gray-700">총 MR 수 </span>
              <span className="text-2xl font-bold text-gray-900">
                {data.totalMR}건
              </span>
            </div>

            {/* 리뷰 진행률 */}
            <div className="gap-2 flex flex-col">
              <div className="text-gray-700 flex items-center gap-2">
                리뷰 진행률
              </div>
              <div className="flex h-9 rounded-md overflow-hidden text-sm">
                <div
                  className="flex items-center justify-center font-medium"
                  style={{
                    width: `${data.inProgressPercentage}%`,
                    backgroundColor: CODE_REVIEW_COLORS.completed,
                    color: CODE_REVIEW_COLORS.completedText,
                  }}
                >
                  완료 {data.inProgressCount}개 (
                  {Math.round(data.inProgressPercentage)}%)
                </div>
                <div
                  className="flex items-center justify-center font-medium"
                  style={{
                    width: `${data.completedPercentage}%`,
                    backgroundColor: CODE_REVIEW_COLORS.incomplete,
                    color: CODE_REVIEW_COLORS.incompleteText,
                  }}
                >
                  미완료 {data.completedCount}개 (
                  {Math.round(data.completedPercentage)}%)
                </div>
              </div>
            </div>

            {/* 리뷰 현황 목록 */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <div className="text-gray-700">리뷰 현황 목록</div>

              {/* 테이블 */}
              <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-lg">
                {/* 테이블 헤더 */}
                <div className="bg-gray-50">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[14%]" />
                      <col className="w-[11%]" />
                      <col className="w-[14%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[11%]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <SortableHeader
                          label="수집일자"
                          column="date"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="MR ID"
                          column="mrId"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <th className="px-3 py-1 text-center font-medium text-gray-500">
                          MR 작성자
                        </th>
                        <SortableHeader
                          label={"등록된 리뷰어"}
                          column="mrApproval"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={"실리뷰 참여자"}
                          column="reviewRequest"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={"MR 기여자"}
                          column="reviewApproval"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="상태"
                          column="status"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* 테이블 본문 - 15행 기준 높이 고정 */}
                <div className="min-h-[554px]">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[14%]" />
                      <col className="w-[11%]" />
                      <col className="w-[14%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[11%]" />
                    </colgroup>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItems.map((item: ReviewItem, index: number) => (
                        <tr
                          key={`${item.mrId}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-1 text-gray-900 text-center">
                            {formatDateString(item.date)}
                          </td>
                          <td
                            className="px-3 py-1 text-center text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={() => handleMrClick(item.mrId)}
                          >
                            {item.mrId}
                          </td>
                          <td className="px-3 py-1 text-gray-900 text-center">
                            <Tooltip
                              content={item.authorEmail}
                              direction="bottom"
                            >
                              <span className="cursor-default">
                                {item.author}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-1 text-gray-900 text-center">
                            <Tooltip
                              content={formatReviewerListTooltip(
                                item.mrApprovalList,
                              )}
                              direction="bottom"
                            >
                              <span className="cursor-default">
                                {item.mrApproval}명
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-1 text-gray-900 text-center">
                            <Tooltip
                              content={formatReviewerListTooltip(
                                item.reviewRequestList,
                              )}
                              direction="bottom"
                            >
                              <span className="cursor-default">
                                {item.reviewRequest}명
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-1 text-gray-900 text-center">
                            <Tooltip
                              content={formatReviewerListTooltip(
                                item.reviewApprovalList,
                              )}
                              direction="bottom"
                            >
                              <span className="cursor-default">
                                {item.reviewApproval}명
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-3 py-1 text-center">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 - 페이지네이션 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-gray-600">전체 {sortedItems.length}건</div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              displayMode="text"
            />
            <div className="text-gray-500">{itemsPerPage}개씩 노출</div>
          </div>
        </div>
      </div>
    </>
  );
};
