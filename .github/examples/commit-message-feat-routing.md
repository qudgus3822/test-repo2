# 커밋 메시지 예시: feat (기능 추가)

## 타입: 라우팅 구조 및 에러 처리 시스템 구축

```
feat: 라우팅 구조 및 에러 처리 시스템 구축

- React Router 기반 라우팅 구조로 전환 (App.tsx, main.tsx)
- Layout 컴포넌트를 통한 중첩 라우팅 구현 (Outlet 활용)
- 페이지 컴포넌트 생성 (Dashboard, Login, Logout)
- GlobalErrorBoundary를 통한 전역 에러 핸들링 추가
- react-hot-toast를 활용한 API 에러 알림 시스템 구축
- Vite 환경 변수 설정 (.env, vite-env.d.ts, env.ts)
- Suspense 기반 로딩 화면 구현

# 상세 설명

## 라우팅 구조 변경
- App.tsx: Routes와 중첩 라우팅 구조로 변경
  - Layout 컴포넌트를 통한 공통 레이아웃 적용
  - 페이지별 Route 설정 (/, /login, /logout)
- main.tsx: BrowserRouter 추가, QueryProvider는 App.tsx로 이동
- 페이지 네이밍 규칙: 'Page' 접미사 제외 (Dashboard, Login, Logout)

## 에러 처리 시스템
- GlobalErrorBoundary 컴포넌트 생성
  - React 렌더링 에러 캐치
  - 에러 발생 시 사용자 친화적인 UI 표시
  - 새로고침 버튼 제공
- errorHandler.ts에 react-hot-toast 연동
  - 상태 코드별 토스트 스타일 차별화 (401/403: 🔒, 500+: ⚠️)
  - duration 및 position 설정 (top-right)
  - showErrorNotification 함수로 API 에러 알림 표시

## App 구조 개선
- Suspense로 비동기 컴포넌트 로딩 처리
- GlobalErrorBoundary → QueryClientProvider → Routes 구조
- React Query 설정 (retry, staleTime, gcTime)
- 개발 환경에서만 ReactQueryDevtools 표시

## 환경 변수 설정
- .env 파일 생성 (VITE_ 접두사 사용)
  - VITE_API_BASE_URL, VITE_ENV, VITE_APP_NAME
- vite-env.d.ts: TypeScript 타입 정의 추가
- src/env.ts: 환경 변수 헬퍼 모듈 생성
  - getEnv 함수로 환경 변수 검증
  - camelCase 변환으로 JavaScript 컨벤션 준수
  - isDev, isProd 헬퍼 제공

## 라이브러리 추가
- react-hot-toast: 토스트 알림 시스템
- lucide-react: 아이콘 라이브러리
```

## 특징
- **타입**: feat (새로운 기능 추가)
- **범위**: 라우팅, 에러 처리
- **본문**: 7개 주요 변경사항을 `-` 로 나열
- **상세 설명**: 5개 서브섹션으로 구성
- **설명 방식**: 무엇을, 왜 변경했는지 명확히 설명
