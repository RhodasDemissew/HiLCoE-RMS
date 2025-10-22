# -*- coding: utf-8 -*-
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime, timezone
import os, io, json, re

try:
    from docx import Document  # python-docx
except Exception:  # pragma: no cover
    Document = None  # type: ignore

try:
    import PyPDF2  # type: ignore
except Exception:  # pragma: no cover
    PyPDF2 = None  # type: ignore

app = FastAPI(title="MSc Formatting Checker")

POLICY_DIR = os.environ.get("POLICY_DIR", os.path.join(os.getcwd(), "app", "policies", "msc"))
CACHE_TTL = int(os.environ.get("POLICY_CACHE_TTL_SECONDS", "60"))

_policy_cache: Dict[str, Dict[str, Any]] = {}
_policy_cache_at: float = 0.0

SUPPORTED = {
    "synopsis",
    "proposal",
    "progress_report_1",
    "progress_report_2",
    "thesis",
    "journal_article",
}

class CheckResponse(BaseModel):
    overall_pass: bool
    score: float
    findings: List[Dict[str, Any]]
    policyName: str
    policyVersion: str
    checkedAt: str


def _load_policies() -> Dict[str, Dict[str, Any]]:
    global _policy_cache, _policy_cache_at
    now = datetime.now().timestamp()
    if _policy_cache and (now - _policy_cache_at) < CACHE_TTL:
        return _policy_cache
    res: Dict[str, Dict[str, Any]] = {}
    if os.path.isdir(POLICY_DIR):
        for fname in os.listdir(POLICY_DIR):
            if not fname.endswith(".json"):
                continue
            key = fname[:-5]
            try:
                with open(os.path.join(POLICY_DIR, fname), "r", encoding="utf-8") as f:
                    res[key] = json.load(f)
            except Exception:
                res[key] = {"version": "v1.0", "rules": []}
    _policy_cache = res
    _policy_cache_at = now
    return res


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/ready")
async def ready():
    pol = _load_policies()
    return {"ok": True, "policies": sorted(list(pol.keys()))}


NUM_RE = re.compile(r"\[(\d+)\]")
HEADING_RE = re.compile(r"^\d+(?:\.\d+)*\s")


def _score_findings(findings: List[Dict[str, Any]], weights: Dict[str, float]) -> float:
    total_w = 0.0
    got = 0.0
    for f in findings:
        w = float(weights.get(f.get("rule", ""), 1.0))
        total_w += w
        if f.get("pass"):
            got += w
    if total_w <= 0:
        return 1.0
    return max(0.0, min(1.0, got / total_w))
def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def _contains_all(text: str, keywords: list[str] | list) -> tuple[bool, list[str]]:
    t = _norm(text)
    missing = [k for k in keywords if _norm(k) not in t]
    return (len(missing) == 0, missing)
def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def _contains_all(text: str, keywords: List[str]):
    t = _norm(text)
    missing = [k for k in keywords if _norm(k) not in t]
    return (len(missing) == 0, missing)


