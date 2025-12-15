interface OrgTypeBadgeProps {
  isEvaluationTarget: boolean;
  fixedWidth?: boolean;
}

export const OrgTypeBadge = ({
  isEvaluationTarget,
  fixedWidth = false,
}: OrgTypeBadgeProps) => {
  return (
    <span
      className={`${
        fixedWidth ? "w-[46px] text-center" : "px-2"
      } py-0.5 text-xs rounded ${
        isEvaluationTarget
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isEvaluationTarget ? "개발" : "비개발"}
    </span>
  );
};

export default OrgTypeBadge;
