import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface HelpImage {
  src: string;
  alt: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: HelpImage[];
  title?: string;
}

export const HelpModal = ({
  isOpen,
  onClose,
  images,
  title = "도움말",
}: HelpModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 모달 열릴 때 첫 번째 이미지로 초기화
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isLastImage = currentIndex === images.length - 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // 마지막 이미지에서 다음 클릭 시 닫힘
  const handleNext = () => {
    if (isLastImage) {
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!shouldRender || images.length === 0) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 이미지 영역 */}
          <div className="relative flex items-center justify-center bg-gray-50 min-w-[600px] min-h-[400px]">
            <img
              key={currentIndex}
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-[600px] object-contain"
            />
          </div>

          {/* 하단 네비게이션 */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            {/* 페이지 인디케이터 */}
            <div className="flex items-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 cursor-pointer transition-colors"
              >
                {isLastImage ? "닫기" : "다음"}
                {!isLastImage && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
