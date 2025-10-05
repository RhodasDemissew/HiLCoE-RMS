# -*- coding: utf-8 -*-
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime, timezone
import os, io, json, re
from docx.enum.text import WD_LINE_SPACING

try:
    from docx import Document  # python-docx
except Exception:  # pragma: no cover
    Document = None  # type: ignore

try:
    import PyPDF2  # type: ignore
except Exception:  # pragma: no cover
    PyPDF2 = None  # type: ignore

app = FastAPI(title="MSc Formatting Checker")

# Resolve policies directory relative to this file to avoid cwd issues when launched via --app-dir
_BASE_DIR = os.path.dirname(__file__)
POLICY_DIR = os.environ.get("POLICY_DIR", os.path.join(_BASE_DIR, "policies", "msc"))
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

    # Resolve inherited formatting: run -> paragraph style -> Normal style
    def _resolve_font_defaults():
        name = ""
        size_pt = None
        try:
            normal = doc.styles['Normal'].font
            name = (getattr(normal, 'name', '') or '').strip()
            ns = getattr(normal, 'size', None)
            if ns is not None:
                size_pt = float(ns.pt) if hasattr(ns, 'pt') else float(ns) / 2.0
        except Exception:
            pass
        return name, size_pt

    def _rfonts_name(run):
        try:
            rpr = run._element.rPr
            rf = getattr(rpr, 'rFonts', None)
            if rf is None:
                return ''
            # Try common font mapping attributes
            for attr in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
                try:
                    v = getattr(rf, attr, None)
                    if v:
                        return str(v)
                except Exception:
                    pass
        except Exception:
            pass
        return ''

    def _resolve_font_name(run, paragraph, normal_name):
        try:
            n = run.font.name
            if n:
                return str(n).strip()
        except Exception:
            pass
        try:
            sfont = getattr(getattr(paragraph, 'style', None), 'font', None)
            n = getattr(sfont, 'name', None)
            if n:
                return str(n).strip()
        except Exception:
            pass
        # Theme rFonts (docx stores theme-bound font families here)
        n = _rfonts_name(run)
        if n:
            return n.strip()
        return (normal_name or '').strip()

    def _resolve_font_size_pt(run, paragraph, normal_size_pt):
        try:
            s = run.font.size
            if s is not None:
                return float(s.pt) if hasattr(s, 'pt') else float(s) / 2.0
        except Exception:
            pass
        try:
            sfont = getattr(getattr(paragraph, 'style', None), 'font', None)
            s = getattr(sfont, 'size', None)
            if s is not None:
                return float(s.pt) if hasattr(s, 'pt') else float(s) / 2.0
        except Exception:
            pass
        return normal_size_pt

    normal_name, normal_size_pt = _resolve_font_defaults()

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
            pf = p.paragraph_format
            # Accept explicit 1.5 rule even if numeric is None
            rule = getattr(pf, 'line_spacing_rule', None)
            if rule == WD_LINE_SPACING.ONE_POINT_FIVE:
                pass  # spacing ok
            else:
                ls = getattr(pf, 'line_spacing', None)
                if ls is None:
                    non_spacing += 1
                else:
                    val = float(ls)
                    if abs(val - target_spacing) > 0.2:
                        non_spacing += 1
        except Exception:
            non_spacing += 1
        # Runs: font + size (with inheritance resolution) â€” evaluate per paragraph
        ran_any = False
        p_font_bad = False
        p_size_bad = False
        for r in p.runs:
            # Ignore empty/whitespace-only runs
            if not (r.text or '').strip():
                continue
            ran_any = True
            fname = _resolve_font_name(r, p, normal_name)
            if (fname or '').strip().lower() != target_font.lower():
                p_font_bad = True
            size_pt = _resolve_font_size_pt(r, p, normal_size_pt)
            if size_pt is None or abs(size_pt - target_size_pt) > 0.6:
                p_size_bad = True
        if not ran_any:
            # No runs: fall back to paragraph style and Normal
            try:
                p_name = str(getattr(getattr(p, 'style', None), 'font', None).name or '').strip()
            except Exception:
                p_name = ''
            if (p_name or normal_name or '').strip().lower() != target_font.lower():
                p_font_bad = True
            try:
                ps = getattr(getattr(p, 'style', None), 'font', None)
                ps = getattr(ps, 'size', None)
                p_size = float(ps.pt) if (ps is not None and hasattr(ps, 'pt')) else (float(ps)/2.0 if ps is not None else None)
            except Exception:
                p_size = None
            base_size = p_size if p_size is not None else normal_size_pt
            if base_size is None or abs(base_size - target_size_pt) > 0.6:
                p_size_bad = True
        if p_font_bad:
            non_font += 1
        if p_size_bad:
            non_size += 1

    # Convert non-conformance counts to ratios
    font_pass = (non_font / total) <= tol_ratio
    size_pass = (non_size / total) <= tol_ratio
    spacing_pass = (non_spacing / total) <= tol_ratio
    findings.append({"rule": "font_family", "pass": font_pass, "details": f"Required: {target_font}"})
    findings.append({"rule": "font_size", "pass": size_pass, "details": f"Required: {target_size_pt} pt"})
    findings.append({"rule": "line_spacing", "pass": spacing_pass, "details": f"Required: {target_spacing}"})
    findings.append({"rule": "heading_numbering", "pass": heading_ok, "details": "1, 1.1, 1.2...¿½"})
    findings.append({"rule": "ieee_references_block", "pass": refs_present, "details": "References like [1], [2] present"})

    return findings

