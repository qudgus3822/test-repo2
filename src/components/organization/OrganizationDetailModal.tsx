import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type {
  OrganizationDepartment,
  OrganizationMember,
  BdpiMetrics,
} from "@/types/organization.types";
import { SCORE_COLORS } from "@/styles/colors";
import { LineChart } from "@/libs/chart";
import {
  getMemberRoleOrPositionLabel,
  getMemberEmail,
} from "@/utils/organization";
import {
  SCORE_EXCELLENT_THRESHOLD,
  SCORE_GOOD_THRESHOLD,
} from "@/store/useOrganizationStore";
import { useModalAnimation } from "@/hooks";

// 선택된 항목 타입 (조직 또는 멤버)
export type OrganizationDetailItem =
  | OrganizationDepartment
  | OrganizationMember;

interface OrganizationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrganizationDetailItem | null;
}

// 점수에 따른 배경색 결정
const getScoreBgColor = (score: number | null): string => {
  if (score === null) return SCORE_COLORS.noScore;
  if (score >= SCORE_EXCELLENT_THRESHOLD) return SCORE_COLORS.excellent;
  if (score >= SCORE_GOOD_THRESHOLD) return SCORE_COLORS.good;
  return SCORE_COLORS.danger;
};

// 점수에 따른 텍스트 색상 결정
const getScoreTextColor = (score: number | null): string => {
  if (score === null) return "#9CA3AF";
  if (score >= SCORE_EXCELLENT_THRESHOLD) return "#059669";
  if (score >= SCORE_GOOD_THRESHOLD) return "#D97706";
  return "#DC2626";
};

// 조직인지 확인하는 타입 가드
const isDepartment = (
  item: OrganizationDetailItem,
): item is OrganizationDepartment => {
  return item.type === "department";
};

// 조직 멤버인지 확인하는 타입 가드
const isMember = (item: OrganizationDetailItem): item is OrganizationMember => {
  return item.type === "member";
};

