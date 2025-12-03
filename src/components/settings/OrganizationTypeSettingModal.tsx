import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockOrganizationData } from "@/mocks/organization.mock";
import type { Department } from "@/types/organization.types";

interface OrganizationTypeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type OrganizationType = "개발" | "비개발";
type ChangeType = "신설" | "삭제" | null;

interface OrgItemState {
  id: string;
  name: string;
  type: OrganizationType;
  changeType: ChangeType;
  changeDate?: string;
  isExpanded?: boolean;
  children?: OrgItemState[];
}

// 조직 유형 배지 컴포넌트
const TypeBadge = ({ type }: { type: OrganizationType }) => {
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded ${
        type === "개발"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {type}
    </span>
  );
};

// 변경 유형 배지 컴포넌트
const ChangeBadge = ({
  changeType,
  date,
}: {
  changeType: ChangeType;
  date?: string;
}) => {
  if (!changeType) return null;

  const isNew = changeType === "신설";
  return (
    <span className="flex items-center gap-1 text-xs">
      <span
        className={`px-1.5 py-0.5 rounded ${
          isNew ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {changeType}
      </span>
      {date && <span className="text-gray-500">{date}</span>}
    </span>
  );
};

// 구분 필터 라디오 버튼
const FilterRadio = ({
  label,
  value,
  checked,
  onChange,
  color,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  color: string;
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="orgFilter"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          checked ? "border-blue-500" : "border-gray-300"
        }`}
      >
        {checked && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        )}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

// 조직 아이템 행 컴포넌트
const OrgItemRow = ({
  item,
  depth = 0,
  onToggle,
  onTypeChange,
  showCheckbox = false,
}: {
  item: OrgItemState;
  depth?: number;
  onToggle?: (id: string) => void;
  onTypeChange?: (id: string, type: OrganizationType) => void;
  showCheckbox?: boolean;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = depth * 20 + 12;

  return (
    <>
      <div
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 border-b border-gray-100 ${
          item.changeType === "삭제" ? "bg-blue-50" : ""
        }`}
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <button
              onClick={() => onToggle?.(item.id)}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {showCheckbox && (
            <TypeBadge type={item.type} />
          )}

          <span
            className={`text-sm ${
              item.changeType === "삭제" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {item.name}
          </span>

          {item.changeType === "신설" && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}

          <ChangeBadge changeType={item.changeType} date={item.changeDate} />
        </div>

        {showCheckbox && (
          <input
            type="checkbox"
            checked={item.type === "개발"}
            onChange={() =>
              onTypeChange?.(item.id, item.type === "개발" ? "비개발" : "개발")
            }
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
      </div>

      {hasChildren && item.isExpanded && (
        <>
          {item.children!.map((child) => (
            <OrgItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              onToggle={onToggle}
              onTypeChange={onTypeChange}
              showCheckbox={showCheckbox}
            />
          ))}
        </>
      )}
    </>
  );
};

export const OrganizationTypeSettingModal = ({
  isOpen,
  onClose,
  onSave,
}: OrganizationTypeSettingModalProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [prevMonthData, setPrevMonthData] = useState<OrgItemState[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<OrgItemState[]>([]);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 목업 데이터를 OrgItemState로 변환
  const convertToOrgItemState = (
    departments: Department[],
    withChanges = false
  ): OrgItemState[] => {
    return [
      {
        id: "it-group",
        name: "IT 총괄",
        type: "개발" as OrganizationType,
        changeType: null,
        isExpanded: true,
        children: departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          type: (dept.type === "개발실" ? "개발" : "비개발") as OrganizationType,
          changeType: withChanges && dept.id === "dept-4" ? "삭제" as ChangeType : null,
          changeDate: withChanges && dept.id === "dept-4" ? "2025.11.23" : undefined,
          isExpanded: dept.id === "dept-3",
          children: dept.teams.map((team) => ({
            id: team.id,
            name: team.name,
            type: (team.type === "개발" ? "개발" : "비개발") as OrganizationType,
            changeType:
              withChanges && team.id === "team-4-2"
                ? ("신설" as ChangeType)
                : null,
            changeDate:
              withChanges && team.id === "team-4-2" ? "2025.11.25" : undefined,
            isExpanded: false,
            children: [],
          })),
        })),
      },
    ];
  };

  // 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      const { departments } = mockOrganizationData;
      setPrevMonthData(convertToOrgItemState(departments, false));
      setCurrentMonthData(convertToOrgItemState(departments, true));
    }
  }, [isOpen]);

  // 애니메이션 처리
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 토글 핸들러
  const handleToggle = (
    data: OrgItemState[],
    setData: React.Dispatch<React.SetStateAction<OrgItemState[]>>,
    id: string
  ) => {
    const toggleItem = (items: OrgItemState[]): OrgItemState[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };
    setData(toggleItem(data));
  };

  // 타입 변경 핸들러
  const handleTypeChange = (id: string, newType: OrganizationType) => {
    const updateType = (items: OrgItemState[]): OrgItemState[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, type: newType };
        }
        if (item.children) {
          return { ...item, children: updateType(item.children) };
        }
        return item;
      });
    };
    setCurrentMonthData(updateType(currentMonthData));
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!shouldRender) return null;

  // 현재 날짜 기준 전월/당월 계산
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const prevMonthLabel = `${prevMonth.getFullYear()}년 ${prevMonth.getMonth() + 1}월`;
  const currentMonthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleCancel}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                조직 유형 수정
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                LDAP 자동 동기화 {mockOrganizationData.lastSyncDate}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">구분</span>
            <div className="flex items-center gap-4">
              <FilterRadio
                label="개발조직 포함"
                value="dev"
                checked={filter === "dev" || filter === "all"}
                onChange={() => setFilter(filter === "dev" ? "nondev" : "dev")}
                color="#1E54B8"
              />
              <FilterRadio
                label="개발조직 제외"
                value="nondev"
                checked={filter === "nondev"}
                onChange={() => setFilter("nondev")}
                color="#6B7280"
              />
            </div>
          </div>

          {/* 콘텐츠 - 2단 레이아웃 */}
          <div className="flex-1 overflow-hidden flex">
            {/* 전월 */}
            <div className="flex-1 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">전월</span>
                  <span className="text-sm font-medium text-gray-900">
                    {prevMonthLabel}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {prevMonthData.map((item) => (
                  <OrgItemRow
                    key={item.id}
                    item={item}
                    onToggle={(id) =>
                      handleToggle(prevMonthData, setPrevMonthData, id)
                    }
                    showCheckbox={false}
                  />
                ))}
              </div>
            </div>

            {/* 당월 */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">당월</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentMonthLabel}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {currentMonthData.map((item) => (
                  <OrgItemRow
                    key={item.id}
                    item={item}
                    onToggle={(id) =>
                      handleToggle(currentMonthData, setCurrentMonthData, id)
                    }
                    onTypeChange={handleTypeChange}
                    showCheckbox={true}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
            <Button variant="cancel" size="sm" onClick={handleCancel}>
              취소
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              수정 완료
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationTypeSettingModal;
