# Barcode Plus Front

빗썸의 품질 지표 관리 대시보드 프론트엔드 프로젝트입니다.

## 기술 스택

### 핵심 기술

- **React 19** - 최신 React 기능 활용
- **TypeScript 5.8** - 타입 안정성 확보
- **Vite 7** - 빠른 개발 환경과 빌드 최적화

### 주요 라이브러리

- **TailwindCSS 4.x** - 유틸리티 우선 CSS 프레임워크
- **React Router 7** - 클라이언트 사이드 라우팅
- **React Query (TanStack Query)** - 서버 상태 관리 및 데이터 페칭
- **Zustand** - 클라이언트 상태 관리
- **Axios** - HTTP 클라이언트
- **Recharts** - 데이터 시각화 및 차트
- **Lucide React** - 아이콘 라이브러리
- **React Hot Toast** - 토스트 알림

## 주요 기능

- **대시보드** - 품질 지표 현황, 생산성 트렌드, 서비스 안정성 모니터링
- **지표 관리** - 품질 메트릭 조회 및 관리
- **인증 시스템** - 로그인/로그아웃 (SSO 인증 예정)
- **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 외부 공개 (ngrok)

로컬 개발 환경을 외부에 공개하려면 ngrok을 사용할 수 있습니다.

#### 1. ngrok 설치

```bash
# macOS (Homebrew)
brew install ngrok/ngrok/ngrok

# Windows (Chocolatey)
choco install ngrok

# Linux (Snap)
snap install ngrok

# 또는 공식 웹사이트에서 다운로드
# https://ngrok.com/download
```

#### 2. ngrok 인증 (최초 1회)

[ngrok 대시보드](https://dashboard.ngrok.com/get-started/your-authtoken)에서 인증 토큰을 받아 설정합니다:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

#### 3. 개발 서버와 ngrok 실행

터미널을 2개 열어서 각각 실행:

```bash
# 터미널 1: 개발 서버 실행
npm run dev

# 터미널 2: ngrok 실행
npm run ngrok
```

ngrok이 실행되면 공개 URL이 표시됩니다 (예: `https://abcd1234.ngrok.io`).
이 URL을 사용하여 외부에서 로컬 개발 환경에 접근할 수 있습니다.

#### 주의사항

- ngrok 무료 플랜은 세션당 2시간 제한이 있습니다
- 매번 실행할 때마다 새로운 랜덤 URL이 생성됩니다
- 백엔드 API도 외부에 공개해야 하는 경우, `ngrok.yml`의 주석을 해제하고 추가 터널을 설정하세요

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 디렉터리에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

프로덕션 빌드를 로컬에서 미리 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── api/                 # API 통신 계층
│   ├── hooks/          # React Query hooks
│   └── mocks/          # 목업 데이터
├── components/         # React 컴포넌트
│   ├── dashboard/     # 대시보드 컴포넌트
│   ├── metrics/       # 지표 관리 컴포넌트
│   ├── layout/        # 레이아웃 컴포넌트
│   ├── ui/            # 공통 UI 컴포넌트
│   └── error/         # 에러 핸들링 컴포넌트
├── libs/               # 외부 라이브러리 래핑
│   ├── axios/         # API 클라이언트 설정
│   ├── react-query/   # React Query 설정
│   └── chart/         # 차트 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── dashboard/     # 대시보드 페이지
│   ├── metrics/       # 지표 관리 페이지
│   └── login/         # 로그인/로그아웃 페이지
├── store/              # 전역 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
├── styles/             # 스타일 관련 파일
└── assets/             # 정적 자산 (이미지, 아이콘 등)
```

## 아키텍처 원칙

### 계층 분리

| 계층         | 경로        | 책임                | 예시                              |
| ------------ | ----------- | ------------------- | --------------------------------- |
| **인프라**   | `src/libs/` | "어떻게" 통신하는가 | axios 설정, 인터셉터, SSO 연동    |
| **비즈니스** | `src/api/`  | "무엇을" 요청하는가 | 대시보드 데이터 조회, 사용자 생성 |

### 컴포넌트 설계

- **재사용 가능한 UI 컴포넌트**: `components/ui/` 디렉터리에 Button, Card 등 공통 컴포넌트 관리
- **도메인별 컴포넌트 분리**: dashboard, metrics 등 도메인별로 컴포넌트 구조화
- **레이아웃 컴포넌트**: Header, Sidebar, Layout 등 전체 레이아웃 구조 관리

## 개발 가이드

### API 연동

React Query hooks를 사용하여 API와 통신합니다:

```tsx
import { useQualityMetrics } from "@/api/hooks/useQualityMetrics";

function MetricsPage() {
  const { data, isLoading, error } = useQualityMetrics();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생!</div>;

  return <div>{/* 데이터 렌더링 */}</div>;
}
```

자세한 내용은 [API Hooks 가이드](src/api/hooks/README.md)를 참고하세요.

### 스타일링

TailwindCSS를 사용하여 스타일링합니다. 프로젝트 고유의 스타일 가이드는 [TailwindCSS 가이드](.github/TAILWINDCSS_GUIDE.md)를 참고하세요.

주요 원칙:

- 최소한의 유틸리티 클래스 사용
- variant 패턴으로 일관성 유지
- 모바일 우선 반응형 디자인

### 차트 사용

Recharts 기반의 래핑된 차트 컴포넌트를 사용합니다:

```tsx
import { LineChart, DonutChart } from "@/libs/chart";

<LineChart data={chartData} xKey="date" yKeys={["value"]} height={300} />;
```

자세한 내용은 [Chart 라이브러리 가이드](src/libs/chart/README.md)를 참고하세요.

## 코딩 컨벤션

### 커밋 메시지

프로젝트의 커밋 메시지 규칙은 [COMMIT_MESSAGE_GUIDE.md](.github/COMMIT_MESSAGE_GUIDE.md) 파일을 참고하세요.

### 코드 스타일

- ESLint 규칙 준수
- TypeScript strict 모드 사용
- 컴포넌트는 PascalCase, 함수와 변수는 camelCase

## 환경 설정

### 개발 환경

- 개발 서버 포트: `5173`
- API 프록시: `/api` → `http://localhost:3000`

### 환경 변수

환경 변수는 `.env` 파일에서 관리합니다 (별도로 설정 필요).
