import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TREND_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";
import type { ThresholdType } from "@/types/serviceStability.types";

interface Metric {
  id: string;
  label: string;
  value: string;
  target: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  status: ThresholdType;
  iconColor: string;
}

// status에 따른 아이콘 매핑
const STATUS_ICONS: Record<ThresholdType, LucideIcon> = {
  excellent: CheckCircle2,
  good: CheckCircle2,
  warning: TriangleAlert,
  danger: TriangleAlert,
};

interface ServiceStabilityProps {
  metrics: Metric[];
}

/**
 * 서비스 안정성 메트릭 컴포넌트
 */
export const ServiceStability = ({ metrics }: ServiceStabilityProps) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        서비스 안정성
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((metric) => {
          const Icon = STATUS_ICONS[metric.status];
          return (
            <div key={metric.id} className="flex flex-col items-center gap-2.5">
              {/* 아이콘 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center`}
                // style={{ backgroundColor: `${metric.iconColor}20` }}
              >
                <Icon className="w-7 h-7" style={{ color: metric.iconColor }} />
              </div>

              {/* 메트릭 값 */}
              <div className="text-3xl font-bold text-gray-900">
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
    </Card>
  );
};
