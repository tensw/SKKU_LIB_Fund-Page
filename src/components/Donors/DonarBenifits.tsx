"use client";
import React from "react";
import { Heart } from "lucide-react";

export default function DonorBenefits() {
  return (
    <div className=" p-8 mb-24">
      <div className="flex items-center space-x-2 mb-6">
        {/* <Heart className="text-orange-600" size={24} /> */}
        <div className="w-3 h-0.5 bg-red-600"></div>
        <h2 className="text-2xl font-bold text-gray-800">기부자혜우</h2>
      </div>

      <p className="text-gray-700 mb-6">
        성균관대학교 발전기금 기부자 혜우 페이지를 iframe으로 삽입하거나
        동일하게 제작합니다.
      </p>

      {/* Embedded iframe container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        <div className="w-full h-[800px] relative">
          <iframe
            src="https://fund.skku.edu/1398-future-research-project"
            className="w-full h-full border-0"
            title="성균관대학교 발전기금 - 1398 미래연구 사업"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
