# TailwindCSS 컴포넌트 구현 규칙

이 프로젝트의 TailwindCSS 컴포넌트 작성 가이드입니다.

## 1. 가능한 한 적은 유틸리티 클래스 사용하기

불필요한 클래스를 줄이고 축약형을 활용하여 코드를 간결하게 유지합니다.

### 방향성 속성 축약

- `pt-4 pb-4` 대신 `py-4` 사용
- `pl-4 pr-4` 대신 `px-4` 사용
- `mt-4 mb-4` 대신 `my-4` 사용
- `ml-4 mr-4` 대신 `mx-4` 사용

### 기본값 생략

CSS 속성의 기본값을 가진 클래스는 생략합니다.

```tsx
// Bad
<div className="flex flex-row justify-between">

// Good
<div className="flex justify-between">
```

`flex-row`는 `flex-direction`의 기본값이므로 생략 가능합니다.

### 불투명도 축약 문법

RGBA 형식 대신 슬래시(/) 문법을 사용합니다.

```tsx
// Bad
<div className="border border-dotted border-2 border-black border-opacity-50">

// Good
<div className="border-dotted border-2 border-black/50">
```

`border-2`는 이미 `border`가 설정되어 있음을 의미하며, `border-black/50`은 RGBA의 축약형입니다.

---

## 2. 디자인 토큰을 그룹화하고 의미론적으로 명명하기

재사용 가능한 디자인 토큰을 `tailwind.config.js`에 정의하여 일관성을 유지합니다.

### 예시

```js
module.exports = {
  theme: {
    colors: {
      primary: "oklch(75% 0.18 154)",
      secondary: "oklch(40% 0.23 283)",
      error: "oklch(54% 0.22 29)",
    },
    spacing: {
      sm: "4px",
      md: "8px",
      lg: "12px",
    },
    screens: {
      sm: "640px",
      md: "768px",
    },
  },
};
```

### 사용 예시

```tsx
// 정의된 디자인 토큰 사용
<button className="bg-primary text-white p-md">클릭</button>
```

---

## 3. 클래스 순서 유지하기

일관된 클래스 순서를 유지하여 코드 가독성을 높입니다.

### 권장 순서

1. Layout (display, position, etc.)
2. Box Model (margin, padding, width, height, etc.)
3. Typography (font, text, etc.)
4. Visual (background, border, etc.)
5. Misc (cursor, pointer-events, etc.)
6. States (hover, focus, active, etc.)

### 예시

```tsx
// Good
<div className="flex items-center gap-4 p-4 text-lg font-bold bg-white border rounded-lg hover:bg-gray-50">
  컨텐츠
</div>
```

---

## 4. 일관성을 위해 variant 사용하기

반복적인 스타일 패턴은 variant 객체로 정의하여 재사용합니다.

### 예시

```tsx
const BUTTON_VARIANTS = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white"
};

export const Button = ({ className, variant = "primary", ...props }) => {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded font-medium transition-colors",
        BUTTON_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
};

// 사용
<Button variant="secondary">버튼</Button>
<Button variant="danger">삭제</Button>
```

### 장점

- 일관된 디자인 유지
- 코드 재사용성 향상
- 유지보수 용이
- 타입 안정성 확보 (TypeScript 사용 시)

---

## 추가 권장사항

### clsx 또는 cn 유틸리티 사용

조건부 클래스 적용 시 `clsx` 또는 커스텀 `cn` 유틸리티를 사용합니다.

```tsx
import { clsx } from "clsx";

<button
  className={clsx(
    "px-4 py-2 rounded",
    isActive && "bg-blue-500",
    isDisabled && "opacity-50 cursor-not-allowed",
  )}
>
  버튼
</button>;
```

### 반응형 디자인

모바일 우선 접근 방식을 사용합니다.

```tsx
// 모바일 우선 (기본값: 모바일, sm 이상: 태블릿, md 이상: 데스크톱)
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">컨텐츠</div>
```

---
