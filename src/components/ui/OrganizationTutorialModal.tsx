import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Layers,
  Target,
  Grid3X3,
} from "lucide-react";

const ORG_COMPARE_SCREENSHOT = "/help/org-compare.png";

interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  highlight: Highlight | null;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "조직비교 화면 소개",
    description:
      "조직비교 화면에서는 조직별 개발생산성을 다양한 기준으로 비교할 수 있습니다.",
    icon: BarChart3,
    iconBg: "bg-orange-500",
    highlight: null,
  },
  {
    id: "tabs",
    title: "전체/BDPI 탭",
    description:
      "전체 탭은 조직별 30개 지표를 비교하고, BDPI 탭은 4개 핵심 지표(코드품질/리뷰품질/개발효율/BDPI)와 전월 대비 변화량을 확인합니다.",
    icon: Layers,
    iconBg: "bg-blue-600",
    highlight: { x: 0.5, y: 1, width: 8.5, height: 7 },
  },
  {
    id: "view-mode",
    title: "하이어라키뷰/플랫뷰",
    description:
      "하이어라키뷰는 조직 구조를 트리 형태로, 플랫뷰는 목록 형태로 보여줍니다. 플랫뷰는 실/팀/개인 버튼을 통해 원하는 조직 레벨만 선택해 한 번에 조회할 수 있습니다.",
    icon: Layers,
    iconBg: "bg-indigo-500",
    highlight: { x: 0.5, y: 15, width: 15.5, height: 6 },
  },
  {
    id: "aggregation",
    title: "평균/총합 버튼",
    description:
      "평균은 조회 월 동안 지표가 실제로 수집된 날짜의 값만 모아 '하루 기준 평균값'으로 환산해 조직 간 비교합니다. 지표 데이터가 없는 날은 계산에서 제외되며, 조직별 수집일 수에 따라 평균값이 달라질 수 있습니다. 총합은 조회 월 동안 지표의 일별 값을 모두 합산해 월 누적으로 조직 간 비교합니다. 데이터가 없는 날은 합산에서 제외되며, 총합은 버그발생수/장애발생수/리뷰요청수/리뷰참여수/커밋빈도/배포빈도 6개 지표만 제공합니다.",
    icon: BarChart3,
    iconBg: "bg-green-500",
    highlight: { x: 16, y: 15, width: 8.5, height: 6 },
  },
  {
    id: "cellpoint",
    title: "실제값/달성률 버튼",
    description:
      "실제값/달성률 버튼은 셀에 표시되는 수치 기준을 전환합니다. 실제값은 지표의 원본 수치를 보여주며, 데이터가 없으면 '--'로 표시됩니다. 달성률은 지표의 목표값 대비 달성 정도(%)를 표시하며, 셀 배경색은 달성률 범례 기준으로 구간별로 표현됩니다.",
    icon: BarChart3,
    iconBg: "bg-purple-500",
    highlight: { x: 89, y: 15, width: 10, height: 6 },
  },
  {
    id: "options",
    title: "우측 옵션",
    description:
      "팀 열기: 하위 조직을 일괄 펼침 | 지표맞춤: 30개 지표 컬럼이 한 화면에 보이도록 자동 조정",
    icon: Grid3X3,
    iconBg: "bg-cyan-500",
    highlight: { x: 75, y: 15, width: 14.5, height: 6 },
  },
  {
    id: "org-tree",
    title: "조직 구조",
    description:
      "실/팀/개인 조직을 트리/목록 구조로 확인합니다. 조직명 옆 배지로 조직 유형/변경 상태를 확인할 수 있습니다.",
    icon: Layers,
    iconBg: "bg-teal-500",
    highlight: { x: 0.5, y: 22, width: 23, height: 72 },
  },
  {
    id: "achievement",
    title: "달성 구간 컬럼",
    description:
      "조직별로 30개 지표가 초과달성/우수/경고/위험 각 단계에 해당하는 개수를 집계해 보여줍니다.",
    icon: Target,
    iconBg: "bg-amber-500",
    highlight: { x: 23, y: 22, width: 15, height: 72 },
  },
  {
    id: "metrics",
    title: "지표 셀 영역",
    description:
      "조직별 지표를 셀 단위로 비교합니다. 지표명 클릭 시 해당 지표의 상세 설명을 확인할 수 있고, 셀 클릭 시 상세 정보 툴팁이 표시됩니다. 컬럼 헤더 드래그로 컬럼 순서 변경도 가능합니다. '--' 표기는 해당 활동 기록이 아직 존재하지 않는 경우를 나타내고 빈칸은 개인·팀·실 단위로 집계가 불가능한 데이터입니다.",
    icon: Grid3X3,
    iconBg: "bg-pink-500",
    highlight: { x: 38, y: 22, width: 61.5, height: 72 },
  },
  // {
  //   id: "complete",
  //   title: "튜토리얼 완료!",
  //   description:
  //     "조직비교 화면의 주요 기능을 모두 살펴보았습니다. 이제 조직별 개발생산성을 효과적으로 비교하고 분석해 보세요!",
  //   icon: CheckCircle2,
  //   highlight: null,
  // },
];

