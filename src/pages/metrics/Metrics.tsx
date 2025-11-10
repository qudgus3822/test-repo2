import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { DateFilter } from "@/components/ui/DateFilter";
import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { TargetValueAchievement } from "@/components/dashboard/TargetValueAchievement";
import { MetricsTable } from "@/components/metrics/MetricsTable";
import {
  mockMetricOverview,
  mockMetricsTargetValueAchievement,
  mockCodeQualityMetrics,
} from "@/mocks/metrics.mock";
import { useMetricsStore } from "@/store/useMetricsStore";
import { TargetValueSettingModal } from "@/components/metrics/TargetValueSettingModal";
import { AchievementRateSettingModal } from "@/components/metrics/AchievementRateSettingModal";
import type { MetricItem } from "@/types/metrics.types";

const MetricsPage = () => {
  const {
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    isTargetValueSettingModalOpen,
    setIsTargetValueSettingModalOpen,
    isAchievementRateSettingModalOpen,
    setIsAchievementRateSettingModalOpen,
  } = useMetricsStore((state) => state);

  // 모달이 열릴 때 body 스크롤 비활성화 및 레이아웃 시프트 방지
  useEffect(() => {
    const isAnyModalOpen =
      isTargetValueSettingModalOpen || isAchievementRateSettingModalOpen;

    if (!isAnyModalOpen) return;

    // 현재 스타일 저장
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // 스크롤바 너비 계산
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // 스크롤 잠금 및 레이아웃 시프트 방지
    document.body.classList.add("overflow-hidden");
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 모달이 닫힐 때 원래 상태로 복원
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isTargetValueSettingModalOpen, isAchievementRateSettingModalOpen]);

  return (
    <div className="">
      {/* 헤더 - 날짜 필터 */}
      <div>
        <Card className="w-full">
          <DateFilter
            period={period}
            onPeriodChange={setPeriod}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            showPdfButton={false}
          />
        </Card>
      </div>

      <div className="flex gap-6 md:h-[300px] lg:h-[330px]">
        {/* 지표 현황 */}
        <div className="w-2/3 h-full">
          <Card className="h-full w-full flex items-center">
            <MetricsSummary data={mockMetricOverview} />
          </Card>
        </div>

        {/* 목표 달성률 */}
        <div className="w-1/3 h-full">
          <Card className="w-full h-full">
            {/* 목표 달성률 */}
            <TargetValueAchievement
              achieved={mockMetricsTargetValueAchievement.achievedMetrics}
              total={mockMetricsTargetValueAchievement.totalMetrics}
            />
          </Card>
        </div>
      </div>

      {/* 지표 리스트 */}
      <Card className="w-full">
        <MetricsTable metrics={mockCodeQualityMetrics.metrics} />
      </Card>

      {/* 지표 리스트 - 목표값 설정 모달 */}
      <TargetValueSettingModal
        isOpen={isTargetValueSettingModalOpen}
        onClose={() => setIsTargetValueSettingModalOpen(false)}
        metrics={mockCodeQualityMetrics.metrics}
        onSave={(updatedMetrics: MetricItem[]) => {
          // TODO: API 연동 시 실제 저장 로직 구현
          console.log("Updated metrics:", updatedMetrics);
        }}
      />

      {/* 지표 리스트 - 달성률 설정 모달 */}
      <AchievementRateSettingModal
        isOpen={isAchievementRateSettingModalOpen}
        onClose={() => setIsAchievementRateSettingModalOpen(false)}
        metrics={mockCodeQualityMetrics.metrics}
        onSave={(updatedMetrics: MetricItem[]) => {
          // TODO: API 연동 시 실제 저장 로직 구현
          console.log("Updated achievement rates:", updatedMetrics);
        }}
      />
    </div>
  );
};

export default MetricsPage;
