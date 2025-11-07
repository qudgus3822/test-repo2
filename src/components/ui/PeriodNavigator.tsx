import { ChevronLeft, ChevronRight } from "lucide-react";

export type PeriodType = "monthly" | "quarterly" | "halfyearly";

interface PeriodNavigatorProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

/**
 * 기간 선택 및 날짜 네비게이션 컴포넌트
 *
 * 월별/분기별/반기별 기간 선택과 이전/다음 날짜 네비게이션을 제공합니다.
 *
 * @example
 * <PeriodNavigator
 *   period="monthly"
 *   onPeriodChange={setPeriod}
 *   currentDate={new Date()}
 *   onDateChange={setDate}
 * />
 */
export const PeriodNavigator = ({
  period,
  //onPeriodChange,
  currentDate,
  onDateChange,
}: PeriodNavigatorProps) => {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (period === "monthly") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (period === "quarterly") {
      newDate.setMonth(newDate.getMonth() - 3);
    } else if (period === "halfyearly") {
      newDate.setMonth(newDate.getMonth() - 6);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (period === "monthly") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (period === "quarterly") {
      newDate.setMonth(newDate.getMonth() + 3);
    } else if (period === "halfyearly") {
      newDate.setMonth(newDate.getMonth() + 6);
    }
    onDateChange(newDate);
  };

  const formatDate = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (period === "monthly") {
      return `${year}년 ${month}월`;
    } else if (period === "quarterly") {
      const quarter = Math.ceil(month / 3);
      return `${year}년 ${quarter}분기`;
    } else if (period === "halfyearly") {
      const half = month <= 6 ? "상반기" : "하반기";
      return `${year}년 ${half}`;
    }
  };

  // "다음" 버튼 비활성화 여부 확인 (오늘 날짜 기준)
  const isNextDisabled = () => {
    const today = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();

    if (period === "monthly") {
      return currentYear === todayYear && currentMonth === todayMonth;
    }
    // 추후 quarterly, halfyearly 개발 시 추가
    return false;
  };

  return (
    <div className="flex items-center gap-5">
      {/* 기간 선택 */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">기간 선택</span>
        <select
          value="monthly"
          disabled
          // onChange={(e) => onPeriodChange(e.target.value as PeriodType)}
          className="min-w-[100px] px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm"
        >
          <option value="monthly">월별</option>
          {/* 추후 개발 예정 */}
          {/* <option value="quarterly">분기별</option> */}
          {/* <option value="halfyearly">반기별</option> */}
        </select>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          className="p-1.5 hover:bg-gray-100 bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] transition-colors"
          aria-label="이전"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="min-w-[120px] text-center text-sm font-medium text-gray-900">
          {formatDate()}
        </span>
        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className={`p-1.5 rounded-lg border border-[#E2E8F0] transition-colors ${
            isNextDisabled()
              ? "bg-gray-100 opacity-50"
              : "hover:bg-gray-100 bg-[#FFFFFF]"
          }`}
          aria-label="다음"
        >
          <ChevronRight
            className={`w-5 h-5 ${
              isNextDisabled() ? "text-gray-400" : "text-gray-600"
            }`}
          />
        </button>
      </div>
    </div>
  );
};
