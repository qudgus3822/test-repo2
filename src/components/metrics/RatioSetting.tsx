import React, { useState, useEffect, useMemo } from "react";
import { MetricCategory } from "@/types/metrics.types";
import { getCategoryLabel } from "@/utils/metrics";
import { useWeightSettings } from "@/api/hooks/useWeightSettings";
import { updateWeightSettings } from "@/api/metrics";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";

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

// 유효성 검사 에러 타입
type ValidationError = "empty" | "invalid" | null;

// 가중치 유효성 검사 함수
const validateWeight = (value: string): ValidationError => {
  const trimmedValue = value.trim();
  if (trimmedValue === "" || trimmedValue === "0") {
    return "empty";
  }

  // 1~3 사이의 정수만 허용
  const numValue = parseInt(trimmedValue, 10);
  if (isNaN(numValue) || numValue < 1 || numValue > 3) {
    return "invalid";
  }

  return null;
};

// 에러 메시지 반환
const getErrorMessage = (error: ValidationError): string => {
  switch (error) {
    case "empty":
      return "가중치는 1~3 사이의 정수를 입력해주세요.";
    case "invalid":
      return "1~3 사이의 정수를 입력해주세요.";
    default:
      return "";
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
  metricName: string;
  weight: number;
}

interface RatioSettingProps {
  month: string;
  onApply?: () => void;
}

export const RatioSetting = ({ month, onApply }: RatioSettingProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>(
    MetricCategory.CODE_QUALITY,
  );
  const [editedMetrics, setEditedMetrics] = useState<MetricWithWeight[]>([]);
  const [errors, setErrors] = useState<Record<string, ValidationError>>({});
  const [isApplying, setIsApplying] = useState(false);

  // 비율 설정 조회 API
  const {
    data: weightSettingsData,
    isLoading,
    refetch,
  } = useWeightSettings(month, true, true);

  // API 데이터가 로드되면 해당 카테고리의 가중치 적용
  useEffect(() => {
    if (weightSettingsData) {
      const categoryValue = getCategoryValue(selectedCategory);
      const categorySetting = weightSettingsData.settings.find(
        (s) => s.category === categoryValue,
      );

      if (categorySetting) {
        setEditedMetrics(
          categorySetting.metrics.map((m) => ({
            metricCode: m.metricCode,
            metricName: m.metricName,
            weight: m.weight,
          })),
        );
      } else {
        setEditedMetrics([]);
      }
      setErrors({});
    }
  }, [weightSettingsData, selectedCategory]);

  // 총 가중치 합계
  const totalWeight = useMemo(
    () => editedMetrics.reduce((sum, m) => sum + m.weight, 0),
    [editedMetrics],
  );

  // 비율 계산 함수
  const calculateRatio = (weight: number): string => {
    if (totalWeight === 0) return "0.0";
    return ((weight / totalWeight) * 100).toFixed(2);
  };

  // 가중치 변경 핸들러
  const handleWeightChange = (metricCode: string, value: string) => {
    const updated = editedMetrics.map((m) =>
      m.metricCode === metricCode ? { ...m, weight: value === "" ? 0 : parseInt(value, 10) } : m,
    );
    setEditedMetrics(updated);

    // 유효성 검사 실행
    const error = validateWeight(value);
    setErrors((prev) => ({ ...prev, [metricCode]: error }));
  };

  // 균등 분배
  // const handleDistributeEvenly = () => {
  //   const updated = editedMetrics.map((m) => ({ ...m, weight: 1 }));
  //   setEditedMetrics(updated);
  //   setErrors({});
  // };

  // 에러 여부 확인
  const hasErrors = editedMetrics.some((metric) => {
    const error = errors[metric.metricCode] ?? validateWeight(String(metric.weight));
    return error !== null;
  });

  // 변경사항 적용 핸들러
  const handleApply = async () => {
    if (hasErrors || isApplying) return;

    setIsApplying(true);
    try {
      const categoryValue = getCategoryValue(selectedCategory);
      await updateWeightSettings(categoryValue, {
        month,
        metrics: editedMetrics.map((m) => ({
          metricCode: m.metricCode,
          weight: m.weight,
        })),
      });
      await refetch();
      onApply?.();
    } catch {
      window.confirm("비율 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex flex-col items-start justify-between pb-2 gap-1">
        <h2 className="text-lg font-semibold text-gray-900">
          범주별 비율 설정
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          범주별 지표의 가중치를 정수로 설정하면 자동으로 비율(%)이 계산됩니다
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex space-x-6 border-b border-gray-200 pb-2 pt-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 -mb-[10px] transition-colors cursor-pointer ${
              selectedCategory === category
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* 본문 - 테이블 */}
      <div className="flex-1 flex flex-col overflow-hidden text-sm">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : editedMetrics.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">지표 데이터가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 고정 헤더 */}
            <div className="[scrollbar-gutter:stable] pr-[15px]">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[30%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead>
                  <tr className="h-[45px] border-b border-gray-200 text-left font-medium text-gray-600">
                    <th className="px-2">지표명</th>
                    <th className="px-2 text-center">가중치(1~3)</th>
                    <th className="px-2 text-center">비율</th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[30%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <tbody>
                  {editedMetrics.map((metric) => {
                    const error = errors[metric.metricCode];
                    const hasError = error !== null && error !== undefined;
                    return (
                      <React.Fragment key={metric.metricCode}>
                        <tr
                          className={`h-[51px] ${
                            hasError ? "" : "border-b border-gray-100"
                          }`}
                        >
                          <td className="px-2 text-gray-900">
                            {metric.metricName}
                          </td>
                          <td className="px-2">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                min={1}
                                max={3}
                                value={metric.weight || ""}
                                onChange={(e) =>
                                  handleWeightChange(
                                    metric.metricCode,
                                    e.target.value,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                className={`w-20 text-center text-gray-700 px-2 py-1.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                                  hasError
                                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-blue-500"
                                }`}
                              />
                            </div>
                          </td>
                          <td className="px-2 text-gray-700 text-center">
                            {calculateRatio(metric.weight)}%
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
          </>
        )}
      </div>

      {/* 합계 */}
      {editedMetrics.length > 0 && (
        <div className="mt-4 px-3 py-2 bg-blue-50 rounded-lg flex justify-between items-center text-sm h-[51px]">
          <span className="font-medium text-gray-700">합계</span>
          <span className="font-semibold text-blue-600">100.0%</span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
        {/* <Button variant="cancel" size="sm" onClick={handleReset}>
          균등 분배
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
