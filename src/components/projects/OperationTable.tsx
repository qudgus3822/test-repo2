import { useRef, useEffect, useCallback, useMemo } from "react";
import { ExternalLink, Info, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { OperationItem } from "@/types/project.types";
import { formatDateString } from "@/utils/date";
import { UNIT_COUNT, NULL_DISPLAY, COMMON_HEADERS } from "./constants";

// 테이블 헤더 설정 (공통 헤더 사용)
const TABLE_HEADERS = {
  ...COMMON_HEADERS,
};

// 숫자 포맷 헬퍼 (null → "--", 0 이상 → 숫자 + 단위)
const formatCount = (
  value: number | null | undefined,
  unit: string,
): string => {
  if (value === null || value === undefined) return NULL_DISPLAY;
  return `${value}${unit}`;
};

interface OperationTableProps {
  items: OperationItem[];
  /** 조회 월 (YYYY-MM 형식) */
  month: string;
  /** 초기 로딩 중 여부 */
  isLoading?: boolean;
  /** 다음 페이지 존재 여부 */
  hasNextPage?: boolean;
  /** 다음 페이지 로딩 중 여부 */
  isFetchingNextPage?: boolean;
  /** 다음 페이지 로드 함수 */
  onLoadMore?: () => void;
}

/**
 * 운영 에픽 테이블 컴포넌트
 */
export const OperationTable = ({
  items,
  month,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: OperationTableProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // [변경: 2026-03-06 00:00, 김병현 수정] month(YYYY-MM)로 월 시작일/종료일 계산
  const { monthStart, monthEnd } = useMemo(() => {
    const [year, mon] = month.split("-").map(Number);
    const start = `${year}-${String(mon).padStart(2, "0")}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const end = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { monthStart: start, monthEnd: end };
  }, [month]);

  // IntersectionObserver를 사용한 무한 스크롤
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        onLoadMore
      ) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  // 초기 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">수집된 데이터가 없습니다.</p>
      </div>
    );
  }

  // [변경: 2026-01-26 00:00, 임도휘 수정] 페이지 스크롤 시 Header(80px) 아래에 sticky 고정 (MetricsTable 방식)
  return (
    <div>
      <table className="w-full">
        <thead
          className="sticky top-20 bg-white z-10"
          style={{ boxShadow: "inset 0 -1px 0 #e5e7eb" }}
        >
          {/* [변경: 2026-01-29 18:00, 임도휘 수정] 테이블 헤더 반응형 패딩 (lg 미만: px-1, lg~xl: px-2, xl 이상: px-4) */}
          <tr className="text-left text-sm font-medium text-gray-700">
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[30%]">
              {TABLE_HEADERS.epicName.label.join("\n")}
            </th>
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[14%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.activeTicketCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.activeTicketCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[14%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.updatedCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.updatedCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[14%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.completedCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.completedCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[14%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.createdCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.createdCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-1 lg:px-2 xl:px-4 py-3 w-[14%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.createdAt.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.createdAt.label.join("\n")}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-1 lg:px-2 xl:px-4 py-4 max-w-[200px]">
                <div
                  className="text-sm font-medium text-gray-900 truncate"
                  title={item.name}
                >
                  {item.name}
                </div>
                <a
                  href={item.epicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                >
                  {item.epicId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="px-1 lg:px-2 xl:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 활성 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {item.activeTicketCount !== null &&
                item.activeTicketCount !== undefined ? (
                  <a
                    href={`${item.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${item.epicId} AND (status CHANGED DURING ("${monthStart}", "${monthEnd}") OR assignee CHANGED DURING ("${monthStart}", "${monthEnd}") OR summary CHANGED DURING ("${monthStart}", "${monthEnd}") OR description CHANGED DURING ("${monthStart}", "${monthEnd}") OR (updated >= "${monthStart}" AND updated <= "${monthEnd}") OR (created >= "${monthStart}" AND created <= "${monthEnd}")) AND status NOT IN ("Canceled", "취소")`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(item.activeTicketCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-1 lg:px-2 xl:px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(item.updatedCount, UNIT_COUNT)}
              </td>
              <td className="px-1 lg:px-2 xl:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 완료 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {item.completedCount !== null &&
                item.completedCount !== undefined ? (
                  <a
                    href={`${item.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${item.epicId} AND resolved >= "${monthStart}" AND resolved <= "${monthEnd}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(item.completedCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-1 lg:px-2 xl:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 생성 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {item.createdCount !== null &&
                item.createdCount !== undefined ? (
                  <a
                    href={`${item.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${item.epicId} AND created >= "${monthStart}" AND created <= "${monthEnd}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(item.createdCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-1 lg:px-2 xl:px-4 py-4 text-center text-sm text-gray-900">
                {item.createdAt
                  ? formatDateString(item.createdAt)
                  : NULL_DISPLAY}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 무한 스크롤 sentinel + 로딩 인디케이터 */}
      <div ref={sentinelRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">데이터 불러오는 중입니다.</span>
          </div>
        )}
      </div>
    </div>
  );
};
