import { apiGet } from "@/libs/fetch";
import type { TraceResult, TraceQuery } from "@/types/traceability.types";

/**
 * 역추적 데이터 조회
 *
 * IMPORTANT: `apiGet` accepts `RequestInit` as its second parameter (see src/libs/fetch/index.ts).
 * `RequestInit` has NO `params` property -- query parameters must be embedded in the URL string.
 * This follows the existing codebase convention (e.g., src/api/metrics.ts uses template literals).
 *
 * @param query - The trace query parameters
 * @param signal - Optional AbortSignal for cancellation (passed via RequestInit)
 */
export const fetchTraceability = async (
  query: TraceQuery,
  signal?: AbortSignal,
): Promise<TraceResult> => {
  const params = new URLSearchParams();
  params.set("metricName", query.metricName);
  params.set("periodKey", query.periodKey);
  params.set("aggregationLevel", query.aggregationLevel);
  if (query.employeeId) params.set("employeeId", query.employeeId);
  if (query.departmentCode) params.set("departmentCode", query.departmentCode);
  if (query.excludeMergeRequests) params.set("excludeMergeRequests", "true");
  return apiGet<TraceResult>(`/traceability?${params.toString()}`, { signal });
};