const HighlightOverlay = ({ highlight }: { highlight: Highlight | null }) => {
  if (!highlight) return null;
  const { x, y, width, height } = highlight;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute bg-black/60"
        style={{ left: 0, top: 0, right: 0, height: `${y}%` }}
      />
      <div
        className="absolute bg-black/60"
        style={{ left: 0, top: `${y}%`, width: `${x}%`, height: `${height}%` }}
      />
      <div
        className="absolute bg-black/60"
        style={{
          left: `${x + width}%`,
          top: `${y}%`,
          right: 0,
          height: `${height}%`,
        }}
      />
      <div
        className="absolute bg-black/60"
        style={{ left: 0, top: `${y + height}%`, right: 0, bottom: 0 }}
      />
      <div
        className="absolute rounded-lg"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          height: `${height}%`,
          border: "3px solid #f97316",
          boxShadow:
            "0 0 0 4px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.5)",
          animation: "organizationTutorialPulse 2s infinite",
        }}
      />
      <style>{`
        @keyframes organizationTutorialPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

interface OrganizationTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationTutorialModal = ({
  isOpen,
  onClose,
}: OrganizationTutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = TUTORIAL_STEPS.length;
  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () =>
    currentStep < totalSteps - 1
      ? setCurrentStep(currentStep + 1)
      : handleClose();
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight")
        setCurrentStep((s) => (s < totalSteps - 1 ? s + 1 : (onClose(), 0)));
      if (e.key === "ArrowLeft") setCurrentStep((s) => (s > 0 ? s - 1 : s));
      if (e.key === "Escape") {
        setCurrentStep(0);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalSteps, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full overflow-hidden">
        {/* 상단 컬러 바 */}
        <div className={`h-2 ${step.iconBg}`} />

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-orange-500 font-bold text-xs">
                STEP {currentStep + 1}/{totalSteps}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{step.title}</h2>
            </div>
          </div>

          {/* 이미지 영역 */}
          <div className="relative bg-white rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            <div className="relative inline-block">
              <img
                src={ORG_COMPARE_SCREENSHOT}
                alt={step.title}
                className="block w-auto h-auto max-h-[65vh] max-w-full"
              />
              <HighlightOverlay highlight={step.highlight} />
            </div>
          </div>

          {/* 설명 */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5 bg-gray-50 p-4 rounded-lg border-l-4 border-orange-400">
            {step.description}
          </p>

          {/* 하단 네비게이션 */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              {/* 도트 인디케이터 */}
              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "bg-orange-500 w-4"
                        : "bg-gray-300 hover:bg-gray-400 w-2"
                    }`}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>

              {/* 이전/다음 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} /> 이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {currentStep === totalSteps - 1 ? "완료" : "다음"}
                  {currentStep < totalSteps - 1 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
