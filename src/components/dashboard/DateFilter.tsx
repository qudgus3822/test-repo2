import { ChevronLeft, ChevronRight, Download } from "lucide-react";

type PeriodType = "daily" | "monthly";

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
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (period === "monthly") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (period === "monthly") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const formatDate = () => {
    if (period === "monthly") {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    } else {
      return `${currentDate.getFullYear()}년 ${
        currentDate.getMonth() + 1
      }월 ${currentDate.getDate()}일`;
    }
  };

  return (
    <>
      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">기간 선택</span>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as PeriodType)}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">일별</option>
          <option value="monthly">월별</option>
        </select>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="min-w-[140px] text-center font-medium text-gray-900">
          {formatDate()}
        </span>
        <button
          onClick={handleNext}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* PDF 다운로드 버튼 */}
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Download className="w-4 h-4" />
        PDF 내보내기
      </button>
    </>
  );
};
