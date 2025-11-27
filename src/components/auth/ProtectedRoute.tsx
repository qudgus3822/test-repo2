import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { env } from "@/env";

/**
 * 인증된 사용자만 접근 가능한 라우트를 보호하는 컴포넌트
 *
 * 사용자가 로그인하지 않은 경우 로그인 페이지로 리다이렉트합니다.
 * 개발 환경(localhost)에서는 인증 체크를 건너뜁니다.
 */
const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);

  // 개발 환경에서는 인증 체크 건너뛰기
  if (env.isDev) {
    return <Outlet />;
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
