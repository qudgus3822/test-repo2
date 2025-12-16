import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrgTypeBadge } from "@/components/ui/OrgTypeBadge";
import { ChangeTypeBadge } from "@/components/ui/ChangeTypeBadge";
import {
  ChevronRight,
  Users,
  Clock,
  History,
  Settings,
  User,
  Building2,
} from "lucide-react";
import type {
  OrganizationDepartment,
  OrganizationMember,
  OrganizationNode,
  OrgHistoryItem,
} from "@/types/organization.types";
import {
  MemberRoleLabel,
  MemberPositionLabel,
} from "@/types/organization.types";
import { formatDisplayDateTime } from "@/utils/date";
import {
  getMemberEmail,
  getChangeDetailWithSuffix,
} from "@/utils/organization";
import { OrganizationTypeSettingModal } from "./OrganizationTypeSettingModal";
import { OrganizationHistoryModal } from "./OrganizationHistoryModal";
import {
  useOrganizationTreeBasic,
  useOrgChangeHistory,
} from "@/api/hooks/useOrganizationTree";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSettingsStore } from "@/store/useSettingsStore";

// 실장/팀장 찾기 헬퍼 함수
const findLeader = (children?: OrganizationNode[]): string => {
  if (!children) return "";
  const leader = children.find(
    (child): child is OrganizationMember =>
      child.type === "member" && child.isManager,
  );
  if (leader) {
    const position = leader.personalTitle
      ? MemberPositionLabel[leader.personalTitle]
      : "";
    return `${leader.name} ${position}`;
  }
  return "";
};

// 변경 유형 배지 컴포넌트 (GROUP, POLICY 카테고리만 표시)
const ChangesBadgeGroup = ({
  changes,
}: {
  changes?: { changeType: string; category: string }[];
}) => {
  if (!changes || changes.length === 0) return null;

  // GROUP, POLICY 카테고리만 필터링
  const filteredChanges = changes.filter(
    (c) => c.category === "GROUP" || c.category === "POLICY",
  );

  if (filteredChanges.length === 0) return null;

  return (
    <span className="flex items-center gap-1">
      {filteredChanges.map((change, index) => (
        <ChangeTypeBadge
          key={`${change.category}-${change.changeType}-${index}`}
          type={change.changeType}
          fixedWidth
        />
      ))}
    </span>
  );
};

