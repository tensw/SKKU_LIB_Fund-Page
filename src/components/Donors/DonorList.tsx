"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Donation {
  id: number;
  name: string;
  donorType: string;
  amount: number;
  donatedAt: string;
  purpose: string;
  note: string | null;
}

export default function DonorList() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("기부자");
  const [purpose, setPurpose] = useState("전체");
  const [sortOrder, setSortOrder] = useState("내림차순");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortOrder === "오름차순" ? "asc" : "desc",
      });

      if (searchTerm.trim()) {
        if (category === "기부자") {
          params.set("search", searchTerm);
        } else {
          params.set("type", searchTerm);
        }
      }

      if (purpose !== "전체") {
        params.set("purpose", purpose);
      }

      const res = await fetch(`/api/donations?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, category, purpose, sortOrder]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleExcelDownload = () => {
    window.open("/api/donations/export", "_blank");
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#F8F6F2]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-[#1B3A5C]" />
            <span className="text-sm font-semibold text-[#1B3A5C] tracking-wider uppercase">
              Donor List
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F222D]">
            기부자 명단
          </h2>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-[#E5E2DC] p-4 mb-6"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm text-[#1F222D] focus:outline-none focus:border-[#1B3A5C]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="기부자">기부자</option>
              <option value="기부자 정보">기부자 정보</option>
            </select>

            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="border border-[#E5E2DC] px-3 py-2.5 text-sm w-64 focus:outline-none focus:border-[#1B3A5C]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            <select
              className="border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm text-[#1F222D] focus:outline-none focus:border-[#1B3A5C]"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="전체">기부 용도</option>
              <option value="도서관 발전기금">도서관 발전기금</option>
              <option value="1398 LibraryON">1398 LibraryON</option>
            </select>

            <select
              className="border border-[#E5E2DC] bg-white px-3 py-2.5 text-sm text-[#1F222D] focus:outline-none focus:border-[#1B3A5C]"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option>오름차순</option>
              <option>내림차순</option>
            </select>

            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 bg-[#1B3A5C] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#152d49] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>조회</span>
            </button>
          </div>
        </motion.div>

        {/* Table Info */}
        <div className="flex justify-between items-end mb-3">
          <p className="text-sm text-[#6B7280]">
            총{" "}
            <span className="font-bold text-[#1F222D]">
              {total.toLocaleString()}
            </span>
            건 / {totalPages} 페이지
          </p>
          <button
            onClick={handleExcelDownload}
            className="p-2 border border-[#E5E2DC] bg-white hover:bg-[#F8F6F2] text-[#6B7280] transition-colors cursor-pointer"
            title="엑셀 다운로드"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white border border-[#E5E2DC]">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="bg-[#1B3A5C] text-white">
                <th className="py-3.5 px-4 font-semibold w-16">No.</th>
                <th className="py-3.5 px-4 font-semibold">기부자</th>
                <th className="py-3.5 px-4 font-semibold">기부자 정보</th>
                <th className="py-3.5 px-4 font-semibold">기부금액</th>
                <th className="py-3.5 px-4 font-semibold">기부일</th>
                <th className="py-3.5 px-4 font-semibold">비고</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-[#6B7280]">
                    로딩 중...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F8F6F2] transition-colors border-b border-[#E5E2DC] last:border-0"
                  >
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {total - (currentPage - 1) * itemsPerPage - index}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1F222D]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{item.donorType}</td>
                    <td className="py-3.5 px-4 text-[#1F222D] font-medium">
                      {item.amount.toLocaleString()}
                      <span className="text-xs text-[#6B7280] ml-0.5">원</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {new Date(item.donatedAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {item.purpose}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-[#6B7280]">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-1 mt-8">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 border border-[#E5E2DC] bg-white hover:bg-[#F8F6F2] disabled:opacity-30 cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4 text-[#6B7280]" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-[#E5E2DC] bg-white hover:bg-[#F8F6F2] disabled:opacity-30 mr-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#1B3A5C] text-white"
                  : "text-[#6B7280] hover:bg-[#E5E2DC]"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-[#E5E2DC] bg-white hover:bg-[#F8F6F2] disabled:opacity-30 ml-2 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border border-[#E5E2DC] bg-white hover:bg-[#F8F6F2] disabled:opacity-30 cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>
      </div>
    </section>
  );
}
