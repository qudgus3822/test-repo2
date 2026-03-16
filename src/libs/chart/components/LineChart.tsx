import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_STYLES, LINE_CHART_MARGIN, MULTI_LINE_COLORS } from "../config";

interface DataPoint {
  [key: string]: string | number | boolean | null | undefined;
}

type YAxisDomainType = "auto" | "dataMinMax" | "fromZero" | [number, number];

interface LineChartProps {
  data: DataPoint[];
  xKey: string;
  yKeys: string[];
  height?: number;
  colors?: readonly string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showDots?: boolean; // 라인의 점 표시 여부 (기본값: true)
  yAxisDomain?: YAxisDomainType; // y축 범위 설정 (기본값: 'auto')
  dashedKeys?: string[]; // 점선으로 표시할 key 배열
  dashedColor?: string; // 점선 색상 (기본값: 회색)
  tooltipValueFormatter?: (
    value: number,
    key: string,
    dataPoint: DataPoint,
  ) => string | number; // 툴팁 값 포맷터
  nullLabel?: string; // 값이 null/undefined일 때 툴팁에 표시할 텍스트 (기본값: 없음)
  connectNulls?: boolean; // null/undefined 구간을 이어서 그릴지 여부 (기본값: false)
}

/**
 * 라인차트 컴포넌트
 * 시계열 데이터, 지수 추이 등을 표시하는데 사용
 */
export const LineChart = ({
  data,
  xKey,
  yKeys,
  height = 300,
  colors = MULTI_LINE_COLORS,
  showLegend = true,
  showGrid = true,
  showDots = true,
  yAxisDomain = "auto",
  dashedKeys = [],
  dashedColor = "#9CA3AF", // gray-400
  tooltipValueFormatter,
  nullLabel,
  connectNulls = false,
}: LineChartProps) => {
  // y축 domain 계산
  const getDomain = (): [number | string, number | string] | undefined => {
    if (Array.isArray(yAxisDomain)) {
      return yAxisDomain;
    }

    switch (yAxisDomain) {
      case "dataMinMax":
        return ["dataMin", "dataMax"];
      case "fromZero":
        return [0, "auto"];
      case "auto":
      default:
        return undefined; // Recharts 기본 동작
    }
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={LINE_CHART_MARGIN}>
        {showGrid && <CartesianGrid {...CHART_STYLES.grid} />}
        <XAxis
          dataKey={xKey}
          style={{ ...CHART_STYLES.axis }}
          tickLine={false}
          tick={{ dy: 8 }} // x축 라벨 위치 조정
          // [변경: 2026-03-16 00:00, 김병현 수정] 화면 축소 시 x축 날짜 텍스트 겹침 방지: 자동 간격 조정
          interval="preserveStartEnd"
        />
        <YAxis
          style={{ ...CHART_STYLES.axis }}
          tickLine={false}
          domain={getDomain()}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            const dataPoint = payload[0]?.payload as DataPoint;
            return (
              <div style={CHART_STYLES.tooltip.contentStyle}>
                <p style={CHART_STYLES.tooltip.labelStyle}>{label}</p>
                {yKeys.map((key, index) => {
                  const item = payload.find((p) => p.dataKey === key);
                  // null/undefined 값은 recharts가 payload에 포함시키지 않으므로 dataPoint에서 직접 읽음
                  const rawValue = item
                    ? (item.value as number | null | undefined)
                    : (dataPoint[key] as number | null | undefined);
                  const isDashed = dashedKeys.includes(key);
                  const color =
                    item?.color ??
                    (isDashed ? dashedColor : colors[index % colors.length]);
                  const displayValue = tooltipValueFormatter
                    ? tooltipValueFormatter(rawValue as number, key, dataPoint)
                    : rawValue == null
                      ? (nullLabel ?? rawValue)
                      : rawValue;
                  return (
                    <p
                      key={key}
                      style={{
                        ...CHART_STYLES.tooltip.itemStyle,
                        color,
                      }}
                    >
                      {`${key}: ${displayValue}`}
                    </p>
                  );
                })}
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            // [변경: 2026-03-16 00:00, 김병현 수정] 화면 축소 시 x축 날짜와 겹침 방지: legend를 상단으로 이동
            verticalAlign="top"
            content={() => {
              return (
                <ul className="flex flex-wrap justify-center gap-4 mb-4">
                  {yKeys.map((key, index) => {
                    const isDashed = dashedKeys.includes(key);
                    const color = isDashed
                      ? dashedColor
                      : colors[index % colors.length];
                    return (
                      <li key={key} className="flex items-center gap-2">
                        <svg width="20" height="20" className="flex-shrink-0">
                          <line
                            x1="0"
                            y1="10"
                            x2="20"
                            y2="10"
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray={isDashed ? "4 4" : undefined}
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{key}</span>
                      </li>
                    );
                  })}
                </ul>
              );
            }}
          />
        )}
        {yKeys.map((key, index) => {
          const isDashed = dashedKeys.includes(key);
          return (
            <Line
              key={key}
              name={key}
              type="monotone"
              dataKey={key}
              stroke={isDashed ? dashedColor : colors[index % colors.length]}
              strokeWidth={1}
              strokeDasharray={isDashed ? "5 5" : undefined}
              dot={showDots && !isDashed ? { r: 4 } : false}
              activeDot={showDots ? { r: 6 } : false}
              connectNulls={connectNulls}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
