import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

/**
 * 버튼 컴포넌트 사용 예시

  // LoginPage에서 현재 사용 중
  <Button type="submit" fullWidth>로그인</Button>

  // 다른 variant 사용
  <Button variant="normal">기본</Button>
  <Button variant="danger">삭제</Button>

  // 크기 변경
  <Button size="sm">작은 버튼</Button>
  <Button size="lg">큰 버튼</Button>
 */

const BUTTON_VARIANTS = {
  primary:
    "bg-[#005FCC] text-[#FFFFFF] border border-[#005FCC] hover:bg-[#1D4ED8] disabled:cursor-not-allowed  disabled:bg-[#33393F0C] disabled:text-[#CCCCCC]", // 저장
  normal:
    "bg-[#FFFFFF] text-[#374151] border border-[#D1D5DB] hover:bg-[#F9FAFB] disabled:cursor-not-allowed  disabled:bg-[#33393F0C] disabled:text-[#CCCCCC]", // 기본
  cancel:
    "bg-[#FFFFFF] text-[#374151] border border-[#D1D5DB] hover:bg-[#F9FAFB]", // 취소
  danger: "bg-[#F39200] text-[#FFFFFF] hover:bg-[#E66100]", // 삭제/경고
  warning: "bg-[#FABA3F] text-[#FFFFFF] hover:bg-[#F39200]", // 주의
  setting:
    "bg-[#1E54B8] text-[#FFFFFF] border border-[#1E54B8] hover:bg-[#1B21A6] disabled:bg-[#9CA3AF] disabled:border-[#9CA3AF] disabled:text-[#E5E7EB]", // '설정' 버튼 (PALETTE_COLORS.blue → darkBlue on hover)
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-md",
  lg: "px-6 py-4 text-lg",
};

// [변경: 2026-01-29 17:00, 임도휘 수정] 반응형 패딩 적용 시 사용 (xl:1280px 미만: 패딩 줄임, xl:1280px 이상: 기본 패딩)
const BUTTON_SIZES_RESPONSIVE = {
  sm: "px-2 xl:px-3 py-1.5 text-sm",
  md: "px-3 xl:px-5 py-2 text-md",
  lg: "px-4 xl:px-6 py-4 text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  fullWidth?: boolean;
  /** 반응형 패딩 적용 여부 (xl:1280px 기준) */
  responsive?: boolean;
}

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  responsive = false,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "flex cursor-pointer items-center justify-center rounded-[8px] font-medium text-[#000000] whitespace-nowrap",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-90 disabled:border-gray-200",
        BUTTON_VARIANTS[variant],
        responsive ? BUTTON_SIZES_RESPONSIVE[size] : BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
