"use client";

import React, { useState, useEffect } from "react";

interface SectionNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const sections = [
  { id: "intro", label: "안내" },
  { id: "status", label: "기부현황" },
  { id: "donors", label: "기부자 명단" },
  { id: "benefits", label: "기부자 예우" },
];

export default function SectionNav({
  activeSection,
  onNavigate,
}: SectionNavProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full z-40 transition-all duration-300 border-b ${
        isSticky
          ? "fixed top-0 bg-white/95 backdrop-blur-sm shadow-sm border-[#E5E2DC]"
          : "relative bg-white border-[#E5E2DC]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`section-nav-item py-4 px-6 text-sm font-medium transition-colors cursor-pointer ${
                activeSection === section.id
                  ? "active text-[#1B3A5C] font-bold"
                  : "text-[#6B7280] hover:text-[#1B3A5C]"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
