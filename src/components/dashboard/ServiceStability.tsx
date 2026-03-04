import { useMemo } from "react";
import { CircleSlash } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TREND_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import { getStatusIcon, getStatusColor } from "@/utils/metrics";
import { useServiceStability } from "@/api/hooks/useServiceStability";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type {
  ServiceStabilityMetric,
  ServiceStabilityMetrics,
  StatusType,
} from "@/types/serviceStability.types";

interface ServiceStabilityProps {
  month: string;
}

/** 화면 표시용 메트릭 데이터 */
interface DisplayMetric {
  id: string;
  label: string;
  value: string;
  target: string;
  status: StatusType;
  trend: {
    show: boolean;
    isSame: boolean;
    isPositive: boolean;
    value: number;
  };
}

/** 메트릭 설정 */
interface MetricConfig {
  id: string;
  key: keyof Omit<ServiceStabilityMetrics, "month">;
  targetSuffix?: string;
}

/** 메트릭 설정 목록 */
const METRIC_CONFIGS: MetricConfig[] = [
  { id: "deployment", key: "deploymentFrequency" },
  { id: "success", key: "deploymentSuccessRate" },
  { id: "mttr", key: "meanTimeToRecovery", targetSuffix: " 이하" },
  { id: "mttd", key: "timeToDetection", targetSuffix: " 이하" },
  { id: "incidents", key: "incidentResolvedCount", targetSuffix: " 이상" },
];

/** API 메트릭 데이터를 화면 표시용으로 변환 */
const formatMetric = (
  config: MetricConfig,
  metric: ServiceStabilityMetric,
): DisplayMetric => {
  const { direction, changePercent } = metric.monthlyComparison;
  const showTrend = direction !== "no_data" && direction !== "new";

  return {
    id: config.id,
    label: metric.metricName,
    value: `${metric.value}${metric.unit}`,
    target: `${metric.targetValue}${metric.unit}${config.targetSuffix ?? ""}`,
    status: metric.status,
    trend: {
      show: showTrend,
      isSame: changePercent === 0,
      isPositive: direction === "up",
      value: Math.abs(changePercent),
    },
  };
};

/** 개별 메트릭 카드 컴포넌트 */
const MetricCard = ({ metric }: { metric: DisplayMetric }) => {
  const Icon = getStatusIcon(metric.status);
  const iconColor = getStatusColor(metric.status);
  const hasStatus = metric.status !== null;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* 상태 아이콘 (데이터 없으면 CircleSlash 아이콘 표시) */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        {hasStatus ? (
          <Icon className="w-7 h-7" style={{ color: iconColor }} />
        ) : (
          <CircleSlash className="w-7 h-7 text-gray-400" />
        )}
      </div>

      {/* 메트릭 값 (데이터 없으면 -- 표시) */}
      <div
        className={`lg:text-2xl text-xl font-bold whitespace-nowrap ${hasStatus ? "text-gray-900" : "text-gray-400"}`}
      >
        {hasStatus ? metric.value : "--"}
      </div>

      {/* 목표치 */}
      <div className="flex justify-center items-center py-1 px-4 bg-[#DFDFDF] rounded-[45px] whitespace-nowrap">
        <span className="text-sm text-center tracking-[-1.17px] text-[#62748E]">
          {metric.target}
        </span>
      </div>

      {/* 전월대비 트렌드 */}
      <div className="flex items-center gap-1 text-sm">
        <span>전월대비</span>
        {metric.trend.show ? (
          metric.trend.isSame ? (
            // [변경: 2026-03-04, 김병현 수정] same(0%) 케이스 회색 처리 추가
            <span className="font-medium text-gray-400">0%</span>
          ) : (
            <div
              className="flex items-center gap-1 font-medium"
              style={{
                color: metric.trend.isPositive
                  ? TREND_COLORS.increase
                  : TREND_COLORS.decrease,
              }}
            >
              <img
                src={metric.trend.isPositive ? upIcon : downIcon}
                alt={metric.trend.isPositive ? "up" : "down"}
              />
              <span>{metric.trend.value}%</span>
            </div>
          )
        ) : (
          <span className="text-gray-400">--</span>
        )}
      </div>

      {/* 메트릭 라벨 */}
      <div
        className="text-md text-gray-500 font-bold line-clamp-2 text-center"
        title={metric.label}
      >
        {metric.label}
      </div>
    </div>
  );
};

/**
 * 서비스 안정성 메트릭 컴포넌트
 */
export const ServiceStability = ({ month }: ServiceStabilityProps) => {
  const { data, isLoading, error } = useServiceStability(month);

  const metrics = useMemo<DisplayMetric[]>(() => {
    if (!data) return [];
    return METRIC_CONFIGS.map((config) =>
      formatMetric(config, data[config.key]),
    );
  }, [data]);

  const hasData = metrics.length > 0;

  // 로딩, 에러, 데이터 없음 상태
  if (isLoading || error || !hasData) {
    return (
      <Card className="w-full h-auto">
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">서비스 안정성</h3>
          <div className="flex items-center justify-center min-h-[152px]">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <p className="text-gray-500">수집된 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-auto">
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">서비스 안정성</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </Card>
  );
};
