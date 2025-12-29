import React from "react";
import { ExternalLink } from "lucide-react";

const DonationInfoCard = () => {
  return (
    <div className=" border border-[#d97706] rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">기부참여 안내</h2>

      <p className="text-gray-900 mb-6">
        학술정보관 발전기금 기부 참여는 '성균관대학 발전기금' 사이트에서
        가능합니다.
      </p>

      <div className="flex flex-wrap gap-4">
        <a
          href="#"
          className="inline-flex items-center space-x-2 bg-[#d97706] text-white px-6 py-1.5 rounded-md hover:bg-orange-600 transition-colors font-medium"
        >
          <span>기부참여방법 안내</span>
          <ExternalLink size={18} />
        </a>

        <a
          href="#"
          className="inline-flex items-center space-x-2 bg-transparent border border-[#ec4899] text-[#ec4899] px-6 py-1.5 rounded-md hover:bg-pink-50 transition-colors font-medium"
        >
          <span>온라인 기부 바로가기</span>
          <ExternalLink size={18} />
        </a>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        (모금창문에서 "도서관(학술정보관) 발전기금" 선택)
      </p>
    </div>
  );
};

export default DonationInfoCard;
