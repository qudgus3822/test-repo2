import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Settings, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { useModalAnimation } from "@/hooks";
import { CHANGE_COLORS } from "@/styles/colors";
import { getStatusIconConfig } from "@/utils/metrics";
import { MetricStatus } from "@/types/metrics.types";
import { applySettingsChanges, cancelPendingChanges } from "@/api/metrics";
import { metricsPreviewKeys } from "@/api/hooks/useMetricsPreview";
import { pendingSummaryKeys } from "@/api/hooks/usePendingSummary";
import {
  MetricsPreviewTable,
  type SettingType,
} from "@/components/metrics/MetricsPreviewTable";
import { useMetricsPreview } from "@/api/hooks/useMetricsPreview";
import { useAchievementCriteria } from "@/api/hooks/useAchievementCriteria";
import { usePendingSummary } from "@/api/hooks/usePendingSummary";
import { useSyncStatus } from "@/api/hooks/useSyncStatus";
import { TargetValueSetting } from "@/components/metrics/TargetValueSetting";
import { AchievementRateSetting } from "@/components/metrics/AchievementRateSetting";
import { RatioSetting } from "@/components/metrics/RatioSetting";
import { useMetricsStore } from "@/store/useMetricsStore";
import { ConfirmPopup } from "@/components/ui/ConfirmPopup";
import { Tooltip } from "@/components/ui/Tooltip";
import { AggregatingIndicator } from "@/components/ui/AggregatingIndicator";

interface MetricStandardSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
}

