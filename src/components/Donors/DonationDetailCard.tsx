export default function DonationDetails() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 mt-8 bg-white border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-0.5 bg-red-600"></div>
        <h3 className="text-sm font-bold text-gray-700">기부 상세내역</h3>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Blue Header */}
        <div className="border border-gray-200">
          <div className="bg-[#236ca8] text-white py-3 text-center font-semibold text-lg">
            로욜라 원 프로젝트
          </div>
          <div className="py-8 text-center bg-gray-50/50">
            <p className="text-2xl font-bold text-[#f84e4f] mb-1">
              758,796,273{" "}
              <span className="text-sm text-gray-800 font-medium">원</span>
            </p>
            <p className="text-2xl font-bold text-[#236ca8]">
              2,546{" "}
              <span className="text-sm text-gray-800 font-medium">건</span>
            </p>
          </div>
        </div>

        {/* Card 2: Red Header */}
        <div className="border border-gray-200">
          <div className="bg-[#c61b26] text-white py-3 text-center font-semibold text-lg">
            도서관 발전기금
          </div>
          <div className="py-8 text-center bg-gray-50/50">
            <p className="text-2xl font-bold text-[#f84e4f] mb-1">
              852,552,601{" "}
              <span className="text-sm text-gray-800 font-medium">원</span>
            </p>
            <p className="text-2xl font-bold text-[#236ca8]">
              1,196{" "}
              <span className="text-sm text-gray-800 font-medium">건</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
