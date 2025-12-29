// components/donors/Header.tsx
import React from "react";

const Header = () => {
  return (
    <header className=" border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          학술정보관 발전기금
        </h1>
        <p className="text-center text-gray-600">
          성균관대학교·학문의 광장이자 대학의 심장
        </p>
      </div>
    </header>
  );
};

export default Header;