export const OrganizationDetailModal = ({
  isOpen,
  onClose,
  item,
}: OrganizationDetailModalProps) => {
  // 상세 내용 표시 여부 (추후 개발 시 true로 변경)
  const [isDetailVisible] = useState(false);

  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  // 모달이 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!shouldRender || !item) return null;

  const bdpiMetrics = item.metrics as BdpiMetrics;

  // 6개월 추이 목업 데이터 (실제로는 API에서 받아와야 함)
  const trendData = [
    {
      month: "2024.06",
      코드품질: 72,
      리뷰품질: 68,
      개발효율: 75,
      BDPI: 71.7,
    },
    {
      month: "2024.07",
      코드품질: 74,
      리뷰품질: 70,
      개발효율: 76,
      BDPI: 73.3,
    },
    {
      month: "2024.08",
      코드품질: 76,
      리뷰품질: 72,
      개발효율: 78,
      BDPI: 75.3,
    },
    {
      month: "2024.09",
      코드품질: 78,
      리뷰품질: 75,
      개발효율: 79,
      BDPI: 77.3,
    },
    {
      month: "2024.10",
      코드품질: 80,
      리뷰품질: 78,
      개발효율: 81,
      BDPI: 79.7,
    },
    {
      month: "2024.11",
      // [변경: 2026-01-26 17:00, 임도휘 수정] score → value 필드 사용
      코드품질: bdpiMetrics?.quality?.value ?? 0,
      리뷰품질: bdpiMetrics?.review?.value ?? 0,
      개발효율: bdpiMetrics?.efficiency?.value ?? 0,
      BDPI: bdpiMetrics?.bdpi?.value ?? 0,
    },
  ];

  // 제목 결정
  const getTitle = () => {
    if (isDepartment(item)) {
      return `${item.name} 상세 정보`;
    }
    return `${item.name} 상세 정보`;
  };

  // 기본 정보 렌더링
  const renderBasicInfo = () => {
    if (isDepartment(item)) {
      return (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">조직 유형</div>
            <div className="text-sm font-medium text-gray-900">
              {item.level === 1 ? "부문" : item.level === 2 ? "실" : "팀"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">조직 코드</div>
            <div className="text-sm font-medium text-gray-900">{item.code}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">구성원 수</div>
            <div className="text-sm font-medium text-gray-900">
              {item.memberCount}명
            </div>
          </div>
        </div>
      );
    }

    if (isMember(item)) {
      return (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">직급/직책</div>
            <div className="text-sm font-medium text-gray-900">
              {getMemberRoleOrPositionLabel(item.title, item.personalTitle)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">소속</div>
            <div className="text-sm font-medium text-gray-900">
              {item.departmentName}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">이메일</div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {item.email || getMemberEmail(item.employeeID)}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // 하위 조직 목록 (부서인 경우)
  const renderChildOrganizations = () => {
    if (!isDepartment(item) || !item.children || item.children.length === 0) {
      return null;
    }

    const childDepts = item.children.filter(
      (child): child is OrganizationDepartment => child.type === "department",
    );

    if (childDepts.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          하위 조직 ({childDepts.length})
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  조직명
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  구성원
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  BDPI
                </th>
              </tr>
            </thead>
            <tbody>
              {childDepts.map((dept) => {
                const deptMetrics = dept.metrics as BdpiMetrics;
                return (
                  <tr
                    key={dept.code}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {dept.memberCount}명
                    </td>
                    {/* [변경: 2026-01-26 17:00, 임도휘 수정] score → value 필드 사용 */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-1 text-sm font-medium rounded"
                        style={{
                          backgroundColor: getScoreBgColor(
                            deptMetrics.bdpi.value ?? null,
                          ),
                          color: getScoreTextColor(deptMetrics.bdpi.value ?? null),
                        }}
                      >
                        {(deptMetrics.bdpi.value ?? 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 구성원 목록 (부서인 경우)
  const renderMembers = () => {
    if (!isDepartment(item) || !item.children || item.children.length === 0) {
      return null;
    }

    const members = item.children.filter(
      (child): child is OrganizationMember => child.type === "member",
    );

    if (members.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          구성원 ({members.length})
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  이름
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  직급/직책
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  BDPI
                </th>
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 10).map((member) => {
                const memberMetrics = member.metrics as BdpiMetrics;
                return (
                  <tr
                    key={member.employeeID}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getMemberRoleOrPositionLabel(
                        member.title,
                        member.personalTitle,
                      )}
                    </td>
                    {/* [변경: 2026-01-26 17:00, 임도휘 수정] score → value 필드 사용 */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-1 text-sm font-medium rounded"
                        style={{
                          backgroundColor: getScoreBgColor(
                            memberMetrics.bdpi.value ?? null,
                          ),
                          color: getScoreTextColor(memberMetrics.bdpi.value ?? null),
                        }}
                      >
                        {(memberMetrics.bdpi.value ?? 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
              외 {members.length - 10}명
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* 추후 개발 예정 메시지 */}
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">추후 개발 예정입니다.</p>
            </div>

            {/* 아래 UI는 추후 개발 시 사용 예정 */}
            {isDetailVisible && (
              <>
                {/* 기본 정보 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    기본 정보
                  </h3>
                  {renderBasicInfo()}
                </div>

                {/* 지표 점수 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    지표 점수
                  </h3>
                  {/* [변경: 2026-01-26 17:00, 임도휘 수정] score → value 필드 사용 */}
                <div className="grid grid-cols-4 gap-4">
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{
                        backgroundColor: getScoreBgColor(
                          bdpiMetrics?.quality?.value ?? null,
                        ),
                      }}
                    >
                      <div className="text-xs text-gray-500 mb-1">코드품질</div>
                      <div
                        className="text-lg font-semibold"
                        style={{
                          color: getScoreTextColor(
                            bdpiMetrics?.quality?.value ?? null,
                          ),
                        }}
                      >
                        {(bdpiMetrics?.quality?.value ?? 0).toFixed(1)}
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{
                        backgroundColor: getScoreBgColor(
                          bdpiMetrics?.review?.value ?? null,
                        ),
                      }}
                    >
                      <div className="text-xs text-gray-500 mb-1">리뷰품질</div>
                      <div
                        className="text-lg font-semibold"
                        style={{
                          color: getScoreTextColor(
                            bdpiMetrics?.review?.value ?? null,
                          ),
                        }}
                      >
                        {(bdpiMetrics?.review?.value ?? 0).toFixed(1)}
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-4 py-3"
                      style={{
                        backgroundColor: getScoreBgColor(
                          bdpiMetrics?.efficiency?.value ?? null,
                        ),
                      }}
                    >
                      <div className="text-xs text-gray-500 mb-1">개발효율</div>
                      <div
                        className="text-lg font-semibold"
                        style={{
                          color: getScoreTextColor(
                            bdpiMetrics?.efficiency?.value ?? null,
                          ),
                        }}
                      >
                        {(bdpiMetrics?.efficiency?.value ?? 0).toFixed(1)}
                      </div>
                    </div>
                    <div
                      className="rounded-lg px-4 py-3 border-2 border-blue-200"
                      style={{
                        backgroundColor: getScoreBgColor(
                          bdpiMetrics?.bdpi?.value ?? null,
                        ),
                      }}
                    >
                      <div className="text-xs text-gray-500 mb-1">BDPI</div>
                      <div
                        className="text-lg font-semibold"
                        style={{
                          color: getScoreTextColor(bdpiMetrics?.bdpi?.value ?? null),
                        }}
                      >
                        {(bdpiMetrics?.bdpi?.value ?? 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하위 조직 목록 */}
                {renderChildOrganizations()}

                {/* 구성원 목록 */}
                {renderMembers()}

                {/* 6개월 추세 차트 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    6개월 추세
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <LineChart
                      data={trendData}
                      xKey="month"
                      yKeys={["코드품질", "리뷰품질", "개발효율", "BDPI"]}
                      height={300}
                      showGrid={true}
                      showDots={true}
                      showLegend={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
