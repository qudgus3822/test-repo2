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
}

/**
 * 날짜 및 기간 필터 컴포넌트 (여러 화면에서 재사용)
 */
export const DateFilter = ({
  period,
  onPeriodChange,
  currentDate,
  onDateChange,
}: DateFilterProps) => {
  return (
    <div className="flex items-center justify-between h-full">
      {/* 기간 선택 */}
      <PeriodNavigator
        period={period}
        onPeriodChange={onPeriodChange}
        currentDate={currentDate}
        onDateChange={onDateChange}
      />
    </div>
  );
};
