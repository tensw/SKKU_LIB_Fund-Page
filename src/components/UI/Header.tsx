"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MenuData } from "@/data/MenuData";

export default function Header() {
  const pathname = usePathname();
  const [isNscPage, setIsNscPage] = useState(false);
  const currentMenuData = MenuData;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 클라이언트에서만 경로 확인하여 hydration 문제 해결
  useEffect(() => {
    setIsNscPage(pathname.startsWith("/suwon"));
  }, [pathname]);

  // 메뉴 위치 계산 함수 (호버한 항목 기준으로 중앙 정렬)
  const getMenuPosition = (menuTitle: string) => {
    const menuItem = menuItemRefs.current[menuTitle];
    if (!menuItem) return "-right-32";

    const rect = menuItem.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const menuWidth = 450; // 대략적인 메뉴 너비
    const padding = 20; // 화면 가장자리 여백

    // 호버한 항목의 중앙 위치 계산
    const itemCenter = rect.left + rect.width / 2;

    // 메뉴를 호버한 항목 중앙에 맞추기
    const menuLeft = itemCenter - menuWidth / 2;

    // 화면 경계 확인
    if (menuLeft < padding) {
      return "left-0";
    } else if (menuLeft + menuWidth > windowWidth - padding) {
      return "right-0";
    }

    // 중앙 정렬이 가능한 경우
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <>
      <header className="border-b border-[#ECEDF1] relative z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-3 md:py-4 lg:py-5">
          <div>
            <Link href="/">
              <Image
                src="/images/skkulib_logo.png"
                alt="logo"
                width={260}
                height={37}
                className="lg:w-[260px] w-[190px] sm:w-[220px] md:w-[240px] cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-6 relative">
            <ul className="hidden lg:flex items-center gap-6 text-lg font-medium">
              {currentMenuData.map((item) => (
                <li key={item.title} className="relative cursor-pointer">
                  <div
                    ref={(el) => {
                      menuItemRefs.current[item.title] = el;
                    }}
                    className="flex items-center gap-1 group pt-6 pb-4"
                    onMouseEnter={() => setActiveMenu(item.title)}
                    onMouseLeave={() => setActiveMenu(null)}
                    onClick={() => {
                      // My library 메뉴 클릭 시 대시보드로 이동
                      if (item.title === "My library") {
                        const dashboardUrl = isNscPage
                          ? "https://lib.skku.edu/nsc/mylibrary/mydashboard/dashboard"
                          : "https://lib.skku.edu/hsc/mylibrary/mydashboard/dashboard";
                        window.location.href = dashboardUrl;
                      }
                    }}
                  >
                    <p className="text-wrap max-w-[220px] text-center">
                      {item.title}
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1F222D] group-hover:bg-[#FF5A5C]" />
                  </div>
                  <AnimatePresence>
                    {activeMenu === item.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className={`absolute ${getMenuPosition(
                          item.title
                        )} top-14 w-max bg-white shadow-xl rounded-xl p-6 border border-gray-200 z-50`}
                        onMouseEnter={() => setActiveMenu(item.title)}
                        onMouseLeave={() => setActiveMenu(null)}
                      >
                        {/* Titles Row */}
                        <div
                          className="grid gap-x-6 mb-0"
                          style={{
                            gridTemplateColumns: `repeat(${item.category.length}, minmax(140px, 1fr))`,
                          }}
                        >
                          {item.category.map((cat) => (
                            <div key={cat.name}>
                              <h4
                                className={`text-sm lg:text-base font-bold text-[#1F222D] pb-1 transition-all duration-500 relative text-wrap max-w-[200px]`}
                              >
                                {cat.name}
                                <span
                                  className={`absolute left-0 bottom-0 h-1 transition-all duration-500 rounded-full ${
                                    hoveredCategory === cat.name
                                      ? "w-full bg-[#015EAC]"
                                      : "w-0 bg-transparent"
                                  }`}
                                />
                              </h4>
                            </div>
                          ))}
                        </div>

                        {/* Full-width divider under all titles */}
                        <div className="mb-3">
                          <div className="w-full h-[0.5px] bg-[#DCDCDC]" />
                        </div>

                        {/* Content Row */}
                        <div
                          className="grid gap-x-6"
                          style={{
                            gridTemplateColumns: `repeat(${item.category.length}, minmax(140px, 1fr))`,
                          }}
                        >
                          {item.category.map((cat) => (
                            <div key={cat.name}>
                              <ul className="space-y-1">
                                {cat.items.map((sub, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs lg:text-sm text-gray-700 hover:text-[#828AFA] cursor-pointer transition-all duration-500 text-wrap max-w-[182px]"
                                    onMouseEnter={() =>
                                      setHoveredCategory(cat.name)
                                    }
                                    onMouseLeave={() =>
                                      setHoveredCategory(null)
                                    }
                                  >
                                    {sub.href ? (
                                      <a
                                        href={sub.href}
                                        {...(sub.title.includes(
                                          "학술논문검색"
                                        ) && {
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                        })}
                                        // className="block"
                                      >
                                        {sub.title}
                                      </a>
                                    ) : (
                                      sub.title
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
            <Menu
              className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
              onClick={() => setShowMobileMenu(true)}
            />
          </div>
        </div>
      </header>
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            key="side-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#080C0EE5] backdrop-blur-xs z-[9999] overflow-y-auto"
          >
            <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  className="text-white text-xl sm:text-2xl cursor-pointer p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✕
                </button>
              </div>

              {/* Menu Blocks */}
              <div className="space-y-6 sm:space-y-8 md:space-y-10">
                {currentMenuData.map((item, idx) => (
                  <div key={idx}>
                    {/* Main Title */}
                    <h2 className="text-white text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">
                      {item.title}
                    </h2>

                    {/* Dropdown Group - 반응형 레이아웃 */}
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-full bg-white shadow-xl rounded-xl p-4 sm:p-6 border border-gray-200"
                      >
                        {/* 모바일: 세로 스택, 태블릿+: 그리드 */}
                        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {item.category.map((cat) => (
                            <div key={cat.name} className="min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-[#1F222D] pb-1 transition-all duration-500 relative break-words">
                                {cat.name}
                                <span
                                  className={`absolute left-0 bottom-0 h-1 transition-all duration-500 rounded-full ${
                                    hoveredCategory === cat.name
                                      ? "w-full bg-[#015EAC]"
                                      : "w-0 bg-transparent"
                                  }`}
                                />
                              </h4>

                              {/* 구분선 */}
                              <div className="mb-3">
                                <div className="w-full h-[0.5px] bg-[#DCDCDC]" />
                              </div>

                              {/* 메뉴 아이템들 */}
                              <ul className="space-y-1">
                                {cat.items.map((sub, idx) => (
                                  <li
                                    key={idx}
                                    className="text-xs sm:text-sm text-gray-700 hover:text-[#828AFA] cursor-pointer transition-all duration-500 break-words"
                                    onMouseEnter={() =>
                                      setHoveredCategory(cat.name)
                                    }
                                    onMouseLeave={() =>
                                      setHoveredCategory(null)
                                    }
                                  >
                                    {sub.href ? (
                                      <a
                                        href={sub.href}
                                        {...(sub.title.includes(
                                          "학술논문검색"
                                        ) && {
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                        })}
                                        className="block"
                                      >
                                        {sub.title}
                                      </a>
                                    ) : (
                                      sub.title
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

