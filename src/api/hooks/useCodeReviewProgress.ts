import { useQuery } from "@tanstack/react-query";
import { fetchCodeReviewProgress } from "@/api/dashboard";
import type {
  CodeReviewProgressResponse,
  CodeReviewProgressParams,
} from "@/types/codeReviewMetric";

// Query Keys
export const codeReviewProgressKeys = {
  all: ["codeReviewProgress"] as const,
  list: (params: CodeReviewProgressParams) =>
    [...codeReviewProgressKeys.all, "list", params] as const,
};

/**
 * 코드 리뷰 진행 현황 조회
 * @param {CodeReviewProgressParams} params - 조회 파라미터
 * @param {boolean} enabled - 쿼리 활성화 여부 (기본값: true)
 * @returns React Query 결과 객체
 */
export const useCodeReviewProgress = (
  params: CodeReviewProgressParams = {},
  enabled: boolean = true,
) => {
  return useQuery<CodeReviewProgressResponse, Error>({
    queryKey: codeReviewProgressKeys.list(params),
    queryFn: () => fetchCodeReviewProgress(params),
    enabled,
    staleTime: 2 * 60 * 1000, // 2분
  });
};
