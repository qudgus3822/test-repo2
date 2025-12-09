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
    "bg-[#1E54B8] text-[#FFFFFF] border border-[#1E54B8] hover:bg-[#1B21A6]", // '비율 설정' 버튼 (PALETTE_COLORS.blue → darkBlue on hover)
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-md",
  lg: "px-6 py-4 text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  fullWidth?: boolean;
}

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "flex cursor-pointer items-center justify-center rounded-[8px] font-medium text-[#000000]",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-none",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
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
