import { ExternalLink } from "lucide-react";
import type { ProjectItem } from "@/types/project.types";

// 시간 포맷 헬퍼
const formatTime = (value: number | null): string => {
  if (value === null) return "-";
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
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
            <th className="px-4 py-3 min-w-[200px]">프로젝트명</th>
            <th className="px-4 py-3 text-center">
              활성
              <br />
              티켓수
            </th>
            <th className="px-4 py-3 text-center">
              버그
              <br />
              발생수
            </th>
            <th className="px-4 py-3 text-center">
              장애
              <br />
              발생수
            </th>
            <th className="px-4 py-3 text-center">
              평균장애
              <br />
              해결시간
            </th>
            <th className="px-4 py-3 text-center">
              평균장애
              <br />
              탐지시간
            </th>
            <th className="px-4 py-3 text-center">
              평균장애
              <br />
              진단시간
            </th>
            <th className="px-4 py-3 text-center">
              평균장애
              <br />
              복구시간
            </th>
            <th className="px-4 py-3 text-center">생성일자</th>
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
                {project.activeTicketCount}건
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {project.bugCount}건
              </td>
              <td className="px-4 py-4 text-center text-sm text-gray-900">
                {project.incidentCount}건
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
                {project.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
