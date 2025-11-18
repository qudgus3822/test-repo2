import type { ServiceStabilityMetrics } from "@/types/serviceStability.types";

/**
 * 전사 서비스 안정성 데이터 목업
 */
export const mockServiceStability: ServiceStabilityMetrics = {
  month: "2025-10",
  deploymentFrequency: {
    threshold: "excellent",
    value: 241,
    targetValue: 200,
    changeRate: 14,
    metricName: "배포빈도",
    unit: "count",
  },
  deploymentSuccessRate: {
    threshold: "warning",
    value: 94.7,
    targetValue: 95,
    changeRate: 4,
    metricName: "배포 성공률",
    unit: "percentage",
  },
  mttr: {
    threshold: "danger",
    value: 3.4,
    targetValue: 3,
    changeRate: 14,
    metricName: "MTTR",
    unit: "hours",
  },
  mttd: {
    threshold: "excellent",
    value: 0.6,
    targetValue: 1,
    changeRate: -2,
    metricName: "MTTD",
    unit: "hours",
  },
  incidentCount: {
    threshold: "warning",
    value: 16,
    targetValue: 15,
    changeRate: -13,
    metricName: "장애 발생건수",
    unit: "count",
  },
};
