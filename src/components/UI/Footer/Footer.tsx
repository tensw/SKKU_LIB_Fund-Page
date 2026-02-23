"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [isFamilySiteOpen, setIsFamilySiteOpen] = useState(false);

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
    <footer className="bg-white border-t border-[#E5E2DC]">
      {/* Top Links */}
      <div className="flex justify-center items-center gap-8 py-3 border-b border-[#E5E2DC]">
        <a
          href="https://lib.skku.edu/hsc/bulletins/notice/services"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6B7280] text-xs font-medium hover:text-[#1F222D] transition-colors hidden sm:block"
        >
          주요전화번호
        </a>
        <div className="w-px h-4 bg-[#E5E2DC] hidden sm:block" />
        <a
          href="https://www.skku.edu/skku/etc/private.do"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6B7280] text-xs font-medium hover:text-[#1F222D] transition-colors"
        >
          개인정보처리방침
        </a>
        <div className="w-px h-4 bg-[#E5E2DC]" />
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
          className="text-[#6B7280] text-xs font-medium hover:text-[#1F222D] transition-colors"
        >
          이메일무단수집거부
        </a>
      </div>

      {/* Bottom Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo + Address */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Image
              src="/svgs/footer-logo.svg"
              alt="성균관대학교"
              width={72}
              height={72}
              className="shrink-0"
            />
            <div className="text-center sm:text-left">
              <p className="text-[#6B7280] text-xs leading-relaxed">
                (03063) 서울시 종로구 성균관로 25-2 성균관대학교 중앙학술정보관
              </p>
              <p className="text-[#6B7280] text-xs leading-relaxed">
                (16419) 경기도 수원시 장안구 서부로 2066 성균관대학교
                삼성학술정보관
              </p>
              <p className="text-[#c4c0b8] text-[10px] mt-1">
                COPYRIGHT &copy; 2025 SKKU LIBRARY. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>

          {/* Social + Family Site */}
          <div className="flex items-center gap-3 relative">
            <a
              href="https://www.facebook.com/saboralib"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/svgs/fb-logo.svg"
                alt="Facebook"
                width={40}
                height={40}
              />
            </a>
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-[#E5E2DC] rounded-full px-4 py-2 text-xs text-[#6B7280] hover:bg-[#F8F6F2] transition-colors cursor-pointer"
                onClick={() => setIsFamilySiteOpen(!isFamilySiteOpen)}
              >
                Family Site
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isFamilySiteOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isFamilySiteOpen && (
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-[#E5E2DC] rounded-lg shadow-lg min-w-[200px] z-50">
                  {familySites.map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-xs text-[#6B7280] hover:text-[#1B3A5C] hover:bg-[#F8F6F2] first:rounded-t-lg last:rounded-b-lg transition-colors"
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
    </footer>
  );
}
