interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * DOM overlay (absolute positioned, not SVG) providing zoom buttons over the graph.
 */
export const ZoomControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) => {
  return (
    <>
      {/* Zoom buttons - bottom right */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-0.5 z-10">
        <button
          type="button"
          onClick={onZoomIn}
          className="w-9 h-9 border border-gray-200 bg-white text-gray-500 text-base flex items-center justify-center rounded-t-lg hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          title="확대"
        >
          +
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-9 h-9 border border-gray-200 bg-white text-gray-500 text-base flex items-center justify-center hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          title="초기화"
        >
          ⌂
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="w-9 h-9 border border-gray-200 bg-white text-gray-500 text-base flex items-center justify-center rounded-b-lg hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          title="축소"
        >
          −
        </button>
      </div>
      {/* Zoom level indicator - bottom left */}
      <div className="absolute bottom-5 left-5 text-xs text-gray-400 font-mono bg-white px-2.5 py-1 rounded-md border border-gray-100 z-10 select-none">
        {Math.round(zoomLevel * 100)}%
      </div>
    </>
  );
};
