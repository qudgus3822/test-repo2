import {
  Rocket,
  CheckCircle2,
  Clock,
  Search,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TREND_COLORS } from "@/styles/colors";
import downIcon from "@/assets/icons/down_icon_red.svg";
import upIcon from "@/assets/icons/up_icon_green.svg";

interface Metric {
  id: string;
  label: string;
  value: string;
  target: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor: string;
}

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
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="flex flex-col items-center">
              {/* 아이콘 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2`}
                // style={{ backgroundColor: `${metric.iconColor}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: metric.iconColor }} />
              </div>

              {/* 값 */}
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>

              {/* 트렌드 */}
              <div
                className="flex items-center gap-1 text-xs font-medium"
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
              {/* 레이블 */}
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>

              {/* 목표 */}
              <div className="text-xs text-gray-400 mb-2">{metric.target}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// 아이콘 매핑을 위한 헬퍼
export const SERVICE_ICONS = {
  deployment: Rocket,
  success: CheckCircle2,
  mttr: Clock,
  mttd: Search,
  incidents: TriangleAlert,
} as const;
