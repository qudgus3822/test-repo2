interface GenericDetailProps {
  details: Record<string, unknown> | null;
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (Array.isArray(value)) {
    return value.map(v => formatDetailValue(v)).join(", ") || "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  // String — check for YYYYMMDD date pattern
  const str = String(value);
  if (/^\d{8}$/.test(str)) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  return str;
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export const GenericDetail = ({ details }: GenericDetailProps) => {
  if (!details) return null;

  const entries = Object.entries(details).filter(([, v]) => !isEmptyValue(v));

  if (entries.length === 0) return null;

  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} className="border-b border-gray-100 last:border-0">
            <td className="py-1.5 pr-3 text-gray-500 font-medium whitespace-nowrap align-top w-1/3">
              {key}
            </td>
            <td className="py-1.5 text-gray-800 break-all align-top">{formatDetailValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
