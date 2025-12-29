interface OrgTypeLegendProps {
  showCheckbox?: boolean;
}

export const OrgTypeLegend = ({ showCheckbox = false }: OrgTypeLegendProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-gray-400" />
        <span className="text-xs text-gray-600">구분</span>
      </div>
      <div className="flex items-center gap-2">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={true}
            readOnly
            className="w-4 h-4 rounded border-gray-300 text-blue-600 pointer-events-none"
          />
        )}
        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
          개발조직 포함
        </span>
        {showCheckbox && (
          <input
            type="checkbox"
            checked={false}
            readOnly
            className="w-4 h-4 rounded border-gray-300 text-blue-600 pointer-events-none"
          />
        )}
        <span className="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600">
          개발조직 제외
        </span>
      </div>
    </div>
  );
};

export default OrgTypeLegend;
