"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(end: number, duration: number = 2000, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

interface Project {
  purpose: string;
  count: number;
  amount: number;
}

interface SummaryData {
  totalCount: number;
  totalAmount: number;
  projects: Project[];
}

export default function DonationStatus() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    fetch("/api/donations/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(console.error);
  }, []);

  const participationCount = summary?.totalCount ?? 0;
  const totalDonation = summary?.totalAmount ?? 0;
  const animatedParticipation = useCountUp(participationCount, 2000, isInView && summary !== null);
  const animatedDonation = useCountUp(totalDonation, 2500, isInView && summary !== null);

  const getProject = (name: string) =>
    summary?.projects.find((p) => p.purpose.includes(name));

  const libraryOn = getProject("1398") ?? getProject("LibraryON");
  const generalFund = getProject("발전기금");

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#1B3A5C] text-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-white/60" />
            <span className="text-sm font-semibold text-white/60 tracking-wider uppercase">
              Donation Status
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            여러분의 <span className="text-[#C8102E]">따뜻한 마음</span>이
            모였습니다
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-10 text-center"
          >
            <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">
              참여 건수
            </p>
            <p className="text-5xl md:text-6xl font-bold mb-2 tabular-nums">
              {formatNumber(animatedParticipation)}
              <span className="text-xl font-normal text-white/60 ml-2">건</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-10 text-center"
          >
            <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">
              기부 총액
            </p>
            <p className="text-5xl md:text-6xl font-bold mb-2 tabular-nums">
              {formatNumber(animatedDonation)}
              <span className="text-xl font-normal text-white/60 ml-2">원</span>
            </p>
          </motion.div>
        </div>

        {/* Detail Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white text-[#1F222D] overflow-hidden">
            <div className="bg-[#1B3A5C] border-b-4 border-[#C8102E] py-4 text-center">
              <h3 className="text-lg font-bold text-white">
                1398 LibraryON 프로젝트
              </h3>
            </div>
            <div className="p-8 text-center">
              <p className="text-3xl font-bold text-[#C8102E] mb-2">
                {formatNumber(libraryOn?.amount ?? 0)}
                <span className="text-sm text-[#6B7280] font-normal ml-1">
                  원
                </span>
              </p>
              <p className="text-2xl font-bold text-[#1B3A5C]">
                {formatNumber(libraryOn?.count ?? 0)}
                <span className="text-sm text-[#6B7280] font-normal ml-1">
                  건
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white text-[#1F222D] overflow-hidden">
            <div className="bg-[#00563F] border-b-4 border-[#1B3A5C] py-4 text-center">
              <h3 className="text-lg font-bold text-white">
                도서관 발전기금
              </h3>
            </div>
            <div className="p-8 text-center">
              <p className="text-3xl font-bold text-[#C8102E] mb-2">
                {formatNumber(generalFund?.amount ?? 0)}
                <span className="text-sm text-[#6B7280] font-normal ml-1">
                  원
                </span>
              </p>
              <p className="text-2xl font-bold text-[#1B3A5C]">
                {formatNumber(generalFund?.count ?? 0)}
                <span className="text-sm text-[#6B7280] font-normal ml-1">
                  건
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
