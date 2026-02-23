"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onScrollDown?: () => void;
}

export default function HeroSection({ onScrollDown }: HeroSectionProps) {
  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[1000px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-concept.png"
          alt="1398 LibraryON 프로젝트 컨셉 이미지"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Navy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A5C]/70 via-[#1B3A5C]/50 to-[#1B3A5C]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-white/80 mb-4 font-light">
            성균관대학교 학술정보관
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 tracking-tight">
            1398{" "}
            <span className="text-[#C8102E]">Library</span>
            <span className="text-white">ON</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-lg md:text-xl text-white/90 mb-2 font-light">
            전통을 켜다, 지식을 ON하다
          </p>
          <p className="text-sm md:text-base text-white/60 mb-10">
            체험형 지식문화공간, 미래형 첨단 도서관의 기준
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <a
            href="https://give.skku.edu/skku/pay/step1_direct?dontype=602j8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A50D24] text-white px-8 py-4 text-base font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#C8102E]/30"
          >
            발전기금 기부참여
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
          <p className="text-xs text-white/50 mt-3">
            1398캠페인 &gt; 1398LibraryOn(도서관)발전기금 온·오프라인 기부 참여
          </p>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={onScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
}
