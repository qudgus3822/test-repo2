import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JsonView from "@uiw/react-json-view";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";

const RawDataViewer = () => {
  const { mrId } = useParams<{ mrId: string }>();
  const [data, setData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRawData = async () => {
      if (!mrId) {
        setError("MR ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/reviews/raw/${mrId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawData();
  }, [mrId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <h1 className="text-lg font-semibold text-gray-900">
          Raw Data - MR {mrId}
        </h1>
      </div>
      <div className="p-4">
        <JsonView
          value={data as object}
          style={githubLightTheme}
          collapsed={2}
          displayDataTypes={false}
          enableClipboard={true}
        />
      </div>
    </div>
  );
};

export default RawDataViewer;
