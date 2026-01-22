import { clsx } from "clsx";

/**
 * [변경: 2026-01-22 10:00, 김병현 수정] 스위치 토글 컴포넌트
 *
 * 사용 예시:
 * <Switch
 *   checked={displayMode === "rate"}
 *   onChange={(checked) => setDisplayMode(checked ? "rate" : "value")}
 *   leftLabel="실제값"
 *   rightLabel="달성률"
 * />
 */

interface SwitchProps {
  /** 스위치 활성화 상태 (true: 오른쪽, false: 왼쪽) */
  checked: boolean;
  /** 상태 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 왼쪽 라벨 텍스트 */
  leftLabel?: string;
  /** 오른쪽 라벨 텍스트 */
  rightLabel?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export const Switch = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false,
  className,
}: SwitchProps) => {
  return (
    // [변경: 2026-01-22 14:30, 김병현 수정] 버튼 토글 스타일로 디자인 변경
    <div
      className={clsx(
        "flex items-center border border-slate-200 rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange(false)}
        disabled={disabled}
        className={clsx(
          "px-4 py-1.5 text-sm font-medium transition-colors",
          !checked
            ? "bg-blue-600 text-white cursor-pointer"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange(true)}
        disabled={disabled}
        className={clsx(
          "px-4 py-1.5 border-l border-slate-200 text-sm font-medium transition-colors",
          checked
            ? "bg-blue-600 text-white cursor-pointer"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {rightLabel}
      </button>
    </div>
  );
};
