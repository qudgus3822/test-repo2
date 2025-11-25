import { Tooltip } from "@/components/ui/Tooltip";
import { AchievementRateFilter } from "@/components/ui/AchievementRateFilter";
import { Button } from "@/components/ui/Button";
import {
  Search,
  ArrowDownUp,
  Info,
  Pencil,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import { useState } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import {
  useMetricsStore,
  type TabType,
  DEFAULT_EXCELLENT_THRESHOLD,
  DEFAULT_DANGER_THRESHOLD,
} from "@/store/useMetricsStore";
import {
  getCategoryLabel,
  getStatusIcon,
  getStatusColor,
  calculateMetricStatus,
} from "@/utils/metrics";

interface MetricsTableProps {
  metrics: MetricItem[];
}

interface Tab {
  id: TabType;
  label: string;
  count: number;
  category?: MetricCategory;
}

export const MetricsTable = ({ metrics }: MetricsTableProps) => {
  const {
    activeTab,
    setActiveTab,
    achievementRateFilter,
    setAchievementRateFilter,
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
    setIsTargetValueSettingModalOpen,
    setIsAchievementRateSettingModalOpen,
    setIsMetricsDetailModalOpen,
    setIsMetricRateSettingModalOpen,
    setSelectedMetric,
  } = useMetricsStore((state) => state);

  // 비율 정렬 상태 (asc: 오름차순, desc: 내림차순, null: 정렬 없음)
  const [ratioSortOrder, setRatioSortOrder] = useState<"asc" | "desc" | null>(
    null,
  );

  // 달성률 기준값
  const excellentThreshold =
    achievementRateExcellentThreshold || DEFAULT_EXCELLENT_THRESHOLD;
  const dangerThreshold =
    achievementRateDangerThreshold || DEFAULT_DANGER_THRESHOLD;

  // 먼저 달성률 필터 적용
  const achievementRateFilteredAllMetrics = metrics.filter((m) => {
    if (achievementRateFilter === "all") return true;
    if (achievementRateFilter === "excellent") {
      return m.achievementRate >= excellentThreshold;
    }
    if (achievementRateFilter === "warning") {
      return (
        m.achievementRate >= dangerThreshold &&
        m.achievementRate < excellentThreshold
      );
    }
    if (achievementRateFilter === "danger") {
      return m.achievementRate < dangerThreshold;
    }
    return true;
  });

  // 카테고리별 개수 계산 (달성률 필터 적용 후)
  const codeQualityCount = achievementRateFilteredAllMetrics.filter(
    (m) => m.category === MetricCategory.CODE_QUALITY,
  ).length;
  const reviewQualityCount = achievementRateFilteredAllMetrics.filter(
    (m) => m.category === MetricCategory.REVIEW_QUALITY,
  ).length;
  const developmentEfficiencyCount = achievementRateFilteredAllMetrics.filter(
    (m) => m.category === MetricCategory.DEVELOPMENT_EFFICIENCY,
  ).length;

  // 활성 탭에 따른 테이블 높이 계산 (헤더 50px + 행당 53px, 최소 200px)
  const getTableHeight = () => {
    let count = 0;
    switch (activeTab) {
      case "all":
        count = achievementRateFilteredAllMetrics.length;
        break;
      case "codeQuality":
        count = codeQualityCount;
        break;
      case "reviewQuality":
        count = reviewQualityCount;
        break;
      case "developmentEfficiency":
        count = developmentEfficiencyCount;
        break;
      default:
        count = achievementRateFilteredAllMetrics.length;
    }
    // 지표가 없을 때도 메시지가 보이도록 최소 높이 보장
    return Math.max(200, 50 + count * 53);
  };

  const tableHeight = getTableHeight();

  const tabs: Tab[] = [
    {
      id: "all",
      label: "전체",
      count: achievementRateFilteredAllMetrics.length,
    },
    {
      id: "codeQuality",
      label: "코드품질",
      count: codeQualityCount,
      category: MetricCategory.CODE_QUALITY,
    },
    {
      id: "reviewQuality",
      label: "리뷰품질",
      count: reviewQualityCount,
      category: MetricCategory.REVIEW_QUALITY,
    },
    {
      id: "developmentEfficiency",
      label: "개발품질",
      count: developmentEfficiencyCount,
      category: MetricCategory.DEVELOPMENT_EFFICIENCY,
    },
  ];

  // 활성 탭에 따라 지표 필터링 (이미 달성률 필터가 적용된 metrics 사용)
  const filteredMetrics =
    activeTab === "all"
      ? achievementRateFilteredAllMetrics
      : achievementRateFilteredAllMetrics.filter((m) => {
          const activeTabData = tabs.find((t) => t.id === activeTab);
          return (
            activeTabData?.category && m.category === activeTabData.category
          );
        });

  // 프론트에서 달성률 기준값에 따라 status 계산
  const metricsWithCalculatedStatus = filteredMetrics.map((metric) => ({
    ...metric,
    status: calculateMetricStatus(
      metric.achievementRate,
      excellentThreshold,
      dangerThreshold,
    ),
  }));

  // 비율 정렬
  const handleRatioSort = () => {
    if (ratioSortOrder === null) {
      setRatioSortOrder("asc");
    } else if (ratioSortOrder === "asc") {
      setRatioSortOrder("desc");
    } else {
      setRatioSortOrder(null);
    }
  };

  // 정렬된 지표 목록
  const sortedMetrics = [...metricsWithCalculatedStatus].sort((a, b) => {
    if (ratioSortOrder === null) return 0;
    if (ratioSortOrder === "asc") {
      return a.ratio - b.ratio;
    }
    return b.ratio - a.ratio;
  });

  // 지표 상세보기 모달 열기
  const handleMetricsDetailClick = (metric: MetricItem) => {
    setSelectedMetric(metric);
    setIsMetricsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Tabs와 달성률 필터 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-medium border-b-2 -mb-[20px] transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}({tab.count})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* 비율 설정 버튼 (전체 탭 제외) */}
          {activeTab !== "all" && (
            <Button
              variant="setting"
              size="sm"
              onClick={() => setIsMetricRateSettingModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-1.5" />
              비율 설정
            </Button>
          )}
          {/* 달성률 필터 */}
          <AchievementRateFilter
            value={achievementRateFilter}
            onChange={setAchievementRateFilter}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ height: `${tableHeight}px` }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
              <th className="px-4 py-3 w-[25%]">지표명</th>
              <th className="px-4 py-3 w-[12%]">범주</th>
              <th className="px-4 py-3 w-[12%]">현재값</th>

              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-1.5">
                  목표값
                  <span className="flex items-center cursor-pointer">
                    <Tooltip
                      content="지표의 목표값을 수정할 수 있습니다."
                      // content="목표값 설정 팝업을 엽니다."
                      color="#6B7280"
                    >
                      <Pencil
                        className="w-4 h-4"
                        id="목표값 설정 아이콘"
                        onClick={() => setIsTargetValueSettingModalOpen(true)}
                      />
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-1.5">
                  달성률
                  <span className="flex items-center cursor-pointer">
                    <Tooltip
                      content="지표의 달성률을 평가하는 기준값을 설정합니다."
                      // content="달성률 설정 팝업을 엽니다."
                      color="#6B7280"
                    >
                      <Pencil
                        className="w-4 h-4"
                        id="달성률 설정 아이콘"
                        onClick={() =>
                          setIsAchievementRateSettingModalOpen(true)
                        }
                      />
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-1.5">
                  비율
                  <span
                    className="flex items-center cursor-pointer"
                    onClick={handleRatioSort}
                  >
                    <Tooltip
                      content={"비율의 정렬을 변경합니다."}
                      color="#6B7280"
                    >
                      {ratioSortOrder === null ? (
                        <ArrowDownUp
                          className="w-4 h-4 text-gray-400"
                          id="비율 정렬 아이콘"
                        />
                      ) : ratioSortOrder === "asc" ? (
                        <ArrowUp
                          className="w-4 h-4 text-blue-600"
                          id="비율 오름차순 정렬 아이콘"
                        />
                      ) : (
                        <ArrowDown
                          className="w-4 h-4 text-blue-600"
                          id="비율 내림차순 정렬 아이콘"
                        />
                      )}
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">상세</th>
            </tr>
          </thead>
          <tbody>
            {sortedMetrics.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-16 text-center text-gray-500"
                >
                  선택된 범주에 해당하는 지표가 없습니다.
                </td>
              </tr>
            ) : (
              sortedMetrics.map((metric, index) => (
                <tr
                  key={metric.metricCode || index}
                  className="border-b border-gray-100 hover:bg-gray-50 whitespace-nowrap overflow-x-auto"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{metric.name}</span>
                      {metric.description && (
                        <Tooltip content={metric.description} color="#6B7280">
                          <Info className="text-gray-400 w-4 h-4 cursor-pointer" />
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getCategoryLabel(metric.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric.currentValue}
                    {metric.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {metric.targetValue}
                    {metric.unit}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const Icon = getStatusIcon(metric.status);
                        const iconColor = getStatusColor(metric.status);
                        return (
                          <>
                            <Icon
                              className="w-5 h-5"
                              style={{ color: iconColor }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: iconColor }}
                            >
                              {metric.achievementRate}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {metric.ratio}%
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() => handleMetricsDetailClick(metric)}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
