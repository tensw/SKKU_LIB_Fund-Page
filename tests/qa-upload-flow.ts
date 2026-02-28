/**
 * QA/QC 테스트: 엑셀 업로드 2단계 전체 로직 검증
 *
 * 테스트 시나리오:
 * TC-01: 신규 데이터만 있는 엑셀 업로드 (analyze → confirm)
 * TC-02: 중복 데이터 포함 엑셀 업로드 (duplicate 감지 검증)
 * TC-03: 충돌 데이터 포함 엑셀 업로드 (conflict 감지 + overwrite 검증)
 * TC-04: 시드 데이터 삭제 옵션 검증
 * TC-05: 취소 API 검증 (staging 정리)
 * TC-06: 구 API 410 Deprecated 응답 검증
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:3000";
const RESULTS: { id: string; name: string; pass: boolean; detail: string }[] = [];

function log(tc: string, name: string, pass: boolean, detail: string) {
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} [${tc}] ${name}: ${detail}`);
  RESULTS.push({ id: tc, name, pass, detail });
}

/** 엑셀 파일을 Buffer로 생성 */
function createExcel(rows: Record<string, unknown>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

/** FormData에 엑셀 버퍼를 File로 첨부하여 analyze API 호출 */
async function callAnalyze(excelBuf: Buffer): Promise<Response> {
  const blob = new Blob([excelBuf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const form = new FormData();
  form.append("file", blob, "test.xlsx");
  return fetch(`${BASE}/api/admin/upload/analyze`, { method: "POST", body: form });
}

/** confirm API 호출 */
async function callConfirm(body: {
  batchId: string;
  deleteSeedData?: boolean;
  decisions?: Record<number, "skip" | "overwrite">;
}): Promise<Response> {
  return fetch(`${BASE}/api/admin/upload/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** cancel API 호출 */
async function callCancel(batchId: string): Promise<Response> {
  return fetch(`${BASE}/api/admin/upload/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batchId }),
  });
}

/** DB 현재 상태 확인 (donations summary API) */
async function getSummary(): Promise<any> {
  const res = await fetch(`${BASE}/api/donations/summary`);
  return res.json();
}

// ============================================================
// TC-01: 신규 데이터만 있는 엑셀 업로드
// ============================================================
async function tc01() {
  console.log("\n━━━ TC-01: 신규 데이터 업로드 ━━━");

  const rows = [
    { 기부자: "테스트신규A", 기부자정보: "동문", 기부금액: 100000, 기부일: "2026-01-15", 기부용도: "QA테스트기금", 비고: "" },
    { 기부자: "테스트신규B", 기부자정보: "학부", 기부금액: 200000, 기부일: "2026-01-20", 기부용도: "QA테스트기금", 비고: "테스트" },
    { 기부자: "테스트신규C", 기부자정보: "교원", 기부금액: 500000, 기부일: "2026-02-01", 기부용도: "QA테스트기금", 비고: "" },
  ];

  const buf = createExcel(rows);
  const res = await callAnalyze(buf);
  const data = await res.json();

  // 검증 1: analyze 성공
  log("TC-01", "analyze API 200", res.ok, `status=${res.status}`);

  // 검증 2: batchId 존재
  log("TC-01", "batchId 존재", !!data.batchId, `batchId=${data.batchId?.slice(0, 8)}...`);

  // 검증 3: 전체 3건, 모두 new
  log("TC-01", "summary 확인", data.summary?.total === 3 && data.summary?.new === 3,
    `total=${data.summary?.total}, new=${data.summary?.new}, dup=${data.summary?.duplicate}, conflict=${data.summary?.conflict}`);

  // 검증 4: hasSeedData=true (시드 30건 존재)
  log("TC-01", "시드 데이터 감지", data.hasSeedData === true, `hasSeedData=${data.hasSeedData}, seedCount=${data.seedCount}`);

  // 검증 5: confirm으로 반영
  const confirmRes = await callConfirm({ batchId: data.batchId });
  const confirmData = await confirmRes.json();

  log("TC-01", "confirm API 200", confirmRes.ok, `status=${confirmRes.status}`);
  log("TC-01", "confirm 결과", confirmData.summary?.added === 3 && confirmData.summary?.skipped === 0,
    `added=${confirmData.summary?.added}, updated=${confirmData.summary?.updated}, skipped=${confirmData.summary?.skipped}`);

  return data.batchId;
}

