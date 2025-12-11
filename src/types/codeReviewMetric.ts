// types/codeReview.ts

// 진행 상태 코드
export type ReviewStatus = "COMPLETED" | "NOT_COMPLETED";

// 상태 코드 → 라벨 매핑
export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  COMPLETED: "완료",
  NOT_COMPLETED: "미완료",
};

// 전행 항목 목록 데이터
export interface ReviewItem {
  date: string; // 날짜 (YYYY-MM-DD)
  mrId: string; // MR ID
  author: string; // 작성자
  mrApproval: number; // MR Approval 횟수
  reviewRequest: number; // 리뷰 요청 횟수
  reviewApproval: number; // 리뷰 승인 횟수
  mrReopen: number; // MR 재오픈 횟수
  status: ReviewStatus; // 상태
}

// 전체 응답 데이터
export interface CodeReviewData {
  totalMR: number; // 총 MR 건수
  inProgressCount: number; // 진행 중인 MR 수
  completedCount: number; // 완료된 MR 수
  inProgressPercentage: number; // 진행 중 비율
  completedPercentage: number; // 완료 비율
  items: ReviewItem[]; // 전행 항목 목록
  totalItems: number; // 전체 아이템 수
  currentPage: number; // 현재 페이지
  totalPages: number; // 전체 페이지 수
  itemsPerPage: number; // 페이지당 아이템 수
}
