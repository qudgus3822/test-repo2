import { useAuth } from "@/api/hooks/useAuth";
import { useEffect } from "react";

const LogoutPage = () => {
  const { logout, isLoggingOut } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-lg text-gray-700">
          {isLoggingOut ? "로그아웃 중..." : "로그인 페이지로 이동합니다..."}
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
