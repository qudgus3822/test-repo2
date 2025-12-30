/**
 * 조직비교 전체 지표 Mock 데이터
 * - 30개 지표 + BDPI 포함
 * - 백엔드 API 개발 완료 전 테스트용
 * - type: "member" 개인 데이터 포함
 */

import type {
  OrganizationCompareResponse,
  OrganizationMember,
  MemberRole,
  MemberPosition,
} from "@/types/organization.types";
import { METRIC_CODE_ORDER } from "@/utils/metrics";

// 30개 지표 코드 목록
const ALL_METRIC_CODES = Object.keys(METRIC_CODE_ORDER);

// 랜덤 점수 생성 (0-150 범위, 대부분 50-120 사이)
const generateRandomScore = (): number | null => {
  // 20% 확률로 null 반환
  if (Math.random() < 0.2) return null;
  const base = Math.random() * 100 + 25; // 25-125
  return Math.min(150, Math.max(0, Math.round(base * 10) / 10));
};

// 랜덤 값 생성 (지표에 따라 다른 범위)
const generateRandomValue = (code: string): number | null => {
  // score가 null이면 value도 null
  if (Math.random() < 0.2) return null;

  // 퍼센트 지표
  if (
    code.includes("RATE") ||
    code.includes("COVERAGE") ||
    code.includes("DUPLICATION")
  ) {
    return Math.round(Math.random() * 1000) / 10; // 0-100%
  }
  // 시간 지표
  if (code.includes("TIME") || code.includes("SPEED")) {
    return Math.round(Math.random() * 500 * 10) / 10; // 0-500
  }
  // 카운트 지표
  if (code.includes("COUNT") || code.includes("FREQUENCY")) {
    return Math.round(Math.random() * 30 * 10) / 10;
  }
  // 기본
  return Math.round(Math.random() * 100 * 10) / 10;
};

// 지표 단위 반환
const getMetricUnit = (code: string): string => {
  if (code.includes("RATE") || code.includes("COVERAGE")) return "%";
  if (code.includes("TIME")) return "시간";
  if (code.includes("SIZE") || code.includes("LOC")) return "라인";
  if (code.includes("FREQUENCY") || code.includes("COUNT")) return "회";
  return "";
};

// 단일 조직/개인의 30개 지표 생성
const generateMetrics = (isUsedDefault = true) => {
  const metrics: Record<
    string,
    { score: number | null; isUsed: boolean; value?: number | null; unit?: string }
  > = {};

  ALL_METRIC_CODES.forEach((code) => {
    const score = generateRandomScore();
    const value = score !== null ? generateRandomValue(code) : null;
    const isUsed = isUsedDefault ? Math.random() > 0.1 : Math.random() > 0.3;

    metrics[code] = {
      score: isUsed ? score : null,
      isUsed,
      ...(value !== null && { value, unit: getMetricUnit(code) }),
    };
  });

  // BDPI 추가
  const validScores = Object.values(metrics).filter(
    (m) => m.score !== null && m.isUsed
  );
  const bdpiScore =
    validScores.length > 0
      ? validScores.reduce((sum, m) => sum + (m.score ?? 0), 0) / validScores.length
      : null;

  return {
    ...metrics,
    bdpi: {
      score: bdpiScore !== null ? Math.round(bdpiScore) : null,
      isUsed: true,
      value: bdpiScore !== null ? Math.round(bdpiScore) : null,
    },
  };
};

// Mock 멤버 생성
const createMember = (
  name: string,
  employeeID: string,
  title: MemberRole,
  personalTitle: MemberPosition,
  dept: { code: string; name: string; level: number },
  division: { code: string; name: string },
  isEvaluationTarget = true
): OrganizationMember => ({
  type: "member",
  name,
  employeeID,
  title,
  personalTitle,
  departmentCode: dept.code,
  departmentName: dept.name,
  teamCode: dept.level === 3 ? dept.code : undefined,
  teamName: dept.level === 3 ? dept.name : undefined,
  divisionCode: division.code,
  divisionName: division.name,
  level: dept.level + 1,
  isEvaluationTarget,
  isManager: personalTitle === "TEAM_LEADER" || personalTitle === "DEPARTMENT_HEAD",
  status: "ACTIVE",
  metrics: generateMetrics(isEvaluationTarget) as never,
});

