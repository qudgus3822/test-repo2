import { useState, useEffect, useMemo } from "react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getCategoryLabel } from "@/utils/metrics";
import { updateWeightSettings } from "@/api/metrics";
import { useWeightSettings } from "@/api/hooks/useWeightSettings";
import { useModalAnimation } from "@/hooks";

interface MetricRateSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  category: MetricCategory;
  month: string;
  onSave: (updatedMetrics: MetricItem[]) => void;
}

interface MetricWithWeight extends MetricItem {
  weight: number;
}

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

export const MetricRateSettingModal = ({
  isOpen,
  onClose,
  metrics,
  category,
  month,
  onSave,
}: MetricRateSettingModalProps) => {
  const [editedMetrics, setEditedMetrics] = useState<MetricWithWeight[]>([]);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(false);

  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  // 비율 설정 조회 API
  const { data: weightSettingsData, isLoading, error: fetchError } = useWeightSettings(month, isOpen);

  // API 에러 발생 시 confirm 메시지 표시
  useEffect(() => {
    if (fetchError && isOpen && !apiError) {
      setApiError(true);
      window.confirm("현재 서버에 해당 API가 없습니다.");
    }
    if (!isOpen) {
      setApiError(false);
    }
  }, [fetchError, isOpen, apiError]);

  // API 데이터가 로드되면 해당 카테고리의 가중치 적용
  useEffect(() => {
    if (weightSettingsData && isOpen) {
      const categoryValue = getCategoryValue(category);
      const categorySetting = weightSettingsData.settings.find(
        (s) => s.category === categoryValue
      );

      if (categorySetting) {
        // API에서 받은 가중치 데이터와 metrics를 병합
        const filteredMetrics = metrics
          .filter((m) => m.category === category)
          .map((m) => {
            const apiMetric = categorySetting.metrics.find(
              (am) => am.metricCode === m.metricCode
            );
            return {
              ...m,
              weight: apiMetric?.weight ?? 1,
            };
          });
        setEditedMetrics(filteredMetrics);
      } else {
        // 해당 카테고리 데이터가 없으면 기본값 1
        const filteredMetrics = metrics
          .filter((m) => m.category === category)
          .map((m) => ({ ...m, weight: 1 }));
        setEditedMetrics(filteredMetrics);
      }
      setErrors(new Map());
    }
  }, [weightSettingsData, metrics, category, isOpen]);

  // 총 가중치 합계
  const totalWeight = useMemo(
    () => editedMetrics.reduce((sum, m) => sum + m.weight, 0),
    [editedMetrics],
  );

  // 비율 계산 함수
  const calculateRatio = (weight: number): string => {
    if (totalWeight === 0) return "0.0";
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  if (!shouldRender) return null;

  const handleWeightChange = (
    metricCode: string | undefined,
    index: number,
    value: string,
  ) => {
    const key = metricCode || `index_${index}`;
    const newErrors = new Map(errors);

    // 빈 값 허용 (입력 중)
    if (value === "") {
      const updated = editedMetrics.map((m, i) =>
        (m.metricCode || `index_${i}`) === key ? { ...m, weight: 0 } : m,
      );
      setEditedMetrics(updated);
      newErrors.delete(key);
      setErrors(newErrors);
      return;
    }

    const numValue = parseInt(value, 10);

    // 유효성 검증
    if (isNaN(numValue) || numValue < 1 || numValue > 3) {
      newErrors.set(key, "가중치는 1~3 사이의 정수를 입력해주세요.");
      setErrors(newErrors);
      return;
    }

    // 정상 값 설정
    newErrors.delete(key);
    setErrors(newErrors);

    const updated = editedMetrics.map((m, i) =>
      (m.metricCode || `index_${i}`) === key ? { ...m, weight: numValue } : m,
    );
    setEditedMetrics(updated);
  };

  const handleDistributeEvenly = () => {
    const updated = editedMetrics.map((m) => ({ ...m, weight: 1 }));
    setEditedMetrics(updated);
    setErrors(new Map());
  };

  const handleSave = async () => {
    // 에러가 있으면 저장 불가
    if (errors.size > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const categoryValue = getCategoryValue(category);

      await updateWeightSettings(categoryValue, {
        month,
        metrics: editedMetrics.map((m) => ({
          metricCode: m.metricCode,
          weight: m.weight,
        })),
      });

      // weight를 weightRatio로 변환하여 저장
      const currentCategoryMetrics = editedMetrics.map((m) => {
        const weightRatio = totalWeight > 0 ? (m.weight / totalWeight) * 100 : 0;

        return {
          name: m.name,
          category: m.category,
          currentValue: m.currentValue,
          targetValue: m.targetValue,
          achievementRate: m.achievementRate,
          status: m.status,
          weightRatio: parseFloat(weightRatio.toFixed(1)),
          metricCode: m.metricCode,
          unit: m.unit,
          description: m.description,
        } as MetricItem;
      });

      // 원본 metrics에서 현재 카테고리 지표만 업데이트
      const updatedMetrics = metrics.map((originalMetric) => {
        const updatedMetric = currentCategoryMetrics.find(
          (m) =>
            m.metricCode === originalMetric.metricCode ||
            m.name === originalMetric.name,
        );
        return updatedMetric || originalMetric;
      });

      onSave(updatedMetrics);
      onClose();
    } catch {
      // API가 없거나 에러 발생 시 confirm 메시지 표시
      window.confirm("현재 서버에 해당 API가 없습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // API 데이터로 원래 값 복원
    if (weightSettingsData) {
      const categoryValue = getCategoryValue(category);
      const categorySetting = weightSettingsData.settings.find(
        (s) => s.category === categoryValue
      );

      if (categorySetting) {
        const filteredMetrics = metrics
          .filter((m) => m.category === category)
          .map((m) => {
            const apiMetric = categorySetting.metrics.find(
              (am) => am.metricCode === m.metricCode
            );
            return {
              ...m,
              weight: apiMetric?.weight ?? 1,
            };
          });
        setEditedMetrics(filteredMetrics);
      }
    }
    setErrors(new Map());
    onClose();
  };

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
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getCategoryLabel(category)} 지표별 비율 설정
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                각 지표의 가중치를 정수로 설정하면 자동으로 비율(%)이
                계산됩니다.
              </p>
            </div>
          </div>

          {/* 테이블 */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 pt-4">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* 고정 헤더 */}
                <div className="[scrollbar-gutter:stable] pr-[15px]">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[61%]" />
                      <col className="w-[24%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
                        <th className="px-3 py-3">지표명</th>
                        <th className="px-3 py-3 text-center">가중치(1~3)</th>
                        <th className="px-3 py-3 text-center">비율</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[61%]" />
                      <col className="w-[24%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <tbody>
                      {editedMetrics.map((metric, index) => {
                        const key = metric.metricCode || `index_${index}`;
                        const error = errors.get(key);
                        return (
                          <tr key={key} className="border-b border-gray-100">
                            <td className="px-3 py-4 text-sm text-gray-900">
                              <div className="flex items-center gap-2 justify-between">
                                <span>{metric.name}</span>
                                {error && (
                                  <span className="text-xs text-red-500">
                                    {error}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex justify-center">
                                <input
                                  type="number"
                                  min={1}
                                  max={3}
                                  value={metric.weight || ""}
                                  onChange={(e) =>
                                    handleWeightChange(
                                      metric.metricCode,
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      ["e", "E", "+", "-", "."].includes(e.key)
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  className={`w-16 text-center text-sm text-gray-700 px-2 py-1.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    error
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-200"
                                  }`}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-700 text-center">
                              {calculateRatio(metric.weight)} %
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* 합계 영역 */}
          <div className="mx-6 mb-4 px-4 py-3 bg-blue-50 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">합계</span>
            <span className="text-sm font-semibold text-blue-600">100.0%</span>
          </div>

          {/* 하단 푸터 - 버튼 */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
            {/* 기본값으로 재설정 버튼 */}
            <div className="flex items-center justify-start gap-3">
              <Button
                variant="normal"
                size="sm"
                onClick={handleDistributeEvenly}
              >
                균등 분배
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
                disabled={errors.size > 0 || isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
