import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

// 예제 타입
interface ExampleItem {
  id: number;
  name: string;
  description: string;
}

// Query Keys (캐시 관리를 위한 키)
export const exampleKeys = {
  all: ['examples'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  list: (filters: string) => [...exampleKeys.lists(), { filters }] as const,
  details: () => [...exampleKeys.all, 'detail'] as const,
  detail: (id: number) => [...exampleKeys.details(), id] as const,
};

// GET 요청 예제 - 목록 조회
export const useExamples = () => {
  return useQuery({
    queryKey: exampleKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ExampleItem[]>>('/examples');
      return data.data;
    },
  });
};

// GET 요청 예제 - 상세 조회
export const useExample = (id: number) => {
  return useQuery({
    queryKey: exampleKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ExampleItem>>(`/examples/${id}`);
      return data.data;
    },
    enabled: !!id, // id가 있을 때만 실행
  });
};

// POST 요청 예제 - 생성
export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newItem: Omit<ExampleItem, 'id'>) => {
      const { data } = await apiClient.post<ApiResponse<ExampleItem>>('/examples', newItem);
      return data.data;
    },
    onSuccess: () => {
      // 생성 성공 시 목록 캐시 무효화하여 자동 refetch
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
    },
  });
};

// PUT 요청 예제 - 수정
export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: ExampleItem) => {
      const { data } = await apiClient.put<ApiResponse<ExampleItem>>(`/examples/${id}`, updateData);
      return data.data;
    },
    onSuccess: (data) => {
      // 수정 성공 시 해당 아이템과 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: exampleKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
    },
  });
};

// DELETE 요청 예제 - 삭제
export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<void>>(`/examples/${id}`);
      return data;
    },
    onSuccess: () => {
      // 삭제 성공 시 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: exampleKeys.lists() });
    },
  });
};
