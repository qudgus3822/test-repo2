import type {
  OrganizationData,
  Department,
  ChangeHistory,
} from "@/types/organization.types";

// 목업 조직도 데이터
export const mockOrganizationData: OrganizationData = {
  departments: [
    {
      id: "dept-1",
      name: "서비스BE개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 3,
      memberCount: 26,
      teams: [
        {
          id: "team-1-1",
          name: "개발팀",
          type: "개발",
          memberCount: 10,
          members: [
            {
              id: "member-1",
              name: "김보라",
              email: "v.s77@company.com",
              position: "팀장",
              status: "active",
            },
            {
              id: "member-2",
              name: "황소율",
              email: "hm82@company.com",
              position: "책임",
              isNew: true,
              joinDate: "2025.10.04",
              status: "active",
            },
            {
              id: "member-3",
              name: "임아인",
              email: "gjr6@company.com",
              position: "책임",
              status: "active",
            },
            {
              id: "member-4",
              name: "황동현",
              email: "bo51@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-5",
              name: "홍은서",
              email: "fll38@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-6",
              name: "서지우",
              email: "4ks77@company.com",
              position: "주임",
              role: "비개발",
              joinDate: "2025.10.10",
              leaveDate: "~",
              status: "active",
            },
            {
              id: "member-7",
              name: "최서윤",
              email: "csw@company.com",
              position: "사원",
              status: "active",
            },
          ],
        },
        {
          id: "team-1-2",
          name: "백오피스기획팀",
          type: "개발",
          memberCount: 7,
          members: [],
        },
        {
          id: "team-1-3",
          name: "규제 데이터팀",
          type: "개발",
          memberCount: 7,
          members: [],
        },
      ],
    },
    {
      id: "dept-2",
      name: "코어플랫폼개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 21,
      teams: [
        {
          id: "team-2-1",
          name: "플랫폼팀",
          type: "개발",
          memberCount: 12,
          members: [],
        },
        {
          id: "team-2-2",
          name: "인프라팀",
          type: "개발",
          memberCount: 9,
          members: [],
        },
      ],
    },
    {
      id: "dept-3",
      name: "모바일App개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 21,
      teams: [
        {
          id: "team-3-1",
          name: "iOS팀",
          type: "개발",
          memberCount: 10,
          members: [],
        },
        {
          id: "team-3-2",
          name: "Android팀",
          type: "개발",
          memberCount: 11,
          members: [],
        },
      ],
    },
    {
      id: "dept-4",
      name: "웹FE개발실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 2,
      memberCount: 18,
      teams: [
        {
          id: "team-4-1",
          name: "웹프론트팀",
          type: "개발",
          memberCount: 10,
          members: [],
        },
        {
          id: "team-4-2",
          name: "디자인시스템팀",
          type: "개발",
          memberCount: 8,
          members: [],
        },
      ],
    },
    {
      id: "dept-5",
      name: "규제기술실",
      type: "개발실",
      leader: "윤수연 실장",
      teamCount: 1,
      memberCount: 21,
      teams: [
        {
          id: "team-5-1",
          name: "개발팀",
          type: "개발",
          memberCount: 21,
          members: [
            {
              id: "member-8",
              name: "김보라",
              email: "v.s77@company.com",
              position: "팀장",
              status: "active",
            },
            {
              id: "member-9",
              name: "황소율",
              email: "hm82@company.com",
              position: "책임",
              isNew: true,
              joinDate: "2025.10.04",
              status: "active",
            },
            {
              id: "member-10",
              name: "임아인",
              email: "gjr6@company.com",
              position: "책임",
              status: "active",
            },
            {
              id: "member-11",
              name: "황동현",
              email: "bo51@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-12",
              name: "홍은서",
              email: "fll38@company.com",
              position: "선임",
              status: "active",
            },
            {
              id: "member-13",
              name: "서지우",
              email: "4ks77@company.com",
              position: "주임",
              role: "비개발",
              joinDate: "2025.10.10",
              leaveDate: "~",
              status: "active",
            },
            {
              id: "member-14",
              name: "최서윤",
              email: "csw@company.com",
              position: "사원",
              status: "active",
            },
          ],
        },
      ],
    },
  ],
  totalDepartments: 9,
  totalTeams: 17,
  totalMembers: 127,
  lastSyncDate: "2025.11.21 02:00",
  syncSource: "LDAP AD기준",
};

// 변경 이력 목업 데이터
export const mockChangeHistory: ChangeHistory[] = [];

// 헬퍼 함수: 부서 찾기
export const findDepartmentById = (id: string): Department | undefined => {
  return mockOrganizationData.departments.find((dept) => dept.id === id);
};

// 헬퍼 함수: 팀 찾기
export const findTeamById = (
  departmentId: string,
  teamId: string,
) => {
  const department = findDepartmentById(departmentId);
  return department?.teams.find((team) => team.id === teamId);
};
