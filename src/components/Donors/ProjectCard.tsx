import React from "react";
import { BookOpen } from "lucide-react";

const ProjectCard = () => {
  return (
    <div className=" border border-[#d97706] rounded-lg p-8 mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <BookOpen className="text-orange-600 shrink-0" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">
          학술정보관 재생프로젝트
        </h2>
      </div>

      <p className="text-gray-700 text-lg mb-8">
        '학문의 광장이자 대학의 심장'인 대학도서관의 지속적인 성장을 위해
        "새로운 패러다임의 도서관-녹색학술융복합공간"을 창조합니다.
      </p>

      <div className="flex flex-col items-center justify-center p-8  rounded-lg">
        <BookOpen className="text-[#d97706] mb-4" size={64} />
        <p className="text-gray-600 text-center">
          중앙학술정보관 디자인계안과 파일 참고하여 이미지 작업 필요
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