// ============================================================
// TC-02: 중복 데이터 감지
// ============================================================
async function tc02() {
  console.log("\n━━━ TC-02: 중복 데이터 감지 ━━━");

  // TC-01에서 넣은 데이터와 동일한 데이터를 다시 업로드
  const rows = [
    { 기부자: "테스트신규A", 기부자정보: "동문", 기부금액: 100000, 기부일: "2026-01-15", 기부용도: "QA테스트기금", 비고: "" },
    { 기부자: "테스트신규B", 기부자정보: "학부", 기부금액: 200000, 기부일: "2026-01-20", 기부용도: "QA테스트기금", 비고: "테스트" },
    { 기부자: "완전신규D", 기부자정보: "일반", 기부금액: 300000, 기부일: "2026-03-01", 기부용도: "QA테스트기금", 비고: "" },
  ];

  const buf = createExcel(rows);
  const res = await callAnalyze(buf);
  const data = await res.json();

  log("TC-02", "analyze API 200", res.ok, `status=${res.status}`);

  // A, B는 duplicate, D는 new
  log("TC-02", "중복 2건 감지", data.summary?.duplicate === 2,
    `duplicate=${data.summary?.duplicate}`);
  log("TC-02", "신규 1건 감지", data.summary?.new === 1,
    `new=${data.summary?.new}`);

  // confirm - 신규만 반영, 중복은 건너뜀
  const confirmRes = await callConfirm({ batchId: data.batchId });
  const confirmData = await confirmRes.json();

  log("TC-02", "confirm 결과", confirmData.summary?.added === 1 && confirmData.summary?.skipped === 2,
    `added=${confirmData.summary?.added}, skipped=${confirmData.summary?.skipped}`);
}

// ============================================================
// TC-03: 충돌 데이터 감지 + overwrite
// ============================================================
async function tc03() {
  console.log("\n━━━ TC-03: 충돌 데이터 + 덮어쓰기 ━━━");

  // 기존 "테스트신규A"의 금액을 변경하여 conflict 유도
  const rows = [
    { 기부자: "테스트신규A", 기부자정보: "동문", 기부금액: 999999, 기부일: "2026-01-15", 기부용도: "QA테스트기금", 비고: "금액변경" },
    { 기부자: "완전신규E", 기부자정보: "직원", 기부금액: 50000, 기부일: "2026-03-10", 기부용도: "QA테스트기금", 비고: "" },
  ];

  const buf = createExcel(rows);
  const res = await callAnalyze(buf);
  const data = await res.json();

  log("TC-03", "analyze API 200", res.ok, `status=${res.status}`);
  log("TC-03", "충돌 1건 감지", data.summary?.conflict === 1, `conflict=${data.summary?.conflict}`);
  log("TC-03", "신규 1건 감지", data.summary?.new === 1, `new=${data.summary?.new}`);

  // 충돌 row의 conflictInfo 확인
  const conflictRow = data.rows?.find((r: any) => r.status === "conflict");
  log("TC-03", "conflictInfo 존재", !!conflictRow?.conflictInfo,
    `existingAmount=${conflictRow?.conflictInfo?.existingAmount}`);

  // overwrite 결정으로 confirm
  const decisions: Record<number, "skip" | "overwrite"> = {};
  if (conflictRow) decisions[conflictRow.id] = "overwrite";

  const confirmRes = await callConfirm({ batchId: data.batchId, decisions });
  const confirmData = await confirmRes.json();

  log("TC-03", "confirm overwrite", confirmData.summary?.updated === 1,
    `updated=${confirmData.summary?.updated}, added=${confirmData.summary?.added}`);
}

