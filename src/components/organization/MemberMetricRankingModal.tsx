/**
 * MemberMetricRankingModal 컴포넌트
 * - 개인 지표 순위 모달
 * - 지표별 달성률을 막대 그래프로 정렬하여 표시
 */

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { OrganizationMember } from "@/types/organization.types";
import { fetchMemberMetricRankings } from "@/api/organization";
import { getMemberEmail } from "@/utils/organization";
import { getAchievementRateColor } from "@/styles/colors";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ScoreLegend } from "./ScoreLegend";

interface MemberMetricRankingModalProps {
  member: OrganizationMember;
  month: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MemberMetricRankingModal = ({
  member,
  month,
  position,
  onClose,
}: MemberMetricRankingModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // API 호출
  const { data, isLoading, isError } = useQuery({
    queryKey: ["memberMetricRankings", member.employeeID, month],
    queryFn: () => fetchMemberMetricRankings(member.employeeID, month),
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 외부 클릭 시 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // 하나라도 유효한 달성률이 있는지 확인
  const hasAnyValidData = (data?.rankings ?? []).some(
    (item) => typeof item.achievementRate === "number",
  );

  // API 데이터를 점수 기준으로 정렬 (유효한 데이터가 있으면 null 포함 전체 표시)
  const sortedMetrics = hasAnyValidData
    ? (data?.rankings ?? [])
        .map((item) => ({
          name: item.metricName,
          score: item.achievementRate,
          category: item.category,
        }))
        // 숫자 값이 있는 항목을 먼저, null은 뒤로 정렬
        .sort((a, b) => {
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return b.score - a.score;
        })
    : [];
  // 모달 위치 계산 (클릭된 div 하단에 표시, 화면 밖으로 나가지 않도록)
  // 19개 지표 기준 높이: 헤더(65px) + 지표목록(422px) + 범례(40px) = 527px
  const calculatePosition = () => {
    const modalWidth = 550;
    const modalHeight = 527;
    const padding = 10;
    const gap = 4; // div와 모달 사이 간격

    let x = position.x;
    let y = position.y + gap; // div 하단 + gap

    // 화면 오른쪽 경계 체크
    if (x + modalWidth > window.innerWidth - padding) {
      x = window.innerWidth - modalWidth - padding;
    }

    // 화면 아래쪽 경계 체크 - 넘어가면 위쪽 끝에 맞춤
    if (y + modalHeight > window.innerHeight - padding) {
      y = window.innerHeight - modalHeight - padding;
    }

    // 최소 위치 보장
    x = Math.max(padding, x);
    y = Math.max(padding, y);

    return { x, y };
  };

  const { x, y } = calculatePosition();

  return (
    <div
      ref={modalRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      style={{
        left: x,
        top: y,
        width: 550,
        height: 527,
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-2">
        <div>
          <div className="text-sm text-gray-700">개인별 달성률 순위</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {member.name}
            </span>
            <span className="text-sm text-gray-500">
              {member.email || getMemberEmail(member.employeeID)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 지표 목록 */}
      <div style={{ height: 422 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
          </div>
        ) : sortedMetrics.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">수집된 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="px-5 py-3 space-y-[1px]">
            {sortedMetrics.map(({ name, score }, index) => (
              <div key={`${name}-${index}`} className="flex items-center gap-2">
                {/* 지표명 */}
                <div className="w-[120px] text-sm text-gray-700 truncate flex-shrink-0">
                  {name}
                </div>
                {/* 막대 그래프 */}
                <div className="flex-1 h-[18px] bg-gray-100 rounded relative">
                  {score !== null && (
                    <div
                      className="h-full rounded"
                      style={{
                        width: score >= 100 ? "100%" : `${score}%`,
                        backgroundColor: getAchievementRateColor(score),
                      }}
                    />
                    
                  )}
                  {/* 점수 표시 */}
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{
                      color:
                        score !== null && score >= 100 ? "#fff" : "#374151",
                    }}
                  >
                    {score !== null ? `${parseFloat(score.toFixed(2))}%` : "--"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 범례 - 데이터가 있을 때만 표시 */}
      {!isLoading && !isError && sortedMetrics.length > 0 && (
        <div>
          <ScoreLegend legendSize="small" />
        </div>
      )}
    </div>
  );
};
