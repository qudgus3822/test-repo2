import { useLogout } from "@/api/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutMutation.mutateAsync();
      } catch (error) {
        console.error("로그아웃 중 오류:", error);
      } finally {
        navigate("/login");
      }
    };
    performLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-lg text-gray-700">
          {logoutMutation.isPending ? "로그아웃 중..." : "로그인 페이지로 이동합니다..."}
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
