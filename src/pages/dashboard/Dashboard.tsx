const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">BDPI 대시보드</h1>
      <p className="text-gray-600">이곳에 대시보드 콘텐츠가 표시됩니다.</p>

      {/* 플레이스홀더 콘텐츠 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">카드 1</h3>
          <p className="text-gray-600">콘텐츠 영역</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">카드 2</h3>
          <p className="text-gray-600">콘텐츠 영역</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">카드 3</h3>
          <p className="text-gray-600">콘텐츠 영역</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
