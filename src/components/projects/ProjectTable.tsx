import { ExternalLink, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ProjectItem } from "@/types/project.types";
import { formatDateString } from "@/utils/date";

// 단위 상수
const UNIT_COUNT = "개";
const UNIT_CASE = "건";
const NULL_DISPLAY = "--";

// 숫자 포맷 헬퍼 (null → "--", 0 이상 → 숫자 + 단위)
const formatCount = (value: number | null | undefined, unit: string): string => {
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
}

/**
 * TF 프로젝트 테이블 컴포넌트
 */
export const ProjectTable = ({ projects }: ProjectTableProps) => {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">수집된 데이터가 없습니다.</p>
      </div>
    );
  }

  // [변경: 2026-01-19 00:00, 김병현 수정] thead 고정, tbody만 스크롤되도록 변경
  return (
    <div className="overflow-auto h-full">
      <table className="w-full">
        <thead
          className="sticky top-0 bg-white z-10"
          style={{ boxShadow: "0 1px 0 0 #e5e7eb" }}
        >
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
            <th className="px-4 py-3 min-w-[200px] whitespace-nowrap">
              프로젝트명
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 에픽 내 하위 티켓 중 활성 티켓 개수"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  활성
                  <br />
                  티켓수
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 버그 총 개수 (월 누적)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  버그
                  <br />
                  해결수
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 장애 총 개수 (월 누적)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  장애
                  <br />
                  해결수
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 장애의 평균 해결시간 (일 평균)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  평균장애
                  <br />
                  해결시간
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 장애의 평균 탐지시간 (일 평균)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  평균장애
                  <br />
                  탐지시간
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 장애의 평균 진단시간 (일 평균)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  평균장애
                  <br />
                  진단시간
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip
                  content="해당 월 프로젝트 발생한 장애의 평균 복구시간 (일 평균)"
                  direction="top"
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span>
                  평균장애
                  <br />
                  복구시간
                </span>
              </div>
            </th>
            <th className="px-4 py-3 text-center whitespace-nowrap">
              <div className="flex flex-col items-center gap-1">
                <Tooltip content="해당 에픽 생성일" direction="top">
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </Tooltip>
                <span className="leading-[2.5]">생성일자</span>
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
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">
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
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.activeTicketCount, UNIT_COUNT)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.bugCount, UNIT_CASE)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatCount(project.incidentCount, UNIT_CASE)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgResolutionTime)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgDetectionTime)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgDiagnosisTime)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {formatTime(project.avgRecoveryTime)}
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {project.createdAt ? formatDateString(project.createdAt) : NULL_DISPLAY}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
