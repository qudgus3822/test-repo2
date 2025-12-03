import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Users, Clock, History, Settings } from "lucide-react";
import { mockOrganizationData } from "@/mocks/organization.mock";
import type { Department, Team, Member } from "@/types/organization.types";
import { PALETTE_COLORS, getAvatarColor } from "@/styles/colors";
import { OrganizationTypeSettingModal } from "./OrganizationTypeSettingModal";

// 조직 유형 배지 컴포넌트
const TypeBadge = ({ type }: { type: string }) => {
  const isDevType = type === "개발실" || type === "개발";
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        isDevType ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {isDevType ? "개발" : "비개발"}
    </span>
  );
};

// 신규 배지 컴포넌트
const NewBadge = () => (
  <span className="px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded ml-1">
    신규
  </span>
);

// 비개발 배지 컴포넌트
const NonDevBadge = () => (
  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded ml-1">
    비개발
  </span>
);

// 실 목록 컴포넌트
const DepartmentList = ({
  departments,
  selectedId,
  onSelect,
}: {
  departments: Department[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">실 목록</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedId === dept.id
                ? "bg-blue-50 border-l-4 border-l-blue-500"
                : ""
            }`}
            onClick={() => onSelect(dept.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TypeBadge type={dept.type} />
                  <span className="font-medium text-gray-900 text-sm">
                    {dept.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{dept.leader}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {dept.memberCount}명
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// 팀 목록 컴포넌트
const TeamList = ({
  teams,
  selectedId,
  onSelect,
}: {
  teams: Team[];
  departmentName: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: PALETTE_COLORS.orange }}
          />
          <span className="font-medium text-gray-900">팀 목록</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {teams.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            실을 선택해주세요
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedId === team.id
                  ? "bg-orange-50 border-l-4 border-l-orange-400"
                  : ""
              }`}
              onClick={() => onSelect(team.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeBadge type={team.type} />
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
  teamName,
}: {
  members: Member[];
  teamName: string;
}) => {
  return (
    <Card padding="none" className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">
            {teamName} - 개인 목록
          </span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            팀을 선택해주세요
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* 프로필 아바타 */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: getAvatarColor(member.name) }}
                >
                  {member.name.charAt(0)}
                </div>
                {/* 멤버 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {member.name}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {member.position}
                    </span>
                    {member.isNew && <NewBadge />}
                    {member.role === "비개발" && <NonDevBadge />}
                    {member.joinDate && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({member.joinDate}
                        {member.leaveDate ? ` ${member.leaveDate}` : ""})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

// 변경 이력 컴포넌트
const ChangeHistorySection = () => {
  return (
    <Card padding="sm" className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
        <span className="font-medium text-gray-700 text-sm">
          실/팀 변경 이력
        </span>
      </div>
      <ul className="list-disc list-inside text-sm text-gray-500 pl-2">
        <li>변경 이력이 없습니다.</li>
      </ul>
    </Card>
  );
};

// 메인 조직도 관리 컴포넌트
export const OrganizationManagement = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >("dept-5");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    "team-5-1",
  );
  const [isAutoSyncEnabled] = useState(true);
  const [isOrgTypeModalOpen, setIsOrgTypeModalOpen] = useState(false);

  const { departments, lastSyncDate, syncSource } = mockOrganizationData;

  // 선택된 부서
  const selectedDepartment = departments.find(
    (d) => d.id === selectedDepartmentId,
  );

  // 선택된 팀
  const selectedTeam = selectedDepartment?.teams.find(
    (t) => t.id === selectedTeamId,
  );

  // 부서 선택 핸들러
  const handleDepartmentSelect = (id: string) => {
    setSelectedDepartmentId(id);
    const dept = departments.find((d) => d.id === id);
    if (dept && dept.teams.length > 0) {
      setSelectedTeamId(dept.teams[0].id);
    } else {
      setSelectedTeamId(null);
    }
  };

  // 팀 선택 핸들러
  const handleTeamSelect = (id: string) => {
    setSelectedTeamId(id);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">조직도 관리</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              전체 (총 {mockOrganizationData.totalDepartments}개 실 /{" "}
              {mockOrganizationData.totalMembers}명)
            </span>
            <span className="text-gray-300">•</span>
            <span>개발실</span>
            <span className="text-gray-300">•</span>
            <span>비개발실</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>최종변경일자</span>
            <span className="text-gray-700">{lastSyncDate}</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
              최신
            </span>
          </div>
          <Button variant="normal" size="sm">
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
          selectedId={selectedDepartmentId}
          onSelect={handleDepartmentSelect}
        />

        {/* 팀 목록 */}
        <TeamList
          teams={selectedDepartment?.teams || []}
          departmentName={selectedDepartment?.name || ""}
          selectedId={selectedTeamId}
          onSelect={handleTeamSelect}
        />

        {/* 개인 목록 */}
        <MemberList
          members={selectedTeam?.members || []}
          teamName={selectedTeam?.name || ""}
        />
      </div>

      {/* 하단 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            마지막 동기화: {lastSyncDate} ({syncSource})
          </span>
        </div>
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
      <ChangeHistorySection />

      {/* 조직 유형 설정 모달 */}
      <OrganizationTypeSettingModal
        isOpen={isOrgTypeModalOpen}
        onClose={() => setIsOrgTypeModalOpen(false)}
        onSave={() => {
          // TODO: 저장 로직 구현
          console.log("조직 유형 설정 저장");
        }}
      />
    </div>
  );
};

export default OrganizationManagement;