def _eval_docx(buf: bytes, policy: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if Document is None:
        return findings
    doc = Document(io.BytesIO(buf))

    # Defaults / targets
    target_font = policy.get("font", "Times New Roman")
    target_size_pt = float(policy.get("font_size", 12))
    target_spacing = float(policy.get("line_spacing", 1.5))
    tol_ratio = float(policy.get("max_nonconforming_paragraph_ratio", policy.get("tolerance", 0.1)))

    # Margins (first section only)
    sec = doc.sections[0]
    inch_emu = 914400  # 1 inch in EMU
    def _emu_to_in(val):
        try:
            return float(val) / inch_emu
        except Exception:
            return 0.0
    margins_ok = (
        abs(_emu_to_in(sec.top_margin) - 1.0) < 0.15 and
        abs(_emu_to_in(sec.bottom_margin) - 1.0) < 0.15 and
        abs(_emu_to_in(sec.left_margin) - 1.0) < 0.15 and
        abs(_emu_to_in(sec.right_margin) - 1.0) < 0.15
    )
    findings.append({"rule": "margins", "pass": margins_ok, "details": "1\" on all sides"})

    # Gather paragraphs
    paragraphs = list(doc.paragraphs)
    total = max(1, len(paragraphs))

    # Font/size checks
    non_font = 0
    non_size = 0
    non_spacing = 0
    heading_ok = True
    refs_present = False

    for p in paragraphs:
        txt = p.text or ""
        # Heading numbering if style suggests heading
        if (getattr(p.style, 'name', '') or '').lower().startswith('heading'):
            if not HEADING_RE.search(txt):
                heading_ok = False
        # References block hint
        if NUM_RE.search(txt):
            refs_present = True
        # Paragraph spacing
        try:
            ls = p.paragraph_format.line_spacing
            if ls is None:
                non_spacing += 1
            else:
                val = float(ls)
                if abs(val - target_spacing) > 0.2:
                    non_spacing += 1
        except Exception:
            non_spacing += 1
        # Runs: font + size
        ran_any = False
        for r in p.runs:
            ran_any = True
            try:
                fname = getattr(getattr(r.font, 'name', None), 'strip', lambda: r.font.name)()
            except Exception:
                fname = r.font.name
            if (not fname) or (fname != target_font):
                non_font += 1
            try:
                size = getattr(r.font, 'size', None)
                if size is None:
                    non_size += 1
                else:
                    # size in half-points in python-docx, 12pt -> 24
                    pt = float(size.pt) if hasattr(size, 'pt') else float(size)/2.0
                    if abs(pt - target_size_pt) > 0.6:
                        non_size += 1
            except Exception:
                non_spacing += 1
        if not ran_any:
            non_font += 1
            non_size += 1

    # Convert non-conformance counts to ratios
    font_pass = (non_font / total) <= tol_ratio
    size_pass = (non_size / total) <= tol_ratio
    spacing_pass = (non_spacing / total) <= tol_ratio
    findings.append({"rule": "font_family", "pass": font_pass, "details": f"Required: {target_font}"})
    findings.append({"rule": "font_size", "pass": size_pass, "details": f"Required: {target_size_pt} pt"})
    findings.append({"rule": "line_spacing", "pass": spacing_pass, "details": f"Required: {target_spacing}"})
    findings.append({"rule": "heading_numbering", "pass": heading_ok, "details": "1, 1.1, 1.2�"})
    findings.append({"rule": "ieee_references_block", "pass": refs_present, "details": "References like [1], [2] present"})

    return findings


def _eval_pdf(buf: bytes, policy: Dict[str, Any]) -> List[Dict[str, Any]]:
    findings: List[Dict[str, Any]] = []
    if PyPDF2 is None:
        return findings
    txt = ""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(buf))
        for page in reader.pages[:5]:
            txt += page.extract_text() or ""
    except Exception:
        pass
    refs_present = bool(NUM_RE.search(txt))
    # Best effort for PDFs: mark margins/spacing/heading as unknown (neutral fail->weighted below)
    findings.append({"rule": "margins", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "font_family", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "font_size", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "line_spacing", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "heading_numbering", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "ieee_references_block", "pass": refs_present, "details": "References like [1], [2] present"})
    return findings


@app.post("/check", response_model=CheckResponse)
async def check(
    file: UploadFile = File(...),
    policyName: str = Form(...),
    policyVersion: str = Form(...),
):
    policyName = policyName.strip().lower()
    if policyName not in SUPPORTED:
        return JSONResponse(status_code=400, content={"error": "unsupported_policy"})

    policies = _load_policies()
    policy = policies.get(policyName, {"version": policyVersion, "rules": []})
    version = policy.get("version") or policyVersion

    content = await file.read()
    mimetype = file.content_type or "application/octet-stream"

    # Evaluate
    if file.filename.lower().endswith(".docx") or "wordprocessingml" in mimetype:
        findings = _eval_docx(content, policy)
    elif file.filename.lower().endswith(".pdf") or "pdf" in mimetype:
        findings = _eval_pdf(content, policy)
    else:
        # Unknown type -> neutral but not passing
        findings = [{"rule": "file_type", "pass": False, "details": "Unsupported type"}]

    weights = policy.get("weights", {
        "margins": 1.0,
        "font_family": 1.0,
        "font_size": 1.0,
        "line_spacing": 1.0,
        "heading_numbering": 1.0,
        "ieee_references_block": 1.0,
    })
    score = _score_findings(findings, weights)
    threshold = float(policy.get("pass_threshold", 0.9))
    overall_pass = bool(score >= threshold)

    return {
        "overall_pass": overall_pass,
        "score": round(float(score), 4),
        "findings": findings,
        "policyName": policyName,
        "policyVersion": str(version),
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }
