import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { MetricStatus } from "@/types/metrics.types";
import { getStatusIconConfig } from "@/utils/metrics";

export type AchievementRateFilterType =
  | "all"
  | "excellent"
  | "warning"
  | "danger";

interface AchievementRateFilterProps {
  value: AchievementRateFilterType;
  onChange: (value: AchievementRateFilterType) => void;
  excellentThreshold: number;
  dangerThreshold: number;
}

/**
 * 달성률 필터 컴포넌트
 *
 * 전체/우수/경고/위험 달성률 필터를 제공합니다.
 *
 * @example
 * <AchievementRateFilter
 *   value="all"
 *   onChange={setAchievementRateFilter}
 * />
 */
export const AchievementRateFilter = ({
  value,
  onChange,
  excellentThreshold,
  dangerThreshold,
}: AchievementRateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 아이콘 설정
  const excellentConfig = getStatusIconConfig(MetricStatus.EXCELLENT);
  const warningConfig = getStatusIconConfig(MetricStatus.WARNING);
  const dangerConfig = getStatusIconConfig(MetricStatus.DANGER);

  const ExcellentIcon = excellentConfig.icon;
  const WarningIcon = warningConfig.icon;
  const DangerIcon = dangerConfig.icon;

  const ACHIEVEMENT_RATE_OPTIONS = [
    {
      value: "all" as const,
      label: "전체",
      icon: null,
      color: null,
    },
    {
      value: "excellent" as const,
      label: `${excellentThreshold}% 이상`,
      icon: ExcellentIcon,
      color: excellentConfig.color,
    },
    {
      value: "warning" as const,
      label: `${dangerThreshold}% ~ ${excellentThreshold}% 미만`,
      icon: WarningIcon,
      color: warningConfig.color,
    },
    {
      value: "danger" as const,
      label: `${dangerThreshold}% 미만`,
      icon: DangerIcon,
      color: dangerConfig.color,
    },
  ];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = ACHIEVEMENT_RATE_OPTIONS.find(
    (opt) => opt.value === value,
  );

  const handleSelect = (optionValue: AchievementRateFilterType) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">달성률</span>
      <div className="relative" ref={dropdownRef}>
        {/* 선택된 값 표시 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="min-w-[200px] px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon && (
              <selectedOption.icon
                className="w-4 h-4"
                style={{ color: selectedOption.color || undefined }}
              />
            )}
            <span>{selectedOption?.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 드롭다운 옵션 */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
            {ACHIEVEMENT_RATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                  value === option.value ? "bg-blue-50" : ""
                }`}
              >
                {option.icon && (
                  <option.icon
                    className="w-4 h-4"
                    style={{ color: option.color || undefined }}
                  />
                )}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
