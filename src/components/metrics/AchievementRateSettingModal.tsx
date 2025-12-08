import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import type { MetricItem } from "@/types/metrics.types";
import { MetricStatus } from "@/types/metrics.types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStatusIconConfig } from "@/utils/metrics";
import {
  useMetricsStore,
  DEFAULT_EXCELLENT_THRESHOLD,
  DEFAULT_DANGER_THRESHOLD,
} from "@/store/useMetricsStore";

// 절대 최소/최대 기준 상수
const MIN_DANGER_THRESHOLD = 1; // 위험 기준 절대 최솟값
const MAX_EXCELLENT_THRESHOLD = 100; // 우수 기준 절대 최댓값

interface AchievementRateSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  onSave: (updatedMetrics: MetricItem[]) => void;
}

export const AchievementRateSettingModal = ({
  isOpen,
  onClose,
  metrics,
  onSave,
}: AchievementRateSettingModalProps) => {
  const {
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
    setAchievementRateExcellentThreshold,
    setAchievementRateDangerThreshold,
    setIsSettingsChanged,
  } = useMetricsStore();

  const [editedMetrics, setEditedMetrics] = useState<MetricItem[]>(metrics);
  const [excellentThreshold, setExcellentThreshold] = useState(
    achievementRateExcellentThreshold,
  );
  const [dangerThreshold, setDangerThreshold] = useState(
    achievementRateDangerThreshold,
  );
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 모달이 열릴 때 store 값으로 초기화
  useEffect(() => {
    if (isOpen) {
      setExcellentThreshold(achievementRateExcellentThreshold);
      setDangerThreshold(achievementRateDangerThreshold);
    }
  }, [isOpen, achievementRateExcellentThreshold, achievementRateDangerThreshold]);

  // 우수 기준 검증 (위험 기준값 이상, 절대 최댓값 이하)
  const isExcellentThresholdValid =
    excellentThreshold >= dangerThreshold &&
    excellentThreshold <= MAX_EXCELLENT_THRESHOLD;

  // 위험 기준 검증 (절대 최솟값 이상, 우수 기준값 미만)
  const isDangerThresholdValid =
    dangerThreshold >= MIN_DANGER_THRESHOLD &&
    dangerThreshold < excellentThreshold;

  // 전체 폼 유효성 검사
  const isFormValid = isExcellentThresholdValid && isDangerThresholdValid;

  // 우수 기준 에러 메시지
  const getExcellentThresholdErrorMessage = () => {
    if (excellentThreshold > MAX_EXCELLENT_THRESHOLD) {
      return `우수 기준은 ${MAX_EXCELLENT_THRESHOLD}%이하여야 합니다.`;
    }
    if (excellentThreshold < dangerThreshold) {
      return `우수 기준은 위험 기준보다 높아야 합니다.`;
    }
    return "";
  };

  // 위험 기준 에러 메시지
  const getDangerThresholdErrorMessage = () => {
    if (dangerThreshold < MIN_DANGER_THRESHOLD) {
      return `위험 기준은 ${MIN_DANGER_THRESHOLD}%이상이어야 합니다.`;
    }
    if (dangerThreshold >= excellentThreshold) {
      return `위험 기준은 우수 기준보다 낮아야 합니다.`;
    }
    return "";
  };

  // 애니메이션을 위한 지연된 unmount
  // flushSync를 사용하여 DOM 렌더링을 동기적으로 보장한 후 애니메이션 시작
  useEffect(() => {
    if (isOpen) {
      flushSync(() => setShouldRender(true));
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSave = () => {
    // Store에 threshold 값들 저장
    setAchievementRateExcellentThreshold(excellentThreshold);
    setAchievementRateDangerThreshold(dangerThreshold);
    // 변경사항 플래그 설정
    setIsSettingsChanged(true);

    onSave(editedMetrics);
    onClose();
  };

  const handleCancel = () => {
    setEditedMetrics(metrics);
    // store 값으로 복원
    setExcellentThreshold(achievementRateExcellentThreshold);
    setDangerThreshold(achievementRateDangerThreshold);
    onClose();
  };

  const handleReset = () => {
    setEditedMetrics(metrics);
    // 기본값으로 재설정
    setExcellentThreshold(DEFAULT_EXCELLENT_THRESHOLD);
    setDangerThreshold(DEFAULT_DANGER_THRESHOLD);
  };

  // 소수점 입력 차단
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "." || e.key === ",") {
      e.preventDefault();
    }
  };

  // 상태별 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCancel}
      />

      {/* 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                달성률 기준 설정
              </h2>
              {/* 설명 텍스트 */}
              <p className="text-sm text-gray-600 mt-1">
                지표의 달성률을 평가하는 기준값을 설정합니다. 설정한 기준에 따라
                지표의 상태 아이콘이 변경됩니다.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 gap-6 flex flex-col">
            {/* 우수 기준 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ExcellentIcon
                      className="w-6 h-6"
                      style={{ color: excellentConfig.color }}
                    />

                    <span className="font-medium text-gray-900">우수 기준</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="number"
                      step="1"
                      value={excellentThreshold}
                      onChange={(e) =>
                        setExcellentThreshold(Math.floor(Number(e.target.value)))
                      }
                      onKeyDown={handleKeyDown}
                      className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        isExcellentThresholdValid
                          ? "border-gray-200 focus:ring-blue-500"
                          : "border-red-300 focus:ring-red-500"
                      }`}
                    />
                    <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                      % 이상
                    </span>
                  </div>
                  {!isExcellentThresholdValid && (
                    <p className="text-sm text-red-500 mb-2">
                      {getExcellentThresholdErrorMessage()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    달성률이 이 값 이상이면 초록색 체크 아이콘이 표시됩니다.
                  </p>
                </div>

                {/* 경고 기준 */}
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <WarningIcon
                      className="w-6 h-6"
                      style={{ color: warningConfig.color }}
                    />

                    <span className="font-medium text-gray-900">경고 기준</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2 w-full justify-between">
                    <div className="flex items-center gap-4 w-[47%] justify-start">
                      <input
                        type="number"
                        value={dangerThreshold}
                        disabled
                        className="w-[80%] px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                      />
                      <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                        % 이상
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap w-[6%] text-center">
                      ~
                    </span>
                    <div className="flex items-center gap-4 w-[47%] justify-end">
                      <input
                        type="number"
                        value={excellentThreshold}
                        disabled
                        className="w-[80%] px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                      />
                      <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                        % 미만
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    달성률이 이 범위에 있으면 주황색 느낌표 아이콘이 표시됩니다.
                  </p>
                </div>

                {/* 위험 기준 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DangerIcon
                      className="w-6 h-6"
                      style={{ color: dangerConfig.color }}
                    />
                    <span className="font-medium text-gray-900">위험 기준</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2 w-full">
                    <input
                      type="number"
                      step="1"
                      value={dangerThreshold}
                      onChange={(e) =>
                        setDangerThreshold(Math.floor(Number(e.target.value)))
                      }
                      onKeyDown={handleKeyDown}
                      className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        isDangerThresholdValid
                          ? "border-gray-200 focus:ring-blue-500"
                          : "border-red-300 focus:ring-red-500"
                      }`}
                    />
                    <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                      % 미만
                    </span>
                  </div>
                  {!isDangerThresholdValid && (
                    <p className="text-sm text-red-500 mb-2">
                      {getDangerThresholdErrorMessage()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    달성률이 경고 기준 미만이면 빨간색 경고 아이콘이 표시됩니다.
                  </p>
                </div>

                {/* 미리보기 */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    미리보기
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ExcellentIcon
                        className="w-6 h-6"
                        style={{ color: excellentConfig.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {excellentThreshold}% 이상
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WarningIcon
                        className="w-6 h-6"
                        style={{ color: warningConfig.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {dangerThreshold}% ~ {excellentThreshold}% 미만
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DangerIcon
                        className="w-6 h-6"
                        style={{ color: dangerConfig.color }}
                      />
                      <span className="text-sm text-gray-700">
                        {dangerThreshold}% 미만
                      </span>
                    </div>
                  </div>
                </div>
          </div>

          {/* 하단 푸터 - 버튼 */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
            {/* 기본값으로 재설정 버튼 */}
            <div className="flex items-center justify-start gap-3">
              <Button
                variant="normal"
                size="sm"
                onClick={handleReset}
              >
                기본값으로 재설정
              </Button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="cancel" size="sm" onClick={handleCancel}>
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!isFormValid}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
