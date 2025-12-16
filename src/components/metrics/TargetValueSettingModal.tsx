import React, { useState, useEffect } from "react";
import type { MetricItem, TargetValueMetric } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getCategoryLabel,
  getMetricUnit,
  getMetricName,
} from "@/utils/metrics";
import { PALETTE_COLORS } from "@/styles/colors";
import { useTargetValues } from "@/api/hooks/useTargetValues";
import { updateTargetValues } from "@/api/metrics";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useModalAnimation } from "@/hooks";

// 범주별 스타일 정의
const getCategoryStyle = (category: MetricCategory) => {
  switch (category) {
    case MetricCategory.CODE_QUALITY:
      return {
        color: PALETTE_COLORS.blue,
        borderColor: PALETTE_COLORS.blue,
      };
    case MetricCategory.REVIEW_QUALITY:
      return {
        color: PALETTE_COLORS.orange,
        borderColor: PALETTE_COLORS.orange,
      };
    case MetricCategory.DEVELOPMENT_EFFICIENCY:
      return {
        color: PALETTE_COLORS.purple,
        borderColor: PALETTE_COLORS.purple,
      };
    default:
      return {
        color: "#6B7280",
        borderColor: "#D1D5DB",
      };
  }
};

interface TargetValueSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricItem[];
  month: string;
  onSave: (updatedMetrics: TargetValueMetric[]) => void;
}

// 유효성 검사 에러 타입
type ValidationError = "empty" | "invalid" | null;

// 목표값 유효성 검사 함수
const validateTargetValue = (value: string): ValidationError => {
  // 빈값, 공백, 0 체크
  const trimmedValue = value.trim();
  if (trimmedValue === "" || trimmedValue === "0") {
    return "empty";
  }

  // 숫자 및 소수점 첫째자리까지만 허용하는 정규식
  const validNumberRegex = /^[0-9]+(\.[0-9])?$/;
  if (!validNumberRegex.test(trimmedValue)) {
    return "invalid";
  }

  return null;
};

// 에러 메시지 반환
const getErrorMessage = (error: ValidationError): string => {
  switch (error) {
    case "empty":
      return "목표값을 입력해주세요.";
    case "invalid":
      return "목표값은 정수 및 소수점 첫번째 자리까지 입력해 주세요.";
    default:
      return "";
  }
};

// 범주 문자열을 MetricCategory로 변환
const categoryToMetricCategory = (category: string): MetricCategory => {
  switch (category) {
    case "quality":
      return MetricCategory.CODE_QUALITY;
    case "review":
      return MetricCategory.REVIEW_QUALITY;
    case "efficiency":
      return MetricCategory.DEVELOPMENT_EFFICIENCY;
    default:
      return MetricCategory.CODE_QUALITY;
  }
};

