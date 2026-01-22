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
    <div className={clsx("flex items-center gap-2", className)}>
      {leftLabel && (
        <span
          className={clsx(
            "text-sm font-medium transition-colors",
            !checked ? "text-blue-600" : "text-gray-500"
          )}
        >
          {leftLabel}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-300",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      {rightLabel && (
        <span
          className={clsx(
            "text-sm font-medium transition-colors",
            checked ? "text-blue-600" : "text-gray-500"
          )}
        >
          {rightLabel}
        </span>
      )}
    </div>
  );
};