// ============================================================
// TC-04: 시드 데이터 삭제 옵션
// ============================================================
async function tc04() {
  console.log("\n━━━ TC-04: 시드 데이터 삭제 ━━━");

  // 신규 1건 + deleteSeedData=true
  const rows = [
    { 기부자: "시드삭제테스트F", 기부자정보: "일반", 기부금액: 10000, 기부일: "2026-04-01", 기부용도: "QA테스트기금", 비고: "" },
  ];

  const buf = createExcel(rows);
  const res = await callAnalyze(buf);
  const data = await res.json();

  log("TC-04", "analyze 시드 감지", data.hasSeedData === true, `seedCount=${data.seedCount}`);

  const confirmRes = await callConfirm({ batchId: data.batchId, deleteSeedData: true });
  const confirmData = await confirmRes.json();

  log("TC-04", "시드 삭제 실행", confirmData.summary?.seedDeleted > 0,
    `seedDeleted=${confirmData.summary?.seedDeleted}`);
  log("TC-04", "신규 반영", confirmData.summary?.added === 1,
    `added=${confirmData.summary?.added}`);
}

// ============================================================
// TC-05: 취소 API (staging 정리)
// ============================================================
async function tc05() {
  console.log("\n━━━ TC-05: 취소 API ━━━");

  const rows = [
    { 기부자: "취소테스트G", 기부자정보: "학부", 기부금액: 77777, 기부일: "2026-05-01", 기부용도: "QA테스트기금", 비고: "" },
  ];

  const buf = createExcel(rows);
  const analyzeRes = await callAnalyze(buf);
  const analyzeData = await analyzeRes.json();

  log("TC-05", "analyze 성공", analyzeRes.ok, `batchId=${analyzeData.batchId?.slice(0, 8)}...`);

  // 취소 호출
  const cancelRes = await callCancel(analyzeData.batchId);
  const cancelData = await cancelRes.json();

  log("TC-05", "cancel API 200", cancelRes.ok, `status=${cancelRes.status}`);
  log("TC-05", "staging 삭제", cancelData.deletedCount === 1,
    `deletedCount=${cancelData.deletedCount}`);

  // confirm 시도하면 404
  const confirmRes = await callConfirm({ batchId: analyzeData.batchId });
  log("TC-05", "취소 후 confirm 불가", confirmRes.status === 404,
    `status=${confirmRes.status}`);
}

// ============================================================
// TC-06: 구 API 410 Deprecated
// ============================================================
async function tc06() {
  console.log("\n━━━ TC-06: 구 API Deprecated ━━━");

  const rows = [{ 기부자: "테스트", 기부자정보: "일반", 기부금액: 1000, 기부일: "2026-01-01", 기부용도: "테스트", 비고: "" }];
  const buf = createExcel(rows);

  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const form = new FormData();
  form.append("file", blob, "test.xlsx");

  const res = await fetch(`${BASE}/api/admin/upload`, { method: "POST", body: form });
  const data = await res.json();

  log("TC-06", "410 Gone 반환", res.status === 410, `status=${res.status}`);
  log("TC-06", "deprecated 플래그", data.deprecated === true, `deprecated=${data.deprecated}`);
}

// ============================================================
// 실행
// ============================================================
async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  QA/QC: 엑셀 업로드 2단계 전체 로직 검증      ║");
  console.log("║  대상: SKKU_LIB_Fund-Page                     ║");
  console.log("║  일시: " + new Date().toISOString().slice(0, 19) + "               ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  await tc01();
  await tc02();
  await tc03();
  await tc04();
  await tc05();
  await tc06();

  // 최종 요약
  const total = RESULTS.length;
  const passed = RESULTS.filter((r) => r.pass).length;
  const failed = RESULTS.filter((r) => !r.pass).length;

  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log(`║  결과: ${passed}/${total} PASS, ${failed} FAIL${" ".repeat(25 - String(passed).length - String(total).length - String(failed).length)}║`);
  console.log("╚═══════════════════════════════════════════════╝");

  if (failed > 0) {
    console.log("\n실패 항목:");
    for (const r of RESULTS.filter((r) => !r.pass)) {
      console.log(`  ❌ [${r.id}] ${r.name}: ${r.detail}`);
    }
  }

  // JSON 결과 파일 저장
  const reportPath = path.join(__dirname, "qa-result.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total, passed, failed,
    results: RESULTS
  }, null, 2));
  console.log(`\n결과 저장: ${reportPath}`);
}

main().catch(console.error);
