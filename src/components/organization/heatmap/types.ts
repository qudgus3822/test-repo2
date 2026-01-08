/**
 * 히트맵 테이블 관련 타입 정의
 * - 참조 프로젝트 구조 기반
 */

import { SUMMARY_COLORS } from "@/styles/colors";
import type { StatusCount, MetricStatusType } from "@/types/organization.types";

// Summary 카테고리 타입 (API 응답 기준)
export type SummaryCategory = "overAchieved" | "excellent" | "warning" | "danger";

// 기존 카테고리 타입 (하위 호환용)
export type LegacySummaryCategory = "exceeds" | "achieved" | "good" | "caution";

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

// Summary 카테고리 설정 (API 기준)
export const SUMMARY_CATEGORIES: SummaryCategoryConfig[] = [
  {
    id: "overAchieved",
    name: "OverAchieved",
    koreanName: "초과달성",
    minPercentage: 100,
    maxPercentage: Infinity,
    bgColor: SUMMARY_COLORS.exceeds,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "excellent",
    name: "Excellent",
    koreanName: "우수",
    minPercentage: 80,
    maxPercentage: 100,
    bgColor: SUMMARY_COLORS.achieved,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "warning",
    name: "Warning",
    koreanName: "경고",
    minPercentage: 60,
    maxPercentage: 80,
    bgColor: SUMMARY_COLORS.good,
    textColor: SUMMARY_COLORS.text,
  },
  {
    id: "danger",
    name: "Danger",
    koreanName: "위험",
    minPercentage: 0,
    maxPercentage: 60,
    bgColor: SUMMARY_COLORS.caution,
    textColor: SUMMARY_COLORS.text,
  },
];

// Summary 배경색 (hex) - SUMMARY_COLORS 참조
export const SUMMARY_BG_COLORS: Record<SummaryCategory, string> = {
  overAchieved: SUMMARY_COLORS.exceeds,
  excellent: SUMMARY_COLORS.achieved,
  warning: SUMMARY_COLORS.good,
  danger: SUMMARY_COLORS.caution,
};

// Summary 컬럼 너비
export const SUMMARY_COLUMN_WIDTH = 60;

// 카테고리 맵 (빠른 접근용)
export const SUMMARY_CATEGORY_MAP: Record<SummaryCategory, SummaryCategoryConfig> =
  SUMMARY_CATEGORIES.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat }),
    {} as Record<SummaryCategory, SummaryCategoryConfig>
  );

// Summary 카운트 타입 (API에서 제공하는 StatusCount 재사용)
export type SummaryCounts = StatusCount;

// 정렬 설정 타입
export interface SortConfig {
  column: SummaryCategory | string | null;
  direction: "asc" | "desc" | null;
}

// 지표 데이터 타입 (API 응답)
export interface MetricData {
  score: number | null;
  isUsed: boolean;
  value?: number | null;
  unit?: string;
  avgRate?: number | null; // 달성률 (%, 100% 초과 가능)
  totalValue?: number | null; // 총합 값 (aggregation=total일 때)
  targetValue?: number | string | null; // 목표값
  status?: MetricStatusType; // 달성 상태
}

// 컬럼 너비 상수
export const COLUMN_WIDTHS = {
  name: 220,
  summary: SUMMARY_COLUMN_WIDTH,
  metric: 48,
  bdpi: 80,
} as const;

// 점수 등급별 카운트 계산 (API statusCount가 없을 경우 대비)
export const calculateSummaryCounts = (
  metrics: Record<string, MetricData> | undefined
): SummaryCounts => {
  const counts: SummaryCounts = { overAchieved: 0, excellent: 0, warning: 0, danger: 0 };

  if (!metrics) return counts;

  Object.values(metrics).forEach((metric) => {
    if (!metric || typeof metric.score !== "number" || metric.isUsed === false) return;

    const score = metric.score;

    // API 기준으로 카테고리 분류
    if (score >= 100) {
      counts.overAchieved++;
    } else if (score >= 80) {
      counts.excellent++;
    } else if (score >= 60) {
      counts.warning++;
    } else {
      counts.danger++;
    }
  });

  return counts;
};

// API statusCount를 SummaryCounts로 변환 (이미 동일 구조이므로 그대로 반환)
export const convertStatusCountToSummaryCounts = (
  statusCount: StatusCount | undefined
): SummaryCounts => {
  if (!statusCount) {
    return { overAchieved: 0, excellent: 0, warning: 0, danger: 0 };
  }
  return statusCount;
};
