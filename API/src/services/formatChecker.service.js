import fs from "fs";
import path from "path";
import { notify } from "./notificationService.js";
import { config } from "../config/env.js";

const POLICIES_DIR = path.join(process.cwd(), "API", "policies", "msc");

function getActivePolicies() {
  try {
    const raw = process.env.ACTIVE_POLICIES || "";
    if (!raw) throw new Error("no env");
    return JSON.parse(raw);
  } catch {
    return {
      synopsis: "v1.0",
      proposal: "v1.0",
      progress_report_1: "v1.0",
      progress_report_2: "v1.0",
      thesis: "v1.0",
      journal_article: "v1.0",
    };
  }
}

export function stageKeyToPolicy(stageKey) {
  switch (stageKey) {
    case "synopsis":
      return "synopsis";
    case "proposal":
      return "proposal";
    case "progress_report_1":
      return "progress_report_1";
    case "progress_report_2":
      return "progress_report_2";
    case "thesis_report":
      return "thesis";
    case "journal_article":
      return "journal_article";
    default:
      return null;
  }
}

function loadPolicy(policyName, version) {
  try {
    const file = path.join(POLICIES_DIR, `${policyName}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const obj = JSON.parse(raw);
    // Choose version if multiple are present in file in future; currently flat
    return { ...obj, version: obj.version || version || "v1.0" };
  } catch {
    return { version: version || "v1.0", rules: [], defaults: {} };
  }
}

async function callExternalChecker({ policyName, policyVersion, filePath, mimetype }) {
  const checkerUrl = config?.formatCheckerUrl || '';
  if (!checkerUrl) return null;
  if (typeof fetch !== 'function' || typeof FormData === 'undefined' || typeof Blob === 'undefined') return null;
  try {
    const fd = new FormData();
    const buf = await fs.promises.readFile(filePath);
    const blob = new Blob([buf], { type: mimetype || 'application/octet-stream' });
    fd.append('file', blob, path.basename(filePath));
    fd.append('policyName', policyName);
    fd.append('policyVersion', policyVersion);
    const res = await fetch(`${checkerUrl}/check`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`checker status ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('[format-check] external error', { url: checkerUrl, err: String(e && e.message || e) });
    return null;
  }
}

function naiveEvaluate({ policyName, policyVersion, file, policy }) {
  // Placeholder evaluator: DOCX earns high score, PDF medium; generate findings set
  const isDocx =
    /vnd.openxmlformats-officedocument.wordprocessingml.document|\.docx$/i.test(
      file.mimetype || file.filename
    );
  const isPdf = /pdf|\.pdf$/i.test(file.mimetype || file.filename);
  let score = isDocx ? 0.95 : isPdf ? 0.75 : 0.5;
  const findings = [
    { rule: "font_family", pass: isDocx, details: "Times New Roman required" },
    { rule: "font_size", pass: isDocx, details: "12 pt required" },
    { rule: "line_spacing", pass: isDocx, details: "1.5 spacing required" },
    { rule: "margins", pass: isDocx, details: '1" margins required' },
    { rule: "heading_numbering", pass: isDocx, details: "1, 1.1, 1.2..." },
    {
      rule: "ieee_references_block",
      pass: isDocx || isPdf,
      details: "References like [1], [2]",
    },
  ];
  const passed = findings.filter((f) => f.pass).length;
  score = Math.min(1, Math.max(0, passed / findings.length));
  return {
    overall_pass: score >= 0.9,
    score,
    findings,
    policyName,
    policyVersion,
    checkedAt: new Date().toISOString(),
  };
}

export async function runFormatCheck({ submission, userId }) {
  const policyName = stageKeyToPolicy(submission.stage_key);
  if (!policyName) return null; // Skip stages without a policy
  const active = getActivePolicies();
  const policyVersion = active[policyName] || "v1.0";
  const policy = loadPolicy(policyName, policyVersion);

  // Attempt external checker; fallback to naive evaluator
  const external = await callExternalChecker({
    policyName,
    policyVersion,
    filePath: submission.file.path,
    mimetype: submission.file.mimetype,
  });
  const result = external || null;

  const overall_pass = Boolean(result?.overall_pass);
  const report = {
    status: result ? (overall_pass ? "pass" : "issues") : "failed",
    overall_pass: result ? overall_pass : false,
    score: typeof result?.score === "number" ? result.score : null,
    policy_name: policyName,
    policy_version: policyVersion,
    checked_at: new Date(),
    findings: Array.isArray(result?.findings) ? result.findings : [],
    error: result ? "" : "checker_unavailable",
  };

  if (!overall_pass) {
    try {
      await notify(userId, "format_issues", {
        submissionId: String(submission._id),
        stage: submission.stage_key,
        score: report.score,
      });
    } catch {}
  }
  console.log("[format-check]", {
    submissionId: String(submission._id),
    stage: submission.stage_key,
    policy: policyName,
    version: policyVersion,
    status: report.status,
    score: report.score,
    findingsSample: Array.isArray(report.findings)
      ? report.findings.slice(0, 6).map((f) => ({ rule: f.rule, pass: f.pass }))
      : [],
  });
  return report;
}
