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
 * @param enabled - 쿼리 활성화 여부 (로그인 중일 때 false로 설정하여 race condition 방지)
 * @returns React Query 결과 객체
 */
export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: checkAuthStatus,
    staleTime: 0, // 항상 서버에서 인증 상태 확인
    retry: false, // 인증 실패 시 재시도 하지 않음
    enabled, // 로그인 중에는 비활성화하여 중복 요청 방지
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
      // Zustand 스토어 초기화
      setLoggedOut();
      // user 쿼리 캐시를 null로 설정하여 즉시 로그아웃 상태 반영
      queryClient.setQueryData(authKeys.user(), null);
      // React Query 캐시 전체 초기화
      queryClient.clear();
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
      // 로그아웃 실패해도 클라이언트 상태는 초기화
      setLoggedOut();
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.clear();
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
    staleTime: 4 * 60 * 60 * 1000, // 4시간
    refetchInterval: 4 * 60 * 60 * 1000, // 4시간마다 자동 체크
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
  // 로그인 중일 때는 useCurrentUser 쿼리를 비활성화하여 race condition 방지
  const { data: user, isLoading, error } = useCurrentUser(!loginMutation.isPending);

  const login = async (credentials: LoginRequest) => {
    const result = await loginMutation.mutateAsync(credentials);
    navigate("/dashboard");
    return result;
  };

  const logout =  async () => {
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
