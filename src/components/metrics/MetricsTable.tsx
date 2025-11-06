import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Search, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { MetricItem } from "@/types/metrics.types";
import { MetricStatus, MetricCategory } from "@/types/metrics.types";

interface MetricsTableProps {
  metrics: MetricItem[];
}

type TabType = "all" | "codeQuality" | "reviewQuality" | "developmentEfficiency";

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

  // 카테고리별 개수 계산
  const codeQualityCount = metrics.filter((m) => m.category === MetricCategory.CODE_QUALITY).length;
  const reviewQualityCount = metrics.filter((m) => m.category === MetricCategory.REVIEW_QUALITY).length;
  const developmentEfficiencyCount = metrics.filter(
    (m) => m.category === MetricCategory.DEVELOPMENT_EFFICIENCY
  ).length;

  const tabs: Tab[] = [
    { id: "all", label: "전체", count: metrics.length },
    { id: "codeQuality", label: "코드분류", count: codeQualityCount, category: MetricCategory.CODE_QUALITY },
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
          return activeTabData?.category && m.category === activeTabData.category;
        });

  return (
    <Card className="p-6">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  지표명
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  분포
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  현재값
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  목표값
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  달성률
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  비율 ⚠
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  상세
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map((metric, index) => (
                <tr
                  key={metric.metricCode || index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">ⓘ</span>
                      <span>{metric.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getCategoryLabel(metric.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metric.currentValue}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{metric.targetValue}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <span
                        className={`text-sm font-medium ${getStatusColor(metric.status)}`}
                      >
                        {metric.achievementRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{metric.ratio}%</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Search className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