export const MetricStandardSettingModal = ({
  isOpen,
  onClose,
  month,
}: MetricStandardSettingModalProps) => {
  const queryClient = useQueryClient();
  const [activeSettingType, setActiveSettingType] =
    useState<SettingType | null>(null);

  // store에서 확인 팝업 상태 가져오기
  const setIsSettingsChangeConfirmModalOpen = useMetricsStore(
    (state) => state.setIsSettingsChangeConfirmModalOpen,
  );
  const isSettingsChangeConfirmModalOpen = useMetricsStore(
    (state) => state.isSettingsChangeConfirmModalOpen,
  );
  // [변경: 2026-02-23 00:00, 김병현 수정] 초기화 시 store threshold 값 원복을 위해 setter 참조
  const setAchievementRateExcellentThreshold = useMetricsStore(
    (state) => state.setAchievementRateExcellentThreshold,
  );
  const setAchievementRateDangerThreshold = useMetricsStore(
    (state) => state.setAchievementRateDangerThreshold,
  );

  // 집계 진행 중 여부 및 강제 상태 설정 함수
  const { isProcessing, setProcessing } = useSyncStatus();

  // 상태별 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen, {
    duration: 200,
  });

  // [변경: 2026-01-08 12:15, 김병현 수정] useCallback으로 메모이제이션하여 불필요한 재생성 방지
  const resetPreviewData = useCallback(async () => {
    // 변경내역 취소 API 호출
    await cancelPendingChanges();
    // 쿼리 캐시 무효화 (다음에 모달 열릴 때 새로 조회)
    await queryClient.invalidateQueries({ queryKey: metricsPreviewKeys.all });
    await queryClient.invalidateQueries({ queryKey: pendingSummaryKeys.all });
  }, [queryClient]);

  useEffect(() => {
    if (isOpen) {
      resetPreviewData();
      setActiveSettingType(null);
    }
  }, [isOpen, resetPreviewData]);

  // 지표 미리보기 데이터 조회 (모달이 열릴 때만 조회)
  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    refetch: refetchPreview,
  } = useMetricsPreview(isOpen);
  const metrics = metricsData?.metrics ?? [];

  // 변경내역 조회 (모달이 열릴 때만 조회)
  const { data: pendingSummary, refetch: refetchPendingSummary } =
    usePendingSummary(isOpen);

  // 달성률 기준 조회
  const { data: criteriaData } = useAchievementCriteria(month);
  const excellentThreshold = useMemo(() => {
    if (pendingSummary) {
      if (pendingSummary.achievementCriteriaExcellent) {
        return pendingSummary.achievementCriteriaExcellent;
      }
    }
    return criteriaData?.thresholds.excellent ?? 80;
  }, [criteriaData, pendingSummary]);
  const dangerThreshold = useMemo(() => {
    if (pendingSummary) {
      if (pendingSummary.achievementCriteriaDanger) {
        return pendingSummary.achievementCriteriaDanger;
      }
    }
    return criteriaData?.thresholds.danger ?? 70;
  }, [criteriaData, pendingSummary]);

  // API 응답에서 변경 사항 데이터 추출
  const targetValueCount = {
    codeQuality: pendingSummary?.targetValue.quality ?? 0,
    reviewQuality: pendingSummary?.targetValue.review ?? 0,
    developmentEfficiency: pendingSummary?.targetValue.efficiency ?? 0,
  };
  const ratioCount = {
    codeQuality: pendingSummary?.weight.quality ?? 0,
    reviewQuality: pendingSummary?.weight.review ?? 0,
    developmentEfficiency: pendingSummary?.weight.efficiency ?? 0,
  };
  const achievementRateChanged = (pendingSummary?.achievementCriteria ?? 0) > 0;

  // 설정 버튼 클릭 핸들러
  const handleSettingClick = (settingType: SettingType) => {
    setActiveSettingType(settingType);
  };

  // 설정 컴포넌트에서 변경사항 적용 후 미리보기 테이블 및 변경 사항 갱신
  const handleSettingApply = () => {
    refetchPreview();
    refetchPendingSummary();
  };

  // 설정 타입에 따른 컴포넌트 렌더링
  const renderSettingComponent = () => {
    switch (activeSettingType) {
      case "targetValue":
        return (
          <TargetValueSetting month={month} onApply={handleSettingApply} />
        );
      case "achievementRate":
        return (
          <AchievementRateSetting month={month} onApply={handleSettingApply} />
        );
      case "ratio":
        return <RatioSetting month={month} onApply={handleSettingApply} />;
      default:
        return (
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            수정할 항목의 설정{" "}
            <Settings className="w-4 h-4 inline-block text-gray-400" /> 버튼을
            클릭하면,
            <br />
            설정 화면이 노출됩니다.
          </p>
        );
    }
  };

  // 변경 사항이 있는지 확인
  const hasChanges =
    targetValueCount.codeQuality > 0 ||
    targetValueCount.reviewQuality > 0 ||
    targetValueCount.developmentEfficiency > 0 ||
    ratioCount.codeQuality > 0 ||
    ratioCount.reviewQuality > 0 ||
    ratioCount.developmentEfficiency > 0 ||
    achievementRateChanged;

  // [변경: 2026-02-26 00:00, 김병현 수정] X 버튼/오버레이 클릭 시 확인 팝업 없이 바로 초기화 후 닫기
  const [isClosing, setIsClosing] = useState(false);
  const handleResetClick = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setIsClosing(true);
    try {
      await resetPreviewData();
      setAchievementRateExcellentThreshold(
        criteriaData?.thresholds.excellent ?? 80,
      );
      setAchievementRateDangerThreshold(criteriaData?.thresholds.danger ?? 70);
      onClose();
    } catch {
      window.confirm("변경내역 초기화 중 오류가 발생했습니다.");
      setIsClosing(false);
    } finally {
      setIsClosing(false);
    }
  };

  // [변경: 2026-03-03 00:00, 김병현 수정] 변경 초기화 버튼 클릭 시 확인 팝업 표시
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const handleResetButtonClick = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setIsResetConfirmOpen(true);
  };

  // 최종 반영 버튼 클릭
  const handleApplyClick = () => {
    setIsSettingsChangeConfirmModalOpen(true);
  };

  // 최종 반영 확인
  const [isApplying, setIsApplying] = useState(false);
  const handleApplyConfirm = async () => {
    setIsApplying(true);
    try {
      // 변경내역 적용 API 호출
      await applySettingsChanges();
      // [변경: 2026-01-27 16:30, 김병현 수정] 강제로 processing 상태로 설정하여 집계 완료 감지 보장
      setProcessing();
      // 팝업창 닫기 + 설정 화면 모두 닫기
      setIsSettingsChangeConfirmModalOpen(false);
      onClose();
    } catch {
      window.confirm("변경사항 반영 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={isClosing || isApplying ? undefined : handleResetClick}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="relative bg-white rounded-lg shadow-xl w-[1300px] max-h-[90vh] flex flex-col">
          {/* 닫기 로딩 오버레이 */}
          {isClosing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 rounded-lg gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">
                변경사항 초기화 중입니다...
              </p>
            </div>
          )}
          {/* 헤더 */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                지표 기준 설정
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: CHANGE_COLORS.emphasis }}
              >
                변경된 목표값•달성률•비율 설정은 즉시 전체 화면에 반영되며 해당
                월 데이터는 변경 기준에 맞춰 모두 재집계됩니다.
              </p>
            </div>
            <button
              onClick={handleResetClick}
              disabled={isClosing || isApplying}
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-4 flex-shrink-0 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 상단 영역 - 변경 사항 */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    변경 사항
                  </h3>
                  <div className="space-y-2 text-sm">
                    {/* 목표값 설정 */}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 w-20">목표값 설정</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700">
                          코드품질{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {targetValueCount.codeQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          리뷰품질{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {targetValueCount.reviewQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          개발효율{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {targetValueCount.developmentEfficiency}개
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 비율 설정 */}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 w-20">비율 설정</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700">
                          코드품질{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {ratioCount.codeQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          리뷰품질{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {ratioCount.reviewQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          개발효율{" "}
                          <span
                            className="font-medium"
                            style={{ color: CHANGE_COLORS.changed }}
                          >
                            {ratioCount.developmentEfficiency}개
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 달성률 설정 */}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 w-20">달성률 설정</span>
                      <div className="flex items-center gap-4">
                        <span
                          className="font-medium"
                          style={{ color: CHANGE_COLORS.changed }}
                        >
                          {achievementRateChanged ? "변경됨" : "변경없음"}
                        </span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span>기준</span>
                          <span
                            className="flex items-center gap-1"
                            style={{ color: excellentConfig.color }}
                          >
                            <ExcellentIcon
                              className="w-3.5 h-3.5"
                              style={{ color: excellentConfig.color }}
                            />
                            {excellentThreshold}% 이상 ~ 100% 이하
                          </span>
                          <span
                            className="flex items-center gap-1"
                            style={{ color: warningConfig.color }}
                          >
                            <WarningIcon
                              className="w-3.5 h-3.5"
                              style={{ color: warningConfig.color }}
                            />
                            {dangerThreshold}% 이상 ~ {excellentThreshold}% 미만
                          </span>
                          <span
                            className="flex items-center gap-1"
                            style={{ color: dangerConfig.color }}
                          >
                            <DangerIcon
                              className="w-3.5 h-3.5"
                              style={{ color: dangerConfig.color }}
                            />
                            {dangerThreshold}% 미만
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex items-end gap-3 self-end">
                  <AggregatingIndicator />
                  <Button
                    variant="cancel"
                    size="sm"
                    onClick={handleResetButtonClick}
                  >
                    변경 초기화
                  </Button>
                  <Tooltip
                    maxWidth={400}
                    content={
                      isProcessing
                        ? "현재 집계가 진행중이므로 최종 반영이 불가능합니다."
                        : ""
                    }
                    direction="bottom"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApplyClick}
                      disabled={!hasChanges || isProcessing}
                    >
                      최종 반영
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* 하단 영역 - 변경사항 미리보기 & 안내 문구 */}
            <div className="flex-1 overflow-hidden flex min-h-0">
              {/* 왼쪽 - 변경사항 미리보기 테이블 */}
              {/* [변경: 2026-01-19 01:00, 김병현 수정] flex-col min-h-0 추가하여 테이블 끝까지 표시되도록 수정 */}
              <div className="flex-1 px-6 py-5 gap-3 flex flex-col min-h-0">
                <div className="flex-shrink-0 flex items-start justify-between pb-5 border-b border-gray-200 gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    변경사항 미리보기
                  </h2>
                </div>

                <MetricsPreviewTable
                  metrics={metrics}
                  isLoading={isMetricsLoading}
                  excellentThreshold={excellentThreshold}
                  dangerThreshold={dangerThreshold}
                  onSettingClick={handleSettingClick}
                />
              </div>

              {/* 오른쪽 - 설정 영역 */}
              <div
                className={`w-[480px] px-6 py-5 flex border-l border-gray-200 ${
                  activeSettingType ? "flex-col" : "items-center justify-center"
                }`}
              >
                {renderSettingComponent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 최종 반영 확인 팝업 */}
      <ConfirmPopup
        isOpen={isSettingsChangeConfirmModalOpen}
        onClose={() => setIsSettingsChangeConfirmModalOpen(false)}
        onConfirm={handleApplyConfirm}
        title="변경사항을 반영하시겠습니까?"
        description={`변경된 설정은 즉시 반영되며,\n새로운 설정 기준에 따라 당월 데이터가 전체 재집계됩니다.\n이 작업은 되돌릴 수 없습니다.`}
        isLoading={isApplying}
        errorMessage={
          "변경사항 반영 중 오류가 발생했습니다.\n다시 시도해주세요."
        }
      />

      {/* 변경 초기화 확인 팝업 */}
      <ConfirmPopup
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={async () => {
          setIsResetConfirmOpen(false);
          await handleResetClick();
        }}
        title="변경사항을 초기화하시겠습니까?"
        description={`변경된 설정이 모두 초기화됩니다.\n이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  );
};
