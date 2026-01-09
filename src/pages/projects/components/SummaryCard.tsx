import { FolderCheck, FolderSync, FolderPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ProjectSummary } from "@/types/project.types";

interface SummaryCardProps {
  title: string;
  summary: ProjectSummary;
}

export const SummaryCard = ({ title, summary }: SummaryCardProps) => (
  <Card className="flex-1 py-6 px-7 flex flex-col gap-4">
    {/* 프로젝트 수 */}
    <div className="flex items-start justify-between">
      <span className="text-md font-mediumtext-gray-700">{title}</span>
      <div className="text-right">
        <span className="text-3xl font-bold text-gray-900">
          {summary.count}
        </span>
        <span className="text-xl text-gray-900 ml-1">건</span>
      </div>
    </div>
    {/* 완료, 업데이트, 생성 프로젝트 수 */}
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center space-y-1">
        <FolderCheck className="w-5.5 h-5.5 text-green-500" />
        <div className="text-xl font-bold text-gray-900 flex-shrink-0 whitespace-nowrap">
          {summary.completed}개
        </div>
        <div className="text-md text-gray-600">완료</div>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <FolderSync className="w-5.5 h-5.5 text-blue-500" />
        <div className="text-xl font-bold text-gray-900 flex-shrink-0 whitespace-nowrap">
          {summary.updated}개
        </div>
        <div className="text-md text-gray-600">업데이트</div>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <FolderPlus className="w-5.5 h-5.5 text-purple-500" />
        <div className="text-xl font-bold text-gray-900 flex-shrink-0 whitespace-nowrap">
          {summary.created}개
        </div>
        <div className="text-md text-gray-600">생성</div>
      </div>
    </div>
  </Card>
);
