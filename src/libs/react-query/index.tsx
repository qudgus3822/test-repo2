import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { setQueryClient } from "@/libs/fetch";

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      staleTime: 1000 * 60 * 60 * 4, // 4시간 데이터를 fresh 상태로 유지
      gcTime: 1000 * 60 * 60 * 4, // 4시간 캐시 유지 (구 cacheTime)
    },
    mutations: {
      retry: 0, // mutation은 재시도 안함
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

// apiFetch에서 401 에러 시 캐시 초기화를 위해 QueryClient 인스턴스 등록
setQueryClient(queryClient);

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
};
