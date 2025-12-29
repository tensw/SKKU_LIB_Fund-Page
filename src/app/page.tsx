"use client";
import React, { useState } from "react";
import Header from "@/components/Donors/DonorHeader";
import NavigationTabs from "@/components/Donors/NavigationTabs";

import DonationStatus from "@/components/Donors/DonationStatus";
import DonorGroup from "@/components/Donors/DonarGroup";
import DonorBenefits from "@/components/Donors/DonarBenifits";
import GuideHero from "@/components/Donors/GuideHero";
import GuideFooter from "@/components/Donors/GuideFooter";
import DonationDetails from "@/components/Donors/DonationDetailCard";

export default function DonorsPage() {
  const [activeTab, setActiveTab] = useState("intro");

  const renderContent = () => {
    switch (activeTab) {
      case "intro":
        return (
          <div>
            <GuideHero />
            <GuideFooter />
          </div>
        );
      case "status":
        return (
          <div>
            <DonationStatus />
            <DonationDetails />
          </div>
        );
      case "group":
        return <DonorGroup />;
      case "benefits":
        return <DonorBenefits />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white ">
      <Header />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-8 bg-white">
        {renderContent()}
      </main>
    </div>
  );
}

