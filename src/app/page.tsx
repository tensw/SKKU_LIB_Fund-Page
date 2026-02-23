"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import HeroSection from "@/components/Donors/HeroSection";
import SectionNav from "@/components/Donors/SectionNav";
import ProjectVision from "@/components/Donors/ProjectVision";
import DonationStatus from "@/components/Donors/DonationStatus";
import DonorList from "@/components/Donors/DonorList";
import DonorBenefits from "@/components/Donors/DonorBenefits";
import DonationGuide from "@/components/Donors/DonationGuide";

export default function DonorsPage() {
  const [activeSection, setActiveSection] = useState("intro");

  const introRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const donorsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    intro: introRef,
    status: statusRef,
    donors: donorsRef,
    benefits: benefitsRef,
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const sections = [
        { id: "benefits", ref: benefitsRef },
        { id: "donors", ref: donorsRef },
        { id: "status", ref: statusRef },
        { id: "intro", ref: introRef },
      ];

      for (const section of sections) {
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      const offset = 60; // Account for sticky nav
      const top = ref.current.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const handleScrollDown = useCallback(() => {
    if (introRef.current) {
      introRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      {/* Hero */}
      <HeroSection onScrollDown={handleScrollDown} />

      {/* Section Navigation */}
      <div ref={introRef}>
        <SectionNav
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Project Vision */}
      <ProjectVision />

      {/* Donation Status */}
      <div ref={statusRef}>
        <DonationStatus />
      </div>

      {/* Donor List */}
      <div ref={donorsRef}>
        <DonorList />
      </div>

      {/* Donor Benefits */}
      <div ref={benefitsRef}>
        <DonorBenefits />
      </div>

      {/* Donation Guide + Contact */}
      <DonationGuide />
    </div>
  );
}
