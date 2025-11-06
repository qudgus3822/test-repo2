# API Hooks 사용 가이드

## 기본 사용법

### 1. GET 요청 (데이터 조회)

```tsx
import { useExamples, useExample } from '@/api/hooks/useExample';

function ExampleList() {
  const { data, isLoading, error } = useExamples();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생!</div>;

  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

function ExampleDetail({ id }: { id: number }) {
  const { data, isLoading } = useExample(id);

  if (isLoading) return <div>로딩 중...</div>;

  return <div>{data?.name}</div>;
}
```

### 2. POST/PUT/DELETE 요청 (데이터 변경)

```tsx
import { useCreateExample, useUpdateExample, useDeleteExample } from '@/api/hooks/useExample';

function ExampleForm() {
  const createMutation = useCreateExample();
  const updateMutation = useUpdateExample();
  const deleteMutation = useDeleteExample();

  const handleCreate = () => {
    createMutation.mutate(
      { name: '새 항목', description: '설명' },
      {
        onSuccess: () => {
          console.log('생성 성공!');
        },
        onError: (error) => {
          console.error('생성 실패:', error);
        },
      }
    );
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      name: '수정된 이름',
      description: '수정된 설명',
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createMutation.isPending}>
        {createMutation.isPending ? '생성 중...' : '생성'}
      </button>

      {createMutation.isError && (
        <div>에러: {createMutation.error.message}</div>
      )}
    </div>
  );
}
```

## 새로운 API Hook 만들기

`src/api/hooks/useYourApi.ts` 파일을 생성하고 `useExample.ts`를 참고하여 작성하세요.

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/libs/axios';

// 1. Query Keys 정의
export const yourApiKeys = {
  all: ['yourApi'] as const,
  // ...
};

// 2. GET Hook
export const useYourData = () => {
  return useQuery({
    queryKey: yourApiKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get('/your-endpoint');
      return data;
    },
  });
};

// 3. Mutation Hook
export const useCreateYourData = () => {
  return useMutation({
    mutationFn: async (newData) => {
      const { data } = await apiClient.post('/your-endpoint', newData);
      return data;
    },
  });
};
```

## 주요 기능

- **자동 캐싱**: 동일한 데이터 재요청 시 캐시된 데이터 사용
- **자동 재검증**: 특정 조건에서 데이터 자동 갱신
- **에러 핸들링**: Axios 인터셉터에서 전역 에러 처리
- **인증 토큰**: 자동으로 Authorization 헤더에 토큰 추가
- **DevTools**: 개발 환경에서 React Query DevTools 사용 가능
