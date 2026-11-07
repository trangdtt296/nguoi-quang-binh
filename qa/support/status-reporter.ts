import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { buildReport } from "../scripts/build-report.mjs";

/**
 * Ghi kết quả từng test case vào qa/results/<mã chức năng>.json rồi dựng
 * lại trang báo cáo.
 *
 * Case được nhận ra qua mã ở đầu tên test, ví dụ "AD-AUTH-001 Đăng nhập…".
 * Test không có mã thì bỏ qua (không thuộc bộ test case nào).
 */

export type CaseStatus = "passed" | "failed" | "blocked" | "pending";

interface CaseResult {
  status: CaseStatus;
  durationMs: number;
  runAt: string;
  reason?: string;
  error?: string;
  attachments?: string[];
}

const QA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_DIR = join(QA_DIR, "results");
const CASE_ID = /^([A-Z]+(?:-[A-Z]+)*)-(\d{3})\b/;

const stripAnsi = (text: string) => text.replace(/\u001b\[[0-9;]*m/g, "");

function toStatus(test: TestCase, result: TestResult): { status: CaseStatus; reason?: string } {
  if (result.status === "passed") return { status: "passed" };
  if (result.status === "skipped") {
    const annotations = [...test.annotations, ...result.annotations];
    const block = annotations.find((item) => item.type === "blocked");
    if (block) return { status: "blocked", reason: block.description };
    const hold = annotations.find((item) => item.type === "fixme" || item.type === "skip");
    return { status: "pending", reason: hold?.description };
  }
  return { status: "failed" };
}

export default class StatusReporter implements Reporter {
  private results = new Map<string, Map<string, CaseResult>>();

  onTestEnd(test: TestCase, result: TestResult) {
    const match = CASE_ID.exec(test.title);
    if (!match) return;

    const [id, feature] = [`${match[1]}-${match[2]}`, match[1]];
    const { status, reason } = toStatus(test, result);
    const error = result.errors[0];

    const entry: CaseResult = {
      status,
      durationMs: result.duration,
      runAt: new Date(result.startTime).toISOString(),
      ...(reason ? { reason } : {}),
      ...(status === "failed" && error
        ? { error: stripAnsi(error.message ?? error.value ?? "Lỗi không rõ").slice(0, 2000) }
        : {}),
    };

    const files = result.attachments
      .filter((item) => item.path && (item.contentType.startsWith("image/") || item.name === "trace"))
      .map((item) => relative(QA_DIR, item.path!).replace(/\\/g, "/"));
    if (files.length) entry.attachments = files;

    if (!this.results.has(feature)) this.results.set(feature, new Map());
    // Có retry thì lần chạy cuối cùng quyết định kết quả.
    this.results.get(feature)!.set(id, entry);
  }

  async onEnd(_result: FullResult) {
    mkdirSync(RESULTS_DIR, { recursive: true });

    for (const [feature, cases] of this.results) {
      const file = join(RESULTS_DIR, `${feature}.json`);
      const previous = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { cases: {} };
      // Giữ kết quả của case không chạy lần này (chạy lẻ một case không xóa kết quả case khác).
      const merged = { ...previous.cases, ...Object.fromEntries(cases) };
      writeFileSync(
        file,
        JSON.stringify({ code: feature, updatedAt: new Date().toISOString(), cases: merged }, null, 2) + "\n",
      );
    }

    const summary = await buildReport({ quiet: true });
    printSummary(summary, [...this.results.keys()]);
  }

  printsToStdio() {
    return false;
  }
}

interface FeatureSummary {
  code: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  pending: number;
  notRun: number;
  coverage: string;
}

function printSummary(
  summary: { features: FeatureSummary[]; reportPath: string },
  ranCodes: string[],
) {
  const rows = summary.features.filter((feature) => ranCodes.includes(feature.code));
  if (rows.length === 0) return;

  const header = ["Mã", "Tổng", "Pass", "Fail", "Blocked", "Pending", "Chưa chạy", "Bao phủ"];
  const lines = rows.map((row) => [
    row.code,
    row.total,
    row.passed,
    row.failed,
    row.blocked,
    row.pending,
    row.notRun,
    row.coverage,
  ].map(String));
  const widths = header.map((title, index) =>
    Math.max(title.length, ...lines.map((line) => line[index].length)),
  );
  const format = (cells: string[]) => cells.map((cell, index) => cell.padEnd(widths[index])).join("  ");

  console.log("\nKết quả theo bộ test case:");
  console.log(format(header));
  for (const line of lines) console.log(format(line));
  console.log(`\nBáo cáo: ${summary.reportPath}\n`);
}
