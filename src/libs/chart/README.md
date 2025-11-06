# Chart 라이브러리 (Recharts)

모니터링 대시보드에서 사용할 차트 컴포넌트 모음입니다.

## 사용 가능한 차트

### 1. LineChart - 라인 차트
시계열 데이터, 지수 추이 등을 표시

```tsx
import { LineChart } from '@/libs/chart';

const data = [
  { month: '1월', 지수: 65, 평균: 70 },
  { month: '2월', 지수: 72, 평균: 68 },
  { month: '3월', 지수: 78, 평균: 71 },
];

<LineChart
  data={data}
  xKey="month"
  yKeys={['지수', '평균']}
  height={300}
  showLegend={true}
/>
```

### 2. AreaChart - 영역 차트
누적 데이터나 트렌드 시각화

```tsx
import { AreaChart } from '@/libs/chart';

<AreaChart
  data={data}
  xKey="month"
  yKeys={['값1', '값2']}
  stacked={true}  // 누적 표시
  height={300}
/>
```

### 3. BarChart - 바 차트
카테고리별 비교, 월별 데이터 표시

```tsx
import { BarChart } from '@/libs/chart';

<BarChart
  data={data}
  xKey="category"
  yKeys={['값1', '값2']}
  stacked={false}
  horizontal={false}  // true로 하면 가로 바 차트
  height={300}
/>
```

### 4. RadarChart - 레이더(다각형) 차트
여러 지표를 다각형 모양으로 비교

```tsx
import { RadarChart } from '@/libs/chart';

const radarData = [
  { subject: '성능', A: 120, B: 110 },
  { subject: '안정성', A: 98, B: 130 },
  { subject: '보안', A: 86, B: 130 },
  { subject: '확장성', A: 99, B: 100 },
];

<RadarChart
  data={radarData}
  angleKey="subject"
  dataKeys={['A', 'B']}
  height={400}
/>
```

## 차트 색상 커스터마이징

```tsx
import { CHART_COLORS, MULTI_LINE_COLORS } from '@/libs/chart';

// 단일 색상 사용
<LineChart colors={[CHART_COLORS.success]} ... />

// 여러 색상 사용
<LineChart colors={MULTI_LINE_COLORS} ... />

// 커스텀 색상
<LineChart colors={['#ff0000', '#00ff00', '#0000ff']} ... />
```

## 공통 Props

모든 차트 컴포넌트는 다음 props를 지원합니다:

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `data` | `Array` | required | 차트 데이터 |
| `height` | `number` | 300 | 차트 높이 (px) |
| `showLegend` | `boolean` | true | 범례 표시 여부 |
| `showGrid` | `boolean` | true | 그리드 표시 여부 |
| `colors` | `string[]` | CHART_COLORS | 차트 색상 배열 |

## 예제: 모니터링 대시보드 실시간 지수

```tsx
import { LineChart, CHART_COLORS } from '@/libs/chart';
import { useRealtimeMetrics } from '@/api/hooks/useMetrics';

function MetricsDashboard() {
  const { data } = useRealtimeMetrics();

  return (
    <div className="p-4">
      <h2>실시간 지수 추이</h2>
      <LineChart
        data={data}
        xKey="timestamp"
        yKeys={['cpu', 'memory', 'disk']}
        colors={[
          CHART_COLORS.primary,
          CHART_COLORS.warning,
          CHART_COLORS.danger,
        ]}
        height={400}
      />
    </div>
  );
}
```

## 차트 설정 변경

기본 차트 색상이나 스타일을 변경하려면 `src/libs/chart/config.ts`를 수정하세요.

```typescript
// src/libs/chart/config.ts
export const CHART_COLORS = {
  primary: "#3b82f6",  // 원하는 색상으로 변경
  // ...
};
```
