import { Tooltip } from "@/components/ui/Tooltip";
import { AchievementRateFilter } from "@/components/ui/AchievementRateFilter";
import { MetricsTabs } from "./MetricsTabs";
import { Search, ArrowDownUp, Info, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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

// 탭 ID별 카테고리 매핑 (필터링용)
const TAB_CATEGORY_MAP: Record<TabType, MetricCategory | null> = {
  all: null,
  bdpi: null,
  codeQuality: MetricCategory.CODE_QUALITY,
  reviewQuality: MetricCategory.REVIEW_QUALITY,
  developmentEfficiency: MetricCategory.DEVELOPMENT_EFFICIENCY,
};

export const MetricsTable = ({ month }: MetricsTableProps) => {
  const activeTab = useMetricsStore((state) => state.activeTab);
  const achievementRateFilter = useMetricsStore(
    (state) => state.achievementRateFilter,
  );
  const setAchievementRateFilter = useMetricsStore(
    (state) => state.setAchievementRateFilter,
  );
  const achievementRateExcellentThreshold = useMetricsStore(
    (state) => state.achievementRateExcellentThreshold,
  );
  const achievementRateDangerThreshold = useMetricsStore(
    (state) => state.achievementRateDangerThreshold,
  );
  const setAchievementRateExcellentThreshold = useMetricsStore(
    (state) => state.setAchievementRateExcellentThreshold,
  );
  const setAchievementRateDangerThreshold = useMetricsStore(
    (state) => state.setAchievementRateDangerThreshold,
  );
  const setIsMetricsDetailModalOpen = useMetricsStore(
    (state) => state.setIsMetricsDetailModalOpen,
  );

  const setSelectedMetric = useMetricsStore((state) => state.setSelectedMetric);

  // API 호출
  const { data, isLoading, error } = useMetricsList(month);
  // [변경: 2026-01-14 12:15, 김병현 수정] useMemo로 감싸서 매 렌더링마다 새 배열 생성 방지
  const metrics = useMemo(() => data?.metrics ?? [], [data?.metrics]);

  // 달성률 기준 API 조회
  const { data: criteriaData, isFetching } = useAchievementCriteria(month);

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
    isFetching,
  ]);

  // 비율 정렬 상태 (asc: 오름차순, desc: 내림차순, null: 정렬 없음)
  const [ratioSortOrder, setRatioSortOrder] = useState<"asc" | "desc" | null>(
    null,
  );

  // 달성률 기준값 (store 값 사용)
  const excellentThreshold = achievementRateExcellentThreshold;
  const dangerThreshold = achievementRateDangerThreshold;

  // 먼저 달성률 필터 적용
  // [변경: 2026-01-14 12:05, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const achievementRateFilteredAllMetrics = useMemo(() => {
    return metrics.filter((m) => {
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
  }, [metrics, achievementRateFilter, excellentThreshold, dangerThreshold]);

  // 카테고리별 개수 계산 (달성률 필터 적용 후)
  // [변경: 2026-01-14 12:05, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const { codeQualityCount, reviewQualityCount, developmentEfficiencyCount } =
    useMemo(() => {
      return {
        codeQualityCount: achievementRateFilteredAllMetrics.filter(
          (m) => m.category === MetricCategory.CODE_QUALITY,
        ).length,
        reviewQualityCount: achievementRateFilteredAllMetrics.filter(
          (m) => m.category === MetricCategory.REVIEW_QUALITY,
        ).length,
        developmentEfficiencyCount: achievementRateFilteredAllMetrics.filter(
          (m) => m.category === MetricCategory.DEVELOPMENT_EFFICIENCY,
        ).length,
      };
    }, [achievementRateFilteredAllMetrics]);

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

  // 활성 탭에 따라 지표 필터링 (이미 달성률 필터가 적용된 metrics 사용)
  // [변경: 2026-01-14 12:05, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const filteredMetrics = useMemo(() => {
    return activeTab === "bdpi"
      ? achievementRateFilteredAllMetrics
      : achievementRateFilteredAllMetrics.filter(
          (m) => m.category === TAB_CATEGORY_MAP[activeTab],
        );
  }, [activeTab, achievementRateFilteredAllMetrics]);

  // 프론트에서 달성률 기준값에 따라 status 계산
  // [변경: 2026-01-14 12:00, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const metricsWithCalculatedStatus = useMemo(
    () =>
      filteredMetrics.map((metric) => ({
        ...metric,
        status: calculateMetricStatus(
          metric.achievementRate,
          excellentThreshold,
          dangerThreshold,
        ),
      })),
    [filteredMetrics, excellentThreshold, dangerThreshold],
  );

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
  // [변경: 2026-01-14 12:10, 김병현 수정] useMemo로 감싸서 불필요한 재계산 방지
  const sortedMetrics = useMemo(() => {
    return [...metricsWithCalculatedStatus].sort((a, b) => {
      if (ratioSortOrder === null) return 0;
      if (ratioSortOrder === "asc") {
        return a.weightRatio - b.weightRatio;
      }
      return b.weightRatio - a.weightRatio;
    });
  }, [metricsWithCalculatedStatus, ratioSortOrder]);

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
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        {/* Tabs 영역 */}
        <MetricsTabs
          allCount={achievementRateFilteredAllMetrics.length}
          codeQualityCount={codeQualityCount}
          reviewQualityCount={reviewQualityCount}
          developmentEfficiencyCount={developmentEfficiencyCount}
        />
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
                                {metric.achievementRate}%
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
