import fs from "fs";
import path from "path";
import { notify } from "./notificationService.js";
import { config } from "../config/env.js";

// Resolve policies directory to the original CHECKER/app/policies/msc by default
function resolvePoliciesDir() {
  const candidates = [];
  if (config.formatPoliciesDir) candidates.push(config.formatPoliciesDir);
  const cwd = process.cwd();
  // When running from repo root
  candidates.push(path.resolve(cwd, "CHECKER/app/policies/msc"));
  // When running from API directory
  candidates.push(path.resolve(cwd, "../CHECKER/app/policies/msc"));
  // Legacy/API-local fallback (kept for safety)
  candidates.push(path.resolve(cwd, "API/policies/msc"));
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return cwd;
}

const POLICIES_DIR = resolvePoliciesDir();

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
    return { ...obj, version: obj.version || version || "v1.0" };
  } catch (e) {
    console.warn("[format-check] policy load failed", { policyName, version, dir: POLICIES_DIR, err: String(e?.message || e) });
    return { version: version || "v1.0", weights: {}, pass_threshold: 0.9 };
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
  // Lightweight fallback when external checker is unavailable
  const isDocx = /vnd.openxmlformats-officedocument.wordprocessingml.document|\.docx$/i.test(file.mimetype || file.filename);
  const isPdf = /pdf|\.pdf$/i.test(file.mimetype || file.filename);
  const findings = [
    { rule: "margins", pass: isDocx, details: '1" on all sides' },
    { rule: "font_family", pass: isDocx, details: "Times New Roman required" },
    { rule: "font_size", pass: isDocx, details: "12 pt required" },
    { rule: "line_spacing", pass: isDocx, details: "1.5 spacing required" },
    { rule: "heading_numbering", pass: isDocx, details: "1, 1.1, 1.2..." },
    { rule: "ieee_references_block", pass: isDocx || isPdf, details: "References like [1], [2]" },
  ];
  const score = Math.min(1, Math.max(0, findings.filter(f => f.pass).length / findings.length));
  const threshold = (typeof policy?.pass_threshold === 'number') ? policy.pass_threshold : 0.9;
  return { overall_pass: score >= threshold, score, findings, policyName, policyVersion, checkedAt: new Date().toISOString() };
}

export async function runFormatCheck({ submission, userId }) {
  const policyName = stageKeyToPolicy(submission.stage_key);
  if (!policyName) return null;
  const active = getActivePolicies();
  const policyVersion = active[policyName] || "v1.0";
  const policy = loadPolicy(policyName, policyVersion);

  // Prefer the external checker; fall back to naive evaluation, but always honor local policy threshold
  const external = await callExternalChecker({
    policyName,
    policyVersion,
    filePath: submission.file.path,
    mimetype: submission.file.mimetype,
  });
  const result = external || naiveEvaluate({ policyName, policyVersion, file: submission.file, policy });

  const threshold = (typeof policy?.pass_threshold === 'number') ? policy.pass_threshold : 0.9;
  const scoreVal = typeof result?.score === 'number' ? result.score : 0;
  const overall_pass = scoreVal >= threshold;

  const report = {
    status: overall_pass ? "pass" : "issues",
    overall_pass,
    score: scoreVal,
    policy_name: policyName,
    policy_version: policyVersion,
    checked_at: new Date(),
    findings: Array.isArray(result?.findings) ? result.findings : [],
    error: external ? "" : "checker_unavailable",
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
    dir: POLICIES_DIR,
    status: report.status,
    score: report.score,
    threshold,
    findingsSample: Array.isArray(report.findings) ? report.findings.slice(0, 12).map(f => ({ rule: f.rule, pass: f.pass })) : [],
    structural: (() => {
      const get = (r) => (Array.isArray(report.findings) ? report.findings.find(f => f.rule === r) : null);
      const req = get('required_headings');
      const tpk = get('title_page_keywords');
      return {
        required_headings: req ? req.pass : undefined,
        title_page_keywords: tpk ? tpk.pass : undefined,
      };
    })(),
  });

  return report;
}
