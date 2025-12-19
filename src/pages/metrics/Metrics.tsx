import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { DateFilter } from "@/components/ui/DateFilter";
import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { TargetValueAchievement } from "@/components/dashboard/TargetValueAchievement";
import { MetricsTable } from "@/components/metrics/MetricsTable";
import { useMetricsStore } from "@/store/useMetricsStore";
import { MetricsDetailModal } from "@/components/metrics/MetricsDetailModal";
import { MetricRateSettingModal } from "@/components/metrics/MetricRateSettingModal";
import { SettingsChangeConfirmModal } from "@/components/metrics/SettingsChangeConfirmModal";
import { MetricStandardSettingModal } from "@/components/metrics/MetricStandardSettingModal";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import { formatYearMonth } from "@/utils";
import { useMetricsList } from "@/api/hooks/useMetricsList";
import { useSyncStatus } from "@/api/hooks/useSyncStatus";
import { Button } from "@/components/ui";
import { Settings } from "lucide-react";

const MetricsPage = () => {
  const {
    period,
    setPeriod,
    currentDate,
    setCurrentDate,
    setActiveTab,
    setAchievementRateFilter,
    isMetricsDetailModalOpen,
    setIsMetricsDetailModalOpen,
    selectedMetric,
    isMetricRateSettingModalOpen,
    setIsMetricRateSettingModalOpen,
    activeTab,
    isSettingsChangeConfirmModalOpen,
    setIsSettingsChangeConfirmModalOpen,
    isMetricStandardSettingModalOpen,
    setIsMetricStandardSettingModalOpen,
  } = useMetricsStore((state) => state);

  // 페이지 진입 시 초기화: 당월, 전체 탭, 달성률 필터 전체로 설정
  useEffect(() => {
    setPeriod("monthly");
    setCurrentDate(new Date());
    setActiveTab("bdpi");
    setAchievementRateFilter("all");
  }, [setPeriod, setCurrentDate, setActiveTab, setAchievementRateFilter]);

  // 현재 선택된 월
  const month = formatYearMonth(currentDate);

  // 지표 설정 동기화 상태 조회 (10초 폴링)
  const { isProcessing } = useSyncStatus();

  // 지표 리스트 API 호출 (모달에서 사용)
  const { data: metricsListData } = useMetricsList(month);
  const metrics = metricsListData?.metrics ?? [];

  // activeTab을 MetricCategory로 변환
  const getSelectedCategory = (): MetricCategory => {
    switch (activeTab) {
      case "codeQuality":
        return MetricCategory.CODE_QUALITY;
      case "reviewQuality":
        return MetricCategory.REVIEW_QUALITY;
      case "developmentEfficiency":
        return MetricCategory.DEVELOPMENT_EFFICIENCY;
      default:
        return MetricCategory.CODE_QUALITY;
    }
  };

  // 모달이 열릴 때 body 스크롤 비활성화 및 레이아웃 시프트 방지
  useEffect(() => {
    const isAnyModalOpen =
      isMetricsDetailModalOpen ||
      isMetricRateSettingModalOpen ||
      isSettingsChangeConfirmModalOpen ||
      isMetricStandardSettingModalOpen;

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
  }, [
    isMetricsDetailModalOpen,
    isMetricRateSettingModalOpen,
    isSettingsChangeConfirmModalOpen,
    isMetricStandardSettingModalOpen,
  ]);

  // 변경사항 확정
  const handleConfirmChanges = () => {
    // TODO: API 연동 시 실제 저장 로직 구현
    console.log("Changes confirmed");
  };

  return (
    <div className="flex flex-col gap-6">
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
            {/* 지표 기준 설정 버튼 */}
            <div className="flex items-center gap-2">
              {isProcessing && (
                <span className="text-sm text-gray-500">집계 진행중</span>
              )}
              <Button
                variant="setting"
                size="sm"
                onClick={() => setIsMetricStandardSettingModalOpen(true)}
                disabled={isProcessing}
              >
                <Settings className="w-4 h-4 mr-1" />
                지표 기준 설정
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-6 md:h-[300px] lg:h-[330px]">
        {/* 지표 현황 */}
        <div className="w-2/3 h-full">
          <Card className="h-full w-full flex items-center">
            <MetricsSummary month={month} />
          </Card>
        </div>

        {/* 목표 달성률 */}
        <div className="w-1/3 h-full">
          <Card className="w-full h-full">
            <TargetValueAchievement month={month} />
          </Card>
        </div>
      </div>

      {/* 지표 리스트 */}
      <Card className="w-full">
        <MetricsTable month={month} />
      </Card>

      {/* 지표 리스트 - 지표 상세보기 모달 */}
      <MetricsDetailModal
        isOpen={isMetricsDetailModalOpen}
        onClose={() => setIsMetricsDetailModalOpen(false)}
        metric={selectedMetric}
      />

      {/* 지표 리스트 - 비율 설정 모달 */}
      <MetricRateSettingModal
        isOpen={isMetricRateSettingModalOpen}
        onClose={() => setIsMetricRateSettingModalOpen(false)}
        metrics={metrics}
        category={getSelectedCategory()}
        month={month}
        onSave={(updatedMetrics: MetricItem[]) => {
          // TODO: API 연동 시 실제 저장 로직 구현
          console.log("Updated metric rates:", updatedMetrics);
        }}
      />

      {/* 변경사항 반영 확인 모달 */}
      <SettingsChangeConfirmModal
        isOpen={isSettingsChangeConfirmModalOpen}
        onClose={() => setIsSettingsChangeConfirmModalOpen(false)}
        onConfirm={handleConfirmChanges}
      />

      {/* 지표 기준 설정 모달 */}
      <MetricStandardSettingModal
        isOpen={isMetricStandardSettingModalOpen}
        onClose={() => setIsMetricStandardSettingModalOpen(false)}
        month={month}
      />
    </div>
  );
};

export default MetricsPage;
