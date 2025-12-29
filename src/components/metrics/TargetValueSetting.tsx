import React, { useState, useEffect } from "react";
import type { TargetValueMetric } from "@/types/metrics.types";
import { MetricCategory } from "@/types/metrics.types";
import {
  getCategoryLabel,
  getMetricUnit,
  getMetricName,
} from "@/utils/metrics";
import { PALETTE_COLORS } from "@/styles/colors";
import { useTargetValues } from "@/api/hooks/useTargetValues";
import { updateTargetValues } from "@/api/metrics";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";

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

// 유효성 검사 에러 타입
type ValidationError = "empty" | "invalid" | null;

// 목표값 유효성 검사 함수
const validateTargetValue = (value: string): ValidationError => {
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
      return "정수 및 소수점 첫번째 자리까지 입력";
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

interface TargetValueSettingProps {
  month: string;
  onDataChange?: (metrics: TargetValueMetric[], hasErrors: boolean) => void;
  onApply?: () => void;
}

export const TargetValueSetting = ({
  month,
  onDataChange,
  onApply,
}: TargetValueSettingProps) => {
  const [editedMetrics, setEditedMetrics] = useState<TargetValueMetric[]>([]);
  const [errors, setErrors] = useState<Record<number, ValidationError>>({});
  const [isApplying, setIsApplying] = useState(false);

  // 3개 범주의 목표값 조회
  const { data: qualityData, isLoading: isLoadingQuality } = useTargetValues(
    "quality",
    month,
    true,
  );
  const { data: reviewData, isLoading: isLoadingReview } = useTargetValues(
    "review",
    month,
    true,
  );
  const { data: efficiencyData, isLoading: isLoadingEfficiency } =
    useTargetValues("efficiency", month, true);

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
      setErrors({});
    }
  }, [qualityData, reviewData, efficiencyData]);

  // 데이터 변경 시 부모에게 알림
  useEffect(() => {
    if (onDataChange && editedMetrics.length > 0) {
      const hasErrors = editedMetrics.some((metric, index) => {
        const error =
          errors[index] ?? validateTargetValue(String(metric.targetValue));
        return error !== null;
      });
      onDataChange(editedMetrics, hasErrors);
    }
  }, [editedMetrics, errors, onDataChange]);

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

  // 변경사항 적용 핸들러
  const handleApply = async () => {
    if (hasErrors || isApplying) return;

    setIsApplying(true);
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
      onApply?.();
    } catch {
      window.confirm("목표값 저장 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* 헤더 */}
      <div className="flex items-start justify-between pb-5 border-b border-gray-200 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">목표값 설정</h2>
      </div>

      {/* 테이블 */}
      <div className="flex-1 flex flex-col overflow-hidden text-sm">
        {/* 고정 헤더 */}
        <div className="[scrollbar-gutter:stable] pr-[15px]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[33%]" />
              <col className="w-[22%]" />
              <col className="w-[45%]" />
            </colgroup>
            <thead>
              <tr className="h-[45px] border-b border-gray-200 text-left font-medium text-gray-600">
                <th className="px-2">지표명</th>
                <th className="px-2 text-center">범주</th>
                <th className="px-2">목표값</th>
              </tr>
            </thead>
          </table>
        </div>
        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[33%]" />
              <col className="w-[22%]" />
              <col className="w-[45%]" />
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
                      className={`h-[51px] ${
                        hasError ? "" : "border-b border-gray-100"
                      }`}
                    >
                      <td className="px-2 text-gray-900">
                        {getMetricName(metric.metricCode)}
                      </td>
                      <td className="px-2 text-center">
                        {(() => {
                          const style = getCategoryStyle(metricCategory);
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
                      <td className="px-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={metric.targetValue}
                            onChange={(e) =>
                              handleTargetValueChange(index, e.target.value)
                            }
                            className={`w-[58%] text-gray-700 px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                              hasError
                                ? "border-red-300 bg-red-50 focus:ring-red-500"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                          <span className="text-gray-500 whitespace-nowrap">
                            {getMetricUnit(metric.metricCode)}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {hasError && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={3} className="px-2 pb-1 pt-0">
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
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        {/* <Button variant="cancel" size="sm">
          이전값 으로 재설정
        </Button> */}
        <Button
          variant="primary"
          size="sm"
          disabled={hasErrors || isApplying}
          onClick={handleApply}
        >
          {isApplying ? "적용 중..." : "변경사항 적용"}
        </Button>
      </div>
    </div>
  );
};
