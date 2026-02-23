"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, Building2, ExternalLink } from "lucide-react";

export default function DonationGuide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#F8F6F2]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Donation CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-[#1B3A5C] text-white p-10 md:p-14 text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            기부 참여 안내
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            학술정보관 발전기금 기부 참여는 성균관대학교 발전기금 사이트에서
            가능합니다. 여러분의 소중한 마음이 도서관의 미래를 밝힙니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="https://give.skku.edu/skku/pay/step1_direct?dontype=602j8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A50D24] text-white px-8 py-4 font-semibold transition-all duration-300 hover:shadow-lg"
            >
              발전기금 기부참여
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://fund.skku.edu/1398-libraryon-project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-4 font-semibold transition-all duration-300"
            >
              기부참여방법 안내
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-white/50">
            (1398캠페인 &gt; 1398LibraryOn(도서관)발전기금 온·오프라인 기부 참여)
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[2px] bg-[#1B3A5C]" />
            <span className="text-sm font-semibold text-[#1B3A5C] tracking-wider uppercase">
              Contact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 학술정보관 */}
            <div className="bg-white border border-[#E5E2DC] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1B3A5C]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1B3A5C]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F222D]">
                  학술정보관
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">전화번호</p>
                    <p className="text-sm font-medium text-[#1F222D]">
                      02-760-1207, 031-299-4021
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">이메일</p>
                    <a
                      href="mailto:centrallib@skku.edu"
                      className="text-sm font-medium text-[#1B3A5C] hover:text-[#C8102E] transition-colors"
                    >
                      centrallib@skku.edu
                    </a>
                    <span className="text-[#6B7280] mx-1">/</span>
                    <a
                      href="mailto:samsunglib@skku.edu"
                      className="text-sm font-medium text-[#1B3A5C] hover:text-[#C8102E] transition-colors"
                    >
                      samsunglib@skku.edu
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 발전협력팀 */}
            <div className="bg-white border border-[#E5E2DC] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#00563F]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#00563F]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F222D]">
                  성균관대학교 발전협력팀
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">전화번호</p>
                    <p className="text-sm font-medium text-[#1F222D]">
                      02-760-1153
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">이메일</p>
                    <a
                      href="mailto:fund@skku.edu"
                      className="text-sm font-medium text-[#1B3A5C] hover:text-[#C8102E] transition-colors"
                    >
                      fund@skku.edu
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
