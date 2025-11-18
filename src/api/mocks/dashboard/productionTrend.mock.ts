import type { DevelopmentProductionTrend } from "@/types/productionTrend.types";

/**
 * 개발생산성 트렌드 데이터 목업
 */
export const mockProductionTrend: {
  target: number;
  trendData: DevelopmentProductionTrend[];
} = {
  target: 75,
  trendData: [
    {
      month: "2025-05",
      bdpiAverage: 69,
      codeQuality: 75,
      reviewQuality: 65,
      developmentEfficiency: 65,
      target: 75,
    },
    {
      month: "2025-06",
      bdpiAverage: 71,
      codeQuality: 78,
      reviewQuality: 68,
      developmentEfficiency: 68,
      target: 75,
    },
    {
      month: "2025-07",
      bdpiAverage: 73,
      codeQuality: 80,
      reviewQuality: 70,
      developmentEfficiency: 70,
      target: 75,
    },
    {
      month: "2025-08",
      bdpiAverage: 75,
      codeQuality: 80,
      reviewQuality: 73,
      developmentEfficiency: 73,
      target: 75,
    },
    {
      month: "2025-09",
      bdpiAverage: 77,
      codeQuality: 82,
      reviewQuality: 75,
      developmentEfficiency: 76,
      target: 75,
    },
    {
      month: "2025-10",
      bdpiAverage: 78,
      codeQuality: 82,
      reviewQuality: 77,
      developmentEfficiency: 77,
      target: 75,
    },
  ],
};
