import type { MergeRequestSummary } from "@/types/traceability.types";

// ── MR Enrichment ──

export interface EnrichedMergeRequest {
  // MR metadata (from mergeRequests[])
  iid: number;
  repositoryId: number;
  repositoryName: string;
  title: string;
  author: string;
  authorEmail: string;
  reviewers: string[];
  sourceBranch: string;
  targetBranch: string;
  createdAt: string;
  mergedAt?: string;
  projectEpicKey?: string;
  projectName?: string;
  // Metric-specific data (from details.mergeRequests[])
  metricData: Record<string, unknown>;
  // Role determination
  isAuthor: boolean;
  isReviewer: boolean;
}

/**
 * details.mergeRequests[j]의 지표별 데이터와 mergeRequests[k]의 MR 메타데이터를
 * join하여 완전한 Enriched MR을 생성합니다.
 *
 * Join key: Number(detailMR.id) === mr.iid && detailMR.repositoryId === mr.repositoryId
 *
 * CRITICAL: details.mergeRequests[].id는 string, mergeRequests[].iid는 number.
 * Number() 변환이 반드시 필요합니다.
 */
export function enrichMergeRequests(
  detailMRs: Array<Record<string, unknown>>,
  mrSummaries: MergeRequestSummary[],
  memberEmployeeId: string,
): EnrichedMergeRequest[] {
  // Build O(1) lookup map keyed by `${iid}-${repositoryId}`
  const summaryMap = new Map<string, MergeRequestSummary>();
  mrSummaries.forEach(mr => {
    summaryMap.set(`${mr.iid}-${mr.repositoryId}`, mr);
  });

  const result: EnrichedMergeRequest[] = [];

  for (const detailMR of detailMRs) {
    const parsedId = Number(detailMR.id);
    if (Number.isNaN(parsedId)) {
      console.warn("[enrichMergeRequests] Skipping detail MR with non-numeric id:", detailMR.id);
      continue;
    }

    const key = `${parsedId}-${detailMR.repositoryId}`;
    const mr = summaryMap.get(key);

    if (mr) {
      result.push({
        iid: mr.iid,
        repositoryId: mr.repositoryId,
        repositoryName: mr.repositoryName,
        title: mr.title,
        author: mr.author,
        authorEmail: mr.authorEmail,
        reviewers: mr.reviewers,
        sourceBranch: mr.sourceBranch,
        targetBranch: mr.targetBranch,
        createdAt: mr.createdAt,
        mergedAt: mr.mergedAt,
        projectEpicKey: mr.projectEpicKey,
        projectName: mr.projectName,
        metricData: detailMR,
        isAuthor: memberEmployeeId === mr.author,
        isReviewer: mr.reviewers.includes(memberEmployeeId),
      });
    } else {
      // No matching MR metadata -- include with null fields
      result.push({
        iid: parsedId,
        repositoryId: Number(detailMR.repositoryId) || 0,
        repositoryName: "",
        title: "",
        author: "",
        authorEmail: "",
        reviewers: [],
        sourceBranch: "",
        targetBranch: "",
        createdAt: "",
        metricData: detailMR,
        isAuthor: false,
        isReviewer: false,
      });
    }
  }

  return result;
}

// ── Time Value Formatting ──

/**
 * rawValue를 사람이 읽기 쉬운 형식으로 포맷합니다.
 *
 * Examples:
 *   formatRawTime(176, 'seconds_to_hours') → "2분 56초"
 *   formatRawTime(1440, 'minutes_to_hours') → "24시간 0분"
 *   formatRawTime(3.5, 'none') → "3.5"
 */
export function formatRawTime(rawValue: number, timeUnitConversion: string): string {
  switch (timeUnitConversion) {
    case 'seconds_to_hours': {
      const totalSeconds = Math.round(rawValue);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (minutes === 0) return `${seconds}초`;
      return `${minutes}분 ${seconds}초`;
    }
    case 'minutes_to_hours': {
      const totalMinutes = Math.round(rawValue);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hours === 0) return `${mins}분`;
      return `${hours}시간 ${mins}분`;
    }
    case 'none':
      return String(rawValue);
    default:
      // Unknown conversion type -- return rawValue as string
      return String(rawValue);
  }
}

/**
 * 표시값과 원본값을 함께 포맷합니다.
 *
 * Examples:
 *   formatMetricValue(0.05, 176, '시간', '초', 'seconds_to_hours')
 *     → { display: "0.05시간", raw: "176초", human: "2분 56초" }
 */
export function formatMetricValue(
  value: number,
  rawValue: number,
  displayUnit: string,
  rawUnit: string,
  timeUnitConversion: string,
): { display: string; raw: string; human: string } {
  return {
    display: `${value}${displayUnit}`,
    raw: `${rawValue}${rawUnit}`,
    human: formatRawTime(rawValue, timeUnitConversion),
  };
}

// ── Count Label Display ──

/**
 * countLabel을 한국어 접미사로 변환합니다.
 *
 * ITEMS → "건"
 * DAYS  → "일"
 * MEMBERS → "명"
 */
export function getCountSuffix(countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS'): string {
  switch (countLabel) {
    case 'ITEMS': return '건';
    case 'DAYS': return '일';
    case 'MEMBERS': return '명';
  }
}

/**
 * count + countLabel을 표시 문자열로 변환합니다.
 *
 * (2, 'ITEMS') → "2건"
 * (22, 'DAYS') → "22일"
 * (3, 'MEMBERS') → "3명"
 */
export function formatCount(count: number, countLabel: 'ITEMS' | 'DAYS' | 'MEMBERS'): string {
  return `${count}${getCountSuffix(countLabel)}`;
}

// ── Aggregation Method Display ──

/**
 * aggregationMethod를 한국어 표시명으로 변환합니다.
 *
 * 'WEIGHTED_AVERAGE' → "가중 평균"
 * 'SUM' → "합계"
 */
export function getAggregationMethodLabel(method: 'WEIGHTED_AVERAGE' | 'SUM'): string {
  switch (method) {
    case 'WEIGHTED_AVERAGE': return '가중 평균';
    case 'SUM': return '합계';
  }
}

// ── Date Formatting ──

/**
 * YYYYMMDD → "YYYY-MM-DD" 또는 "YYYY년 MM월 DD일"
 */
export function formatDateKey(dateKey: string, format: 'iso' | 'korean' = 'iso'): string {
  if (dateKey.length !== 8) return dateKey;
  const year = dateKey.slice(0, 4);
  const month = dateKey.slice(4, 6);
  const day = dateKey.slice(6, 8);
  if (format === 'korean') {
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }
  return `${year}-${month}-${day}`;
}

/**
 * periodKey → 표시 문자열
 *
 * "20260202" → "2026-02-02 (일별)"
 * "2026-02" → "2026년 2월 (월별)"
 */
export function formatPeriodKey(periodKey: string, period: 'DAILY' | 'MONTHLY'): string {
  if (period === 'DAILY') {
    return `${formatDateKey(periodKey, 'iso')} (일별)`;
  }
  // MONTHLY: "YYYY-MM"
  const parts = periodKey.split('-');
  if (parts.length === 2) {
    const [year, month] = parts;
    return `${year}년 ${Number(month)}월 (월별)`;
  }
  return `${periodKey} (월별)`;
}

// ── Score Color Coding ──

/**
 * 점수에 따라 Tailwind 텍스트 색상 클래스를 반환합니다.
 *
 * score >= 100 → green
 * score >= 70  → yellow
 * score < 70   → red
 */
export function getScoreColor(score: number): string {
  if (score >= 100) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}
