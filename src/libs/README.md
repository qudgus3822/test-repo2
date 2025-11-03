# libs 디렉터리

외부 라이브러리의 설정 및 래핑(wrapping)을 담당하는 **인프라 계층**입니다.

## 디렉터리 구조

```
libs/
├── axios/          # API 통신 클라이언트 (Axios 인스턴스 + 인터셉터)
├── react-query/    # React Query 설정 + Provider
├── chart/          # 차트 라이브러리 (Recharts)
├── sso/            # SSO 인증 설정 (예정)
├── cookie/         # 쿠키 관리 (예정)
└── websocket/      # WebSocket 연결 (예정)
```

## 역할

### 인프라 계층 (libs) vs 비즈니스 계층 (api)

| 계층         | 경로        | 책임                | 예시                              |
| ------------ | ----------- | ------------------- | --------------------------------- |
| **인프라**   | `src/libs/` | "어떻게" 통신하는가 | axios 설정, 인터셉터, SSO 연동    |
| **비즈니스** | `src/api/`  | "무엇을" 요청하는가 | 대시보드 데이터 조회, 사용자 생성 |

## 사용 예시

### axios - API 클라이언트

```tsx
// libs/axios를 직접 사용
import apiClient from "@/libs/axios";

const response = await apiClient.get("/endpoint");
```

**대부분의 경우 `libs`를 직접 사용하지 않고, `api/hooks`를 사용하세요:**

```tsx
// 권장: api/hooks 사용
import { useExamples } from "@/api/hooks/useExample";

const { data, isLoading } = useExamples();
```

### react-query - React Query Provider

```tsx
// src/main.tsx
import { QueryProvider } from "@/libs/react-query";

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>,
);
```

### chart - 차트 컴포넌트

```tsx
// 라인 차트 사용
import { LineChart, CHART_COLORS } from "@/libs/chart";

const data = [
  { month: "1월", 지수: 65 },
  { month: "2월", 지수: 72 },
];

<LineChart
  data={data}
  xKey="month"
  yKeys={["지수"]}
  colors={[CHART_COLORS.primary]}
  height={300}
/>;

// 더 자세한 사용법은 src/libs/chart/README.md 참고
```

## 새로운 라이브러리 추가 가이드

1. **libs 하위에 디렉터리 생성**

   ```bash
   mkdir src/libs/your-library
   ```

2. **index.ts에서 설정 및 내보내기**

   ```tsx
   // src/libs/your-library/index.ts
   import SomeLibrary from "some-library";

   export const configuredLibrary = new SomeLibrary({
     // 설정...
   });
   ```

3. **필요한 곳에서 import**
   ```tsx
   import { configuredLibrary } from "@/libs/your-library";
   ```

## 주의사항

- ⚠️ **libs는 인프라 담당자만 수정**하도록 권장합니다
- 일반 기능 개발 시에는 `api/hooks`를 사용하세요
- libs 변경 시 전체 프로젝트에 영향을 줄 수 있으므로 신중히 리뷰하세요

## 예정된 라이브러리

- `sso/` - SSO 인증 (Keycloak, OAuth 등)
- `cookie/` - 쿠키 관리 (react-cookie)
- `websocket/` - 실시간 데이터 통신
- `monitoring/` - 에러 모니터링 (Sentry 등)
