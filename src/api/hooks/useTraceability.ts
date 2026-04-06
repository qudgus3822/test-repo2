import { useQuery } from "@tanstack/react-query";
import { fetchTraceability } from "@/api/traceability";
import { traceabilityKeys } from "./traceabilityKeys";
import type { TraceResult, TraceQuery } from "@/types/traceability.types";

export { traceabilityKeys } from "./traceabilityKeys";

// ── Base Hooks ──

/**
 * 역추적 데이터 조회 Hook
 * @param query - 조회 파라미터
 * @param enabled - 쿼리 활성화 여부 (기본값: true)
 */
export const useTraceability = (query: TraceQuery, enabled: boolean = true) => {
  return useQuery<TraceResult, Error>({
    queryKey: traceabilityKeys.byQuery(query),
    queryFn: () => fetchTraceability(query),
    enabled: enabled && !!query.metricName && !!query.periodKey,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * COMPANY shallow 응답에서 개별 DIVISION 상세 조회 Hook.
 * useSequentialDivisionLoader에 의해 제어됩니다.
 */
export const useDivisionTrace = (
  metricName: string,
  periodKey: string,
  departmentCode: string,
  enabled: boolean = false,
) => {
  const query: TraceQuery = {
    metricName,
    periodKey,
    aggregationLevel: "DIVISION",
    departmentCode,
  };

  return useQuery<TraceResult, Error>({
    queryKey: traceabilityKeys.byQuery(query),
    queryFn: () => fetchTraceability(query),
    enabled: enabled && !!departmentCode,
    staleTime: 5 * 60 * 1000, // 5분 (drill-down 데이터는 더 오래 캐시)
    retry: 1, // Division 상세는 무거운 쿼리이므로 기본 3회 대신 1회만 재시도
  });
};

// ── Sequential Division Loader (re-exported for backward compatibility) ──
export type { DivisionLoadState, DivisionLoadStatus } from "./useSequentialDivisionLoader";
export { useSequentialDivisionLoader } from "./useSequentialDivisionLoader";
