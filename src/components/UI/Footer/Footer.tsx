"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [isFamilySiteOpen, setIsFamilySiteOpen] = useState(false);
  const pathname = usePathname();
  const isNsc = pathname?.startsWith("/suwon") || pathname?.startsWith("/nsc");
  const campus = isNsc ? "nsc" : "hsc";

  const familySites = [
    { name: "교사자료 (기록보존실)", url: "https://archives.skku.edu/" },
    { name: "dCollection", url: "https://dcollection.skku.edu/" },
    { name: "법학도서관", url: "https://skku.libguides.com/c.php?g=376351" },
    { name: "성균관대학교", url: "https://www.skku.edu/skku/index.do" },
    { name: "성균관대 출판부", url: "https://press.skku.edu/" },
    { name: "수중혜", url: "https://dailyinsight.skku.edu/" },
    { name: "오거서", url: "https://book.skku.edu/" },
    { name: "존경각", url: "https://east.skku.edu/#/" },
  ];

  return (
    <div className="bg-white hidden xl:block">
      <div className="flex justify-center items-center gap-8 border border-[#EEEEEE] pb-2 pt-3">
        <a
          href={`https://lib.skku.edu/${campus}/bulletins/notice/services`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8188A1] text-xs font-bold hover:text-[#2D2F3E] cursor-pointer"
        >
          주요전화번호
        </a>
        <div className="w-[1px] h-4 bg-[#CDD2E0]" />
        <a
          href="https://www.skku.edu/skku/etc/private.do"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8188A1] text-xs font-bold hover:text-[#2D2F3E] cursor-pointer"
        >
          개인정보처리방침
        </a>
        <div className="w-[1px] h-4 bg-[#CDD2E0]" />
        <a
          href="https://www.skku.edu/skku/etc/pop_email.do"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              "https://www.skku.edu/skku/etc/pop_email.do",
              "emailRejection",
              "width=600,height=500,scrollbars=yes,resizable=yes,left=100,top=100"
            );
          }}
          className="text-[#8188A1] text-xs font-bold hover:text-[#2D2F3E] cursor-pointer"
        >
          이메일무단수집거부
        </a>
      </div>
      <div className="flex justify-between items-center py-3 gap-10 max-w-[1200px] mx-auto px-20">
        <div className="flex items-center gap-4">
          <Image
            src="/svgs/footer-logo.svg"
            alt="footer-logo"
            width={90}
            height={90}
          />
          <div>
            <p className="text-[#454F6F] text-sm">
              (03063) 서울시 종로구 성균관로 25-2 성균관대학교 중앙학술정보관
            </p>
            <p className="text-[#454F6F] text-sm">
              (16419) 경기도 수원시 장안구 서부로 2066 성균관대학교
              삼성학술정보관
            </p>
            <p className="text-[#B1B7CC] text-xs mt-1">
              COPYRIGHT © 2025 SKKU LIBRARY. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          <Image src="/svgs/fb-logo.svg" alt="fb-logo" width={48} height={48} />
          <div className="relative">
            <button
              className="flex items-center gap-2 border border-[#CDD2E0] rounded-full px-5 py-3 text-[#8188A1] hover:bg-gray-50"
              onClick={() => setIsFamilySiteOpen(!isFamilySiteOpen)}
            >
              Family Site
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isFamilySiteOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isFamilySiteOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-[#CDD2E0] rounded-lg shadow-lg min-w-[200px] z-50">
                {familySites.map((site, index) => (
                  <a
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-[#454F6F] hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {site.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

