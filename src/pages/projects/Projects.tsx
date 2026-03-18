import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DateFilter, type PeriodType } from "@/components/ui/DateFilter";
import { SummaryCard } from "@/components/projects/SummaryCard";
import {
  ProjectTabs,
  type ProjectTabType,
} from "@/components/projects/ProjectTabs";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { OperationTable } from "@/components/projects/OperationTable";
import { useProjectDashboardSummary } from "@/api/hooks/useProjectDashboardSummary";
import { useProjectTableData } from "@/hooks/projects/useProjectTableData";
import { useOperationTableData } from "@/hooks/projects/useOperationTableData";
import { formatYearMonth } from "@/utils/date";
import type { ProjectSummary } from "@/types/project.types";
import { getMockProjectDashboardSummary } from "@/mocks/projects.mock";

// VITE_USE_MOCK_DATA=true 이면 mock 데이터 사용
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

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
  const { data: summaryApiData } = useProjectDashboardSummary(month, true);

  // [변경: 2026-03-18 00:00, 김병현 수정] mock 모드: 실제 요약 데이터에 mock 요약 데이터를 합산
  const summaryData = useMemo(() => {
    if (!USE_MOCK) return summaryApiData;
    const mock = getMockProjectDashboardSummary(month);
    if (!summaryApiData) return mock;
    return {
      ...summaryApiData,
      tfProjectCount: summaryApiData.tfProjectCount
        ? {
            ...summaryApiData.tfProjectCount,
            value: summaryApiData.tfProjectCount.value + mock.tfProjectCount.value,
            completedCount: (summaryApiData.tfProjectCount.completedCount ?? 0) + (mock.tfProjectCount.completedCount ?? 0),
            updatedCount: (summaryApiData.tfProjectCount.updatedCount ?? 0) + (mock.tfProjectCount.updatedCount ?? 0),
            createdCount: (summaryApiData.tfProjectCount.createdCount ?? 0) + (mock.tfProjectCount.createdCount ?? 0),
          }
        : mock.tfProjectCount,
      operationProjectCount: summaryApiData.operationProjectCount
        ? {
            ...summaryApiData.operationProjectCount,
            value: summaryApiData.operationProjectCount.value + mock.operationProjectCount.value,
            completedCount: (summaryApiData.operationProjectCount.completedCount ?? 0) + (mock.operationProjectCount.completedCount ?? 0),
            updatedCount: (summaryApiData.operationProjectCount.updatedCount ?? 0) + (mock.operationProjectCount.updatedCount ?? 0),
            createdCount: (summaryApiData.operationProjectCount.createdCount ?? 0) + (mock.operationProjectCount.createdCount ?? 0),
          }
        : mock.operationProjectCount,
    };
  }, [summaryApiData, month]);

  // TF 프로젝트 테이블 데이터
  const tfTable = useProjectTableData(month, activeTab === "tf");

  // 운영 프로젝트 테이블 데이터
  const operationTable = useOperationTableData(
    month,
    activeTab === "operation",
  );

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

  // [변경: 2026-01-26 00:00, 임도휘 수정] 페이지 스크롤 레이아웃으로 변경 - 테이블 헤더 sticky 고정
  return (
    <div className="flex flex-col gap-6">
      {/* 상단 영역 */}
      <div className="flex flex-col gap-6">
        {/* 헤더 - 날짜 필터 */}
        <div>
          <Card className="w-full">
            <div className="w-full flex items-center justify-between gap-4">
              <DateFilter
                period={period}
                onPeriodChange={(p) => {
                  setPeriod(p);
                  setActiveTab("tf");
                }}
                currentDate={currentDate}
                onDateChange={(d) => {
                  setCurrentDate(d);
                  setActiveTab("tf");
                }}
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

      {/* 탭 + 테이블 */}
      <Card className="p-0">
        {/* 탭 */}
        <div>
          <ProjectTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tfCount={summaryData?.tfProjectCount?.value ?? 0}
            operationCount={summaryData?.operationProjectCount?.value ?? 0}
          />
        </div>

        {/* 테이블 */}
        <div className="py-4">
          {activeTab === "tf" ? (
            <>
              <InfoBanner message="'분류 유형'이 'TF'로 표기된 Jira Epic 중 하위 티켓의 업데이트가 있는 Epic만 노출됩니다." />
              <ProjectTable
                projects={tfTable.projects}
                month={month}
                isLoading={tfTable.isLoading}
                hasNextPage={tfTable.hasNextPage}
                isFetchingNextPage={tfTable.isFetchingNextPage}
                onLoadMore={tfTable.fetchNextPage}
              />
            </>
          ) : (
            <>
              <InfoBanner message="Jira OPR2 Space의 Epic은 운영 특성상 유형(버그/장애/애프터잡)을 분류하기 어려워, 버그·장애 관련 지표는 제공되지 않습니다." />
              <OperationTable
                items={operationTable.items}
                month={month}
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