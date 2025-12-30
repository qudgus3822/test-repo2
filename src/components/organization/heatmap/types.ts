/**
 * 히트맵 테이블 관련 타입 정의
 * - 참조 프로젝트 구조 기반
 */

import { SUMMARY_COLORS } from "@/styles/colors";

// Summary 카테고리 타입
export type SummaryCategory = "exceeds" | "achieved" | "good" | "caution";

// Summary 카테고리 설정 인터페이스
export interface SummaryCategoryConfig {
  id: SummaryCategory;
  name: string;
  koreanName: string;
  minPercentage: number;
  maxPercentage: number;
  bgColor: string;
  textColor: string;
}

// Summary 카테고리 설정
export const SUMMARY_CATEGORIES: SummaryCategoryConfig[] = [
  {
    id: "exceeds",
    name: "Exceeds",
    koreanName: "초과달성",
    minPercentage: 100,
    maxPercentage: Infinity,
    bgColor: SUMMARY_COLORS.exceeds,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "achieved",
    name: "Achieved",
    koreanName: "달성",
    minPercentage: 80,
    maxPercentage: 100,
    bgColor: SUMMARY_COLORS.achieved,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "good",
    name: "Good",
    koreanName: "양호",
    minPercentage: 60,
    maxPercentage: 80,
    bgColor: SUMMARY_COLORS.good,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "caution",
    name: "Caution",
    koreanName: "주의",
    minPercentage: 0,
    maxPercentage: 60,
    bgColor: SUMMARY_COLORS.caution,
    textColor: SUMMARY_COLORS.text,
  },
];

// Summary 배경색 (hex) - SUMMARY_COLORS 참조
export const SUMMARY_BG_COLORS: Record<SummaryCategory, string> = {
  exceeds: SUMMARY_COLORS.exceeds,
  achieved: SUMMARY_COLORS.achieved,
  good: SUMMARY_COLORS.good,
  caution: SUMMARY_COLORS.caution,
};

// Summary 컬럼 너비
export const SUMMARY_COLUMN_WIDTH = 60;

// 카테고리 맵 (빠른 접근용)
export const SUMMARY_CATEGORY_MAP: Record<SummaryCategory, SummaryCategoryConfig> =
  SUMMARY_CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat }),
    {} as Record<SummaryCategory, SummaryCategoryConfig>
  );

// Summary 카운트 타입
export interface SummaryCounts {
  exceeds: number;
  achieved: number;
  good: number;
  caution: number;
}

// 정렬 설정 타입
export interface SortConfig {
  column: SummaryCategory | string | null;
  direction: "asc" | "desc" | null;
}

// 지표 데이터 타입 (API 응답)
export interface MetricData {
  score: number;
  isUsed: boolean;
  value?: number;
  unit?: string;
}

// 컬럼 너비 상수
export const COLUMN_WIDTHS = {
  name: 220,
  summary: SUMMARY_COLUMN_WIDTH,
  metric: 48,
  bdpi: 80,
} as const;

// 점수 등급별 카운트 계산
export const calculateSummaryCounts = (
  metrics: Record<string, MetricData> | undefined
): SummaryCounts => {
  const counts: SummaryCounts = { exceeds: 0, achieved: 0, good: 0, caution: 0 };

  if (!metrics) return counts;

  Object.values(metrics).forEach((metric) => {
    if (!metric || typeof metric.score !== "number" || metric.isUsed === false) return;

    const score = metric.score;
    const category = SUMMARY_CATEGORIES.find(
      (cat) => score >= cat.minPercentage && score < cat.maxPercentage
    );

    if (category) {
      counts[category.id]++;
    }
  });

  return counts;
};
