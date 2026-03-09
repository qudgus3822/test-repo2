import { useRef, useEffect, useCallback, useMemo } from "react";
import { ExternalLink, Info, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ProjectItem } from "@/types/project.types";
import { formatDateString } from "@/utils/date";
import {
  UNIT_COUNT,
  UNIT_CASE,
  NULL_DISPLAY,
  COMMON_HEADERS,
} from "./constants";

// 테이블 헤더 설정 (공통 헤더 + TF 전용 헤더)
const TABLE_HEADERS = {
  ...COMMON_HEADERS,
  bugCount: {
    label: ["버그", "해결 수"],
    tooltip: "해당 월 프로젝트 발생한 버그 총 개수 (월 누적)",
  },
  incidentCount: {
    label: ["장애", "해결 수"],
    tooltip: "해당 월 프로젝트 발생한 장애 총 개수 (월 누적)",
  },
  avgResolutionTime: {
    label: ["장애", "해결 시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 해결시간 (일 평균)",
  },
  avgDetectionTime: {
    label: ["장애", "탐지 시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 탐지시간 (일 평균)",
  },
  avgDiagnosisTime: {
    label: ["장애", "진단 시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 진단시간 (일 평균)",
  },
  avgRecoveryTime: {
    label: ["장애", "복구 시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 복구시간 (일 평균)",
  },
};

// 숫자 포맷 헬퍼 (null → "--", 0 이상 → 숫자 + 단위)
const formatCount = (
  value: number | null | undefined,
  unit: string,
): string => {
  if (value === null || value === undefined) return NULL_DISPLAY;
  return `${value}${unit}`;
};

// 시간 포맷 헬퍼
const formatTime = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return NULL_DISPLAY;
  return `${value}초`;
};

interface ProjectTableProps {
  projects: ProjectItem[];
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
 * 프로젝트(TF) 테이블 컴포넌트
 */
export const ProjectTable = ({
  projects,
  month,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: ProjectTableProps) => {
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

  if (projects.length === 0) {
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
          {/* [변경: 2026-01-29 18:00, 임도휘 수정] 테이블 헤더 반응형 패딩 (1480px 미만: px-0.5, 1480px 이상: px-4), 폰트 사이즈 (xl 미만: 10px, xl 이상: text-sm) */}
          <tr className="text-left text-[10px] xl:text-sm font-medium text-gray-700">
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[16%]">
              {TABLE_HEADERS.epicName.label.join("\n")}
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
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
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
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
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
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
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
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
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.bugCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.bugCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.incidentCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.incidentCount.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[8%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.avgResolutionTime.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.avgResolutionTime.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[8%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.avgDetectionTime.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.avgDetectionTime.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[8%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.avgDiagnosisTime.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.avgDiagnosisTime.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[8%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.avgRecoveryTime.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="whitespace-pre-line">
                  {TABLE_HEADERS.avgRecoveryTime.label.join("\n")}
                </span>
              </div>
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[10%] text-center">
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
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-0.5 min-[1480px]:px-4 py-4 max-w-[200px]">
                <div
                  className="text-sm font-medium text-gray-900 truncate"
                  title={project.name}
                >
                  {project.name}
                </div>
                <a
                  href={project.epicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                >
                  {project.epicId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-02-27 00:00, 김병현 수정] 활성 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 활성 티켓 JQL: 월 기간 내 변경된 티켓 */}
                {project.activeTicketCount !== null &&
                project.activeTicketCount !== undefined ? (
                  <a
                    href={`${project.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${project.epicId} AND (status CHANGED DURING ("${monthStart}", "${monthEnd}") OR assignee CHANGED DURING ("${monthStart}", "${monthEnd}") OR (updated >= "${monthStart}" AND updated <= "${monthEnd}") OR (created >= "${monthStart}" AND created <= "${monthEnd}")) AND status NOT IN ("Canceled", "취소")`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(project.activeTicketCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.updatedCount, UNIT_COUNT)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-02-27 00:00, 김병현 수정] 완료 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 완료 티켓 JQL: 월 기간 내 resolved된 티켓 */}
                {project.completedCount !== null &&
                project.completedCount !== undefined ? (
                  <a
                    href={`${project.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${project.epicId} AND resolved >= "${monthStart}" AND resolved <= "${monthEnd}" AND status NOT IN ("Canceled", "취소")`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(project.completedCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {/* [변경: 2026-03-06 00:00, 김병현 수정] 생성 티켓수 클릭 시 Jira JQL 검색 페이지로 이동 */}
                {project.createdCount !== null &&
                project.createdCount !== undefined ? (
                  <a
                    href={`${project.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=${encodeURIComponent(`parentEpic = ${project.epicId} AND created >= "${monthStart}" AND created <= "${monthEnd}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatCount(project.createdCount, UNIT_COUNT)}
                  </a>
                ) : (
                  NULL_DISPLAY
                )}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.bugCount, UNIT_CASE)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.incidentCount, UNIT_CASE)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgResolutionTime)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgDetectionTime)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgDiagnosisTime)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgRecoveryTime)}
              </td>
              <td className="px-0.5 min-[1480px]:px-4 py-4 text-center text-sm text-gray-900">
                {project.createdAt
                  ? formatDateString(project.createdAt)
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
