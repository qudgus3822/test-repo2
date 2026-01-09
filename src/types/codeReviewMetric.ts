// types/codeReviewMetric.ts

// 진행 상태 코드 (API 응답 기준)
export type ReviewStatus = "completed" | "incomplete";

// 상태 코드 → 라벨 매핑
export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  completed: "완료",
  incomplete: "미완료",
};

// 리뷰어/참여자/기여자 상세 정보
export interface ReviewerInfo {
  username: string; // 사용자 ID
  name: string; // 이름
  team: string; // 소속팀
}

// MR 작성자 정보
export interface MrAuthorInfo {
  name: string; // 이름
  email: string; // 이메일
}

// 리뷰 항목 데이터 (API 응답 기준)
export interface ReviewItem {
  collectedAt: string; // 수집일자 (ISO 8601)
  mrId: number; // MR ID
  mrAuthor: MrAuthorInfo; // MR 작성자
  registeredReviewerCount: number; // 등록된 리뷰어 수
  registeredReviewers: ReviewerInfo[]; // 등록된 리뷰어 목록
  actualReviewerCount: number; // 실리뷰 참여자 수
  actualReviewers: ReviewerInfo[]; // 실리뷰 참여자 목록
  contributorCount: number; // MR 기여자 수
  contributors: ReviewerInfo[]; // MR 기여자 목록
  status: ReviewStatus; // 상태
  rawDataUrl: string; // 원시 데이터 URL
}

// 리뷰 상태별 breakdown 데이터
export interface ReviewBreakdown {
  singleContributor: number; // MR 기여자 1명
  multipleContributors: number; // MR 기여자 2명 이상
}

// 리뷰 상태별 상세 데이터
export interface ReviewStatusDetail {
  count: number; // 건수
  rate: number; // 비율
  breakdown: ReviewBreakdown; // 기여자별 breakdown
}

// Summary 데이터
export interface CodeReviewSummary {
  totalMrCount: number; // 총 MR 건수
  completed: ReviewStatusDetail; // 완료 상세
  incomplete: ReviewStatusDetail; // 미완료 상세
}

// Pagination 데이터
export interface CodeReviewPagination {
  page: number; // 현재 페이지
  limit: number; // 페이지당 아이템 수
  totalCount: number; // 전체 아이템 수
  totalPages: number; // 전체 페이지 수
}

// 전체 API 응답 데이터
export interface CodeReviewProgressResponse {
  summary: CodeReviewSummary;
  items: ReviewItem[];
  pagination: CodeReviewPagination;
}

// 정렬 가능한 컬럼 타입
export type CodeReviewSortBy =
  | "collectedAt"
  | "mrId"
  | "registeredReviewerCount"
  | "actualReviewerCount"
  | "contributorCount"
  | "status";

// API 요청 파라미터
export interface CodeReviewProgressParams {
  yearMonth?: string; // YYYY-MM 형식 (예: 2025-12)
  page?: number;
  limit?: number;
  sortBy?: CodeReviewSortBy;
  sortOrder?: "asc" | "desc";
}
