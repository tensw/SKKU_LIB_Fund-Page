"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import * as XLSX from "xlsx";

interface PreviewRow {
  기부자: string;
  기부자정보: string;
  기부금액: number | string;
  기부일: string;
  기부용도: string;
  비고: string;
}

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    setResult(null);
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
        기부자: String(row["기부자"] ?? row["name"] ?? ""),
        기부자정보: String(row["기부자정보"] ?? row["donorType"] ?? ""),
        기부금액: row["기부금액"] ?? row["amount"] ?? "",
        기부일: String(row["기부일"] ?? row["donatedAt"] ?? ""),
        기부용도: String(row["기부용도"] ?? row["purpose"] ?? ""),
        비고: String(row["비고"] ?? row["note"] ?? ""),
      }));

      setPreview(rows);
    } catch {
      setResult({ type: "error", message: "파일을 읽는 중 오류가 발생했습니다." });
      setPreview([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          type: "success",
          message: `${data.count ?? 0}건의 기부 데이터가 성공적으로 업로드되었습니다.`,
        });
        // Reset after successful upload
        setFile(null);
        setPreview([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setResult({
          type: "error",
          message: data.error || "업로드에 실패했습니다.",
        });
      }
    } catch {
      setResult({ type: "error", message: "서버 오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const previewColumns: (keyof PreviewRow)[] = [
    "기부자",
    "기부자정보",
    "기부금액",
    "기부일",
    "기부용도",
    "비고",
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F222D]">엑셀 업로드</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          기부 데이터가 담긴 엑셀 파일(.xlsx, .xls)을 업로드하세요.
        </p>
      </div>

      {/* Upload Area */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E5E2DC] bg-[#F8F6F2] px-6 py-12 transition-colors hover:border-[#1B3A5C]/40">
          <Upload className="mb-3 h-10 w-10 text-[#6B7280]" />
          <p className="mb-1 text-sm font-medium text-[#1F222D]">
            엑셀 파일을 선택하세요
          </p>
          <p className="mb-4 text-xs text-[#6B7280]">
            .xlsx 또는 .xls 파일 지원
          </p>
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

        {/* Selected file info */}
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
            <button
              onClick={handleClear}
              className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#E5E2DC] hover:text-[#1F222D]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            result.type === "success"
              ? "bg-[#00563F]/10 text-[#00563F]"
              : "bg-[#C8102E]/10 text-[#C8102E]"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{result.message}</p>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1F222D]">
              미리보기
              <span className="ml-2 text-sm font-normal text-[#6B7280]">
                ({preview.length}행)
              </span>
            </h2>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-lg bg-[#00563F] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00563F]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "업로드 중..." : "업로드"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E2DC]">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]">
                    No
                  </th>
                  {previewColumns.map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-[#6B7280]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#E5E2DC] last:border-b-0 hover:bg-[#F8F6F2]"
                  >
                    <td className="px-4 py-3 text-[#6B7280]">{idx + 1}</td>
                    {previewColumns.map((col) => (
                      <td key={col} className="px-4 py-3 text-[#1F222D]">
                        {col === "기부금액"
                          ? Number(row[col]).toLocaleString("ko-KR")
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
                {preview.length > 50 && (
                  <tr>
                    <td
                      colSpan={previewColumns.length + 1}
                      className="px-4 py-3 text-center text-sm text-[#6B7280]"
                    >
                      ...외 {preview.length - 50}행 (최대 50행까지 미리보기)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
