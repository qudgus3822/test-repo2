import { Download } from "lucide-react";
import {
  PeriodNavigator,
  type PeriodType,
} from "@/components/ui/PeriodNavigator";

export type { PeriodType };

interface DateFilterProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  showPdfButton?: boolean;
}

/**
 * 날짜 및 기간 필터 컴포넌트 (여러 화면에서 재사용)
 */
export const DateFilter = ({
  period,
  onPeriodChange,
  currentDate,
  onDateChange,
  showPdfButton = true,
}: DateFilterProps) => {
  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* 기간 선택 */}
      <PeriodNavigator
        period={period}
        onPeriodChange={onPeriodChange}
        currentDate={currentDate}
        onDateChange={onDateChange}
      />

      {/* PDF 다운로드 버튼 (옵셔널) */}
      {showPdfButton && (
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          PDF 내보내기
        </button>
      )}
    </div>
  );
};