// Mock 조직 트리 데이터 생성
export const generateMockOrganizationMetricsData = (
  yearMonth: string
): OrganizationCompareResponse => {
  const [year, month] = yearMonth.split("-").map(Number);

  return {
    period: { year, month },
    lastLdapSyncAt: new Date().toISOString(),
    lastChangeAt: new Date().toISOString(),
    tree: [
      {
        type: "department",
        name: "IT부문",
        code: "IT01",
        level: 1,
        displayName: "IT부문[IT01]",
        sortOrder: 1,
        isEvaluationTarget: true,
        deptStatus: "ACTIVE",
        existedDays: 30,
        memberCount: 150,
        metrics: generateMetrics() as never,
        children: [
          // 개발1실
          {
            type: "department",
            name: "개발1실",
            code: "IT0101",
            level: 2,
            displayName: "개발1실[IT0101]",
            parentCode: "IT01",
            sortOrder: 1,
            isEvaluationTarget: true,
            deptStatus: "ACTIVE",
            existedDays: 30,
            memberCount: 45,
            metrics: generateMetrics() as never,
            children: [
              // 자산플랫폼개발팀
              {
                type: "department",
                name: "자산플랫폼개발팀",
                code: "IT010101",
                level: 3,
                displayName: "자산플랫폼개발팀[IT010101]",
                parentCode: "IT0101",
                sortOrder: 1,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 7,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "김민준",
                    "dev.minjun",
                    "DEPUTY_MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010101", name: "자산플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "이서연",
                    "dev.seoyeon",
                    "MANAGER",
                    "",
                    { code: "IT010101", name: "자산플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "박지호",
                    "dev.jiho",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010101", name: "자산플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "최유진",
                    "dev.yujin",
                    "STAFF",
                    "",
                    { code: "IT010101", name: "자산플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                ],
              },
              // 거래플랫폼개발팀
              {
                type: "department",
                name: "거래플랫폼개발팀",
                code: "IT010102",
                level: 3,
                displayName: "거래플랫폼개발팀[IT010102]",
                parentCode: "IT0101",
                sortOrder: 2,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 7,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "정하준",
                    "dev.hajun",
                    "MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010102", name: "거래플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "강수아",
                    "dev.sua",
                    "MANAGER",
                    "",
                    { code: "IT010102", name: "거래플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "윤도윤",
                    "dev.doyun",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010102", name: "거래플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                ],
              },
              // 공통플랫폼개발팀
              {
                type: "department",
                name: "공통플랫폼개발팀",
                code: "IT010103",
                level: 3,
                displayName: "공통플랫폼개발팀[IT010103]",
                parentCode: "IT0101",
                sortOrder: 3,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 7,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "임서준",
                    "dev.seojun",
                    "DEPUTY_MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010103", name: "공통플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "한예은",
                    "dev.yeeun",
                    "MANAGER",
                    "",
                    { code: "IT010103", name: "공통플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                  createMember(
                    "오시우",
                    "dev.siu",
                    "STAFF",
                    "",
                    { code: "IT010103", name: "공통플랫폼개발팀", level: 3 },
                    { code: "IT0101", name: "개발1실" }
                  ),
                ],
              },
              // 실장 (실 직속)
              createMember(
                "송현우",
                "dev.hyunwoo",
                "GENERAL_MANAGER",
                "DEPARTMENT_HEAD",
                { code: "IT0101", name: "개발1실", level: 2 },
                { code: "IT0101", name: "개발1실" }
              ),
            ],
          },
          // 개발2실
          {
            type: "department",
            name: "개발2실",
            code: "IT0102",
            level: 2,
            displayName: "개발2실[IT0102]",
            parentCode: "IT01",
            sortOrder: 2,
            isEvaluationTarget: true,
            deptStatus: "ACTIVE",
            existedDays: 30,
            memberCount: 52,
            metrics: generateMetrics() as never,
            children: [
              // 규제개발팀
              {
                type: "department",
                name: "규제개발팀",
                code: "IT010201",
                level: 3,
                displayName: "규제개발팀[IT010201]",
                parentCode: "IT0102",
                sortOrder: 1,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 7,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "배준서",
                    "dev.junseo",
                    "MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010201", name: "규제개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "조아린",
                    "dev.arin",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010201", name: "규제개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "신지안",
                    "dev.jian",
                    "STAFF",
                    "",
                    { code: "IT010201", name: "규제개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                ],
              },
              // 금융상품개발팀
              {
                type: "department",
                name: "금융상품개발팀",
                code: "IT010202",
                level: 3,
                displayName: "금융상품개발팀[IT010202]",
                parentCode: "IT0102",
                sortOrder: 2,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 10,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "권민서",
                    "dev.minseo",
                    "DEPUTY_MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010202", name: "금융상품개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "유하은",
                    "dev.haeun",
                    "MANAGER",
                    "",
                    { code: "IT010202", name: "금융상품개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "남지훈",
                    "dev.jihun",
                    "MANAGER",
                    "",
                    { code: "IT010202", name: "금융상품개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "전소율",
                    "dev.soyul",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010202", name: "금융상품개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                ],
              },
              // 회원인증개발팀
              {
                type: "department",
                name: "회원인증개발팀",
                code: "IT010203",
                level: 3,
                displayName: "회원인증개발팀[IT010203]",
                parentCode: "IT0102",
                sortOrder: 3,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 8,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "황예준",
                    "dev.yejun",
                    "MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010203", name: "회원인증개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "안서윤",
                    "dev.seoyun",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010203", name: "회원인증개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                  createMember(
                    "문태현",
                    "dev.taehyun",
                    "STAFF",
                    "",
                    { code: "IT010203", name: "회원인증개발팀", level: 3 },
                    { code: "IT0102", name: "개발2실" }
                  ),
                ],
              },
              // 실장 (실 직속)
              createMember(
                "양지원",
                "dev.jiwon",
                "GENERAL_MANAGER",
                "DEPARTMENT_HEAD",
                { code: "IT0102", name: "개발2실", level: 2 },
                { code: "IT0102", name: "개발2실" }
              ),
            ],
          },
          // 개발3실
          {
            type: "department",
            name: "개발3실",
            code: "IT0103",
            level: 2,
            displayName: "개발3실[IT0103]",
            parentCode: "IT01",
            sortOrder: 3,
            isEvaluationTarget: true,
            deptStatus: "ACTIVE",
            existedDays: 30,
            memberCount: 53,
            metrics: generateMetrics() as never,
            children: [
              // 데이터플랫폼개발팀
              {
                type: "department",
                name: "데이터플랫폼개발팀",
                code: "IT010301",
                level: 3,
                displayName: "데이터플랫폼개발팀[IT010301]",
                parentCode: "IT0103",
                sortOrder: 1,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 9,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "서예린",
                    "dev.yerin2",
                    "DEPUTY_MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010301", name: "데이터플랫폼개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "고민재",
                    "dev.minjae2",
                    "MANAGER",
                    "",
                    { code: "IT010301", name: "데이터플랫폼개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "백수진",
                    "dev.sujin",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010301", name: "데이터플랫폼개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "차윤호",
                    "dev.yunho",
                    "STAFF",
                    "",
                    { code: "IT010301", name: "데이터플랫폼개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                ],
              },
              // AI개발팀
              {
                type: "department",
                name: "AI개발팀",
                code: "IT010302",
                level: 3,
                displayName: "AI개발팀[IT010302]",
                parentCode: "IT0103",
                sortOrder: 2,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 8,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "노하린",
                    "dev.harin",
                    "MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010302", name: "AI개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "하지민",
                    "dev.jimin",
                    "MANAGER",
                    "",
                    { code: "IT010302", name: "AI개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "방승현",
                    "dev.seunghyun",
                    "ASSISTANT_MANAGER",
                    "",
                    { code: "IT010302", name: "AI개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                ],
              },
              // 인프라개발팀
              {
                type: "department",
                name: "인프라개발팀",
                code: "IT010303",
                level: 3,
                displayName: "인프라개발팀[IT010303]",
                parentCode: "IT0103",
                sortOrder: 3,
                isEvaluationTarget: true,
                deptStatus: "ACTIVE",
                existedDays: 30,
                memberCount: 7,
                metrics: generateMetrics() as never,
                children: [
                  createMember(
                    "추다은",
                    "dev.daeun",
                    "DEPUTY_MANAGER",
                    "TEAM_LEADER",
                    { code: "IT010303", name: "인프라개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "탁우진",
                    "dev.woojin",
                    "MANAGER",
                    "",
                    { code: "IT010303", name: "인프라개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                  createMember(
                    "류채원",
                    "dev.chaewon",
                    "STAFF",
                    "",
                    { code: "IT010303", name: "인프라개발팀", level: 3 },
                    { code: "IT0103", name: "개발3실" }
                  ),
                ],
              },
              // 실장 (실 직속)
              createMember(
                "엄태민",
                "dev.taemin",
                "GENERAL_MANAGER",
                "DEPARTMENT_HEAD",
                { code: "IT0103", name: "개발3실", level: 2 },
                { code: "IT0103", name: "개발3실" }
              ),
            ],
          },
        ],
      },
    ],
  };
};

// Mock 데이터 사용 여부 (개발 환경에서만 true)
export const USE_MOCK_METRICS = true;
