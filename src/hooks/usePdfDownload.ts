import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * oklch 색상을 RGB로 변환하는 함수
 * oklch(L C H) 또는 oklch(L C H / A) 형식을 지원
 */
const convertOklchToRgb = (oklch: string): string => {
  try {
    // oklch(L C H) 또는 oklch(L C H / A) 파싱
    const match = oklch.match(
      /oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)/,
    );
    if (!match) return oklch;

    const [, l, c, h, a] = match;

    // 퍼센트 처리
    const lightness = l.endsWith("%") ? parseFloat(l) / 100 : parseFloat(l);
    const chroma = parseFloat(c);
    const hue = parseFloat(h);
    const alpha = a
      ? a.endsWith("%")
        ? parseFloat(a) / 100
        : parseFloat(a)
      : 1;

    // OKLCH to Linear RGB 변환
    const hRad = (hue * Math.PI) / 180;
    const a_ = chroma * Math.cos(hRad);
    const b_ = chroma * Math.sin(hRad);

    const l_ = lightness + 0.3963377774 * a_ + 0.2158037573 * b_;
    const m_ = lightness - 0.1055613458 * a_ - 0.0638541728 * b_;
    const s_ = lightness - 0.0894841775 * a_ - 1.291485548 * b_;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let b = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    // Gamma correction
    const gammaCorrect = (val: number) => {
      const abs = Math.abs(val);
      if (abs > 0.0031308) {
        return (Math.sign(val) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
      }
      return 12.92 * val;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);

    // 0-255 범위로 변환 및 클램핑
    const toRgb = (val: number) =>
      Math.max(0, Math.min(255, Math.round(val * 255)));

    if (alpha < 1) {
      return `rgba(${toRgb(r)}, ${toRgb(g)}, ${toRgb(b)}, ${alpha})`;
    }
    return `rgb(${toRgb(r)}, ${toRgb(g)}, ${toRgb(b)})`;
  } catch (error) {
    console.warn("Failed to convert oklch color:", oklch, error);
    return oklch;
  }
};

/**
 * DOM 요소의 oklch 색상을 RGB로 변환
 */
const convertOklchColors = (element: HTMLElement) => {
  const elements = element.querySelectorAll("*");

  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);

    // 변환이 필요한 CSS 속성들
    const colorProperties = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "fill",
      "stroke",
    ];

    colorProperties.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value.includes("oklch")) {
        const converted = convertOklchToRgb(value);
        htmlEl.style.setProperty(prop, converted);
      }
    });
  });
};


export function usePdfDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = useCallback(
    async (elementId: string, filename: string = "dashboard.pdf") => {
      setIsGenerating(true);

      try {
        // DOM 요소 가져오기
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error("Element not found");
        }

        // Canvas로 변환
        const canvas = await html2canvas(element, {
          scale: 2, // 해상도 (높을수록 선명, 느림)
          useCORS: true, // 외부 이미지 허용
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // 복제된 document에서 oklch 색상을 RGB로 변환
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
              convertOklchColors(clonedElement);
            }
          },
        });

        // Canvas를 이미지로 변환
        const imgData = canvas.toDataURL("image/png");

        // PDF 생성
        const pdf = new jsPDF({
          orientation: "landscape", // 'portrait' 또는 'landscape'
          unit: "mm",
          format: "a4",
        });

        // A4 페이지 크기 (landscape)
        const pageWidth = 297; // mm
        const pageHeight = 210; // mm
        const margin = 10; // mm

        // 이미지 크기 계산 (여백 고려)
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 페이지 높이 (여백 고려)
        const availableHeight = pageHeight - margin * 2;

        // 이미지가 한 페이지에 들어가는 경우
        if (imgHeight <= availableHeight) {
          pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
          // 여러 페이지로 나누기
          let position = margin; // 첫 페이지 시작 위치
          let pageCount = 0;

          // 필요한 페이지 수만큼 반복
          while (position > margin - imgHeight) {
            if (pageCount > 0) {
              pdf.addPage();
            }

            // 각 페이지에 이미지 배치
            // position이 음수가 되면서 이미지가 위로 이동하여 다음 부분이 보임
            pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);

            // 다음 페이지를 위해 position을 위로 이동
            position -= availableHeight;
            pageCount++;
          }
        }

        // 다운로드
        pdf.save(filename);
      } catch (error) {
        console.error("PDF 생성 실패:", error);
        alert("PDF 다운로드에 실패했습니다.");
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return { downloadPdf, isGenerating };
}
