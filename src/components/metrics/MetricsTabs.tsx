import { Tabs } from "@/components/ui/Tabs";
import { useMetricsStore, type TabType } from "@/store/useMetricsStore";

interface MetricsTabsProps {
  allCount: number;
  codeQualityCount: number;
  reviewQualityCount: number;
  developmentEfficiencyCount: number;
}

export const MetricsTabs = ({
  allCount,
  codeQualityCount,
  reviewQualityCount,
  developmentEfficiencyCount,
}: MetricsTabsProps) => {
  const activeTab = useMetricsStore((state) => state.activeTab);
  const setActiveTab = useMetricsStore((state) => state.setActiveTab);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "bdpi", label: "전체", count: allCount },
    { id: "codeQuality", label: "코드품질", count: codeQualityCount },
    { id: "reviewQuality", label: "리뷰품질", count: reviewQualityCount },
    {
      id: "developmentEfficiency",
      label: "개발효율",
      count: developmentEfficiencyCount,
    },
  ];

  // [변경: 2026-02-12 14:39, 임도휘 수정] 텍스트 줄바꿈 방지, 855px 미만 텍스트 축소·탭 간격 축소 반응형 처리
  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="flex space-x-2 [@media(min-width:855px)]:space-x-6 whitespace-nowrap text-xs [@media(min-width:855px)]:text-[15px]" buttonTextSizeClass="[font-size:inherit]" />;
};
