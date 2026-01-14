import { useState, useEffect } from "react";
import { X, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import { useModalAnimation } from "@/hooks";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useCodeReviewProgress } from "@/api/hooks/useCodeReviewProgress";
import { formatDateString, formatYearMonth } from "@/utils/date";
import {
  CODE_REVIEW_COLORS,
  REVIEW_STATUS_BADGE_COLORS,
} from "@/styles/colors";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/Pagination";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  REVIEW_STATUS_LABEL,
  type CodeReviewSortBy,
  type ReviewItem,
  type ReviewerInfo,
  type ReviewStatus,
} from "@/types/codeReviewMetric";

// 정렬 방향 타입
type SortDirection = "asc" | "desc";

// 상태 뱃지 컴포넌트
const StatusBadge = ({ status }: { status: ReviewStatus }) => {
  const colors = REVIEW_STATUS_BADGE_COLORS[status] ?? {
    bg: "#E5E7EB",
    text: "#7B7B7B",
  };
  const label = REVIEW_STATUS_LABEL[status] ?? status;
  return (
    <span
      className="inline-block w-14 py-1 rounded text-sm font-medium text-center"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {label}
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
  column: CodeReviewSortBy;
  currentSort: CodeReviewSortBy;
  currentDirection: SortDirection;
  onSort: (column: CodeReviewSortBy) => void;
}) => {
  const isActive = currentSort === column;
  return (
    <th
      className="px-2.5 py-3 text-center font-medium text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center justify-center gap-0.5">
        <span>{label}</span>
        {isActive ? (
          currentDirection === "asc" ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
          ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
          )
        ) : (
          <ArrowDownUp className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );
};

export const CodeReviewStatusModal = () => {

  const isCodeReviewModalOpen = useDashboardStore(
    (state) => state.isCodeReviewModalOpen,
  );
  const setCodeReviewModal = useDashboardStore(
    (state) => state.setCodeReviewModal,
  );
  const currentDate = useDashboardStore((state) => state.currentDate);
  const { shouldRender, isAnimating } = useModalAnimation(
    isCodeReviewModalOpen,
  );

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<CodeReviewSortBy>("collectedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // 현재 선택된 날짜를 YYYY-MM 형식으로 변환
  const yearMonth = formatYearMonth(currentDate);

  // API 호출
  const { data, isLoading, isError } = useCodeReviewProgress(
    {
      yearMonth,
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortColumn,
      sortOrder: sortDirection,
    },
    isCodeReviewModalOpen,
  );

  // 모달 닫힐 때 페이지 초기화
  useEffect(() => {
    if (!isCodeReviewModalOpen) {
      setCurrentPage(1);
      setSortColumn("collectedAt");
      setSortDirection("desc");
    }
  }, [isCodeReviewModalOpen]);

  // 정렬 핸들러
  const handleSort = (column: CodeReviewSortBy) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // MR 링크 클릭 핸들러
  const handleMrClick = (mrId: number) => {
    window.open(`https://gitlab.example.com/merge_requests/${mrId}`, "_blank");
  };

  // 리뷰어 목록을 툴팁 문자열로 변환
  const formatReviewerListTooltip = (list: ReviewerInfo[]): string => {
    if (list.length === 0) return "";
    return list.map((r) => `• ${r.name}(${r.team})`).join("\n");
  };

  // Raw Data 보기 클릭 핸들러
  const handleRawDataClick = (mrId: number) => {
    window.open(`/raw-data/${mrId}`, "_blank");
  };

  if (!shouldRender) return null;

  // 로딩/에러 상태 처리
  const summary = data?.summary ?? {
    totalMrCount: 0,
    completed: {
      count: 0,
      rate: 0,
      breakdown: { singleContributor: 0, multipleContributors: 0 },
    },
    incomplete: {
      count: 0,
      rate: 0,
      breakdown: { singleContributor: 0, multipleContributors: 0 },
    },
  };
  const items = data?.items ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: itemsPerPage,
    totalCount: 0,
    totalPages: 1,
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCodeReviewModal(false)}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={() => setCodeReviewModal(false)}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[900px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              코드 리뷰 진행 현황
            </h2>
            <button
              onClick={() => setCodeReviewModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-hidden px-6 py-3 flex flex-col gap-3">
            {/* 총 머지된 MR 수 */}
            <div className="gap-4 flex items-center">
              <span className="text-gray-700">총 머지된 MR 수 </span>
              <span className="text-2xl font-bold text-gray-900">
                {summary.totalMrCount}건
              </span>
            </div>

            {/* 리뷰 진행률 */}
            <div className="gap-2 flex flex-col">
              <div className="text-gray-700 flex items-center gap-2">
                리뷰 진행률
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center h-20 bg-gray-100 rounded-md">
                  <LoadingSpinner size="sm" showMessage={false} />
                </div>
              ) : summary.totalMrCount === 0 ? (
                <div className="flex items-center justify-center h-[78px] bg-gray-100 rounded-md border border-gray-200">
                  <span className="text-gray-500">
                    수집된 데이터가 없습니다.
                  </span>
                </div>
              ) : (
                <div className="flex">
                  {/* 리뷰 완료 */}
                  {summary.completed.count > 0 && (
                    <div
                      className={`flex-1 border border-gray-200 py-3 px-0.5 ${
                        summary.incomplete.count > 0
                          ? "border-r-0 rounded-l-lg"
                          : "rounded-lg"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2 text-center">
                        리뷰 완료 {summary.completed.count}개 (
                        {summary.completed.rate.toFixed(1)}%)
                      </div>
                      <div className="flex h-6 rounded overflow-hidden text-xs">
                        {summary.completed.breakdown.singleContributor > 0 && (
                          <div
                            className="flex items-center justify-center font-medium"
                            style={{
                              width: `${
                                (summary.completed.breakdown.singleContributor /
                                  summary.completed.count) *
                                100
                              }%`,
                              backgroundColor:
                                CODE_REVIEW_COLORS.completedSingle,
                              color: CODE_REVIEW_COLORS.progressText,
                            }}
                          >
                            MR 기여자 1명{" "}
                            {summary.completed.breakdown.singleContributor}개
                          </div>
                        )}
                        {summary.completed.breakdown.multipleContributors >
                          0 && (
                          <div
                            className="flex items-center justify-center font-medium"
                            style={{
                              width: `${
                                (summary.completed.breakdown
                                  .multipleContributors /
                                  summary.completed.count) *
                                100
                              }%`,
                              backgroundColor:
                                CODE_REVIEW_COLORS.completedMultiple,
                              color: CODE_REVIEW_COLORS.progressText,
                            }}
                          >
                            MR기여자 2명이상{" "}
                            {summary.completed.breakdown.multipleContributors}개
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 리뷰 미완료 */}
                  {summary.incomplete.count > 0 && (
                    <div
                      className={`flex-1 border border-gray-200 py-3 px-0.5 ${
                        summary.completed.count > 0
                          ? "rounded-r-lg"
                          : "rounded-lg"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-2 text-center">
                        리뷰 미완료 {summary.incomplete.count}개 (
                        {summary.incomplete.rate.toFixed(1)}%)
                      </div>
                      <div className="flex h-6 rounded overflow-hidden text-xs">
                        {summary.incomplete.breakdown.singleContributor > 0 && (
                          <div
                            className="flex items-center justify-center font-medium"
                            style={{
                              width: `${
                                (summary.incomplete.breakdown
                                  .singleContributor /
                                  summary.incomplete.count) *
                                100
                              }%`,
                              backgroundColor:
                                CODE_REVIEW_COLORS.incompleteSingle,
                              color: CODE_REVIEW_COLORS.progressText,
                            }}
                          >
                            MR 기여자 1명{" "}
                            {summary.incomplete.breakdown.singleContributor}개
                          </div>
                        )}
                        {summary.incomplete.breakdown.multipleContributors >
                          0 && (
                          <div
                            className="flex items-center justify-center font-medium"
                            style={{
                              width: `${
                                (summary.incomplete.breakdown
                                  .multipleContributors /
                                  summary.incomplete.count) *
                                100
                              }%`,
                              backgroundColor:
                                CODE_REVIEW_COLORS.incompleteMultiple,
                              color: CODE_REVIEW_COLORS.progressText,
                            }}
                          >
                            MR기여자 2명이상{" "}
                            {summary.incomplete.breakdown.multipleContributors}
                            개
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 리뷰 현황 목록 */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <div className="text-gray-700">리뷰 현황 목록</div>

              {/* 테이블 */}
              <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-lg">
                {/* 테이블 헤더 */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[12%]" />
                      <col className="w-[10%]" />
                      <col className="w-[11%]" />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[9%]" />
                      <col className="w-[11%]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <SortableHeader
                          label="수집일자"
                          column="collectedAt"
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
                        <th className="px-2.5 py-1 text-center font-medium text-gray-500">
                          MR 작성자
                        </th>
                        <SortableHeader
                          label={"등록된 리뷰어"}
                          column="registeredReviewerCount"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={"실리뷰 참여자"}
                          column="actualReviewerCount"
                          currentSort={sortColumn}
                          currentDirection={sortDirection}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={"MR 기여자"}
                          column="contributorCount"
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
                        <th className="px-2.5 py-3 text-center font-medium text-gray-500">
                          Raw Data
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* 테이블 본문 - 10행 기준 높이 고정 */}
                <div className="min-h-[365px] flex flex-col">
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  ) : isError ? (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-red-500">
                        데이터를 불러오는 데 실패했습니다.
                      </span>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex items-center justify-center flex-1">
                      <span className="text-gray-500">
                        수집된 데이터가 없습니다.
                      </span>
                    </div>
                  ) : (
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[12%]" />
                        <col className="w-[10%]" />
                        <col className="w-[11%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                        <col className="w-[9%]" />
                        <col className="w-[11%]" />
                      </colgroup>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item: ReviewItem, index: number) => (
                          <tr
                            key={`${item.mrId}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-2.5 py-1 text-gray-900 text-center">
                              {formatDateString(item.collectedAt)}
                            </td>
                            <td
                              className="px-2.5 py-1 text-center text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              onClick={() => handleMrClick(item.mrId)}
                            >
                              {item.mrId}
                            </td>
                            <td className="px-2.5 py-1 text-gray-900 text-center">
                              <Tooltip
                                content={item.mrAuthor.email}
                                direction="bottom"
                              >
                                <span className="cursor-default">
                                  {item.mrAuthor.name}
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-2.5 py-1 text-gray-900 text-center">
                              <Tooltip
                                content={formatReviewerListTooltip(
                                  item.registeredReviewers,
                                )}
                                direction="bottom"
                              >
                                <span className="cursor-default">
                                  {item.registeredReviewerCount}명
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-2.5 py-1 text-gray-900 text-center">
                              <Tooltip
                                content={formatReviewerListTooltip(
                                  item.actualReviewers,
                                )}
                                direction="bottom"
                              >
                                <span className="cursor-default">
                                  {item.actualReviewerCount}명
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-2.5 py-1 text-gray-900 text-center">
                              <Tooltip
                                content={formatReviewerListTooltip(
                                  item.contributors,
                                )}
                                direction="bottom"
                              >
                                <span className="cursor-default">
                                  {item.contributorCount}명
                                </span>
                              </Tooltip>
                            </td>
                            <td className="px-2.5 py-1 text-center">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-2.5 py-1 text-center">
                              <button
                                onClick={() => handleRawDataClick(item.mrId)}
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                보기
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 - 페이지네이션 */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-md">
            <div className="text-gray-600">전체 {pagination.totalCount}건</div>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
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
