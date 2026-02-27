import { useRef, useEffect, useCallback } from "react";
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
    label: ["버그", "해결수"],
    tooltip: "해당 월 프로젝트 발생한 버그 총 개수 (월 누적)",
  },
  incidentCount: {
    label: ["장애", "해결수"],
    tooltip: "해당 월 프로젝트 발생한 장애 총 개수 (월 누적)",
  },
  avgResolutionTime: {
    label: ["평균장애", "해결시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 해결시간 (일 평균)",
  },
  avgDetectionTime: {
    label: ["평균장애", "탐지시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 탐지시간 (일 평균)",
  },
  avgDiagnosisTime: {
    label: ["평균장애", "진단시간"],
    tooltip: "해당 월 프로젝트 발생한 장애의 평균 진단시간 (일 평균)",
  },
  avgRecoveryTime: {
    label: ["평균장애", "복구시간"],
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
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: ProjectTableProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

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
              {TABLE_HEADERS.epicName.label}
            </th>
            <th className="px-0.5 min-[1480px]:px-4 py-3 w-[7%] text-center">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content={TABLE_HEADERS.activeTicketCount.tooltip}
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  {TABLE_HEADERS.activeTicketCount.label[0]}
                  <br />
                  {TABLE_HEADERS.activeTicketCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.updatedCount.label[0]}
                  <br />
                  {TABLE_HEADERS.updatedCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.completedCount.label[0]}
                  <br />
                  {TABLE_HEADERS.completedCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.createdCount.label[0]}
                  <br />
                  {TABLE_HEADERS.createdCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.bugCount.label[0]}
                  <br />
                  {TABLE_HEADERS.bugCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.incidentCount.label[0]}
                  <br />
                  {TABLE_HEADERS.incidentCount.label[1]}
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
                <span>
                  {TABLE_HEADERS.avgResolutionTime.label[0]}
                  <br />
                  {TABLE_HEADERS.avgResolutionTime.label[1]}
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
                <span>
                  {TABLE_HEADERS.avgDetectionTime.label[0]}
                  <br />
                  {TABLE_HEADERS.avgDetectionTime.label[1]}
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
                <span>
                  {TABLE_HEADERS.avgDiagnosisTime.label[0]}
                  <br />
                  {TABLE_HEADERS.avgDiagnosisTime.label[1]}
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
                <span>
                  {TABLE_HEADERS.avgRecoveryTime.label[0]}
                  <br />
                  {TABLE_HEADERS.avgRecoveryTime.label[1]}
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
                <span className="leading-[2.5]">
                  {TABLE_HEADERS.createdAt.label}
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
                {project.activeTicketCount !== null &&
                project.activeTicketCount !== undefined ? (
                  <a
                    href={`${project.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=parentEpic%20%3D%20${project.epicId}%20AND%20statusCategory%20in%20(%22In%20Progress%22%2C%20%22To%20Do%22)`}
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
                {project.completedCount !== null &&
                project.completedCount !== undefined ? (
                  <a
                    href={`${project.epicUrl.replace(/\/browse\/.*/, "")}/issues/?jql=parentEpic%20%3D%20${project.epicId}%20AND%20statusCategory%20%3D%20%22Done%22`}
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
                {formatCount(project.createdCount, UNIT_COUNT)}
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
