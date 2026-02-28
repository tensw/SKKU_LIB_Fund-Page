"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";

interface PreviewRow {
  기부자: string;
  기부자정보: string;
  기부금액: number | string;
  기부일: string;
  기부용도: string;
  비고: string;
}

interface AnalyzeRow {
  id: number;
  name: string;
  donorType: string;
  amount: number;
  donatedAt: string;
  purpose: string;
  note: string | null;
  status: "new" | "duplicate" | "conflict";
  conflictInfo: {
    existingAmount: number;
    existingDonorType: string;
    existingNote: string | null;
  } | null;
  existingId: number | null;
}

interface AnalyzeResult {
  batchId: string;
  summary: {
    total: number;
    new: number;
    duplicate: number;
    conflict: number;
  };
  hasSeedData: boolean;
  seedCount: number;
  rows: AnalyzeRow[];
}

type Step = "upload" | "review" | "done";

export default function AdminUploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [decisions, setDecisions] = useState<Record<number, "skip" | "overwrite">>({});
  const [deleteSeedData, setDeleteSeedData] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    details?: { added: number; updated: number; skipped: number; seedDeleted: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    setResult(null);
    setAnalyzeResult(null);
    setStep("upload");
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      const rows: PreviewRow[] = jsonData.map((row) => ({
        기부자: String(row["기부자"] ?? row["기부자명"] ?? row["name"] ?? ""),
        기부자정보: String(row["기부자정보"] ?? row["기부자 정보"] ?? row["donorType"] ?? ""),
        기부금액: row["기부금액"] ?? row["기부 금액"] ?? row["amount"] ?? "",
        기부일: String(row["기부일"] ?? row["기부날짜"] ?? row["donatedAt"] ?? ""),
        기부용도: String(row["기부용도"] ?? row["기부 용도"] ?? row["purpose"] ?? ""),
        비고: String(row["비고"] ?? row["note"] ?? ""),
      }));

      setPreview(rows);
    } catch {
      setResult({ type: "error", message: "파일을 읽는 중 오류가 발생했습니다." });
      setPreview([]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAnalyzeResult(data);
        // Default all conflicts to "skip"
        const defaultDecisions: Record<number, "skip" | "overwrite"> = {};
        for (const row of data.rows) {
          if (row.status === "conflict") {
            defaultDecisions[row.id] = "skip";
          }
        }
        setDecisions(defaultDecisions);
        setDeleteSeedData(false);
        setStep("review");
      } else {
        setResult({ type: "error", message: data.error || "분석에 실패했습니다." });
      }
    } catch {
      setResult({ type: "error", message: "서버 오류가 발생했습니다." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!analyzeResult) return;

    setConfirming(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: analyzeResult.batchId,
          deleteSeedData,
          decisions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          type: "success",
          message: `반영 완료: 추가 ${data.summary.added}건, 수정 ${data.summary.updated}건, 건너뜀 ${data.summary.skipped}건${data.summary.seedDeleted > 0 ? `, 시드 삭제 ${data.summary.seedDeleted}건` : ""}`,
          details: data.summary,
        });
        setStep("done");
        setAnalyzeResult(null);
        setFile(null);
        setPreview([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setResult({ type: "error", message: data.error || "확정 처리에 실패했습니다." });
      }
    } catch {
      setResult({ type: "error", message: "서버 오류가 발생했습니다." });
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (analyzeResult) {
      await fetch("/api/admin/upload/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: analyzeResult.batchId }),
      });
    }
    setAnalyzeResult(null);
    setStep("upload");
    setDecisions({});
    setDeleteSeedData(false);
  };

  const handleClear = () => {
    handleCancel();
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatAmount = (amount: number) =>
    amount.toLocaleString("ko-KR") + "원";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const previewColumns: (keyof PreviewRow)[] = [
    "기부자", "기부자정보", "기부금액", "기부일", "기부용도", "비고",
  ];

  const statusLabel = (status: string) => {
    switch (status) {
      case "new": return { text: "신규", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
      case "duplicate": return { text: "중복", color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
      case "conflict": return { text: "충돌", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
      default: return { text: status, color: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F222D]">엑셀 업로드</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          기부 데이터가 담긴 엑셀 파일(.xlsx, .xls)을 업로드하세요.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 text-sm">
        <div className={`flex items-center gap-1.5 ${step === "upload" ? "font-semibold text-[#1B3A5C]" : "text-[#6B7280]"}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === "upload" ? "bg-[#1B3A5C] text-white" : step === "review" || step === "done" ? "bg-[#00563F] text-white" : "bg-[#E5E2DC] text-[#6B7280]"}`}>1</span>
          파일 선택
        </div>
        <ArrowRight className="h-4 w-4 text-[#E5E2DC]" />
        <div className={`flex items-center gap-1.5 ${step === "review" ? "font-semibold text-[#1B3A5C]" : "text-[#6B7280]"}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === "review" ? "bg-[#1B3A5C] text-white" : step === "done" ? "bg-[#00563F] text-white" : "bg-[#E5E2DC] text-[#6B7280]"}`}>2</span>
          검토 및 확정
        </div>
        <ArrowRight className="h-4 w-4 text-[#E5E2DC]" />
        <div className={`flex items-center gap-1.5 ${step === "done" ? "font-semibold text-[#00563F]" : "text-[#6B7280]"}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === "done" ? "bg-[#00563F] text-white" : "bg-[#E5E2DC] text-[#6B7280]"}`}>3</span>
          완료
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`flex items-center gap-3 rounded-xl p-4 ${result.type === "success" ? "bg-[#00563F]/10 text-[#00563F]" : "bg-[#C8102E]/10 text-[#C8102E]"}`}>
          {result.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <p className="text-sm font-medium">{result.message}</p>
        </div>
      )}

      {/* ===== STEP 1: Upload ===== */}
      {step === "upload" && (
        <>
          {/* Upload Area */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E2DC] bg-[#F8F6F2] px-6 py-12 transition-colors hover:border-[#1B3A5C]/40">
              <Upload className="mb-3 h-10 w-10 text-[#6B7280]" />
              <p className="mb-1 text-sm font-medium text-[#1F222D]">엑셀 파일을 선택하세요</p>
              <p className="mb-4 text-xs text-[#6B7280]">.xlsx 또는 .xls 파일 지원</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer rounded-lg bg-[#1B3A5C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B3A5C]/90"
              >
                파일 선택
              </label>
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[#1B3A5C]/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-[#00563F]" />
                  <div>
                    <p className="text-sm font-medium text-[#1F222D]">{file.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {(file.size / 1024).toFixed(1)} KB
                      {preview.length > 0 && ` / ${preview.length}행`}
                    </p>
                  </div>
                </div>
                <button onClick={handleClear} className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#E5E2DC] hover:text-[#1F222D]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1F222D]">
                  미리보기
                  <span className="ml-2 text-sm font-normal text-[#6B7280]">({preview.length}행)</span>
                </h2>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 rounded-lg bg-[#1B3A5C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B3A5C]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      분석하기
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E2DC]">
                      <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">No</th>
                      {previewColumns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E5E2DC] last:border-b-0 hover:bg-[#F8F6F2]">
                        <td className="px-4 py-3 text-[#6B7280]">{idx + 1}</td>
                        {previewColumns.map((col) => (
                          <td key={col} className="px-4 py-3 text-[#1F222D]">
                            {col === "기부금액" ? Number(row[col]).toLocaleString("ko-KR") : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {preview.length > 50 && (
                      <tr>
                        <td colSpan={previewColumns.length + 1} className="px-4 py-3 text-center text-sm text-[#6B7280]">
                          ...외 {preview.length - 50}행 (최대 50행까지 미리보기)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== STEP 2: Review ===== */}
      {step === "review" && analyzeResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-[#6B7280]">전체</p>
              <p className="mt-1 text-2xl font-bold text-[#1F222D]">{analyzeResult.summary.total}건</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs text-emerald-600">신규 추가</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{analyzeResult.summary.new}건</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 shadow-sm">
              <p className="text-xs text-amber-600">충돌 (판단 필요)</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{analyzeResult.summary.conflict}건</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
              <p className="text-xs text-gray-500">중복 (건너뜀)</p>
              <p className="mt-1 text-2xl font-bold text-gray-500">{analyzeResult.summary.duplicate}건</p>
            </div>
          </div>

          {/* Seed Data Warning */}
          {analyzeResult.hasSeedData && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">
                    시드(테스트) 데이터 {analyzeResult.seedCount}건이 존재합니다
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    실 데이터 반영과 함께 시드 데이터를 삭제하시겠습니까?
                    삭제하면 대시보드와 이용자 페이지에서 테스트 데이터가 제거됩니다.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => setDeleteSeedData(true)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        deleteSeedData
                          ? "bg-amber-600 text-white"
                          : "bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      삭제하고 반영
                    </button>
                    <button
                      onClick={() => setDeleteSeedData(false)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        !deleteSeedData
                          ? "bg-amber-600 text-white"
                          : "bg-white text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      유지하고 반영
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Diff Review Table */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1F222D]">데이터 비교 검토</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E2DC]">
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">상태</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">기부자</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">기부자정보</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">기부금액</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">기부일</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">용도</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-[#6B7280]">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {analyzeResult.rows.map((row) => {
                    const sl = statusLabel(row.status);
                    return (
                      <tr key={row.id} className={`border-b border-[#E5E2DC] last:border-b-0 ${row.status === "duplicate" ? "opacity-50" : ""}`}>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sl.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sl.dot}`} />
                            {sl.text}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-[#1F222D]">{row.name}</td>
                        <td className="px-3 py-3 text-[#1F222D]">{row.donorType}</td>
                        <td className="px-3 py-3 text-[#1F222D]">
                          {formatAmount(row.amount)}
                          {row.status === "conflict" && row.conflictInfo && (
                            <div className="mt-0.5 text-xs text-amber-600">
                              기존: {formatAmount(row.conflictInfo.existingAmount)}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-[#1F222D]">{formatDate(row.donatedAt)}</td>
                        <td className="px-3 py-3 text-[#1F222D]">{row.purpose}</td>
                        <td className="px-3 py-3">
                          {row.status === "new" && (
                            <span className="text-xs font-medium text-emerald-600">추가</span>
                          )}
                          {row.status === "duplicate" && (
                            <span className="text-xs text-gray-400">건너뜀</span>
                          )}
                          {row.status === "conflict" && (
                            <select
                              value={decisions[row.id] ?? "skip"}
                              onChange={(e) =>
                                setDecisions((prev) => ({
                                  ...prev,
                                  [row.id]: e.target.value as "skip" | "overwrite",
                                }))
                              }
                              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              <option value="skip">기존 유지</option>
                              <option value="overwrite">덮어쓰기</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-[#E5E2DC] pt-4">
              <div className="text-sm text-[#6B7280]">
                신규 {analyzeResult.summary.new}건 추가
                {analyzeResult.summary.conflict > 0 && (
                  <> / 충돌 {Object.values(decisions).filter((d) => d === "overwrite").length}건 덮어쓰기</>
                )}
                {analyzeResult.summary.duplicate > 0 && (
                  <> / 중복 {analyzeResult.summary.duplicate}건 건너뜀</>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={confirming}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-[#6B7280] ring-1 ring-[#E5E2DC] transition-colors hover:bg-[#F8F6F2] disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex items-center gap-2 rounded-lg bg-[#00563F] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00563F]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "확정 반영"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== STEP 3: Done ===== */}
      {step === "done" && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#00563F]" />
          <h2 className="text-xl font-bold text-[#1F222D]">업로드 완료</h2>
          <p className="mt-2 text-sm text-[#6B7280]">데이터가 성공적으로 반영되었습니다.</p>
          {result?.details && (
            <div className="mx-auto mt-4 flex max-w-sm justify-center gap-6 text-sm">
              <div><span className="font-bold text-emerald-600">{result.details.added}</span> 추가</div>
              <div><span className="font-bold text-amber-600">{result.details.updated}</span> 수정</div>
              <div><span className="font-bold text-gray-500">{result.details.skipped}</span> 건너뜀</div>
              {result.details.seedDeleted > 0 && (
                <div><span className="font-bold text-red-500">{result.details.seedDeleted}</span> 시드 삭제</div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setStep("upload");
              setResult(null);
            }}
            className="mt-6 rounded-lg bg-[#1B3A5C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B3A5C]/90"
          >
            새 파일 업로드
          </button>
        </div>
      )}
    </div>
  );
}
