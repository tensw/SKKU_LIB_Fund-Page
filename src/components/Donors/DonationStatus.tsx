// components/DonationStatus.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CounterProps {
  end: number;
  duration?: number;
  suffix: string;
}

function useCountUp(end: number, duration: number = 2000, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
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

export default function DonationStatus() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const participationCount = 8734;
  const totalDonation = 1810735970;
  const animatedParticipation = useCountUp(participationCount, 2000, isVisible);
  const animatedDonation = useCountUp(totalDonation, 2500, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className=" bg-white">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-3 h-0.5 bg-red-600"></div>
          <h2 className="text-base font-semibold text-gray-600">기부현황</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Image
                src="/images/donateheart.png"
                alt="참여 건수 아이콘"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <p className="text-4xl md:text-6xl font-bold text-[#0fa094] mb-2">
              {formatNumber(animatedParticipation)}
              <span className="text-2xl text-black font-medium ml-1">건</span>
            </p>

            <h3 className="text-xl text-black font-medium">참여 건수</h3>
          </div>

          {/* Total Donation */}
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-4">
              <Image
                src="/images/donatemoney.png"
                alt="기부 총액 아이콘"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            <p className="text-4xl md:text-6xl font-bold text-[#f84e4f] mb-2">
              {formatNumber(animatedDonation)}
              <span className="text-2xl text-black font-medium ml-1">원</span>
            </p>
            <h3 className="text-xl text-black font-medium">기부 총액</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
