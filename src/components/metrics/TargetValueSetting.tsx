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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
}

export const TargetValueSetting = ({
  month,
  onDataChange,
}: TargetValueSettingProps) => {
  const [editedMetrics, setEditedMetrics] = useState<TargetValueMetric[]>([]);
  const [errors, setErrors] = useState<Record<number, ValidationError>>({});

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
      <div className="pb-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900">목표값 설정</h4>
        <p className="text-xs text-gray-500 mt-1">
          각 지표의 목표값을 수정할 수 있습니다.
        </p>
      </div>

      {/* 테이블 */}
      <div className="flex-1 flex flex-col overflow-hidden pt-3">
        {/* 고정 헤더 */}
        <div className="[scrollbar-gutter:stable] pr-[8px]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[35%]" />
              <col className="w-[20%]" />
              <col className="w-[45%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-600">
                <th className="px-2 py-2">지표명</th>
                <th className="px-2 py-2 text-center">범주</th>
                <th className="px-2 py-2">목표값</th>
              </tr>
            </thead>
          </table>
        </div>
        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[35%]" />
              <col className="w-[20%]" />
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
                      className={hasError ? "" : "border-b border-gray-100"}
                    >
                      <td className="px-2 py-2 text-xs text-gray-900">
                        {getMetricName(metric.metricCode)}
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        {(() => {
                          const style = getCategoryStyle(metricCategory);
                          return (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
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
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={metric.targetValue}
                            onChange={(e) =>
                              handleTargetValueChange(index, e.target.value)
                            }
                            className={`w-[60%] text-xs text-gray-700 px-2 py-1 bg-gray-50 border rounded focus:outline-none focus:ring-1 focus:border-transparent ${
                              hasError
                                ? "border-red-300 bg-red-50 focus:ring-red-500"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {getMetricUnit(metric.metricCode)}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {hasError && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={3} className="px-2 pb-1 pt-0">
                          <span className="text-[10px] text-red-500">
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
    </div>
  );
};
