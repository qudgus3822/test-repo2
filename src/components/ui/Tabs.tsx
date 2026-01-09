interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  countClassName?: string;
  showCountBrackets?: boolean;
}

/**
 * 공통 탭 컴포넌트
 * 지표관리, 프로젝트/운영 등 여러 페이지에서 재사용
 */
export const Tabs = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  countClassName,
  showCountBrackets = true,
}: TabsProps<T>) => {
  return (
    <div className={className ?? "flex space-x-6"}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-4 px-1.5 text-[15px] font-medium border-b-2 -mb-[12px] transition-colors cursor-pointer ${
            activeTab === tab.id
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={countClassName}>
              {showCountBrackets ? `(${tab.count})` : tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
