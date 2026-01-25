import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DateFilter, type PeriodType } from "@/components/ui/DateFilter";
import { SummaryCard } from "@/components/projects/SummaryCard";
import { ProjectTabs, type ProjectTabType } from "@/components/projects/ProjectTabs";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { OperationTable } from "@/components/projects/OperationTable";
import { useProjectDashboardSummary } from "@/api/hooks/useProjectDashboardSummary";
import { useProjectTableData } from "@/hooks/projects/useProjectTableData";
import { useOperationTableData } from "@/hooks/projects/useOperationTableData";
import { formatYearMonth } from "@/utils/date";
import type { ProjectSummary } from "@/types/project.types";

// 안내 메시지 컴포넌트
const InfoBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
    <span className="text-sm text-amber-700">{message}</span>
  </div>
);

const ProjectsPage = () => {
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<ProjectTabType>("tf");

  // API 호출을 위한 월 포맷 (YYYY-MM)
  const month = formatYearMonth(currentDate);

  // 프로젝트 대시보드 요약 데이터 조회
  const { data: summaryData } = useProjectDashboardSummary(month);

  // TF 프로젝트 테이블 데이터
  const tfTable = useProjectTableData(month, activeTab === "tf");

  // 운영 프로젝트 테이블 데이터
  const operationTable = useOperationTableData(month, activeTab === "operation");

  // API 응답을 SummaryCard의 ProjectSummary 형태로 변환
  const tfSummary: ProjectSummary | null = useMemo(() => {
    if (!summaryData?.tfProjectCount) return null;
    return {
      count: summaryData.tfProjectCount.value,
      completed: summaryData.tfProjectCount.completedCount,
      updated: summaryData.tfProjectCount.updatedCount,
      created: summaryData.tfProjectCount.createdCount,
    };
  }, [summaryData]);

  const operationSummary: ProjectSummary | null = useMemo(() => {
    if (!summaryData?.operationProjectCount) return null;
    return {
      count: summaryData.operationProjectCount.value,
      completed: summaryData.operationProjectCount.completedCount,
      updated: summaryData.operationProjectCount.updatedCount,
      created: summaryData.operationProjectCount.createdCount,
    };
  }, [summaryData]);

  // [변경: 2026-01-19 00:00, 김병현 수정] 100vh 레이아웃 적용 - 상단 영역 고정, 테이블 영역 스크롤
  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      {/* 상단 고정 영역 */}
      <div className="flex-shrink-0 flex flex-col gap-6">
        {/* 헤더 - 날짜 필터 */}
        <div>
          <Card className="w-full">
            <div className="w-full flex items-center justify-between gap-4">
              <DateFilter
                period={period}
                onPeriodChange={setPeriod}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            </div>
          </Card>
        </div>

        {/* 요약 카드 */}
        <div className="flex gap-4">
          <SummaryCard title="프로젝트(TF)" summary={tfSummary} />
          <SummaryCard title="긴급 운영(OPR2)" summary={operationSummary} />
        </div>
      </div>

      {/* 탭 + 테이블 - 남은 공간 차지하며 스크롤 가능 */}
      <Card className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* 탭 */}
        <div className="flex-shrink-0 px-4 pt-3">
          <ProjectTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tfCount={summaryData?.tfProjectCount?.value ?? 0}
            operationCount={summaryData?.operationProjectCount?.value ?? 0}
          />
        </div>

        {/* 테이블 */}
        <div className="p-4 flex-1 min-h-0 overflow-auto">
          {activeTab === "tf" ? (
            <>
              <InfoBanner message="지라 전체 에픽 중 분류유형이 'TF' 표기된 프로젝트성 에픽에 대해 해당 지표들을 한눈에 확인할 수 있습니다." />
              <ProjectTable
                projects={tfTable.projects}
                isLoading={tfTable.isLoading}
                hasNextPage={tfTable.hasNextPage}
                isFetchingNextPage={tfTable.isFetchingNextPage}
                onLoadMore={tfTable.fetchNextPage}
              />
            </>
          ) : (
            <>
              <InfoBanner message="지라 OPR2 긴급 운영의 에픽은 유형(버그/장애/애프터잡 등)이 분류되지 않아 버그 및 장애 관련 상세 지표가 제공되지 않습니다." />
              <OperationTable
                items={operationTable.items}
                isLoading={operationTable.isLoading}
                hasNextPage={operationTable.hasNextPage}
                isFetchingNextPage={operationTable.isFetchingNextPage}
                onLoadMore={operationTable.fetchNextPage}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectsPage;
