import { Tooltip } from "@/components/ui/Tooltip";
import { AchievementRateFilter } from "@/components/ui/AchievementRateFilter";
import { MetricsTabs } from "./MetricsTabs";
import { Search, ArrowDownUp, Info, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import { useMetricsStore, type TabType } from "@/store/useMetricsStore";
import {
  getCategoryLabel,
  getStatusIcon,
  getStatusColor,
  calculateMetricStatus,
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
  // [변경: 2026-01-25 12:00, 김병현 수정] useShallow로 개별 selector 통합
  const {
    activeTab,
    achievementRateFilter,
    setAchievementRateFilter,
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
    setAchievementRateExcellentThreshold,
    setAchievementRateDangerThreshold,
    setIsMetricsDetailModalOpen,
    setSelectedMetric,
  } = useMetricsStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      achievementRateFilter: state.achievementRateFilter,
      setAchievementRateFilter: state.setAchievementRateFilter,
      achievementRateExcellentThreshold: state.achievementRateExcellentThreshold,
      achievementRateDangerThreshold: state.achievementRateDangerThreshold,
      setAchievementRateExcellentThreshold: state.setAchievementRateExcellentThreshold,
      setAchievementRateDangerThreshold: state.setAchievementRateDangerThreshold,
      setIsMetricsDetailModalOpen: state.setIsMetricsDetailModalOpen,
      setSelectedMetric: state.setSelectedMetric,
    })),
  );

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

  // [변경: 2026-01-19 19:00, 김병현 수정] 페이지 스크롤 레이아웃으로 변경
  return (
    <div className="flex flex-col">
      {/* Tabs와 달성률 필터 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
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
      {/* [변경: 2026-01-19 19:00, 김병현 수정] overflow 제거하여 페이지 스크롤 사용, thead는 sticky로 고정 */}
      <div>
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
            {/* [변경: 2026-01-19 19:00, 김병현 수정] 페이지 스크롤 시 Header(80px) 아래에 sticky 고정 */}
            {/* [변경: 2026-01-20 11:20, 김병현 수정] sticky 시 border 사라지는 문제 해결 - box-shadow 사용 */}
            <thead
              className="sticky top-20 bg-white z-10"
              style={{ boxShadow: "inset 0 -1px 0 #e5e7eb" }}
            >
              <tr className="text-left text-sm font-medium text-gray-700">
                <th className="px-4 py-3 w-[25%]">지표명</th>
                <th className="px-4 py-3 w-[12%] text-center">범주</th>
                <th className="px-4 py-3 w-[12%] text-center">현재값</th>

                <th className="px-4 py-3 w-[12%] text-center">목표값</th>
                <th className="px-4 py-3 w-[12%] text-center">달성률</th>
                <th className="px-4 py-3 w-[12%] text-center">
                  <div className="flex items-center justify-center gap-1.5">
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
                <th className="px-4 py-3 w-[12%] text-center">상세</th>
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
                        {metric.tooltip && (
                          <Tooltip
                            content={metric.tooltip}
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
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      {metric.currentValue === null
                        ? "--"
                        : `${metric.currentValue}${metric.unit}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {metric.targetValue}
                      {metric.unit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        {metric.achievementRate === null ? (
                          <span className="text-sm text-gray-400">--</span>
                        ) : (
                          (() => {
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
                          })()
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {metric.weightRatio.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
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
