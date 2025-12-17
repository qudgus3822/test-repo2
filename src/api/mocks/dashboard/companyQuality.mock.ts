import type { CompanyQualityMetrics } from "@/types/companyQuality.types";

/**
 * 전사 BDPI 품질 데이터 목업
 */
export const mockCompanyQuality: CompanyQualityMetrics = {
  month: "2025-10",
  bdpiAverage: 77.4,
  monthlyComparison: {
    changePercent: 2.3,
    direction: "up",
  },
  quality: {
    score: 85.3,
    achievedMetrics: 7,
    totalMetrics: 9,
  },
  review: {
    score: 69.5,
    achievedMetrics: 9,
    totalMetrics: 12,
  },
  efficiency: {
    score: 77.4,
    achievedMetrics: 6,
    totalMetrics: 9,
  },
};
