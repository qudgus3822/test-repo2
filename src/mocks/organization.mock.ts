import type {
  OrganizationUnit,
  OrganizationCompareResponse,
} from "@/types/organization.types";

/**
 * 조직 비교 페이지 Mock 데이터
 * 이미지 참고하여 실제와 유사한 구조로 생성
 */

// IT부문 > 코어플랫폼개발실 > 자산플랫폼개발팀
const 자산플랫폼개발팀Members = [
  {
    id: "m1",
    name: "강준석",
    role: "팀장" as const,
    status: "재직" as const,
    email: "kjs79@company.com",
    joinDate: "2023.11.19",
    codeQuality: 87.9,
    reviewQuality: 87.9,
    developmentEfficiency: 84.9,
    bdpi: 85.9,
    changeRate: 4.1,
  },
  {
    id: "m2",
    name: "양기만",
    role: "책임" as const,
    email: "ykm87@company.com",
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
  },
  {
    id: "m3",
    name: "최유찬",
    role: "선임" as const,
    email: "cyc3@company.com",
    codeQuality: 86.9,
    reviewQuality: 86.9,
    developmentEfficiency: 85.9,
    bdpi: 84.9,
    changeRate: 4.4,
  },
  {
    id: "m4",
    name: "황동현",
    role: "주임" as const,
    email: "hdh75@company.com",
    codeQuality: 87.9,
    reviewQuality: 82.9,
    developmentEfficiency: 82.9,
    bdpi: 83.9,
    changeRate: 0.6,
  },
  {
    id: "m5",
    name: "김시현",
    role: "사원" as const,
    status: "입사" as const,
    email: "ksh54@company.com",
    joinDate: "2025.01.20",
    codeQuality: null,
    reviewQuality: null,
    developmentEfficiency: null,
    bdpi: null,
    changeRate: null,
  },
];

// IT부문 > 코어플랫폼개발실 > 공통플랫폼개발팀
const 공통플랫폼개발팀Members = [
  {
    id: "m6",
    name: "박승무",
    role: "팀장" as const,
    status: "재직" as const,
    email: "psm74@company.com",
    joinDate: "2023.11.19",
    codeQuality: 87.9,
    reviewQuality: 87.9,
    developmentEfficiency: 84.9,
    bdpi: 85.9,
    changeRate: 4.1,
  },
  {
    id: "m7",
    name: "강동현",
    role: "팀장" as const,
    status: "재직" as const,
    email: "kdh47@company.com",
    joinDate: "2025.11.25",
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
  },
  {
    id: "m8",
    name: "함현주",
    role: "책임" as const,
    email: "hhj47@company.com",
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
  },
  {
    id: "m9",
    name: "김지석",
    role: "책임" as const,
    email: "kjs47@company.com",
    codeQuality: 72.9,
    reviewQuality: 74.9,
    developmentEfficiency: 76.9,
    bdpi: 76.9,
    changeRate: 0.1,
  },
  {
    id: "m10",
    name: "박디온",
    role: "선임" as const,
    email: "pdo3@company.com",
    codeQuality: 86.9,
    reviewQuality: 86.9,
    developmentEfficiency: 85.9,
    bdpi: 84.9,
    changeRate: 4.4,
  },
  {
    id: "m11",
    name: "임준서",
    role: "과장" as const,
    status: "재직" as const,
    email: "ljs3@company.com",
    joinDate: "2025.11.19",
    codeQuality: 86.9,
    reviewQuality: 86.9,
    developmentEfficiency: 85.9,
    bdpi: 84.9,
    changeRate: 4.4,
  },
];

// IT부문 > 코어플랫폼개발실
const 코어플랫폼개발실: OrganizationUnit = {
  id: "org2",
  name: "코어플랫폼개발실",
  memberCount: 21,
  codeQuality: 85.2,
  reviewQuality: 82.5,
  developmentEfficiency: 84.1,
  bdpi: 83.9,
  changeRate: 2.8,
  isExpanded: true,
  children: [
    {
      id: "org2-1",
      name: "자산플랫폼개발팀",
      memberCount: 7,
      codeQuality: 86.1,
      reviewQuality: 83.4,
      developmentEfficiency: 85.2,
      bdpi: 84.9,
      changeRate: 2.9,
      isExpanded: true,
      members: 자산플랫폼개발팀Members,
    },
    {
      id: "org2-2",
      name: "공통플랫폼개발팀",
      memberCount: 7,
      codeQuality: 86.1,
      reviewQuality: 83.4,
      developmentEfficiency: 85.2,
      bdpi: 84.9,
      changeRate: 2.9,
      isExpanded: true,
      members: 공통플랫폼개발팀Members,
    },
    {
      id: "org2-3",
      name: "자산플랫폼개발팀",
      memberCount: 7,
      codeQuality: 86.1,
      reviewQuality: 83.4,
      developmentEfficiency: 85.2,
      bdpi: 84.9,
      changeRate: 2.9,
      isExpanded: false,
    },
  ],
  members: [
    {
      id: "m0",
      name: "강준석",
      role: "실장" as const,
      status: "재직" as const,
      email: "kjs999@company.com",
      joinDate: "2025.11.20",
      codeQuality: 87.9,
      reviewQuality: 87.9,
      developmentEfficiency: 84.9,
      bdpi: 85.9,
      changeRate: 4.1,
    },
  ],
};

// IT부문 > 규제기술실
const 규제기술실: OrganizationUnit = {
  id: "org3",
  name: "규제기술실",
  memberCount: 7,
  codeQuality: 68.5,
  reviewQuality: 70.8,
  developmentEfficiency: 69.3,
  bdpi: 69.5,
  changeRate: -1.5,
  isExpanded: false,
};

// IT부문
const IT부문: OrganizationUnit = {
  id: "org1",
  name: "IT부문",
  memberCount: 82,
  codeQuality: 80.3,
  reviewQuality: 78.7,
  developmentEfficiency: 79.6,
  bdpi: 79.5,
  changeRate: 1.8,
  isExpanded: true,
  children: [코어플랫폼개발실, 규제기술실],
};

// 조직 비교 Mock 응답
export const mockOrganizationCompare: OrganizationCompareResponse = {
  month: "2025-11",
  organizations: [IT부문],
};

// 전체 조직 목록 (flat)
export const mockOrganizationList: OrganizationUnit[] = [IT부문];
