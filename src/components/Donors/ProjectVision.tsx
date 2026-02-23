"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Monitor, Users, Palette } from "lucide-react";

const visionCards = [
  {
    icon: <Monitor className="w-8 h-8" />,
    title: "스마트 도서관",
    subtitle: "디지털 학습 및 AI 기반",
    description:
      "첨단 디지털 기술과 AI를 접목한 스마트 도서관으로 학술 연구와 학습의 새로운 패러다임을 제시합니다.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "멀티 학습 공간",
    subtitle: "협업과 창의의 공간",
    description:
      "북 라운지, 미디어 라운지 등 다양한 학습 공간을 구축하여 융합적 사고와 협업을 지원합니다.",
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "문화·예술 체험",
    subtitle: "열린 공간",
    description:
      "갤러리, 이벤트홀, 북카페 등 문화·예술을 체험할 수 있는 열린 공간으로 캠퍼스 문화의 중심이 됩니다.",
  },
];

export default function ProjectVision() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#F8F6F2]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-[#1B3A5C]" />
            <span className="text-sm font-semibold text-[#1B3A5C] tracking-wider uppercase">
              Project Vision
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F222D] mb-4">
            도서관의 <span className="text-[#1B3A5C]">새로운 미래</span>를
            만들어갑니다
          </h2>
          <p className="text-[#6B7280] max-w-2xl text-base leading-relaxed">
            디지털 시대의 교육환경 변화와 다양한 이용자의 요구에 맞춰 &apos;1398
            LibraryON 프로젝트&apos;를 통해 체험형 지식문화공간, 미래형 첨단
            도서관의 기준을 만들어갑니다.
          </p>
        </motion.div>

        {/* Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {visionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="bg-white p-8 border border-[#E5E2DC] hover:border-[#1B3A5C]/30 transition-all duration-300 group hover:shadow-lg"
            >
              <div className="text-[#1B3A5C] mb-4 group-hover:text-[#C8102E] transition-colors">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1F222D] mb-1">
                {card.title}
              </h3>
              <p className="text-xs font-medium text-[#1B3A5C] mb-3 uppercase tracking-wider">
                {card.subtitle}
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[480px]"
        >
          {/* Large Image - 사랑해 라운지 */}
          <div className="relative w-full h-72 lg:h-full overflow-hidden group">
            <Image
              src="/images/lounge-concept.png"
              alt="사랑해 라운지 컨셉"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-white font-semibold text-lg">사랑해 라운지</p>
              <p className="text-white/80 text-sm">
                문화·예술 체험 열린 공간
              </p>
            </div>
          </div>

          {/* Right Column - Two Stacked Images */}
          <div className="grid grid-rows-2 gap-4 h-72 lg:h-full">
            <div className="relative w-full h-full overflow-hidden group">
              <Image
                src="/images/info2Img2.jpg"
                alt="학술정보관 내부"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-white font-semibold">멀티 학습 공간</p>
              </div>
            </div>
            <div className="relative w-full h-full overflow-hidden group">
              <Image
                src="/images/info2Img3.jpg"
                alt="도서관 서가"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-white font-semibold">스마트 도서관</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-between bg-white border border-[#E5E2DC] p-6 md:p-8"
        >
          <div>
            <p className="text-sm text-[#6B7280] mb-1">총 사업비</p>
            <p className="text-2xl md:text-3xl font-bold text-[#1B3A5C]">
              50<span className="text-lg font-medium text-[#6B7280] ml-1">억 원</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-8">
            <div className="text-center">
              <p className="text-xs text-[#6B7280] mb-1">삼성학술정보관</p>
              <p className="text-sm font-semibold text-[#1F222D]">자연과학캠퍼스</p>
            </div>
            <div className="w-px h-10 bg-[#E5E2DC]" />
            <div className="text-center">
              <p className="text-xs text-[#6B7280] mb-1">중앙학술정보관</p>
              <p className="text-sm font-semibold text-[#1F222D]">인문사회과학캠퍼스</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
