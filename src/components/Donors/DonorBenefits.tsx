"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award, BookOpen, Star, Crown } from "lucide-react";

const benefitTiers = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    tier: "일반 기부자",
    amount: "1만원 이상",
    color: "#1B3A5C",
    borderColor: "#1B3A5C",
    benefits: [
      "감사 서신 발송",
      "기부자 명단 등재",
      "학술정보관 소식지 발송",
    ],
  },
  {
    icon: <Star className="w-6 h-6" />,
    tier: "우수 기부자",
    amount: "100만원 이상",
    color: "#00563F",
    borderColor: "#00563F",
    benefits: [
      "일반 기부자 혜택 포함",
      "학술정보관 특별 열람 서비스",
      "도서관 행사 초청",
      "기부자 감사패 수여",
    ],
  },
  {
    icon: <Award className="w-6 h-6" />,
    tier: "명예 기부자",
    amount: "1,000만원 이상",
    color: "#1B3A5C",
    borderColor: "#C8102E",
    benefits: [
      "우수 기부자 혜택 포함",
      "학술정보관 명예의 전당 등재",
      "총장 감사장 수여",
      "VIP 열람실 이용 권한",
    ],
  },
  {
    icon: <Crown className="w-6 h-6" />,
    tier: "공간명 헌정",
    amount: "사업비 50% 이상",
    color: "#C8102E",
    borderColor: "#C8102E",
    benefits: [
      "명예 기부자 혜택 포함",
      "도서관 공간명 헌정 (기부자명 명명)",
      "영구 감사 명판 설치",
      "학교 발전 자문위원 위촉",
    ],
  },
];

export default function DonorBenefits() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-[#1B3A5C]" />
            <span className="text-sm font-semibold text-[#1B3A5C] tracking-wider uppercase">
              Donor Benefits
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F222D] mb-4">
            기부자 <span className="text-[#1B3A5C]">예우</span>
          </h2>
          <p className="text-[#6B7280] max-w-2xl text-base leading-relaxed">
            성균관대학교 학술정보관 발전기금에 참여해주시는 모든 기부자분들께
            감사의 마음을 담아 다양한 혜택을 제공합니다.
          </p>
        </motion.div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefitTiers.map((tier, index) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * index }}
              className="border border-[#E5E2DC] bg-[#F8F6F2] hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div
                className="h-1"
                style={{ backgroundColor: tier.borderColor }}
              />

              <div className="p-6">
                {/* Icon & Tier */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 mb-4 transition-colors"
                  style={{ color: tier.color }}
                >
                  {tier.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1F222D] mb-1">
                  {tier.tier}
                </h3>
                <p
                  className="text-sm font-semibold mb-5"
                  style={{ color: tier.color }}
                >
                  {tier.amount}
                </p>

                {/* Benefits List */}
                <ul className="space-y-2.5">
                  {tier.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-sm text-[#6B7280]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: tier.borderColor }}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fund.skku.edu Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-[#6B7280] mb-3">
            기부자 예우에 대한 상세 내용은 성균관대학교 발전기금 사이트에서
            확인하실 수 있습니다.
          </p>
          <a
            href="https://fund.skku.edu/1398-libraryon-project"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B3A5C] hover:text-[#C8102E] transition-colors"
          >
            성균관대학교 발전기금 사이트 바로가기
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
