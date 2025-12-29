"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const MOCK_DATA = [
  {
    id: 1,
    name: "이석원",
    type: "직원",
    amount: 33333,
    date: "2019-10-22",
    purpose: "도서관 발전기금",
  },
  {
    id: 2,
    name: "익명기부자",
    type: "학부",
    amount: 50000,
    date: "2020-02-11",
    purpose: "도서관 발전기금",
  },
  {
    id: 3,
    name: "익명기부자",
    type: "학부",
    amount: 60000,
    date: "2021-01-14",
    purpose: "도서관 발전기금",
  },
  {
    id: 4,
    name: "신숙원",
    type: "교원",
    amount: 30000000,
    date: "2021-12-30",
    purpose: "도서관 발전기금",
  },
  {
    id: 5,
    name: "신숙원",
    type: "교원",
    amount: 20000000,
    date: "2021-12-31",
    purpose: "도서관 발전기금",
  },
  {
    id: 6,
    name: "익명기부자",
    type: "학부",
    amount: 70000,
    date: "2022-01-13",
    purpose: "도서관 발전기금",
  },
  {
    id: 7,
    name: "김달원",
    type: "직원",
    amount: 20000,
    date: "2022-01-18",
    purpose: "도서관 발전기금",
  },
  {
    id: 8,
    name: "익명기부자",
    type: "학부",
    amount: 70000,
    date: "2022-02-15",
    purpose: "도서관 발전기금",
  },
  {
    id: 9,
    name: "김달원",
    type: "직원",
    amount: 20000,
    date: "2022-02-18",
    purpose: "도서관 발전기금",
  },
  {
    id: 10,
    name: "익명기부자",
    type: "학부",
    amount: 70000,
    date: "2022-03-15",
    purpose: "도서관 발전기금",
  },
  {
    id: 11,
    name: "박지성",
    type: "동문",
    amount: 1000000,
    date: "2022-04-01",
    purpose: "도서관 발전기금",
  },
  {
    id: 12,
    name: "손흥민",
    type: "동문",
    amount: 5000000,
    date: "2022-04-05",
    purpose: "도서관 발전기금",
  },
  {
    id: 13,
    name: "김연아",
    type: "교원",
    amount: 250000,
    date: "2022-04-10",
    purpose: "도서관 발전기금",
  },
  {
    id: 14,
    name: "아이유",
    type: "일반",
    amount: 10000000,
    date: "2022-04-12",
    purpose: "도서관 발전기금",
  },
  {
    id: 15,
    name: "유재석",
    type: "일반",
    amount: 50000,
    date: "2022-04-20",
    purpose: "도서관 발전기금",
  },
];

export default function DonorGroup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("기부자");
  const [purpose, setPurpose] = useState("전체");
  const [sortOrder, setSortOrder] = useState("오름차순");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /* ---------------- FILTER + SORT (FIXED) ---------------- */
  const filteredData = useMemo(() => {
    let data = [...MOCK_DATA];

    // search
    if (searchTerm.trim()) {
      data = data.filter((item) =>
        category === "기부자"
          ? item.name.includes(searchTerm)
          : item.type.includes(searchTerm)
      );
    }

    // purpose filter
    if (purpose !== "전체") {
      data = data.filter((item) => item.purpose === purpose);
    }

    // sort
    data.sort((a, b) =>
      sortOrder === "오름차순" ? a.amount - b.amount : b.amount - a.amount
    );

    return data;
  }, [searchTerm, category, purpose, sortOrder]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearch = () => setCurrentPage(1);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 mb-12 bg-white font-sans text-slate-700">
      <div className="flex items-center space-x-2 mb-6">
        {/* <Heart className="text-orange-600" size={24} /> */}
        <div className="w-3 h-0.5 bg-red-600"></div>
        <h2 className="text-2xl font-bold text-gray-800">기부자명단</h2>
      </div>
      <div className="flex flex-wrap gap-2 mb-8 items-center bg-white p-1">
        <select
          className="border border-slate-300 rounded px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="기부자">기부자</option>
          <option value="기부자 정보">기부자 정보</option>
        </select>

        {/* Input: Search Term */}
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className="border border-slate-300 rounded px-3 py-2 text-sm w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border border-slate-300 rounded px-3 py-2 text-sm"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          <option value="전체">기부 용도</option>
          <option value="도서관 발전기금">도서관 발전기금</option>
          <option value="장학금">장학금</option>
        </select>

        <select
          className="border border-slate-300 rounded px-3 py-2 text-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option>오름차순</option>
          <option>내림차순</option>
        </select>

        <button
          onClick={handleSearch}
          className="flex items-center gap-1 border border-slate-400 bg-white px-4 py-2 rounded"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">조회</span>
        </button>
      </div>
      <div className="flex justify-between items-end mb-2">
        <div className="text-md font-bold text-slate-700">
          총
          <span className="text-slate-900">{totalItems.toLocaleString()}</span>{" "}
          건<span className="font-normal text-slate-400 mx-1">/</span>
          <span className="font-normal text-slate-500">
            {totalPages} 페이지
          </span>
        </div>

        {/* Excel Download Icon */}
        <button
          className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-500"
          title="Excel Download"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* --- Data Table --- */}
      <div className="overflow-x-auto border-t-2 border-slate-800">
        <table className="w-full text-sm text-center border-b border-slate-200">
          <thead className="bg-gray-100 text-slate-700 font-bold">
            <tr>
              <th className="py-4 px-4 border-b border-slate-200 w-16">No.</th>
              <th className="py-4 px-4 border-b border-slate-200">기부자</th>
              <th className="py-4 px-4 border-b border-slate-200">
                기부자 정보
              </th>
              <th className="py-4 px-4 border-b border-slate-200">기부금액</th>
              <th className="py-4 px-4 border-b border-slate-200">기부일</th>
              <th className="py-4 px-4 border-b border-slate-200">비고</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-yellow-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 px-4 text-slate-500">
                    {totalItems - (currentPage - 1) * itemsPerPage - index}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600">{item.type}</td>
                  <td className="py-4 px-4 text-slate-600">
                    {item.amount.toLocaleString()}
                    <span className="text-xs ml-0.5">원</span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{item.date}</td>
                  <td className="py-4 px-4 text-slate-600">{item.purpose}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-slate-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-center items-center gap-1 mt-8">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronsLeft className="w-4 h-4 text-slate-500" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 mr-2"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors
              ${
                currentPage === pageNum
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 ml-2"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronsRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
