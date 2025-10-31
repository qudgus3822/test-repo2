import { useState } from "react";
import {
  DateFilter,
  MetricsOverview,
  GoalAchievement,
  ServiceStability,
  SERVICE_ICONS,
  MetricsRanking,
  ProductivityTrend,
} from "@/components/dashboard";
import { CHART_COLORS } from "@/libs/chart";

const DashboardPage = () => {
  const [period, setPeriod] = useState<"daily" | "monthly">("monthly");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // 2025년 10월

  // 샘플 데이터: 메트릭 개요
  const metricsData = [
    {
      id: "timing",
      value: 77.4,
      label: "전시 타이밍 확보",
      sublabel: "평균 확보율",
      color: CHART_COLORS.primary,
      trend: { value: 2.3, isPositive: true },
    },
    {
      id: "code",
      value: 85.3,
      label: "코드 품질",
      sublabel: "7가지 평균",
      color: CHART_COLORS.success,
    },
    {
      id: "review",
      value: 69.5,
      label: "리뷰 품질",
      sublabel: "5/12건 달성",
      color: CHART_COLORS.warning,
    },
    {
      id: "efficiency",
      value: 77.4,
      label: "개발 효율",
      sublabel: "6/9건 달성",
      color: CHART_COLORS.info,
    },
  ];

  // 샘플 데이터: 서비스 안정성
  const stabilityMetrics = [
    {
      id: "deployment",
      label: "배포빈도수",
      value: "312회",
      target: "250회",
      trend: { value: 18, isPositive: true },
      icon: SERVICE_ICONS.deployment,
      iconColor: CHART_COLORS.primary,
    },
    {
      id: "success",
      label: "배포 성공률",
      value: "94.8%",
      target: "95%",
      trend: { value: 0, isPositive: true },
      icon: SERVICE_ICONS.success,
      iconColor: CHART_COLORS.success,
    },
    {
      id: "mttr",
      label: "MTTR",
      value: "1.7시간",
      target: "2시간 이하",
      trend: { value: 22, isPositive: true },
      icon: SERVICE_ICONS.mttr,
      iconColor: CHART_COLORS.info,
    },
    {
      id: "mttd",
      label: "MTTD",
      value: "1.2시간",
      target: "1.5시간 이하",
      trend: { value: 14, isPositive: false },
      icon: SERVICE_ICONS.mttd,
      iconColor: CHART_COLORS.secondary,
    },
    {
      id: "incidents",
      label: "장애 발생건수",
      value: "8건",
      target: "10건 이하",
      trend: { value: 14, isPositive: true },
      icon: SERVICE_ICONS.incidents,
      iconColor: CHART_COLORS.danger,
    },
  ];

  // 샘플 데이터: 상승 지표
  const topGainers = [
    { rank: 1, name: "데스크바이퍼지", change: 15.3 },
    { rank: 2, name: "리뷰완성률", change: 12.8 },
    { rank: 3, name: "배포성공률", change: 10.2 },
    { rank: 4, name: "조회공유율", change: 8.7 },
    { rank: 5, name: "커밋빈도", change: 7.6 },
  ];

  // 샘플 데이터: 하락 지표
  const topLosers = [
    { rank: 1, name: "장애발생건수", change: -8.5 },
    { rank: 2, name: "코드복잡도", change: -6.3 },
    { rank: 3, name: "기술부채", change: -5.2 },
    { rank: 4, name: "MTTR", change: -4.8 },
    { rank: 5, name: "보안취약점수", change: -3.1 },
  ];

  // 샘플 데이터: 개발생산성 트렌드
  const trendData = [
    {
      month: "5월",
      "타이밍 확보": 69,
      "코드 품질": 75,
      "개발 효율": 72,
      "리뷰 품질": 68,
      "코드 통합": 73,
    },
    {
      month: "6월",
      "타이밍 확보": 71,
      "코드 품질": 78,
      "개발 효율": 73,
      "리뷰 품질": 70,
      "코드 통합": 75,
    },
    {
      month: "7월",
      "타이밍 확보": 73,
      "코드 품질": 80,
      "개발 효율": 75,
      "리뷰 품질": 72,
      "코드 통합": 76,
    },
    {
      month: "8월",
      "타이밍 확보": 75,
      "코드 품질": 82,
      "개발 효율": 76,
      "리뷰 품질": 74,
      "코드 통합": 78,
    },
    {
      month: "9월",
      "타이밍 확보": 76,
      "코드 품질": 84,
      "개발 효율": 77,
      "리뷰 품질": 75,
      "코드 통합": 79,
    },
    {
      month: "10월",
      "타이밍 확보": 77,
      "코드 품질": 85,
      "개발 효율": 78,
      "리뷰 품질": 76,
      "코드 통합": 80,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        {/* 날짜 필터 */}
        <DateFilter
          period={period}
          onPeriodChange={setPeriod}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </div>

      {/* 메트릭 개요 */}
      <MetricsOverview metrics={metricsData} />

      {/* 목표 달성률 & 서비스 안정성 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalAchievement achieved={23} total={30} />
        <div className="lg:col-span-2">
          <ServiceStability metrics={stabilityMetrics} />
        </div>
      </div>

      {/* 지표 순위 */}
      <MetricsRanking topGainers={topGainers} topLosers={topLosers} />

      {/* 개발생산성 트렌드 */}
      <ProductivityTrend
        data={trendData}
        metrics={[
          "타이밍 확보",
          "코드 품질",
          "개발 효율",
          "리뷰 품질",
          "코드 통합",
        ]}
      />
    </div>
  );
};

export default DashboardPage;
