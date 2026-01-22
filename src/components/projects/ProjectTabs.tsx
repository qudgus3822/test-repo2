import { Tabs } from "@/components/ui/Tabs";

export type ProjectTabType = "tf" | "operation";

interface ProjectTabsProps {
  activeTab: ProjectTabType;
  onTabChange: (tab: ProjectTabType) => void;
  tfCount: number;
  operationCount: number;
}

export const ProjectTabs = ({
  activeTab,
  onTabChange,
  tfCount,
  operationCount,
}: ProjectTabsProps) => {
  const tabs: { id: ProjectTabType; label: string; count: number }[] = [
    { id: "tf", label: "프로젝트(TF)", count: tfCount },
    { id: "operation", label: "긴급 운영(OPR2)", count: operationCount },
  ];

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        showCountBrackets={false}
        countClassName="text-white border border-blue-700 bg-blue-700 rounded-md px-2 py-1 ml-2 text-sm"
      />
    </div>
  );
};
