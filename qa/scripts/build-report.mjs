#!/usr/bin/env node
/**
 * Gộp danh mục chức năng (features.json), test case (cases/*.json) và kết
 * quả chạy (results/*.json) thành một trang HTML tự chứa: qa/report/index.html.
 *
 * Trang nhúng sẵn dữ liệu nên mở thẳng bằng trình duyệt là xem được.
 * Đồng thời kiểm tra định dạng file test case và in cảnh báo.
 *
 *   node scripts/build-report.mjs            dựng báo cáo, in tổng kết
 *   node scripts/build-report.mjs AD-AUTH    chỉ in tổng kết của một mã
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const QA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRIORITIES = ["P1", "P2", "P3"];
const TYPES = ["functional", "validation", "negative", "ui", "security", "permission", "a11y", "performance", "seo"];
const STATUSES = ["passed", "failed", "blocked", "pending", "notRun"];

/** Kỹ thuật thiết kế test được dùng trong phần "design" của bộ case. */
export const TECHNIQUES = {
  EP: "Phân vùng tương đương",
  BVA: "Phân tích giá trị biên",
  DT: "Bảng quyết định",
  ST: "Chuyển trạng thái",
  UC: "Kịch bản sử dụng",
  PW: "Kiểm thử cặp",
  EG: "Đoán lỗi",
  CL: "Checklist",
};

