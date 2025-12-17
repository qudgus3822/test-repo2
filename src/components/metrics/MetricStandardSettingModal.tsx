import { useState, useEffect, useMemo } from "react";
import {
  X,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { MetricCategory } from "@/types/metrics.types";
import { getCategoryLabel, getMetricName } from "@/utils/metrics";
import { useWeightSettings } from "@/api/hooks/useWeightSettings";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { useModalAnimation } from "@/hooks";
import {
  MetricsPreviewTable,
  type SettingType,
} from "@/components/metrics/MetricsPreviewTable";
import { useMetricsPreview } from "@/api/hooks/useMetricsPreview";
import { useAchievementCriteria } from "@/api/hooks/useAchievementCriteria";
import { TargetValueSetting } from "@/components/metrics/TargetValueSetting";
import { MetricStatus } from "@/types/metrics.types";
import { getStatusIconConfig } from "@/utils/metrics";
import {
  useMetricsStore,
  DEFAULT_EXCELLENT_THRESHOLD,
  DEFAULT_DANGER_THRESHOLD,
} from "@/store/useMetricsStore";
import { ConfirmPopup } from "@/components/ui/ConfirmPopup";

// 절대 최소/최대 기준 상수
const MIN_DANGER_THRESHOLD = 1;
const MAX_EXCELLENT_THRESHOLD = 100;

interface AchievementRateSettingProps {
  month: string;
}

const AchievementRateSetting = ({ month }: AchievementRateSettingProps) => {
  const {
    achievementRateExcellentThreshold,
    achievementRateDangerThreshold,
  } = useMetricsStore();

  const [excellentThreshold, setExcellentThreshold] = useState(
    achievementRateExcellentThreshold
  );
  const [dangerThreshold, setDangerThreshold] = useState(
    achievementRateDangerThreshold
  );

  // month가 변경되거나 store 값이 변경될 때 초기화
  useEffect(() => {
    setExcellentThreshold(achievementRateExcellentThreshold);
    setDangerThreshold(achievementRateDangerThreshold);
  }, [month, achievementRateExcellentThreshold, achievementRateDangerThreshold]);

  // 우수 기준 검증
  const isExcellentThresholdValid =
    excellentThreshold >= dangerThreshold &&
    excellentThreshold <= MAX_EXCELLENT_THRESHOLD;

  // 위험 기준 검증
  const isDangerThresholdValid =
    dangerThreshold >= MIN_DANGER_THRESHOLD &&
    dangerThreshold < excellentThreshold;

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
  const handleReset = () => {
    setExcellentThreshold(DEFAULT_EXCELLENT_THRESHOLD);
    setDangerThreshold(DEFAULT_DANGER_THRESHOLD);
  };

  // 상태별 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900">달성률 기준 설정</h4>
        <p className="text-xs text-gray-500 mt-1">
          지표의 달성률을 평가하는 기준값을 설정합니다.
        </p>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* 우수 기준 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ExcellentIcon
              className="w-5 h-5"
              style={{ color: excellentConfig.color }}
            />
            <span className="text-sm font-medium text-gray-900">우수 기준</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <input
              type="number"
              step="1"
              value={excellentThreshold}
              onChange={(e) =>
                setExcellentThreshold(Math.floor(Number(e.target.value)))
              }
              onKeyDown={handleKeyDown}
              className={`flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                isExcellentThresholdValid
                  ? "border-gray-200 focus:ring-blue-500"
                  : "border-red-300 focus:ring-red-500"
              }`}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              % 이상
            </span>
          </div>
          {!isExcellentThresholdValid && (
            <p className="text-xs text-red-500 mb-1">
              {getExcellentThresholdErrorMessage()}
            </p>
          )}
          <p className="text-xs text-gray-500">
            달성률이 이 값 이상이면 초록색 체크 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 경고 기준 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon
              className="w-5 h-5"
              style={{ color: warningConfig.color }}
            />
            <span className="text-sm font-medium text-gray-900">경고 기준</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <input
              type="number"
              value={dangerThreshold}
              disabled
              className="w-[70px] px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
            />
            <span className="text-xs text-gray-600">% 이상</span>
            <span className="text-xs text-gray-400">~</span>
            <input
              type="number"
              value={excellentThreshold}
              disabled
              className="w-[70px] px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
            />
            <span className="text-xs text-gray-600">% 미만</span>
          </div>
          <p className="text-xs text-gray-500">
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
            <span className="text-sm font-medium text-gray-900">위험 기준</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <input
              type="number"
              step="1"
              value={dangerThreshold}
              onChange={(e) =>
                setDangerThreshold(Math.floor(Number(e.target.value)))
              }
              onKeyDown={handleKeyDown}
              className={`flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                isDangerThresholdValid
                  ? "border-gray-200 focus:ring-blue-500"
                  : "border-red-300 focus:ring-red-500"
              }`}
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              % 미만
            </span>
          </div>
          {!isDangerThresholdValid && (
            <p className="text-xs text-red-500 mb-1">
              {getDangerThresholdErrorMessage()}
            </p>
          )}
          <p className="text-xs text-gray-500">
            달성률이 이 값 미만이면 빨간색 경고 아이콘이 표시됩니다.
          </p>
        </div>

        {/* 미리보기 */}
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <h5 className="text-xs font-medium text-gray-900 mb-2">미리보기</h5>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ExcellentIcon
                className="w-4 h-4"
                style={{ color: excellentConfig.color }}
              />
              <span className="text-xs text-gray-700">
                {excellentThreshold}% 이상
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WarningIcon
                className="w-4 h-4"
                style={{ color: warningConfig.color }}
              />
              <span className="text-xs text-gray-700">
                {dangerThreshold}% ~ {excellentThreshold}% 미만
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DangerIcon
                className="w-4 h-4"
                style={{ color: dangerConfig.color }}
              />
              <span className="text-xs text-gray-700">
                {dangerThreshold}% 미만
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="pt-4 mt-auto">
        <Button variant="normal" size="sm" onClick={handleReset} className="w-full">
          기본값으로 재설정
        </Button>
      </div>
    </div>
  );
};

// 카테고리 enum을 API 카테고리 문자열로 변환
const getCategoryValue = (category: MetricCategory): string => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return "quality";
    case MetricCategory.REVIEW_QUALITY:
      return "review";
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return "efficiency";
    default:
      return "quality";
  }
};

// 카테고리 목록
const CATEGORIES = [
  MetricCategory.CODE_QUALITY,
  MetricCategory.REVIEW_QUALITY,
  MetricCategory.DEVELOPMENT_EFFICIENCY,
];

interface MetricWithWeight {
  metricCode: string;
  weight: number;
}

interface RatioSettingProps {
  month: string;
}

const RatioSetting = ({ month }: RatioSettingProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>(
    MetricCategory.CODE_QUALITY
  );
  const [editedMetrics, setEditedMetrics] = useState<MetricWithWeight[]>([]);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // 비율 설정 조회 API
  const { data: weightSettingsData, isLoading } = useWeightSettings(month, true);

  // API 데이터가 로드되면 해당 카테고리의 가중치 적용
  useEffect(() => {
    if (weightSettingsData) {
      const categoryValue = getCategoryValue(selectedCategory);
      const categorySetting = weightSettingsData.settings.find(
        (s) => s.category === categoryValue
      );

      if (categorySetting) {
        setEditedMetrics(
          categorySetting.metrics.map((m) => ({
            metricCode: m.metricCode,
            weight: m.weight,
          }))
        );
      } else {
        setEditedMetrics([]);
      }
      setErrors(new Map());
    }
  }, [weightSettingsData, selectedCategory]);

  // 총 가중치 합계
  const totalWeight = useMemo(
    () => editedMetrics.reduce((sum, m) => sum + m.weight, 0),
    [editedMetrics]
  );

  // 비율 계산 함수
  const calculateRatio = (weight: number): string => {
    if (totalWeight === 0) return "0.0";
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  // 가중치 변경 핸들러
  const handleWeightChange = (metricCode: string, value: string) => {
    const newErrors = new Map(errors);

    // 빈 값 허용 (입력 중)
    if (value === "") {
      const updated = editedMetrics.map((m) =>
        m.metricCode === metricCode ? { ...m, weight: 0 } : m
      );
      setEditedMetrics(updated);
      newErrors.delete(metricCode);
      setErrors(newErrors);
      return;
    }

    const numValue = parseInt(value, 10);

    // 유효성 검증
    if (isNaN(numValue) || numValue < 1 || numValue > 3) {
      newErrors.set(metricCode, "1~3 사이의 정수를 입력해주세요.");
      setErrors(newErrors);
      return;
    }

    // 정상 값 설정
    newErrors.delete(metricCode);
    setErrors(newErrors);

    const updated = editedMetrics.map((m) =>
      m.metricCode === metricCode ? { ...m, weight: numValue } : m
    );
    setEditedMetrics(updated);
  };

  // 균등 분배
  const handleDistributeEvenly = () => {
    const updated = editedMetrics.map((m) => ({ ...m, weight: 1 }));
    setEditedMetrics(updated);
    setErrors(new Map());
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900">비율 설정</h4>
        <p className="text-xs text-gray-500 mt-1">
          각 지표의 가중치를 설정하면 자동으로 비율(%)이 계산됩니다.
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* 본문 - 지표 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : editedMetrics.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">지표 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {editedMetrics.map((metric) => {
              const error = errors.get(metric.metricCode);
              return (
                <div
                  key={metric.metricCode}
                  className="p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getMetricName(metric.metricCode)}
                    </span>
                    <span className="text-sm text-blue-600 font-medium">
                      {calculateRatio(metric.weight)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">가중치</span>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={metric.weight || ""}
                      onChange={(e) =>
                        handleWeightChange(metric.metricCode, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-16 text-center text-sm px-2 py-1 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    />
                    <span className="text-xs text-gray-500">(1~3)</span>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 합계 */}
      {editedMetrics.length > 0 && (
        <div className="mt-4 px-3 py-2 bg-blue-50 rounded-lg flex justify-between items-center">
          <span className="text-xs font-medium text-gray-700">합계</span>
          <span className="text-xs font-semibold text-blue-600">100.0%</span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="pt-4 mt-auto">
        <Button
          variant="normal"
          size="sm"
          onClick={handleDistributeEvenly}
          className="w-full"
        >
          균등 분배
        </Button>
      </div>
    </div>
  );
};

interface MetricStandardSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
}

// 변경 사항 요약 타입
interface ChangeSummary {
  targetValue: {
    codeQuality: number;
    reviewQuality: number;
    developmentEfficiency: number;
  };
  ratio: {
    codeQuality: number;
    reviewQuality: number;
    developmentEfficiency: number;
  };
  achievementRate: {
    isChanged: boolean;
    excellent: number;
    warning: number;
    danger: number;
  };
}

// Mock 데이터 - 변경 사항 요약
const mockChangeSummary: ChangeSummary = {
  targetValue: {
    codeQuality: 0,
    reviewQuality: 0,
    developmentEfficiency: 0,
  },
  ratio: {
    codeQuality: 0,
    reviewQuality: 0,
    developmentEfficiency: 0,
  },
  achievementRate: {
    isChanged: false,
    excellent: 80,
    warning: 70,
    danger: 70,
  },
};

export const MetricStandardSettingModal = ({
  isOpen,
  onClose,
  month,
}: MetricStandardSettingModalProps) => {
  const [changeSummary] = useState<ChangeSummary>(mockChangeSummary);
  const [activeSettingType, setActiveSettingType] =
    useState<SettingType | null>(null);

  // store에서 확인 팝업 상태 가져오기
  const {
    isSettingsChangeConfirmModalOpen,
    isSettingsResetConfirmModalOpen,
    setIsSettingsChangeConfirmModalOpen,
    setIsSettingsResetConfirmModalOpen,
  } = useMetricsStore();

  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen, {
    duration: 200,
  });

  // 지표 미리보기 데이터 조회 (모달이 열릴 때만 조회)
  const { data: metricsData, isLoading: isMetricsLoading } =
    useMetricsPreview(isOpen);
  const metrics = metricsData?.metrics ?? [];

  // 달성률 기준 조회
  const { data: criteriaData } = useAchievementCriteria(month);
  const excellentThreshold = criteriaData?.thresholds.excellent ?? 80;
  const dangerThreshold = criteriaData?.thresholds.danger ?? 70;

  // 설정 버튼 클릭 핸들러
  const handleSettingClick = (settingType: SettingType) => {
    setActiveSettingType(settingType);
  };

  // 설정 타입에 따른 컴포넌트 렌더링
  const renderSettingComponent = () => {
    switch (activeSettingType) {
      case "targetValue":
        return <TargetValueSetting month={month} />;
      case "achievementRate":
        return <AchievementRateSetting month={month} />;
      case "ratio":
        return <RatioSetting month={month} />;
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

  // 변경사항 초기화 버튼 클릭
  const handleResetClick = () => {
    setIsSettingsResetConfirmModalOpen(true);
  };

  // 변경사항 초기화 확인
  const handleResetConfirm = () => {
    // TODO: 초기화 로직 구현
    setActiveSettingType(null);
    setIsSettingsResetConfirmModalOpen(false);
  };

  // 변경사항 반영 버튼 클릭
  const handleApplyClick = () => {
    setIsSettingsChangeConfirmModalOpen(true);
  };

  // 변경사항 반영 확인
  const handleApplyConfirm = () => {
    // TODO: 반영 로직 구현
    setIsSettingsChangeConfirmModalOpen(false);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl w-[1300px] max-h-[90vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                지표 기준 설정
              </h2>
              <p className="mt-1 text-sm text-orange-600">
                변경된 목표값•달성기준•비율 설정은 즉시 전체 화면에 반영되며
                해당 월 데이터는 변경 기준에 맞춰 모두 재집계됩니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-4 flex-shrink-0"
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
                          <span className="text-orange-600 font-medium">
                            {changeSummary.targetValue.codeQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          리뷰품질{" "}
                          <span className="text-orange-600 font-medium">
                            {changeSummary.targetValue.reviewQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          개발효율{" "}
                          <span className="text-orange-600 font-medium">
                            {changeSummary.targetValue.developmentEfficiency}개
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
                          <span className="text-orange-600 font-medium">
                            {changeSummary.ratio.codeQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          리뷰품질{" "}
                          <span className="text-orange-600 font-medium">
                            {changeSummary.ratio.reviewQuality}개
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">
                          개발효율{" "}
                          <span className="text-orange-600 font-medium">
                            {changeSummary.ratio.developmentEfficiency}개
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* 달성률 설정 */}
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 w-20">달성률 설정</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700">
                          {changeSummary.achievementRate.isChanged
                            ? "변경됨"
                            : "변경없음"}
                        </span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span>( 기준</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {changeSummary.achievementRate.excellent}% 이상
                          </span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {changeSummary.achievementRate.warning}% ~{" "}
                            {changeSummary.achievementRate.excellent}% 미만
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-3.5 h-3.5" />
                            {changeSummary.achievementRate.danger}% 미만
                          </span>
                          <span>)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex items-end gap-3 self-end">
                  <Button variant="cancel" size="sm" onClick={handleResetClick}>
                    변경사항 초기화
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleApplyClick}>
                    변경사항 반영
                  </Button>
                </div>
              </div>
            </div>

            {/* 하단 영역 - 설정 미리보기 & 안내 문구 */}
            <div className="flex-1 overflow-hidden flex">
              {/* 왼쪽 - 설정 미리보기 테이블 */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  설정 미리보기
                </h3>
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
                className={`w-[480px] bg-gray-50 px-6 py-5 flex border-l border-gray-200 ${
                  activeSettingType ? "flex-col" : "items-center justify-center"
                }`}
              >
                {renderSettingComponent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 변경사항 반영 확인 팝업 */}
      <ConfirmPopup
        isOpen={isSettingsChangeConfirmModalOpen}
        onClose={() => setIsSettingsChangeConfirmModalOpen(false)}
        onConfirm={handleApplyConfirm}
        title="변경사항을 반영하시겠습니까?"
        description={`변경된 설정은 즉시 반영되며,\n새로운 설정 기준에 따라 당월 데이터가 전체 재집계됩니다.\n이 작업은 되돌릴 수 없습니다.`}
      />

      {/* 변경사항 초기화 확인 팝업 */}
      <ConfirmPopup
        isOpen={isSettingsResetConfirmModalOpen}
        onClose={() => setIsSettingsResetConfirmModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="변경사항을 초기화하시겠습니까?"
        description={`현재 변경된 설정은 모두 초기화되며,\n이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  );
};
