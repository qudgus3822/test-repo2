import { useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowDownUp,
  Info,
  Pencil,
} from "lucide-react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricStatus, MetricCategory } from "@/types/metrics.types";

interface MetricsTableProps {
  metrics: MetricItem[];
}

type TabType =
  | "all"
  | "codeQuality"
  | "reviewQuality"
  | "developmentEfficiency";

interface Tab {
  id: TabType;
  label: string;
  count: number;
  category?: MetricCategory;
}

// MetricCategory enum을 한글 라벨로 변환
const getCategoryLabel = (category: MetricCategory): string => {
  const labels: Record<MetricCategory, string> = {
    code_quality: "코드분류",
    review_quality: "지표분류",
    development_efficiency: "개발정보",
  };
  return labels[category];
};

// MetricStatus에 따른 아이콘 반환
const getStatusIcon = (status: MetricStatus) => {
  switch (status) {
    case "achieved":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "not_achieved":
      return <XCircle className="w-5 h-5 text-red-500" />;
  }
};

// MetricStatus에 따른 텍스트 색상 반환
const getStatusColor = (status: MetricStatus): string => {
  switch (status) {
    case "achieved":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "not_achieved":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const MetricsTable = ({ metrics }: MetricsTableProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // 전체 메트릭 개수 기준 테이블 높이 계산 (헤더 50px + 행당 53px)
  const tableHeight = 50 + metrics.length * 53;

  // 카테고리별 개수 계산
  const codeQualityCount = metrics.filter(
    (m) => m.category === MetricCategory.CODE_QUALITY,
  ).length;
  const reviewQualityCount = metrics.filter(
    (m) => m.category === MetricCategory.REVIEW_QUALITY,
  ).length;
  const developmentEfficiencyCount = metrics.filter(
    (m) => m.category === MetricCategory.DEVELOPMENT_EFFICIENCY,
  ).length;

  const tabs: Tab[] = [
    { id: "all", label: "전체", count: metrics.length },
    {
      id: "codeQuality",
      label: "코드분류",
      count: codeQualityCount,
      category: MetricCategory.CODE_QUALITY,
    },
    {
      id: "reviewQuality",
      label: "지표분류",
      count: reviewQualityCount,
      category: MetricCategory.REVIEW_QUALITY,
    },
    {
      id: "developmentEfficiency",
      label: "개발정보",
      count: developmentEfficiencyCount,
      category: MetricCategory.DEVELOPMENT_EFFICIENCY,
    },
  ];

  // 활성 탭에 따라 지표 필터링
  const filteredMetrics =
    activeTab === "all"
      ? metrics
      : metrics.filter((m) => {
          const activeTabData = tabs.find((t) => t.id === activeTab);
          return (
            activeTabData?.category && m.category === activeTabData.category
          );
        });

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ height: `${tableHeight}px` }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-700">
              <th className="px-4 py-3 w-[25%]">지표명</th>
              <th className="px-4 py-3 w-[12%]">범주</th>
              <th className="px-4 py-3 w-[12%]">현재값</th>
              {/* <th className="px-4 py-3 w-[12%]">목표값</th>
              <th className="px-4 py-3 w-[15%]">달성률</th> */}

              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-2">
                  목표값
                  <span>
                    <Tooltip
                      // content="전체 메트릭의 목표값을 수정할 수 있습니다."
                      content="목표값 설정 팝업으로 이동합니다."
                      color="#6B7280"
                    >
                      <Pencil className="w-4 h-4 cursor-pointer" />
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-2">
                  달성률
                  <span>
                    <Tooltip
                      // content="지표의 달성률을 평가하는 기준값을 설정합니다."
                      content="달성률 설정 팝업으로 이동합니다."
                      color="#6B7280"
                    >
                      <Pencil className="w-4 h-4 cursor-pointer" />
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">
                <div className="flex items-center gap-2">
                  비율 <ArrowDownUp className="w-4 h-4 cursor-pointer" />
                </div>
              </th>
              <th className="px-4 py-3 w-[12%]">상세</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetrics.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-16 text-center text-gray-500"
                >
                  선택된 범주에 해당하는 지표가 없습니다.
                </td>
              </tr>
            ) : (
              filteredMetrics.map((metric, index) => (
                <tr
                  key={metric.metricCode || index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{metric.name}</span>
                      {metric.description && (
                        <Tooltip content={metric.description} color="#6B7280">
                          <Info className="text-gray-400 w-4 h-4 cursor-pointer" />
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getCategoryLabel(metric.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {metric.currentValue}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {metric.targetValue}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          metric.status,
                        )}`}
                      >
                        {metric.achievementRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {metric.ratio}%
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Search className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
