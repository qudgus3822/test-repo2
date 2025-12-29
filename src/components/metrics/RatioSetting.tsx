import { useState, useEffect, useMemo } from "react";
import { MetricCategory } from "@/types/metrics.types";
import { getCategoryLabel, getMetricName } from "@/utils/metrics";
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
  onApply?: () => void;
}

export const RatioSetting = ({ month, onApply }: RatioSettingProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>(
    MetricCategory.CODE_QUALITY,
  );
  const [editedMetrics, setEditedMetrics] = useState<MetricWithWeight[]>([]);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isApplying, setIsApplying] = useState(false);

  // 비율 설정 조회 API
  const { data: weightSettingsData, isLoading } = useWeightSettings(
    month,
    true,
  );

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
            weight: m.weight,
          })),
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
    [editedMetrics],
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
        m.metricCode === metricCode ? { ...m, weight: 0 } : m,
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
      m.metricCode === metricCode ? { ...m, weight: numValue } : m,
    );
    setEditedMetrics(updated);
  };

  // 균등 분배
  // const handleDistributeEvenly = () => {
  //   const updated = editedMetrics.map((m) => ({ ...m, weight: 1 }));
  //   setEditedMetrics(updated);
  //   setErrors(new Map());
  // };

  // 에러 여부 확인
  const hasErrors = errors.size > 0;

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
                    const error = errors.get(metric.metricCode);
                    return (
                      <tr
                        key={metric.metricCode}
                        className="h-[51px] border-b border-gray-100"
                      >
                        <td className="px-2 text-gray-900">
                          <div className="flex flex-col">
                            <span>{getMetricName(metric.metricCode)}</span>
                            {error && (
                              <span className="text-red-500">{error}</span>
                            )}
                          </div>
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
                              className={`w-20 text-center text-gray-700 px-2 py-1.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                error
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200"
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-2 text-gray-700 text-center">
                          {calculateRatio(metric.weight)}%
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
