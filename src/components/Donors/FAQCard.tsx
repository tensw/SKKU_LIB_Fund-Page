import React from "react";

const FAQCard = () => {
  return (
    <div className="bg-[#fefce8] border border-[#d97706] rounded-lg p-8 mb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">문의</h2>

      <div className="text-gray-700">
        <div className="mt-6 grid grid-cols-2 gap-8">
          {/* First Column - 학술정보관 */}
          <div>
            <div className="font-semibold text-lg">학술정보관</div>
            <div className="mt-4 space-y-2">
              <div className="flex">
                <span className="text-sm w-20">전화번호:</span>
                <span className="text-sm">02-760-1207, 031-299-4021</span>
              </div>
              <div className="flex">
                <span className=" w-12 text-sm">Email:</span>
                <span className="text-sm">
                  centrallib@skku.edu, samsunglib@skku.edu
                </span>
              </div>
            </div>
          </div>

          {/* Second Column - 성균관대학교 발전협력팀 */}
          <div>
            <div className="font-semibold text-lg">성균관대학교 발전협력팀</div>
            <div className="mt-4 space-y-2">
              <div className="flex">
                <span className="text-sm w-20">전화번호:</span>
                <span className="text-sm">02-760-1153</span>
              </div>
              <div className="flex">
                <span className="text-sm w-20">Email:</span>
                <span className="text-sm">fund@skku.edu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQCard;
