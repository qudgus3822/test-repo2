import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  checkAuthStatus,
  logoutFromServer,
  checkBackendHealth,
  loginToServer,
  type LoginRequest,
} from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  health: () => [...authKeys.all, "health"] as const,
};

/**
 * 현재 사용자 정보 조회 (쿠키 기반 인증)
 * @returns React Query 결과 객체
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: checkAuthStatus,
    staleTime: 5 * 60 * 1000, // 5분
    retry: false, // 인증 실패 시 재시도 하지 않음
  });
};

/**
 * 로그인 mutation
 * @returns React Query mutation 객체
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

  return useMutation({
    mutationFn: loginToServer,
    onSuccess: (data) => {
      // React Query 캐시 업데이트
      queryClient.setQueryData(authKeys.user(), data.user);
      // Zustand 스토어 업데이트 (localStorage에 persist)
      setLoggedIn(data.user);
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
  });
};

/**
 * 로그아웃 mutation
 * @returns React Query mutation 객체
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

  return useMutation({
    mutationFn: logoutFromServer,
    onSuccess: () => {
      // React Query 캐시 초기화
      queryClient.clear();
      // Zustand 스토어 초기화 (localStorage에서도 제거)
      setLoggedOut();
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
    },
  });
};

/**
 * 백엔드 서버 상태 확인
 * @returns React Query 결과 객체
 */
export const useBackendHealth = () => {
  return useQuery({
    queryKey: authKeys.health(),
    queryFn: checkBackendHealth,
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 체크
  });
};

/**
 * 통합 인증 훅 - 로그인, 로그아웃, 사용자 정보 조회
 * @returns 인증 관련 모든 기능을 포함하는 객체
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: user, isLoading, error } = useCurrentUser();

  const login = async (credentials: LoginRequest) => {
    const result = await loginMutation.mutateAsync(credentials);
    navigate("/dashboard");
    return result;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      // 실패해도 로그인 페이지로 이동
      navigate("/login");
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  };
};