export const TargetValueSettingModal = ({
  isOpen,
  onClose,
  metrics,
  month,
  onSave,
}: TargetValueSettingModalProps) => {
  const [editedMetrics, setEditedMetrics] = useState<TargetValueMetric[]>([]);
  const [errors, setErrors] = useState<Record<number, ValidationError>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 모달 애니메이션
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  // 3개 범주의 목표값 조회
  const { data: qualityData, isLoading: isLoadingQuality } = useTargetValues(
    "quality",
    month,
    isOpen,
  );
  const { data: reviewData, isLoading: isLoadingReview } = useTargetValues(
    "review",
    month,
    isOpen,
  );
  const { data: efficiencyData, isLoading: isLoadingEfficiency } =
    useTargetValues("efficiency", month, isOpen);

  const isLoading = isLoadingQuality || isLoadingReview || isLoadingEfficiency;

  // API 데이터가 로드되면 editedMetrics 초기화
  useEffect(() => {
    if (qualityData && reviewData && efficiencyData) {
      const allMetrics = [
        ...qualityData.metrics,
        ...reviewData.metrics,
        ...efficiencyData.metrics,
      ];
      setEditedMetrics(allMetrics);
    }
  }, [qualityData, reviewData, efficiencyData]);

  // 모달 열릴 때 에러 초기화
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleTargetValueChange = (index: number, value: string) => {
    const updated = [...editedMetrics];
    updated[index] = { ...updated[index], targetValue: value };
    setEditedMetrics(updated);

    // 유효성 검사 실행
    const error = validateTargetValue(value);
    setErrors((prev) => ({ ...prev, [index]: error }));
  };

  // 저장 버튼 비활성화 여부 확인
  const hasErrors = editedMetrics.some((metric, index) => {
    const error =
      errors[index] ?? validateTargetValue(String(metric.targetValue));
    return error !== null;
  });

  const handleSave = async () => {
    // 저장 전 전체 유효성 검사
    const newErrors: Record<number, ValidationError> = {};
    let hasValidationError = false;

    editedMetrics.forEach((metric, index) => {
      const error = validateTargetValue(String(metric.targetValue));
      if (error) {
        newErrors[index] = error;
        hasValidationError = true;
      }
    });

    if (hasValidationError) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      // 범주별로 그룹핑하여 API 호출
      const qualityMetrics = editedMetrics.filter(
        (m) => m.category === "quality",
      );
      const reviewMetrics = editedMetrics.filter(
        (m) => m.category === "review",
      );
      const efficiencyMetrics = editedMetrics.filter(
        (m) => m.category === "efficiency",
      );

      const updatePromises = [];

      if (qualityMetrics.length > 0) {
        updatePromises.push(
          updateTargetValues("quality", {
            month,
            metrics: qualityMetrics.map((m) => ({
              metricCode: m.metricCode,
              targetValue: m.targetValue,
            })),
          }),
        );
      }

      if (reviewMetrics.length > 0) {
        updatePromises.push(
          updateTargetValues("review", {
            month,
            metrics: reviewMetrics.map((m) => ({
              metricCode: m.metricCode,
              targetValue: m.targetValue,
            })),
          }),
        );
      }

      if (efficiencyMetrics.length > 0) {
        updatePromises.push(
          updateTargetValues("efficiency", {
            month,
            metrics: efficiencyMetrics.map((m) => ({
              metricCode: m.metricCode,
              targetValue: m.targetValue,
            })),
          }),
        );
      }

      await Promise.all(updatePromises);
      onSave(editedMetrics);
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
    if (qualityData && reviewData && efficiencyData) {
      const allMetrics = [
        ...qualityData.metrics,
        ...reviewData.metrics,
        ...efficiencyData.metrics,
      ];
      setEditedMetrics(allMetrics);
    }
    onClose();
  };

  // metrics props에서 현재값 찾기
  const getCurrentValue = (metricCode: string): string => {
    const found = metrics.find((m) => m.metricCode === metricCode);
    return found ? `${found.currentValue}` : "-";
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
        {/* 본문 */}
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                목표값 일괄 설정
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                전체 메트릭의 목표값을 일괄적으로 수정할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
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
                      <col className="w-[30%]" />
                      <col className="w-[20%]" />
                      <col className="w-[20%]" />
                      <col className="w-[30%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
                        <th className="px-4 py-3">지표명</th>
                        <th className="px-4 py-3 text-center">범주</th>
                        <th className="px-4 py-3">현재값</th>
                        <th className="px-4 py-3">목표값</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[30%]" />
                      <col className="w-[20%]" />
                      <col className="w-[20%]" />
                      <col className="w-[30%]" />
                    </colgroup>
                    <tbody>
                      {editedMetrics.map((metric, index) => {
                        const error = errors[index];
                        const hasError = error !== null && error !== undefined;
                        const metricCategory = categoryToMetricCategory(
                          metric.category,
                        );
                        return (
                          <React.Fragment key={metric.metricCode || index}>
                            <tr
                              className={
                                hasError ? "" : "border-b border-gray-100"
                              }
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {getMetricName(metric.metricCode)}
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                {(() => {
                                  const style =
                                    getCategoryStyle(metricCategory);
                                  return (
                                    <span
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                                      style={{
                                        color: style.color,
                                        borderColor: style.borderColor,
                                      }}
                                    >
                                      {getCategoryLabel(metricCategory)}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {getCurrentValue(metric.metricCode)}
                                {getMetricUnit(metric.metricCode)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={metric.targetValue}
                                    onChange={(e) =>
                                      handleTargetValueChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className={`w-[58%] text-[14px] text-gray-700 px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                                      hasError
                                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                                        : "border-gray-200 focus:ring-blue-500"
                                    }`}
                                  />
                                  <span className="w-[45px] text-sm text-gray-600 whitespace-nowrap">
                                    {getMetricUnit(metric.metricCode)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {hasError && (
                              <tr className="border-b border-gray-100">
                                <td colSpan={4} className="px-4 pb-2 pt-0">
                                  <span className="text-xs text-red-500">
                                    {getErrorMessage(error)}
                                  </span>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="cancel" size="sm" onClick={handleCancel}>
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={hasErrors || isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
