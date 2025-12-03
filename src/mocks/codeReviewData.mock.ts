import type {
  CodeReviewData,
  ReviewItem,
  ReviewStatus,
} from "@/types/codeReviewMetric";

// mocks/codeReviewMockData.ts

export const mockCodeReviewData: CodeReviewData = {
  totalMR: 156,
  inProgressCount: 48,
  completedCount: 108,
  inProgressPercentage: 30.8,
  completedPercentage: 69.2,
  currentPage: 1,
  totalPages: 8,
  itemsPerPage: 15,
  totalItems: 156,
  items: [
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12344",
      author: "이서준",
      mrApproval: 1,
      reviewRequest: 0,
      reviewApproval: 1,
      mrReopen: 1,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12344",
      author: "이서준",
      mrApproval: 1,
      reviewRequest: 0,
      reviewApproval: 1,
      mrReopen: 1,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
    {
      date: "2025-11-10",
      mrId: "I12345",
      author: "김민준",
      mrApproval: 2,
      reviewRequest: 2,
      reviewApproval: 2,
      mrReopen: 2,
      status: "진행",
    },
  ],
};

// 다양한 작성자 목록
const authors = [
  "김민준",
  "이서준",
  "박도윤",
  "최서연",
  "정예준",
  "강지우",
  "조서현",
  "윤하준",
  "장지민",
  "임서진",
];

// 랜덤 데이터 생성 함수
export function generateRandomReviewItem(index: number): ReviewItem {
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
  const randomStatus: ReviewStatus = Math.random() > 0.3 ? "진행" : "완료";

  return {
    date: "2025-11-10",
    mrId: `I${12340 + index}`,
    author: randomAuthor,
    mrApproval: Math.floor(Math.random() * 3) + 1,
    reviewRequest: Math.floor(Math.random() * 3),
    reviewApproval: Math.floor(Math.random() * 3) + 1,
    mrReopen: Math.floor(Math.random() * 3) + 1,
    status: randomStatus,
  };
}

// 대량 목업 데이터 생성
export function generateMockReviewData(
  totalItems: number = 156,
): CodeReviewData {
  const items: ReviewItem[] = [];

  for (let i = 0; i < totalItems; i++) {
    items.push(generateRandomReviewItem(i));
  }

  const inProgressCount = items.filter((item) => item.status === "진행").length;
  const completedCount = items.filter((item) => item.status === "완료").length;

  return {
    totalMR: totalItems,
    inProgressCount,
    completedCount,
    inProgressPercentage: Number(
      ((inProgressCount / totalItems) * 100).toFixed(1),
    ),
    completedPercentage: Number(
      ((completedCount / totalItems) * 100).toFixed(1),
    ),
    currentPage: 1,
    totalPages: Math.ceil(totalItems / 15),
    itemsPerPage: 15,
    totalItems,
    items,
  };
}
