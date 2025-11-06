import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  PeriodNavigator,
  type PeriodType,
} from "@/components/ui/PeriodNavigator";

interface DateFilterProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

/**
 * 대시보드 날짜 및 기간 필터 컴포넌트
 */
export const DateFilter = ({
  period,
  onPeriodChange,
  currentDate,
  onDateChange,
}: DateFilterProps) => {
  return (
    <Card>
      <div className="flex items-center justify-between w-full h-full">
        {/* 기간 선택 */}
        <PeriodNavigator
          period={period}
          onPeriodChange={onPeriodChange}
          currentDate={currentDate}
          onDateChange={onDateChange}
        />

        {/* PDF 다운로드 버튼 */}
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          PDF 내보내기
        </button>
      </div>
    </Card>
  );
};
