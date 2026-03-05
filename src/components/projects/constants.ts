/**
 * 프로젝트/운영 테이블 공통 상수
 */

// 단위 상수
export const UNIT_COUNT = "개";
export const UNIT_CASE = "건";
export const NULL_DISPLAY = "--";

// 공통 테이블 헤더 설정
export const COMMON_HEADERS = {
  epicName: { label: ["에픽명"] },
  activeTicketCount: {
    label: ["활성", "티켓 수"],
    tooltip: "해당 월에 업데이트, 완료 혹은 생성 된 티켓의 수",
  },
  updatedCount: {
    label: ["업데이트", "수"], 
    tooltip: "해당 월에 업데이트 된 티켓의 수. (생성과 완료는 제외)",
  },
  completedCount: {
    label: ["완료", "티켓 수"],

    tooltip: "해당 월에 완료된 티켓의 수",
  },
  createdCount: {
    label: ["생성", "티켓 수"],
    tooltip: "해당 월에 생성된 티켓의 수",
  },
  createdAt: {
    label: ["생성", "일자"],
    tooltip: "해당 에픽 생성일",
  },
} as const;