import { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeadProps {
  children?: ReactNode;
  className?: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface TableCellProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
  align?: "left" | "center" | "right";
}

/**
 * 공통 테이블 컴포넌트
 */
export const Table = ({ children, className = "" }: TableProps) => (
  <div className="overflow-x-auto">
    <table className={`w-full ${className}`}>{children}</table>
  </div>
);

/**
 * 테이블 헤더 (thead)
 */
export const TableHeader = ({ children, className = "" }: TableHeaderProps) => (
  <thead className={className}>{children}</thead>
);

/**
 * 테이블 바디 (tbody)
 */
export const TableBody = ({ children, className = "" }: TableBodyProps) => (
  <tbody className={className}>{children}</tbody>
);

/**
 * 테이블 행 (tr) - 헤더용
 */
export const TableHeaderRow = ({ children, className = "" }: TableRowProps) => (
  <tr
    className={`border-b border-gray-200 text-left text-sm font-medium text-gray-700 ${className}`}
  >
    {children}
  </tr>
);

/**
 * 테이블 행 (tr) - 바디용
 */
export const TableRow = ({
  children,
  className = "",
  onClick,
}: TableRowProps) => (
  <tr
    className={`border-b border-gray-100 hover:bg-gray-50 ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

/**
 * 테이블 헤더 셀 (th)
 */
export const TableHead = ({
  children,
  className = "",
  width,
  align = "left",
}: TableHeadProps) => {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <th
      className={`px-4 py-3 ${alignClass} ${className}`}
      style={width ? { width } : undefined}
    >
      {children}
    </th>
  );
};

/**
 * 테이블 데이터 셀 (td)
 */
export const TableCell = ({
  children,
  className = "",
  colSpan,
  align = "left",
}: TableCellProps) => {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <td
      className={`px-4 py-4 text-sm text-gray-900 ${alignClass} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

/**
 * 빈 데이터 표시 셀
 */
export const TableEmptyRow = ({
  colSpan,
  message = "데이터가 없습니다.",
}: {
  colSpan: number;
  message?: string;
}) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-16 text-center text-gray-500">
      {message}
    </td>
  </tr>
);
