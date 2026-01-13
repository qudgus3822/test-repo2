import { useState, useEffect, useRef, useCallback } from "react";
import { MetricStatus } from "@/types/metrics.types";
import { getStatusIconConfig } from "@/utils/metrics";
import { Button } from "@/components/ui/Button";
import {
  useMetricsStore,
  // DEFAULT_EXCELLENT_THRESHOLD,
  // DEFAULT_DANGER_THRESHOLD,
} from "@/store/useMetricsStore";
import { updateAchievementCriteria } from "@/api/metrics";

// 절대 최소/최대 기준 상수
const MIN_DANGER_THRESHOLD = 1;
const MAX_EXCELLENT_THRESHOLD = 100;

interface AchievementRateSettingProps {
  month: string;
  onApply?: () => void;
}

export const AchievementRateSetting = ({
  month,
  onApply,
}: AchievementRateSettingProps) => {
  const achievementRateExcellentThreshold = useMetricsStore(
    (state) => state.achievementRateExcellentThreshold,
  );
  const achievementRateDangerThreshold = useMetricsStore(
    (state) => state.achievementRateDangerThreshold,
  );
  const setAchievementRateExcellentThreshold = useMetricsStore(
    (state) => state.setAchievementRateExcellentThreshold,
  );
  const setAchievementRateDangerThreshold = useMetricsStore(
    (state) => state.setAchievementRateDangerThreshold,
  );

  const [excellentThreshold, setExcellentThreshold] = useState(
    achievementRateExcellentThreshold,
  );
  const [dangerThreshold, setDangerThreshold] = useState(
    achievementRateDangerThreshold,
  );
  const [isApplying, setIsApplying] = useState(false);

  // 스크롤 여부 감지
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  const checkScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setHasScroll(scrollHeight > clientHeight);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // month가 변경되거나 store 값이 변경될 때 초기화
  useEffect(() => {
    setExcellentThreshold(achievementRateExcellentThreshold);
    setDangerThreshold(achievementRateDangerThreshold);
  }, [
    month,
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
  ]);

  // 우수 기준 검증
  const isExcellentThresholdValid =
    excellentThreshold >= dangerThreshold &&
    excellentThreshold <= MAX_EXCELLENT_THRESHOLD;

  // 위험 기준 검증
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

  // 소수점 입력 차단
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "." || e.key === ",") {
      e.preventDefault();
    }
  };

  // 기본값으로 재설정
  // const handleReset = () => {
  //   setExcellentThreshold(DEFAULT_EXCELLENT_THRESHOLD);
  //   setDangerThreshold(DEFAULT_DANGER_THRESHOLD);
  // };

  // 상태별 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

  // 변경사항 적용 핸들러
  const handleApply = async () => {
    if (!isFormValid || isApplying) return;

    setIsApplying(true);
    try {
      await updateAchievementCriteria({
        thresholds: {
          excellent: excellentThreshold,
          danger: dangerThreshold,
        },
      });
      onApply?.();
    } catch {
      window.confirm("달성률 기준 저장 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
      setAchievementRateExcellentThreshold(excellentThreshold);
      setAchievementRateDangerThreshold(dangerThreshold);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* 헤더 */}
      <div className="flex flex-col items-start justify-between pb-5 border-b border-gray-200 gap-1">
        <h2 className="text-lg font-semibold text-gray-900">
          달성률 기준 설정
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          지표의 달성률을 평가하는 기준값을 설정합니다. <br />
          설정한 기준에 따라 지표의 상태 아이콘이 변경됩니다.
        </p>
      </div>

      {/* 본문 */}
      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto py-4 gap-6 flex flex-col text-sm w-full ${
          hasScroll ? "pr-2" : ""
        }`}
      >
        {/* 우수 기준 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ExcellentIcon
              className="w-5 h-5"
              style={{ color: excellentConfig.color }}
            />
            <span className="font-medium text-gray-900">우수 기준</span>
          </div>
          <div className="flex items-center gap-3 mb-2 w-full justify-between">
            <div className="flex items-center gap-3 w-[47%] justify-start pl-1">
              <input
                type="number"
                step="1"
                value={String(excellentThreshold)}
                onChange={(e) => {
                  // 앞의 0 제거 후 숫자로 변환
                  const trimmedValue = e.target.value.replace(/^0+/, "") || "0";
                  setExcellentThreshold(Math.floor(Number(trimmedValue)));
                }}
                onKeyDown={handleKeyDown}
                className={`w-[80%] px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  isExcellentThresholdValid
                    ? "border-gray-200 focus:ring-blue-500"
                    : "border-red-300 focus:ring-red-500"
                }`}
              />
              <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                % 이상
              </span>
            </div>
            <span className="text-sm text-gray-600 whitespace-nowrap w-[6%] text-center">
              ~
            </span>
            <div className="flex items-center gap-3 w-[47%] justify-end">
              <input
                type="number"
                value={100}
                disabled
                className="w-[80%] px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                % 이하
              </span>
            </div>
          </div>
          {!isExcellentThresholdValid && (
            <p className="text-red-500 mb-1 pl-1">
              {getExcellentThresholdErrorMessage()}
            </p>
          )}
          <p className="text-gray-500 pl-1">
            달성률이 이 범위에 있으면 초록색 체크 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 경고 기준 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon
              className="w-5 h-5"
              style={{ color: warningConfig.color }}
            />
            <span className="font-medium text-gray-900">경고 기준</span>
          </div>
          <div className="flex items-center gap-3 mb-2 w-full justify-between">
            <div className="flex items-center gap-3 w-[47%] justify-start pl-1">
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
            <div className="flex items-center gap-3 w-[47%] justify-end">
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
          <p className="text-gray-500 pl-1">
            달성률이 이 범위에 있으면 주황색 느낌표 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 위험 기준 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DangerIcon
              className="w-5 h-5"
              style={{ color: dangerConfig.color }}
            />
            <span className="font-medium text-gray-900">위험 기준</span>
          </div>
          <div className="flex items-center gap-3 mb-1 pl-1">
            <input
              type="number"
              step="1"
              value={String(dangerThreshold)}
              onChange={(e) => {
                // 앞의 0 제거 후 숫자로 변환
                const trimmedValue = e.target.value.replace(/^0+/, "") || "0";
                setDangerThreshold(Math.floor(Number(trimmedValue)));
              }}
              onKeyDown={handleKeyDown}
              className={`flex-1 px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                isDangerThresholdValid
                  ? "border-gray-200 focus:ring-blue-500"
                  : "border-red-300 focus:ring-red-500"
              }`}
            />
            <span className="text-gray-600 whitespace-nowrap">% 미만</span>
          </div>
          {!isDangerThresholdValid && (
            <p className="text-red-500 mb-1 pl-1">
              {getDangerThresholdErrorMessage()}
            </p>
          )}
          <p className="text-gray-500 pl-1">
            달성률이 경고 기준 미만이면 빨간색 경고 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 미리보기 */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">미리보기</h5>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ExcellentIcon
                className="w-4 h-4"
                style={{ color: excellentConfig.color }}
              />
              <span className="text-gray-700">
                {excellentThreshold}% ~ 100% 이하
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WarningIcon
                className="w-4 h-4"
                style={{ color: warningConfig.color }}
              />
              <span className="text-gray-700">
                {dangerThreshold}% ~ {excellentThreshold}% 미만
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DangerIcon
                className="w-4 h-4"
                style={{ color: dangerConfig.color }}
              />
              <span className="text-gray-700">{dangerThreshold}% 미만</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        {/* <Button variant="cancel" size="sm" onClick={handleReset}>
          기본값으로 재설정
        </Button> */}
        <Button
          variant="primary"
          size="sm"
          disabled={!isFormValid || isApplying}
          onClick={handleApply}
        >
          {isApplying ? "적용 중..." : "변경사항 적용"}
        </Button>
      </div>
    </div>
  );
};
