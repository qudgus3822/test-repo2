import {
  Rocket,
  CheckCircle2,
  Clock,
  Search,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                style={{ backgroundColor: `${metric.iconColor}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: metric.iconColor }} />
              </div>

              {/* 레이블 */}
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>

              {/* 값 */}
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>

              {/* 목표 */}
              <div className="text-xs text-gray-400 mb-2">{metric.target}</div>

              {/* 트렌드 */}
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>{metric.trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(metric.trend.value)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
