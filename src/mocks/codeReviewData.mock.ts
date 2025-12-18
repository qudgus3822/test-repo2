import type {
  CodeReviewProgressResponse,
  ReviewItem,
  ReviewerInfo,
  ReviewStatus,
} from "@/types/codeReviewMetric";

// 다양한 작성자 목록
const authorsData = [
  {
    username: "moco.minjun",
    name: "김민준",
    email: "moco.minjun@moco.lv",
    team: "개발1팀",
  },
  {
    username: "moco.seojun",
    name: "이서준",
    email: "moco.seojun@moco.lv",
    team: "개발1팀",
  },
  {
    username: "moco.doyun",
    name: "박도윤",
    email: "moco.doyun@moco.lv",
    team: "개발2팀",
  },
  {
    username: "moco.seoyeon",
    name: "최서연",
    email: "moco.seoyeon@moco.lv",
    team: "QA팀",
  },
  {
    username: "moco.yejun",
    name: "정예준",
    email: "moco.yejun@moco.lv",
    team: "개발1팀",
  },
  {
    username: "moco.jiwoo",
    name: "강지우",
    email: "moco.jiwoo@moco.lv",
    team: "개발3팀",
  },
  {
    username: "moco.seohyun",
    name: "조서현",
    email: "moco.seohyun@moco.lv",
    team: "개발1팀",
  },
  {
    username: "moco.hajun",
    name: "윤하준",
    email: "moco.hajun@moco.lv",
    team: "개발2팀",
  },
  {
    username: "moco.jimin",
    name: "장지민",
    email: "moco.jimin@moco.lv",
    team: "QA팀",
  },
  {
    username: "moco.seojin",
    name: "임서진",
    email: "moco.seojin@moco.lv",
    team: "개발3팀",
  },
];

// 랜덤 리뷰어 목록 생성 함수
function generateRandomReviewerList(count: number): ReviewerInfo[] {
  if (count === 0) return [];
  const shuffled = [...authorsData].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, count)
    .map((a) => ({ username: a.username, name: a.name, team: a.team }));
}

// 랜덤 데이터 생성 함수
export function generateRandomReviewItem(index: number): ReviewItem {
  const randomAuthor =
    authorsData[Math.floor(Math.random() * authorsData.length)];
  const statuses: ReviewStatus[] = ["completed", "incomplete"];
  const randomStatus: ReviewStatus =
    statuses[Math.floor(Math.random() * statuses.length)];

  const registeredReviewerCount = Math.floor(Math.random() * 3) + 1;
  const actualReviewerCount = Math.floor(Math.random() * 3);
  const contributorCount = Math.floor(Math.random() * 3) + 1;

  return {
    collectedAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    mrId: 1000 + index,
    mrAuthor: { name: randomAuthor.name, email: randomAuthor.email },
    registeredReviewerCount,
    registeredReviewers: generateRandomReviewerList(registeredReviewerCount),
    actualReviewerCount,
    actualReviewers: generateRandomReviewerList(actualReviewerCount),
    contributorCount,
    contributors: generateRandomReviewerList(contributorCount),
    status: randomStatus,
  };
}

// 대량 목업 데이터 생성
export function generateMockReviewData(
  totalItems: number = 40,
  page: number = 1,
  limit: number = 15,
): CodeReviewProgressResponse {
  const items: ReviewItem[] = [];

  for (let i = 0; i < totalItems; i++) {
    items.push(generateRandomReviewItem(i));
  }

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;
  const incompleteCount = items.filter(
    (item) => item.status === "incomplete",
  ).length;

  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return {
    summary: {
      totalMrCount: totalItems,
      completedCount,
      completedRate: Number(((completedCount / totalItems) * 100).toFixed(1)),
      incompleteCount,
      incompleteRate: Number(((incompleteCount / totalItems) * 100).toFixed(1)),
    },
    items: paginatedItems,
    pagination: {
      page,
      limit,
      totalCount: totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

// 기본 목업 데이터
export const mockCodeReviewProgressData: CodeReviewProgressResponse =
  generateMockReviewData();