ROBUST_EVAL_DOCX = _eval_docx

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
"""FastAPI formatting checker with structural rules and stricter evaluation.
"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime, timezone
import os, io, json, re

try:
    from docx import Document  # python-docx
except Exception:
    Document = None  # type: ignore

try:
    import PyPDF2  # type: ignore
except Exception:
    PyPDF2 = None  # type: ignore

app = FastAPI(title="MSc Formatting Checker")

POLICY_DIR = os.environ.get("POLICY_DIR", os.path.join(os.getcwd(), "app", "policies", "msc"))
CACHE_TTL = int(os.environ.get("POLICY_CACHE_TTL_SECONDS", "60"))

_policy_cache: Dict[str, Dict[str, Any]] = {}
_policy_cache_at: float = 0.0

SUPPORTED = {"synopsis", "proposal", "progress_report_1", "progress_report_2", "thesis", "journal_article"}


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


def _contains_all(text: str, keywords: List[str]):
    t = _norm(text)
    missing = [k for k in keywords if _norm(k) not in t]
    return (len(missing) == 0, missing)


def _eval_docx(buf: bytes, policy: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Delegate to the robust implementation defined earlier
    return ROBUST_EVAL_DOCX(buf, policy)

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
    findings.append({"rule": "margins", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "font_family", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "font_size", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "line_spacing", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "heading_numbering", "pass": False, "details": "PDF heuristic"})
    findings.append({"rule": "ieee_references_block", "pass": refs_present, "details": "References like [1], [2] present"})

    # Structural checks for PDF
    try:
        req_heads = policy.get("required_headings") or []
        if req_heads:
            ok, missing = _contains_all(txt, req_heads)
            findings.append({"rule": "required_headings", "pass": ok, "details": ("Missing: " + ", ".join(missing)) if not ok else "All required headings present"})
        title_keys = policy.get("title_page_keywords") or []
        if title_keys:
            first_page = ""
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(buf))
                first_page = (reader.pages[0].extract_text() or "") if reader.pages else ""
                if isinstance(policy.get("page_count_range"), list) and len(policy["page_count_range"]) == 2:
                    lo, hi = policy["page_count_range"]
                    pc = len(reader.pages)
                    in_range = (pc >= int(lo)) and (pc <= int(hi))
                    findings.append({"rule": "page_count_range", "pass": in_range, "details": f"{pc} pages (required {lo}-{hi})"})
            except Exception:
                pass
            ok, missing = _contains_all(first_page, title_keys)
            findings.append({"rule": "title_page_keywords", "pass": ok, "details": ("Missing: " + ", ".join(missing)) if not ok else "Title page keywords present"})
    except Exception:
        pass

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

    if file.filename.lower().endswith(".docx") or "wordprocessingml" in mimetype:
        findings = _eval_docx(content, policy)
    elif file.filename.lower().endswith(".pdf") or "pdf" in mimetype:
        findings = _eval_pdf(content, policy)
    else:
        findings = [{"rule": "file_type", "pass": False, "details": "Unsupported type"}]

    weights = policy.get("weights", {
        "margins": 1.0,
        "font_family": 1.0,
        "font_size": 1.0,
        "line_spacing": 1.0,
        "heading_numbering": 1.0,
        "ieee_references_block": 1.0,
        "required_headings": 1.0,
        "title_page_keywords": 1.0,
        "page_count_range": 0.5,
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




