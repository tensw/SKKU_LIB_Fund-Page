"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Hash,
  Banknote,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

const CHART_COLORS = ["#1B3A5C", "#C8102E", "#00563F", "#F59E0B", "#8B5CF6"];

type Period = "1m" | "3m" | "6m" | "all";

interface Analytics {
  totalCount: number;
  totalAmount: number;
  avgAmount: number;
  latestDonation: string | null;
  monthlyTrend: { month: string; count: number; amount: number }[];
  byPurpose: { purpose: string; count: number; amount: number }[];
  byDonorType: { donorType: string; count: number; amount: number }[];
}

interface Donation {
  id: number;
  name: string;
  donorType: string;
  amount: number;
  donatedAt: string;
  purpose: string;
  note: string | null;
}

const periodOptions: { label: string; value: Period }[] = [
  { label: "1개월", value: "1m" },
  { label: "3개월", value: "3m" },
  { label: "6개월", value: "6m" },
  { label: "전체", value: "all" },
];

function formatAmount(value: number): string {
  return value.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const [analyticsRes, donationsRes] = await Promise.all([
        fetch(`/api/donations/analytics?period=${selectedPeriod}`),
        fetch("/api/donations?limit=10&sort=desc"),
      ]);

      if (analyticsRes.ok) {
        const data: Analytics = await analyticsRes.json();
        setAnalytics(data);
      }

      if (donationsRes.ok) {
        const data = await donationsRes.json();
        setRecentDonations(data.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  if (loading && !analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#6B7280]">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#1F222D]">대시보드</h1>

        {/* Period Filter */}
        <div className="flex gap-2">
          {periodOptions.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                period === value
                  ? "bg-[#1B3A5C] text-white"
                  : "bg-white text-[#6B7280] hover:bg-[#E5E2DC]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              icon={<Hash className="h-5 w-5" />}
              label="총 기부 건수"
              value={`${analytics.totalCount.toLocaleString("ko-KR")}건`}
              color="#1B3A5C"
            />
            <KPICard
              icon={<Banknote className="h-5 w-5" />}
              label="총 기부액"
              value={formatAmount(analytics.totalAmount)}
              color="#00563F"
            />
            <KPICard
              icon={<TrendingUp className="h-5 w-5" />}
              label="평균 기부액"
              value={formatAmount(analytics.avgAmount)}
              color="#C8102E"
            />
            <KPICard
              icon={<CalendarDays className="h-5 w-5" />}
              label="최근 기부일"
              value={
                analytics.latestDonation
                  ? formatDate(analytics.latestDonation)
                  : "-"
              }
              color="#F59E0B"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Monthly Trend */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F222D]">
                월별 기부 추이
              </h2>
              {analytics.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(v: number) =>
                        v >= 10000
                          ? `${(v / 10000).toLocaleString("ko-KR")}만`
                          : v.toLocaleString("ko-KR")
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatAmount(value),
                        "기부액",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#1B3A5C"
                      strokeWidth={2}
                      dot={{ fill: "#1B3A5C", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#6B7280]">
                  데이터가 없습니다.
                </div>
              )}
            </div>

            {/* By Purpose */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F222D]">
                기부 용도별 분포
              </h2>
              {analytics.byPurpose.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.byPurpose}
                      dataKey="amount"
                      nameKey="purpose"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ purpose, percent }: { purpose: string; percent: number }) =>
                        `${purpose} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {analytics.byPurpose.map((_, index) => (
                        <Cell
                          key={`cell-purpose-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatAmount(value),
                        "기부액",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#6B7280]">
                  데이터가 없습니다.
                </div>
              )}
            </div>

            {/* By Donor Type */}
            <div className="rounded-xl bg-white p-6 shadow-sm xl:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-[#1F222D]">
                기부자 유형별 현황
              </h2>
              {analytics.byDonorType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.byDonorType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" />
                    <XAxis
                      dataKey="donorType"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(v: number) =>
                        v >= 10000
                          ? `${(v / 10000).toLocaleString("ko-KR")}만`
                          : v.toLocaleString("ko-KR")
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "amount"
                          ? formatAmount(value)
                          : value.toLocaleString("ko-KR") + "건",
                        name === "amount" ? "기부액" : "건수",
                      ]}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === "amount" ? "기부액" : "건수"
                      }
                    />
                    <Bar dataKey="amount" fill="#1B3A5C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" fill="#C8102E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#6B7280]">
                  데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* Recent Donations Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1F222D]">
              최근 기부 내역
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E2DC]">
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      No
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      기부자
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      유형
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      금액
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      날짜
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                      용도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.length > 0 ? (
                    recentDonations.map((donation, idx) => (
                      <tr
                        key={donation.id}
                        className="border-b border-[#E5E2DC] last:border-b-0 hover:bg-[#F8F6F2]"
                      >
                        <td className="px-4 py-3 text-[#6B7280]">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#1F222D]">
                          {donation.name}
                        </td>
                        <td className="px-4 py-3 text-[#6B7280]">
                          <span className="rounded-full bg-[#1B3A5C]/10 px-2.5 py-0.5 text-xs font-medium text-[#1B3A5C]">
                            {donation.donorType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1F222D]">
                          {formatAmount(donation.amount)}
                        </td>
                        <td className="px-4 py-3 text-[#6B7280]">
                          {formatDate(donation.donatedAt)}
                        </td>
                        <td className="px-4 py-3 text-[#6B7280]">
                          {donation.purpose}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-[#6B7280]"
                      >
                        기부 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <span className="text-sm text-[#6B7280]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#1F222D]">{value}</p>
    </div>
  );
}
