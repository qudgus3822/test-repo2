import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

/**
 * 버튼 컴포넌트 사용 예시

  // LoginPage에서 현재 사용 중
  <Button type="submit" fullWidth>로그인</Button>

  // 다른 variant 사용
  <Button variant="secondary">취소</Button>
  <Button variant="danger">삭제</Button>

  // 크기 변경
  <Button size="sm">작은 버튼</Button>
  <Button size="lg">큰 버튼</Button>
 */

const BUTTON_VARIANTS = {
  primary: "bg-[#FF6C00] hover:bg-[#E66100] focus:ring-[#FF6C00]",
  secondary: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500",
  danger: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
};

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-3 text-md",
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
        "rounded-md font-medium text-white transition-colors cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
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
