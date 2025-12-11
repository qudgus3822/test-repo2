import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/api/hooks/useAuth";
import { env } from "@/env";

/**
 * 인증된 사용자만 접근 가능한 라우트를 보호하는 컴포넌트
 *
 * 새로고침 시 서버에서 인증 상태를 확인하고 Zustand store에 동기화합니다.
 * 사용자가 로그인하지 않은 경우 로그인 페이지로 리다이렉트합니다.
 * VITE_SKIP_AUTH=true 설정 시 인증 체크를 건너뜁니다.
 */
const ProtectedRoute = () => {
  const storeUser = useAuthStore((state) => state.user);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const { data: serverUser, isLoading, isFetched } = useCurrentUser();

  // 서버에서 가져온 사용자 정보를 Zustand store에 동기화
  useEffect(() => {
    if (serverUser && !storeUser) {
      setLoggedIn(serverUser);
    }
  }, [serverUser, storeUser, setLoggedIn]);

  // VITE_SKIP_AUTH=true인 경우 인증 체크 건너뛰기
  if (env.skipAuth) {
    return <Outlet />;
  }

  // 서버에서 인증 상태 확인 중일 때 로딩 표시
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 서버 확인 완료 후 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (isFetched && !serverUser) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
