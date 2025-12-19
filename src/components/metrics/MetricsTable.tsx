import { Tooltip } from "@/components/ui/Tooltip";
import { AchievementRateFilter } from "@/components/ui/AchievementRateFilter";
import { Search, ArrowDownUp, Info, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import { useMetricsStore, type TabType } from "@/store/useMetricsStore";
import {
  getCategoryLabel,
  getStatusIcon,
  getStatusColor,
  calculateMetricStatus,
  getMetricUnit,
  getMetricName,
} from "@/utils/metrics";
import { PALETTE_COLORS } from "@/styles/colors";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMetricsList } from "@/api/hooks/useMetricsList";
import { useAchievementCriteria } from "@/api/hooks/useAchievementCriteria";

// 범주별 스타일 정의
const getCategoryStyle = (category: MetricCategory) => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return {
        color: PALETTE_COLORS.blue,
        borderColor: PALETTE_COLORS.blue,
      };
    case MetricCategory.REVIEW_QUALITY:
      return {
        color: PALETTE_COLORS.orange,
        borderColor: PALETTE_COLORS.orange,
      };
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return {
        color: PALETTE_COLORS.purple,
        borderColor: PALETTE_COLORS.purple,
      };
    default:
      return {
        color: "#6B7280",
        borderColor: "#D1D5DB",
        bgColor: "#F9FAFB",
      };
  }
};

interface MetricsTableProps {
  month: string;
}

interface Tab {
  id: TabType;
  label: string;
  count: number;
  category?: MetricCategory;
}

export const MetricsTable = ({ month }: MetricsTableProps) => {
  const {
    activeTab,
    setActiveTab,
    achievementRateFilter,
    setAchievementRateFilter,
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
    setAchievementRateExcellentThreshold,
    setAchievementRateDangerThreshold,
    setIsMetricsDetailModalOpen,
    setSelectedMetric,
  } = useMetricsStore((state) => state);

  // API 호출
  const { data, isLoading, error } = useMetricsList(month);
  const metrics = data?.metrics ?? [];

  // 달성률 기준 API 조회
  const { data: criteriaData } = useAchievementCriteria(month);

  // API 데이터가 로드되면 store에 저장
  useEffect(() => {
    if (criteriaData) {
      setAchievementRateExcellentThreshold(criteriaData.thresholds.excellent);
      setAchievementRateDangerThreshold(criteriaData.thresholds.danger);
    }
  }, [
    criteriaData,
    setAchievementRateExcellentThreshold,
    setAchievementRateDangerThreshold,
  ]);

  // 비율 정렬 상태 (asc: 오름차순, desc: 내림차순, null: 정렬 없음)
  const [ratioSortOrder, setRatioSortOrder] = useState<"asc" | "desc" | null>(
    null,
  );

  // 달성률 기준값 (store 값 사용)
  const excellentThreshold = achievementRateExcellentThreshold;
  const dangerThreshold = achievementRateDangerThreshold;

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
    // 데이터가 없는 경우 최소 높이 반환
    if (isLoading || error || metrics.length === 0) {
      return 225;
    }

    let count = 0;
    switch (activeTab) {
      case "bdpi":
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
      id: "bdpi",
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
      label: "개발효율",
      count: developmentEfficiencyCount,
      category: MetricCategory.DEVELOPMENT_EFFICIENCY,
    },
  ];

  // 활성 탭에 따라 지표 필터링 (이미 달성률 필터가 적용된 metrics 사용)
  const filteredMetrics =
    activeTab === "bdpi"
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
      return a.weightRatio - b.weightRatio;
    }
    return b.weightRatio - a.weightRatio;
  });

  // 지표 상세보기 모달 열기
  const handleMetricsDetailClick = (metric: MetricItem) => {
    setSelectedMetric(metric);
    setIsMetricsDetailModalOpen(true);
  };

  // 로딩, 에러, 데이터 없음 상태 여부
  const isEmptyState = isLoading || error || metrics.length === 0;

  return (
    <div className="space-y-4">
      {/* Tabs와 달성률 필터 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        {/* Tabs 영역 */}
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
          {/* 달성률 필터 */}
          <AchievementRateFilter
            value={achievementRateFilter}
            onChange={setAchievementRateFilter}
            excellentThreshold={excellentThreshold}
            dangerThreshold={dangerThreshold}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ height: `${tableHeight}px` }}>
        {isEmptyState ? (
          <div className="flex items-center justify-center h-full">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <p className="text-gray-500">수집된 데이터가 없습니다.</p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
                <th className="px-4 py-3 w-[25%]">지표명</th>
                <th className="px-4 py-3 w-[12%] text-center">범주</th>
                <th className="px-4 py-3 w-[12%]">현재값</th>

                <th className="px-4 py-3 w-[12%]">목표값</th>
                <th className="px-4 py-3 w-[12%]">달성률</th>
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
                        <span>{getMetricName(metric.metricCode)}</span>
                        {(metric.tooltipDescription || metric.description) && (
                          <Tooltip
                            content={
                              metric.tooltipDescription ||
                              metric.description ||
                              ""
                            }
                            color="#6B7280"
                            maxWidth={250}
                          >
                            <Info className="text-gray-400 w-4 h-4 cursor-pointer" />
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {(() => {
                        const style = getCategoryStyle(metric.category);
                        return (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                            style={{
                              color: style.color,
                              borderColor: style.borderColor,
                              backgroundColor: style.bgColor,
                            }}
                          >
                            {getCategoryLabel(metric.category)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {metric.currentValue}
                      {getMetricUnit(metric.metricCode)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {metric.targetValue}
                      {getMetricUnit(metric.metricCode)}
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
                                {Math.round(metric.achievementRate)}%
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {metric.weightRatio.toFixed(1)}%
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
        )}
      </div>
    </div>
  );
};
