import { useMemo } from "react";
import { DonutChart } from "@/libs/chart";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TREND_COLORS, BRAND_COLORS, CHART_COLORS, PALETTE_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import { useCompanyQuality } from "@/api/hooks/useCompanyQuality";
import { Tooltip } from "../ui/Tooltip";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { CodeReviewStatusModal } from "./CodeReviewStatusModal";
import { useDashboardStore } from "@/store/useDashboardStore";

interface MetricsOverviewProps {
  month: string; // YYYY-MM 형식
}

// API 에러 시 빈 차트 표시용 기본 데이터
const DEFAULT_EMPTY_DATA = {
  month: "",
  bdpiAverage: 0.0,
  monthlyComparison: { changePercent: 0, direction: "new" as const },
  quality: { score: 0, achievedMetrics: null, totalMetrics: 9 },
  review: { score: 0, achievedMetrics: null, totalMetrics: 12 },
  efficiency: { score: 0, achievedMetrics: null, totalMetrics: 9 },
};

/**
 * 메트릭 개요 컴포넌트
 * 전사 BDPI 평균(텍스트)과 주요 지표들(도넛 차트)을 표시
 */
export const MetricsOverview = ({ month }: MetricsOverviewProps) => {
  // React Query로 전사 BDPI 데이터 조회
  const {
    data: companyQualityData,
    isLoading,
    error,
  } = useCompanyQuality(month);

  // 코드 리뷰 현황 모달 상태
  const setCodeReviewModal = useDashboardStore(
    (state) => state.setCodeReviewModal,
  );

  // API 에러 시 빈 차트 표시용 기본 데이터 사용
  const data = error ? DEFAULT_EMPTY_DATA : companyQualityData;

  // 전사 BDPI 평균 계산
  const bdpiAverage = useMemo(
    () =>
      data
        ? {
            value: data.bdpiAverage,
            label: "전사 BDPI 평균",
            sublabel: "평균 확보율",
            color: BRAND_COLORS.secondary,
            trend: {
              value: data.monthlyComparison.changePercent,
              direction: data.monthlyComparison.direction,
              isPositive: data.monthlyComparison.direction === "up",
              hasData: data.monthlyComparison.direction !== "new",
            },
          }
        : null,
    [data],
  );

  // 차트 메트릭 계산
  const chartMetrics = useMemo(
    () =>
      data
        ? [
            {
              id: "code",
              value: data.quality.score,
              label: "코드품질",
              sublabel: `${
                data.quality.achievedMetrics === null
                  ? "-"
                  : data.quality.achievedMetrics
              }/${data.quality.totalMetrics}개 달성`,
              color: CHART_COLORS.blue,
              // [변경: 2026-01-27 15:00, 임도휘 수정] 라벨 툴팁 추가
              labelTooltip: "전사 기준으로 설정된 총 9개 지표의 목표 달성률에 대해, 각 지표별 가중치 비율을 반영하여 산정한 코드품질의 총 달성률입니다.",
            },
            {
              id: "review",
              value: data.review.score,
              label: "리뷰품질",
              sublabel: `${
                data.review.achievedMetrics === null
                  ? "-"
                  : data.review.achievedMetrics
              }/${data.review.totalMetrics}개 달성`,
              color: CHART_COLORS.yellow,
              // [변경: 2026-01-27 15:00, 임도휘 수정] 라벨 툴팁 추가
              labelTooltip: "전사 기준으로 설정된 총 12개 지표의 목표 달성률에 대해, 각 지표별 가중치 비율을 반영하여 산정한 리뷰품질의 총 달성률입니다.",
            },
            {
              id: "efficiency",
              value: data.efficiency.score,
              label: "개발효율",
              sublabel: `${
                data.efficiency.achievedMetrics === null
                  ? "-"
                  : data.efficiency.achievedMetrics
              }/${data.efficiency.totalMetrics}개 달성`,
              color: CHART_COLORS.lightYellow,
              // [변경: 2026-01-27 15:00, 임도휘 수정] 라벨 툴팁 추가
              labelTooltip: "전사 기준으로 설정된 총 9개 지표의 목표 달성률에 대해, 각 지표별 가중치 비율을 반영하여 산정한 개발효율의 총 달성률입니다.",
            },
          ]
        : null,
    [data],
  );

  // 로딩 또는 데이터 없음 상태
  if (isLoading || !bdpiAverage || !chartMetrics) {
    return (
      <Card className="w-full h-auto">
        <div className="flex items-center justify-center h-40">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <p className="text-gray-500">수집된 전사 BDPI 데이터가 없습니다.</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 전사 BDPI 평균 (텍스트 표시) */}
        <div className="flex items-center justify-center border-r border-[#E2E8F0] pr-6">
          {/* [변경: 2026-01-27 16:30, 임도휘 수정] 세로 간격 margin에서 gap으로 변경 */}
          <div className="flex flex-col items-center w-full gap-2 pt-1.5">
            <div className="text-center flex flex-col gap-3.5">
              {/* [변경: 2026-01-27 16:30, 임도휘 수정] BDPI 값 세로 확대(scale-y-110), 색상 변경(darkBlue) */}
              <div className="text-4xl font-bold [@media(min-width:1400px)]:text-5xl scale-y-110 origin-center" style={{ color: PALETTE_COLORS.darkBlue }}>
                {bdpiAverage.value === 0 ? "-" : bdpiAverage.value.toFixed(1)}
              </div>
              {/* [변경: 2026-01-27 14:30, 임도휘 수정] 전사 BDPI 평균 텍스트 줄바꿈 방지 */}
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {bdpiAverage.label}
                </span>
                <Tooltip
                  content={
                    "BDPI는 코드품질, 리뷰품질, 개발효율의 점수를 동일 가중치로 평균한 지표입니다."
                  }
                  direction="bottom"
                  color="#6B7280"
                  maxWidth={250}
                >
                  <Info
                    className="w-4 h-4 text-gray-400 cursor-pointer"
                  />
                </Tooltip>
              </div>
            </div>
            {bdpiAverage.trend && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">
                  전월대비
                </span>
                {!bdpiAverage.trend.hasData ? (
                  <span className="text-sm font-medium text-gray-500">-</span>
                ) : bdpiAverage.trend.value === 0 ? (
                  <span className="text-sm font-medium text-gray-500">
                    0.0%
                  </span>
                ) : (
                  <div
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{
                      color: bdpiAverage.trend.isPositive
                        ? TREND_COLORS.increase
                        : TREND_COLORS.decrease,
                    }}
                  >
                    <span>
                      {bdpiAverage.trend.isPositive ? (
                        <img src={upIcon} alt="up" />
                      ) : (
                        <img src={downIcon} alt="down" />
                      )}
                    </span>
                    <span>{Math.abs(bdpiAverage.trend.value).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}{" "}
          </div>
        </div>

        {/* 차트 메트릭 (도넛 차트 표시) */}
        {chartMetrics.map((metric) => (
          <div key={metric.id}>
            {/* [변경: 2026-01-27 14:30, 임도휘 수정] lg(1024px)~1400px 구간에서 도넛차트 크기 축소 */}
            <div className="flex flex-col items-center justify-center gap-2 lg:scale-[0.75] [@media(min-width:1160px)]:scale-[0.85] [@media(min-width:1400px)]:scale-100 origin-center">
              <DonutChart
                value={metric.value}
                maxValue={100}
                color={metric.color}
                label={metric.label}
                sublabel={metric.sublabel}
                strokeWidth={20}
                noDataLabel={metric.value === 0 ? "-" : undefined}
                labelTooltip={metric.labelTooltip}
              />
            </div>
            <div className="flex justify-center pt-1 pl-1">
              {metric.id === "review" && (
                <Button
                  variant="normal"
                  size="sm"
                  onClick={() => setCodeReviewModal(true)}
                >
                  상세보기
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 코드 리뷰 현황 모달 */}
      <CodeReviewStatusModal />
    </Card>
  );
};
