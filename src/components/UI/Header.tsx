"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuData } from "@/data/MenuData";

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getMenuPosition = (menuTitle: string) => {
    const menuItem = menuItemRefs.current[menuTitle];
    if (!menuItem) return "-right-32";

    const rect = menuItem.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const menuWidth = 450;
    const padding = 20;
    const itemCenter = rect.left + rect.width / 2;
    const menuLeft = itemCenter - menuWidth / 2;

    if (menuLeft < padding) return "left-0";
    if (menuLeft + menuWidth > windowWidth - padding) return "right-0";
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <>
      <header
        className={`border-b border-[#E5E2DC] relative z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/images/skkulib_logo.png"
              alt="성균관대학교 학술정보관"
              width={240}
              height={34}
              className="lg:w-[240px] w-[170px] sm:w-[200px] md:w-[220px]"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="flex items-center gap-4 relative">
            <ul className="hidden lg:flex items-center gap-5 text-[15px] font-medium">
              {MenuData.map((item) => (
                <li key={item.title} className="relative">
                  <div
                    ref={(el) => {
                      menuItemRefs.current[item.title] = el;
                    }}
                    className="flex items-center gap-1 py-5 cursor-pointer group"
                    onMouseEnter={() => setActiveMenu(item.title)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <p className="text-[#1F222D] group-hover:text-[#1B3A5C] transition-colors text-center max-w-[200px]">
                      {item.title}
                    </p>
                    <div className="w-1 h-1 rounded-full bg-[#1F222D] group-hover:bg-[#C8102E] transition-colors" />
                  </div>

                  <AnimatePresence>
                    {activeMenu === item.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${getMenuPosition(
                          item.title
                        )} top-14 w-max bg-white shadow-xl rounded-lg p-6 border border-[#E5E2DC] z-50`}
                        onMouseEnter={() => setActiveMenu(item.title)}
                        onMouseLeave={() => setActiveMenu(null)}
                      >
                        <div
                          className="grid gap-x-6 mb-0"
                          style={{
                            gridTemplateColumns: `repeat(${item.category.length}, minmax(140px, 1fr))`,
                          }}
                        >
                          {item.category.map((cat) => (
                            <div key={cat.name}>
                              <h4 className="text-sm font-bold text-[#1F222D] pb-1 relative max-w-[200px]">
                                {cat.name}
                                <span
                                  className={`absolute left-0 bottom-0 h-[2px] transition-all duration-300 ${
                                    hoveredCategory === cat.name
                                      ? "w-full bg-[#1B3A5C]"
                                      : "w-0 bg-transparent"
                                  }`}
                                />
                              </h4>
                            </div>
                          ))}
                        </div>
                        <div className="mb-3">
                          <div className="w-full h-px bg-[#E5E2DC]" />
                        </div>
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
                                    className="text-xs lg:text-sm text-[#6B7280] hover:text-[#1B3A5C] cursor-pointer transition-colors max-w-[182px]"
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

            {/* Hamburger */}
            <button
              className="cursor-pointer p-1 hover:bg-[#F8F6F2] rounded transition-colors"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-6 h-6 md:w-7 md:h-7 text-[#1F222D]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            key="side-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#1B3A5C]/95 backdrop-blur-sm z-[9999] overflow-y-auto"
          >
            <div className="max-w-lg mx-auto px-6 py-8">
              <div className="flex justify-end mb-8">
                <button
                  className="text-white p-2 hover:bg-white/10 rounded transition-colors cursor-pointer"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {MenuData.map((item, idx) => (
                  <div key={idx}>
                    <h2 className="text-white text-lg font-bold mb-3">
                      {item.title}
                    </h2>
                    <div className="bg-white rounded-lg p-5">
                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                        {item.category.map((cat) => (
                          <div key={cat.name}>
                            <h4 className="text-sm font-bold text-[#1F222D] pb-1 mb-2 border-b border-[#E5E2DC]">
                              {cat.name}
                            </h4>
                            <ul className="space-y-1">
                              {cat.items.map((sub, subIdx) => (
                                <li
                                  key={subIdx}
                                  className="text-sm text-[#6B7280] hover:text-[#1B3A5C] transition-colors"
                                >
                                  {sub.href ? (
                                    <a href={sub.href} className="block py-0.5">
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
                    </div>
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
