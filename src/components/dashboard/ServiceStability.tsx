import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { TREND_COLORS, GOAL_STATUS_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import { getStatusIcon, getStatusColor } from "@/utils/metrics";
import { useServiceStability } from "@/api/hooks/useServiceStability";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ServiceStabilityProps {
  month: string;
}

/**
 * 서비스 안정성 메트릭 컴포넌트
 */
export const ServiceStability = ({ month }: ServiceStabilityProps) => {
  const {
    data: serviceStabilityData,
    isLoading,
    error,
  } = useServiceStability(month);

  // 서비스 안정성 데이터 가공
  const metrics = useMemo(
    () =>
      serviceStabilityData
        ? [
            {
              id: "deployment",
              label: serviceStabilityData.deploymentFrequency.metricName,
              value: `${serviceStabilityData.deploymentFrequency.value}회`,
              target: `${serviceStabilityData.deploymentFrequency.targetValue}회`,
              trend: {
                value: Math.abs(
                  serviceStabilityData.deploymentFrequency.changeRate,
                ),
                isPositive:
                  serviceStabilityData.deploymentFrequency.changeRate > 0,
              },
              status: serviceStabilityData.deploymentFrequency.threshold,
              iconColor:
                GOAL_STATUS_COLORS[
                  serviceStabilityData.deploymentFrequency.threshold
                ],
            },
            {
              id: "success",
              label: serviceStabilityData.deploymentSuccessRate.metricName,
              value: `${serviceStabilityData.deploymentSuccessRate.value}%`,
              target: `${serviceStabilityData.deploymentSuccessRate.targetValue}%`,
              trend: {
                value: Math.abs(
                  serviceStabilityData.deploymentSuccessRate.changeRate,
                ),
                isPositive:
                  serviceStabilityData.deploymentSuccessRate.changeRate > 0,
              },
              status: serviceStabilityData.deploymentSuccessRate.threshold,
              iconColor:
                GOAL_STATUS_COLORS[
                  serviceStabilityData.deploymentSuccessRate.threshold
                ],
            },
            {
              id: "mttr",
              label: serviceStabilityData.mttr.metricName,
              value: `${serviceStabilityData.mttr.value}시간`,
              target: `${serviceStabilityData.mttr.targetValue}시간 이하`,
              trend: {
                value: Math.abs(serviceStabilityData.mttr.changeRate),
                isPositive: serviceStabilityData.mttr.changeRate > 0,
              },
              status: serviceStabilityData.mttr.threshold,
              iconColor:
                GOAL_STATUS_COLORS[serviceStabilityData.mttr.threshold],
            },
            {
              id: "mttd",
              label: serviceStabilityData.mttd.metricName,
              value: `${serviceStabilityData.mttd.value}시간`,
              target: `${serviceStabilityData.mttd.targetValue}시간 이하`,
              trend: {
                value: Math.abs(serviceStabilityData.mttd.changeRate),
                isPositive: serviceStabilityData.mttd.changeRate > 0,
              },
              status: serviceStabilityData.mttd.threshold,
              iconColor:
                GOAL_STATUS_COLORS[serviceStabilityData.mttd.threshold],
            },
            {
              id: "incidents",
              label: serviceStabilityData.incidentCount.metricName,
              value: `${serviceStabilityData.incidentCount.value}건`,
              target: `${serviceStabilityData.incidentCount.targetValue}건 이하`,
              trend: {
                value: Math.abs(serviceStabilityData.incidentCount.changeRate),
                isPositive: serviceStabilityData.incidentCount.changeRate > 0,
              },
              status: serviceStabilityData.incidentCount.threshold,
              iconColor:
                GOAL_STATUS_COLORS[
                  serviceStabilityData.incidentCount.threshold
                ],
            },
          ]
        : [],
    [serviceStabilityData],
  );

  // 로딩, 에러, 데이터 없음 상태
  if (isLoading || error || !metrics || metrics.length === 0) {
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
          {metrics.map((metric) => {
            const Icon = getStatusIcon(metric.status);
            const iconColor = getStatusColor(metric.status);
            return (
              <div
                key={metric.id}
                className="flex flex-col items-center gap-2.5"
              >
                {/* 아이콘 */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center`}
                >
                  <Icon className="w-7 h-7" style={{ color: iconColor }} />
                </div>

                {/* 메트릭 값 */}
                <div className="lg:text-2xl text-xl font-bold text-gray-900">
                  {metric.value}
                </div>

                {/* 목표치 값 */}
                <div className="flex justify-center items-center py-1 px-4 bg-[#DFDFDF] rounded-[45px]">
                  <span className="text-sm text-center tracking-[-1.17px] text-[#62748E]">
                    {metric.target}
                  </span>
                </div>

                {/* 트렌드 */}
                <div className="flex items-center gap-1 text-sm">
                  <div>전월대비</div>
                  <div
                    className="flex items-center gap-1 font-medium"
                    style={{
                      color: metric.trend.isPositive
                        ? TREND_COLORS.increase
                        : TREND_COLORS.decrease,
                    }}
                  >
                    <span>
                      {metric.trend.isPositive ? (
                        <img src={upIcon} alt="up" />
                      ) : (
                        <img src={downIcon} alt="down" />
                      )}
                    </span>
                    <span>{Math.abs(metric.trend.value)}%</span>
                  </div>
                </div>
                {/* 레이블 */}
                <div className="text-md text-gray-500 font-bold">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
