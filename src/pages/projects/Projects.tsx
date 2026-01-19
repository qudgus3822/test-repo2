import { useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DateFilter, type PeriodType } from "@/components/ui/DateFilter";
import { SummaryCard } from "./components/SummaryCard";
import { ProjectTabs, type ProjectTabType } from "./components/ProjectTabs";
import { ProjectTable } from "./components/ProjectTable";
import { OperationTable } from "./components/OperationTable";

// 안내 메시지 컴포넌트
const InfoBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
    <span className="text-sm text-amber-700">{message}</span>
  </div>
);

const ProjectsPage = () => {
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // 전월 기본 선택
    return date;
  });
  const [activeTab, setActiveTab] = useState<ProjectTabType>("tf");

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
          <SummaryCard title="TF 프로젝트" summary={null} />
          <SummaryCard title="운영" summary={null} />
        </div>
      </div>

      {/* 탭 + 테이블 - 남은 공간 차지하며 스크롤 가능 */}
      <Card className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* 탭 */}
        <div className="flex-shrink-0 px-4 pt-3">
          <ProjectTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tfCount={0}
            operationCount={0}
          />
        </div>

        {/* 테이블 */}
        <div className="p-4 flex-1 min-h-0 overflow-auto">
          {activeTab === "tf" ? (
            <ProjectTable projects={[]} />
          ) : (
            <>
              <InfoBanner message="운영은 에픽의 유형(버그/장애/에프터잡 등)이 분류되지 않아 상세 지표가 제공되지 않습니다." />
              <OperationTable items={[]} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectsPage;
