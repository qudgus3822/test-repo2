import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
// import { useOrganizationStore } from "@/store/useOrganizationStore";

export const CompareGroupSelector = () => {
  // const { compareGroups, addCompareGroup } = useOrganizationStore();

  // const handleAddGroup = () => {
  //   const nextLabel = String.fromCharCode(65 + compareGroups.length); // A, B, C, ...
  //   const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  //   const color = colors[compareGroups.length % colors.length];

  //   addCompareGroup({
  //     id: nextLabel.toLowerCase(),
  //     label: `비교 ${nextLabel}`,
  //     color,
  //   });
  // };

  return (
    <div className="flex items-center gap-3 pointer-events-none">
      {/* {compareGroups.map((group) => (
        <button
          key={group.id}
          disabled
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg cursor-not-allowed"
          style={{
            borderColor: group.color,
            color: group.color,
          }}
        >
          {group.label}
        </button>
      ))} */}
      <Button
        variant="normal"
        size="sm"
        disabled
        className="flex items-center gap-1"
      >
        <Plus className="w-4 h-4" />
        비교추가
      </Button>
    </div>
  );
};
