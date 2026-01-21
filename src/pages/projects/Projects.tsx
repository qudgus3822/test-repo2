import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DateFilter, type PeriodType } from "@/components/ui/DateFilter";
import { SummaryCard } from "@/components/projects/SummaryCard";
import { ProjectTabs, type ProjectTabType } from "@/components/projects/ProjectTabs";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { OperationTable } from "@/components/projects/OperationTable";
import { useProjectDashboardSummary } from "@/api/hooks/useProjectDashboardSummary";
import { useProjectDashboard } from "@/api/hooks/useProjectDashboard";
import { formatYearMonth } from "@/utils/date";
import type {
  ProjectSummary,
  ProjectItem,
  OperationItem,
} from "@/types/project.types";

// 안내 메시지 컴포넌트
const InfoBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
    <span className="text-sm text-amber-700">{message}</span>
  </div>
);

// TODO: 임시 테스트 데이터 (API 연동 후 삭제)
const MOCK_TF_PROJECTS: ProjectItem[] = [
  {
    id: "1",
    name: "[TF] 신규 거래소 플랫폼 개발",
    epicId: "TF-101",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/TF-101",
    activeTicketCount: 15,
    bugCount: 3,
    incidentCount: 1,
    avgResolutionTime: 7200,
    avgDetectionTime: 1800,
    avgDiagnosisTime: 3600,
    avgRecoveryTime: 1800,
    createdAt: "2025-12-01",
  },
  {
    id: "2",
    name: "[TF] 모바일 앱 리뉴얼",
    epicId: "TF-102",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/TF-102",
    activeTicketCount: 8,
    bugCount: 2,
    incidentCount: 0,
    avgResolutionTime: 5400,
    avgDetectionTime: 1200,
    avgDiagnosisTime: 2400,
    avgRecoveryTime: 1800,
    createdAt: "2025-12-15",
  },
  {
    id: "3",
    name: "[TF] 결제 시스템 고도화",
    epicId: "TF-103",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/TF-103",
    activeTicketCount: 12,
    bugCount: 5,
    incidentCount: 2,
    avgResolutionTime: 9000,
    avgDetectionTime: 2400,
    avgDiagnosisTime: 4200,
    avgRecoveryTime: 2400,
    createdAt: "2026-01-05",
  },
];

const MOCK_OPERATION_ITEMS: OperationItem[] = [
  {
    id: "1",
    name: "[운영] 고객센터 시스템 유지보수",
    epicId: "OPR2-201",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/OPR2-201",
    activeTicketCount: 5,
    updatedCount: 10,
    completedCount: 8,
    createdCount: 3,
    createdAt: "2025-11-20",
  },
  {
    id: "2",
    name: "[운영] 관리자 대시보드 운영",
    epicId: "OPR2-202",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/OPR2-202",
    activeTicketCount: 3,
    updatedCount: 5,
    completedCount: 12,
    createdCount: 2,
    createdAt: "2025-12-01",
  },
  {
    id: "3",
    name: "[운영] API Gateway 모니터링",
    epicId: "OPR2-203",
    epicUrl: "https://bithumbcorp.atlassian.net/browse/OPR2-203",
    activeTicketCount: 7,
    updatedCount: 15,
    completedCount: 20,
    createdCount: 5,
    createdAt: "2026-01-10",
  },
];

const ProjectsPage = () => {
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<ProjectTabType>("tf");

  // API 호출을 위한 월 포맷 (YYYY-MM)
  const month = formatYearMonth(currentDate);

  // 프로젝트 대시보드 요약 데이터 조회
  const { data: summaryData } = useProjectDashboardSummary(month);

  // TF 프로젝트 목록 데이터 조회 (TF 탭이 활성화된 경우에만 호출)
  const { data: tfData } = useProjectDashboard(
    { month, classification: "TF" },
    activeTab === "tf",
  );

  // 운영 프로젝트 목록 데이터 조회 (운영 탭이 활성화된 경우에만 호출)
  const { data: operationData } = useProjectDashboard(
    { month, classification: "OPR2_NON_TF" },
    activeTab === "operation",
  );

  // API 응답을 SummaryCard의 ProjectSummary 형태로 변환
  const tfSummary: ProjectSummary | null = useMemo(() => {
    if (!summaryData?.tfProjectCount) return null;
    return {
      count: summaryData.tfProjectCount.value,
      completed: 0,
      updated: 0,
      created: 0,
    };
  }, [summaryData]);

  const operationSummary: ProjectSummary | null = useMemo(() => {
    if (!summaryData?.operationProjectCount) return null;
    return {
      count: summaryData.operationProjectCount.value,
      completed: 0,
      updated: 0,
      created: 0,
    };
  }, [summaryData]);

  // API 응답을 ProjectTable의 ProjectItem 형태로 변환
  // TODO: API 연동 후 MOCK_TF_PROJECTS fallback 제거
  const tfProjects: ProjectItem[] = useMemo(() => {
    if (!tfData?.projects || tfData.projects.length === 0) return MOCK_TF_PROJECTS;
    return tfData.projects.map((project) => ({
      id: project.projectId,
      name: project.epicSummary,
      epicId: project.epicKey,
      epicUrl: `https://bithumbcorp.atlassian.net/browse/${project.epicKey}`,
      activeTicketCount: project.activeTicketCount,
      bugCount: project.bugCount ?? 0,
      incidentCount: project.incidentCount ?? 0,
      avgResolutionTime: project.mttr,
      avgDetectionTime: project.mttd,
      avgDiagnosisTime: project.timeToCauseIdentification,
      avgRecoveryTime: project.timeToRepair,
      createdAt: project.createdAt ?? "",
    }));
  }, [tfData]);

  // API 응답을 OperationTable의 OperationItem 형태로 변환
  // TODO: API 연동 후 MOCK_OPERATION_ITEMS fallback 제거
  const operationItems: OperationItem[] = useMemo(() => {
    if (!operationData?.projects || operationData.projects.length === 0) return MOCK_OPERATION_ITEMS;
    return operationData.projects.map((project) => ({
      id: project.projectId,
      name: project.epicSummary,
      epicId: project.epicKey,
      epicUrl: `https://bithumbcorp.atlassian.net/browse/${project.epicKey}`,
      activeTicketCount: project.activeTicketCount,
      updatedCount: 0,
      completedCount: 0,
      createdCount: 0,
      createdAt: project.createdAt ?? "",
    }));
  }, [operationData]);

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
          <SummaryCard title="TF 프로젝트" summary={tfSummary} />
          <SummaryCard title="운영" summary={operationSummary} />
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
            <ProjectTable projects={tfProjects} />
          ) : (
            <>
              <InfoBanner message="운영은 에픽의 유형(버그/장애/에프터잡 등)이 분류되지 않아 상세 지표가 제공되지 않습니다." />
              <OperationTable items={operationItems} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectsPage;