/** Kiểm tra phần thiết kế test và độ phủ; trả về cảnh báo và số liệu phủ. */
function analyzeDesign(where, suite) {
  const problems = [];
  const groups = Array.isArray(suite.design) ? suite.design : [];
  if (!groups.length) {
    problems.push(`${where}: thiếu phần "design" (các mục cần phủ theo kỹ thuật test)`);
  }

  const items = new Map();
  for (const [index, group] of groups.entries()) {
    const label = `${where} design #${index + 1}`;
    if (!TECHNIQUES[group.technique]) {
      problems.push(`${label}: "technique" phải là một trong ${Object.keys(TECHNIQUES).join(", ")}`);
    }
    if (!group.target) problems.push(`${label}: thiếu "target"`);
    for (const item of group.items ?? []) {
      if (!item.id || !item.desc) problems.push(`${label}: mục thiếu "id" hoặc "desc"`);
      if (items.has(item.id)) problems.push(`${label}: mục ${item.id} bị trùng`);
      items.set(item.id, { ...item, technique: group.technique });
    }
  }

  const coveredBy = new Map([...items.keys()].map((id) => [id, []]));
  for (const testCase of suite.cases ?? []) {
    const covers = Array.isArray(testCase.covers) ? testCase.covers : [];
    if (!covers.length) problems.push(`${where} (${testCase.id}): thiếu "covers" — case phải phủ ít nhất một mục thiết kế`);
    for (const id of covers) {
      if (!coveredBy.has(id)) problems.push(`${where} (${testCase.id}): "covers" có ${id} không tồn tại trong design`);
      else coveredBy.get(id).push(testCase.id);
    }
  }

  const uncovered = [...coveredBy].filter(([, cases]) => cases.length === 0).map(([id]) => id);
  if (uncovered.length) problems.push(`${where}: ${uncovered.length} mục thiết kế chưa có case phủ: ${uncovered.join(", ")}`);

  return {
    problems,
    coverage: {
      total: items.size,
      covered: items.size - uncovered.length,
      groups: groups.map((group) => ({
        ...group,
        techniqueName: TECHNIQUES[group.technique] ?? group.technique,
        items: (group.items ?? []).map((item) => ({ ...item, coveredBy: coveredBy.get(item.id) ?? [] })),
      })),
      techniquesOf: (testCase) =>
        [...new Set((testCase.covers ?? []).map((id) => items.get(id)?.technique).filter(Boolean))],
    },
  };
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

function readDir(dir) {
  const full = join(QA_DIR, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((name) => name.endsWith(".json"))
    .map((name) => ({ name, data: readJson(join(full, name)) }));
}

/** Kiểm tra một file test case, trả về danh sách cảnh báo. */
function validateCases(fileName, suite, featureCodes) {
  const problems = [];
  const where = `cases/${fileName}`;
  const code = fileName.replace(/\.json$/, "");

  if (suite.code !== code) problems.push(`${where}: "code" phải là "${code}"`);
  if (!featureCodes.has(code)) problems.push(`${where}: mã "${code}" không có trong features.json`);
  if (!Array.isArray(suite.cases)) {
    problems.push(`${where}: thiếu mảng "cases"`);
    return problems;
  }

  const seen = new Set();
  for (const [index, item] of suite.cases.entries()) {
    const label = `${where} #${index + 1}${item?.id ? ` (${item.id})` : ""}`;
    if (!new RegExp(`^${code}-\\d{3}$`).test(item.id ?? "")) {
      problems.push(`${label}: id phải dạng ${code}-001`);
    }
    if (seen.has(item.id)) problems.push(`${label}: id bị trùng`);
    seen.add(item.id);
    if (!item.title) problems.push(`${label}: thiếu "title"`);
    if (!PRIORITIES.includes(item.priority)) problems.push(`${label}: "priority" phải là ${PRIORITIES.join("/")}`);
    if (!TYPES.includes(item.type)) problems.push(`${label}: "type" phải là một trong ${TYPES.join(", ")}`);
    if (!Array.isArray(item.steps) || item.steps.length === 0) problems.push(`${label}: thiếu "steps"`);
    if (!Array.isArray(item.expected) || item.expected.length === 0) problems.push(`${label}: thiếu "expected"`);
    if (!["auto", "manual"].includes(item.automation)) problems.push(`${label}: "automation" phải là auto/manual`);
  }
  return [...problems, ...analyzeDesign(where, suite).problems];
}

export async function buildReport({ quiet = false, only } = {}) {
  const { features } = readJson(join(QA_DIR, "features.json"));
  const featureCodes = new Set(features.map((feature) => feature.code));
  const warnings = [];

  const cases = new Map();
  for (const { name, data } of readDir("cases")) {
    warnings.push(...validateCases(name, data, featureCodes));
    cases.set(name.replace(/\.json$/, ""), data);
  }

  const results = new Map();
  for (const { name, data } of readDir("results")) {
    results.set(name.replace(/\.json$/, ""), data.cases ?? {});
  }

  const enriched = features.map((feature) => {
    const suite = cases.get(feature.code);
    const runResults = results.get(feature.code) ?? {};
    const design = suite ? analyzeDesign(`cases/${feature.code}.json`, suite).coverage : null;
    const items = (suite?.cases ?? []).map((item) => ({
      ...item,
      techniques: design ? design.techniquesOf(item) : [],
      result: runResults[item.id] ?? null,
      status: runResults[item.id]?.status ?? "notRun",
    }));

    const ids = new Set(items.map((item) => item.id));
    for (const id of Object.keys(runResults)) {
      if (!ids.has(id)) warnings.push(`results/${feature.code}.json: ${id} có kết quả nhưng không có trong bộ test case`);
    }

    const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
    for (const item of items) counts[item.status] += 1;

    return {
      ...feature,
      generatedAt: suite?.generatedAt ?? null,
      hasCases: Boolean(suite),
      cases: items,
      counts,
      total: items.length,
      design: design ? { total: design.total, covered: design.covered, groups: design.groups } : null,
    };
  });

  const data = { generatedAt: new Date().toISOString(), techniques: TECHNIQUES, features: enriched };
  const reportDir = join(QA_DIR, "report");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, "index.html");
  const page = renderPage(data);
  // index.html: mở thẳng trên máy. artifact.html: bản đăng lên link web
  // (nơi đăng tự bọc khung <html>, nên chỉ cần phần nội dung).
  writeFileSync(
    reportPath,
    `<!doctype html>\n<html lang="vi">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${page}\n</html>\n`,
  );
  writeFileSync(join(reportDir, "artifact.html"), page);

  const summary = {
    reportPath,
    warnings,
    features: enriched.map((feature) => ({
      code: feature.code,
      name: feature.name,
      total: feature.total,
      passed: feature.counts.passed,
      failed: feature.counts.failed,
      blocked: feature.counts.blocked,
      pending: feature.counts.pending,
      notRun: feature.counts.notRun,
      coverage: feature.design?.total
        ? `${feature.design.covered}/${feature.design.total}`
        : "—",
    })),
  };

  if (warnings.length) {
    console.warn(`\n⚠ ${warnings.length} cảnh báo về định dạng:`);
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  if (!quiet) {
    const rows = summary.features.filter((feature) => (only ? feature.code === only : feature.total > 0));
    if (rows.length) console.table(Object.fromEntries(rows.map(({ code, ...rest }) => [code, rest])));
    console.log(`Báo cáo: ${reportPath}`);
  }

  return summary;
}

/* ---------- HTML ---------- */

function renderPage(data) {
  // Chặn chuỗi "</script>" trong dữ liệu làm vỡ thẻ script.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const template = readFileSync(join(QA_DIR, "scripts", "report-template.html"), "utf8");
  // Dùng hàm thay thế: chuỗi thay thế thường sẽ hiểu "$&", "$1"… trong dữ liệu là ký hiệu đặc biệt.
  return template.replace("/*__DATA__*/null", () => json);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const only = process.argv[2];
  const summary = await buildReport({ only });
  if (summary.warnings.length) process.exitCode = 1;
}
