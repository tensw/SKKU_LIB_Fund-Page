// components/donors/NavigationTabs.tsx
"use client";
import React from "react";
import { Book, TrendingUp, Users, Heart, BookOpen } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: "intro", label: "안내", icon: <BookOpen size={18} /> },
  { id: "status", label: "기부현황", icon: <TrendingUp size={18} /> },
  { id: "group", label: "기부자단", icon: <Users size={18} /> },
  { id: "benefits", label: "기부자혜택", icon: <Heart size={18} /> },
];

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="bg-white  mt-8 ">
      <div className="max-w-6xl mx-auto px-1 border-b border-gray-500">
        <div className="flex  flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-2 px-5 border transition-colors ${
                activeTab === tab.id
                  ? "border-gray-700  "
                  : "border border-gray-200 text-gray-600 bg-gray-50"
              }`}
            >
              {/* {tab.icon} */}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavigationTabs;
