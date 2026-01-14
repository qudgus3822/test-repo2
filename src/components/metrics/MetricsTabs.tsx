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

  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;
};