// 실 목록 컴포넌트
const DepartmentList = ({
  departments,
  selectedCode,
  onSelect,
}: {
  departments: OrganizationDepartment[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">실 목록</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {departments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            조직 데이터가 없습니다
          </div>
        ) : (
          departments.map((dept) => {
            const leader = findLeader(dept.children);
            return (
              <div
                key={dept.code}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedCode === dept.code
                    ? "bg-blue-50 border-l-blue-500"
                    : "border-l-transparent"
                }`}
                onClick={() => onSelect(dept.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <OrgTypeBadge
                        isEvaluationTarget={dept.isEvaluationTarget}
                        fixedWidth
                      />
                      <span className="font-medium text-gray-900 text-sm">
                        {dept.name}
                      </span>
                      <ChangesBadgeGroup changes={dept.changes} />
                    </div>
                    <p className="text-xs text-gray-500">{leader}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {dept.memberCount}명
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

// 팀 목록 컴포넌트
const TeamList = ({
  teams,
  selectedCode,
  onSelect,
  isDepartmentSelected,
}: {
  teams: OrganizationDepartment[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  isDepartmentSelected: boolean;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">팀 목록</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {teams.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {isDepartmentSelected
              ? "해당 실에 팀 정보가 없습니다."
              : "실을 선택하면 팀 목록이 표시됩니다."}
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.code}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-4 ${
                selectedCode === team.code
                  ? "bg-orange-50 border-l-orange-400"
                  : "border-l-transparent"
              }`}
              onClick={() => onSelect(team.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <OrgTypeBadge
                    isEvaluationTarget={team.isEvaluationTarget}
                    fixedWidth
                  />
                  <span className="font-medium text-gray-900 text-sm">
                    {team.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {team.memberCount}명
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

// 멤버 목록 컴포넌트
const MemberList = ({
  members,
  isTeamSelected,
}: {
  members: OrganizationMember[];
  isTeamSelected: boolean;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">개인 목록</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {isTeamSelected
              ? "해당 팀 내 개인 정보가 없습니다."
              : "팀을 선택하면 개인 목록이 표시됩니다."}
          </div>
        ) : (
          members.map((member) => {
            const roleLabel = MemberRoleLabel[member.title] || member.title;

            return (
              <div
                key={member.employeeID}
                className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* 프로필 아바타 */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  {/* 멤버 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {member.name}
                      </span>
                      <span className="text-gray-500 text-sm">{roleLabel}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {member.email || getMemberEmail(member.employeeID)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

// 변경 이력 컴포넌트
const ChangeHistorySection = ({ yearMonth }: { yearMonth: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useOrgChangeHistory(yearMonth);

  // GROUP, POLICY 카테고리만 필터링
  const filteredData = useMemo<OrgHistoryItem[]>(() => {
    if (!data?.changes) return [];
    return data.changes.filter(
      (item) => item.category === "GROUP" || item.category === "POLICY",
    );
  }, [data]);

  return (
    <Card padding="sm" className="mt-4">
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <span className="font-medium text-gray-700 text-sm">
          실/팀 변경 이력
        </span>
      </div>
      {isExpanded && (
        <div className="mt-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : filteredData.length === 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-500 pl-2">
              <li>변경 이력이 없습니다.</li>
            </ul>
          ) : (
            <ul className="space-y-1.5 pl-2 max-h-[139px] overflow-y-auto">
              {filteredData.map((item, index) => (
                <li
                  key={`${item.changeDate}-${index}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-[1%] text-gray-400">•</span>
                  <span className="w-[11%] text-gray-600">
                    {formatDisplayDateTime(item.changeDate)}
                  </span>
                  <span className="w-[1%] text-gray-400">|</span>
                  <span
                    className={`w-[11%] truncate ${
                      item.processedBy && item.processedBy !== "자동(LDAP)"
                        ? "text-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                    title={item.processedBy}
                  >
                    {item.processedBy || "-"}
                  </span>
                  <span className="w-[6%]">
                    <ChangeTypeBadge type={item.changeType} fixedWidth />
                  </span>
                  <span className="w-[6%]">
                    <OrgTypeBadge
                      isEvaluationTarget={item.isEvaluationTarget}
                      fixedWidth
                    />
                  </span>
                  <span
                    className="w-[14%] text-gray-700 truncate"
                    title={item.name || "-"}
                  >
                    {item.name || "-"}
                  </span>
                  <span
                    className="w-[25%] text-gray-700 truncate"
                    title={getChangeDetailWithSuffix(
                      item.changeDetail,
                      item.category,
                      item.changeType,
                    )}
                  >
                    {getChangeDetailWithSuffix(
                      item.changeDetail,
                      item.category,
                      item.changeType,
                    )}
                  </span>
                  <span className="w-[10%]"></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};

// 현재 월 가져오기 (YYYY-MM 형식)
const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// 메인 조직도 관리 컴포넌트
export const OrganizationManagement = () => {
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState<
    string | null
  >(null);
  const [selectedTeamCode, setSelectedTeamCode] = useState<string | null>(null);
  const [isAutoSyncEnabled] = useState(true);
  const [isOrgTypeModalOpen, setIsOrgTypeModalOpen] = useState(false);
  const { openOrgHistoryModal } = useSettingsStore();

  // API에서 조직 데이터 조회 (현재 월 기준, 기본 tree 엔드포인트)
  const yearMonth = getCurrentYearMonth();
  const {
    data: organizationData,
    isLoading,
    error,
  } = useOrganizationTreeBasic(yearMonth);

  // API 에러 시 confirm 메시지 표시
  useEffect(() => {
    if (error) {
      window.confirm("현재 서버에 해당 API가 없습니다.");
    }
  }, [error]);

  // 조직 트리에서 Level 2 (실) 목록 추출
  const departments = useMemo<OrganizationDepartment[]>(() => {
    if (!organizationData?.tree) return [];

    const level2Depts: OrganizationDepartment[] = [];

    // Level 1 (부문)에서 Level 2 (실) 추출
    for (const level1 of organizationData.tree) {
      if (level1.children) {
        for (const child of level1.children) {
          if (child.type === "department" && child.level === 2) {
            level2Depts.push(child);
          }
        }
      }
    }

    return level2Depts.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [organizationData]);

  // 선택된 부서 (실)
  const selectedDepartment = useMemo(() => {
    return departments.find((d) => d.code === selectedDepartmentCode);
  }, [departments, selectedDepartmentCode]);

  // 선택된 부서의 팀 목록 (Level 3)
  const teams = useMemo<OrganizationDepartment[]>(() => {
    if (!selectedDepartment?.children) return [];

    return selectedDepartment.children
      .filter(
        (child): child is OrganizationDepartment =>
          child.type === "department" && child.level === 3,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [selectedDepartment]);

  // 선택된 팀
  const selectedTeam = useMemo(() => {
    return teams.find((t) => t.code === selectedTeamCode);
  }, [teams, selectedTeamCode]);

  // 선택된 팀의 멤버 목록
  const members = useMemo<OrganizationMember[]>(() => {
    if (!selectedTeam?.children) return [];

    return selectedTeam.children.filter(
      (child): child is OrganizationMember => child.type === "member",
    );
  }, [selectedTeam]);

  // 전체 통계 계산
  const totalStats = useMemo(() => {
    let totalDepartments = 0;
    let totalMembers = 0;

    for (const dept of departments) {
      totalDepartments++;
      totalMembers += dept.memberCount;
    }

    return { totalDepartments, totalMembers };
  }, [departments]);

  // 부서 선택 핸들러
  const handleDepartmentSelect = (code: string) => {
    setSelectedDepartmentCode(code);
    const dept = departments.find((d) => d.code === code);

    // 해당 부서의 첫 번째 팀 자동 선택
    if (dept?.children) {
      const firstTeam = dept.children.find(
        (child): child is OrganizationDepartment =>
          child.type === "department" && child.level === 3,
      );
      setSelectedTeamCode(firstTeam?.code || null);
    } else {
      setSelectedTeamCode(null);
    }
  };

  // 팀 선택 핸들러
  const handleTeamSelect = (code: string) => {
    setSelectedTeamCode(code);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  // 에러 상태
  if (error || !organizationData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">조직 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 최종변경일자 및 마지막 동기화 일자
  const lastChangeDate = formatDisplayDateTime(organizationData.lastChangeAt);
  const lastSyncDate = formatDisplayDateTime(organizationData.lastLdapSyncAt);

  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-900">조직도 관리</h2>
          <div className="flex items-center gap-7">
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              전체 (총 {totalStats.totalDepartments}개 실 /{" "}
              {totalStats.totalMembers}명)
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">구분</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                  개발
                </span>
                <span>개발조직</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs rounded bg-gray-100">
                  비개발
                </span>
                <span>비개발조직</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>최종변경일자</span>
            <span>{lastChangeDate}</span>
          </div>
          <Button variant="normal" size="sm" onClick={openOrgHistoryModal}>
            <History className="w-4 h-4 mr-1" />
            히스토리
          </Button>
          <Button
            variant="setting"
            size="sm"
            onClick={() => setIsOrgTypeModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-1" />
            조직유형 설정
          </Button>
        </div>
      </div>

      {/* 3단 레이아웃 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 실 목록 */}
        <DepartmentList
          departments={departments}
          selectedCode={selectedDepartmentCode}
          onSelect={handleDepartmentSelect}
        />

        {/* 팀 목록 */}
        <TeamList
          teams={teams}
          selectedCode={selectedTeamCode}
          onSelect={handleTeamSelect}
          isDepartmentSelected={selectedDepartmentCode !== null}
        />

        {/* 개인 목록 */}
        <MemberList
          members={members}
          isTeamSelected={selectedTeamCode !== null}
        />
      </div>

      {/* 하단 영역 */}
      <div className="flex items-center justify-end gap-4">
        <p className="text-sm text-gray-500 mt-1 gap-1 flex items-center">
          <span>마지막 동기화</span>
          <span>{lastSyncDate}</span>
          <span>(LDAP AD기준)</span>
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isAutoSyncEnabled ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-gray-600">
            자동 동기화 {isAutoSyncEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* 변경 이력 */}
      <ChangeHistorySection yearMonth={yearMonth} />

      {/* 조직 유형 설정 모달 */}
      <OrganizationTypeSettingModal
        isOpen={isOrgTypeModalOpen}
        onClose={() => setIsOrgTypeModalOpen(false)}
        onSave={() => {
          // TODO: 저장 로직 구현
          console.log("조직 유형 설정 저장");
        }}
      />

      {/* 조직도 변경 히스토리 모달 */}
      <OrganizationHistoryModal />
    </div>
  );
};

export default OrganizationManagement;
