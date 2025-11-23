import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../../../api/client.js";
import DecisionModal from "./DecisionModal.jsx";

function StatusBadge({ status }) {
  const meta = {
    under_review: { label: "Under Review", cls: "bg-blue-50 text-blue-700" },
    awaiting_coordinator: { label: "Awaiting Coordinator", cls: "bg-indigo-50 text-indigo-700" },
    needs_changes: { label: "Needs Changes", cls: "bg-amber-50 text-amber-700" },
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-600" },
  }[status] || { label: String(status || "-"), cls: "bg-[color:var(--neutral-100)] text-[color:var(--neutral-700)]" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
  );
}

function RowActions({ submission, onOpenDecision, downloadingId, onDownload, modalOpen, modalSubmission, modalDecision, onModalClose, onModalSubmit }) {
  const status = submission?.status || '';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  
  // If approved or rejected, don't allow status changes
  if (isApproved) {
    return (
      <div className="flex flex-wrap items-center gap-2 relative">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Already Approved</span>
        <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => onDownload(submission)} disabled={downloadingId === submission.id}>{downloadingId === submission.id ? "Downloading." : "Download"}</button>
      </div>
    );
  }
  
  if (isRejected) {
    return (
      <div className="flex flex-wrap items-center gap-2 relative">
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Rejected</span>
        <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => onDownload(submission)} disabled={downloadingId === submission.id}>{downloadingId === submission.id ? "Downloading." : "Download"}</button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap items-center gap-2 relative">
      <button type="button" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" onClick={() => onOpenDecision(submission, "approve")}>Approve</button>
      <button type="button" className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100" onClick={() => onOpenDecision(submission, "needs_changes")}>Needs Changes</button>
      <button type="button" className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => onOpenDecision(submission, "reject")}>Reject</button>
      <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => onDownload(submission)} disabled={downloadingId === submission.id}>{downloadingId === submission.id ? "Downloading." : "Download"}</button>
      
      {/* Inline Decision Modal */}
      {modalOpen && modalSubmission?.id === submission?.id && (
        <DecisionModal
          isOpen={modalOpen}
          onClose={onModalClose}
          onSubmit={onModalSubmit}
          decision={modalDecision}
          submission={modalSubmission}
        />
      )}
    </div>
  );
}

export default function ReviewWorkspace({ hideSynopsis = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmission, setModalSubmission] = useState(null);
  const [modalDecision, setModalDecision] = useState(null);
  const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";

  const stages = useMemo(() => {
    const list = [
      "Synopsis",
      "Proposal",
      "Progress Report 1",
      "Progress Report 2",
      "Thesis Report",
      "Final Draft (Pre-Defense)",
      "Final Draft (Post-Defense)",
      "Journal Article",
    ];
    return hideSynopsis ? list.filter((s) => s !== "Synopsis") : list;
  }, [hideSynopsis]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = stageFilter !== "all" ? `?stage=${encodeURIComponent(stageFilter)}` : "";
      const res = await api(`/stages/coordinator/submissions${qs}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load submissions");
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    function onStorage(e) { if (e.key === "coordinatorDataUpdated") fetchList(); }
    function onFocus() { fetchList(); }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onFocus); };
  }, [fetchList]);

  const grouped = useMemo(() => {
    const visible = (items || []).filter((it) => (it.researcher?.name || it.researcher?.email));
    const map = new Map();
    for (const it of visible) {
      const r = it.researcher || {};
      const key = String(r._id || r.id || r.email || Math.random());
      if (!map.has(key)) map.set(key, { researcher: r, submissions: [] });
      map.get(key).submissions.push(it);
    }
    return Array.from(map.values()).map((g) => ({
      researcher: g.researcher,
      submissions: g.submissions.sort((a, b) => new Date(b.submittedAt || b.created_at || 0) - new Date(a.submittedAt || a.created_at || 0)),
      last: g.submissions[0] || null,
    }));
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return grouped;
    return grouped.filter((g) => (g.researcher?.name || g.researcher?.email || "").toLowerCase().includes(term));
  }, [grouped, search]);

  function openDecisionDialog(submission, decision) {
    if (!submission || !decision) return;
    setModalSubmission(submission);
    setModalDecision(decision);
    setModalOpen(true);
  }

  const handleModalClose = () => {
    setModalOpen(false);
    setModalSubmission(null);
    setModalDecision(null);
  };

  const handleModalSubmit = async (submission, decision, notes) => {
    await handleDecision(submission, decision, notes);
    handleModalClose();
  };

  async function handleDecision(submission, decision, notes = "") {
    if (!submission) return;
    if (decision === "analyze") {
      try {
        const res = await api(`/stages/submissions/${submission.id}/analyze`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Analyze failed");
        fetchList();
      } catch (err) { alert(err.message || "Analyze failed"); }
      return;
    }
    try {
      const res = await api(`/stages/submissions/${submission.id}/review`, { method: "POST", body: JSON.stringify({ decision, notes }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit review");
      fetchList();
      try { localStorage.setItem("stageProgressUpdated", String(Date.now())); } catch {}
    } catch (err) {
      alert(err.message || "Review failed");
    }
  }

  async function handleDownload(submission) {
    try {
      setDownloadingId(submission.id);
      const res = await fetch(`${API_BASE}/stages/submissions/${submission.id}/file`, {
        headers: (() => { const t = localStorage.getItem("token"); return t ? { Authorization: `Bearer ${t}` } : {}; })(),
      });
      if (!res.ok) { const payload = await res.json().catch(() => null); throw new Error(payload?.error || "Download failed"); }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = submission.file?.filename || `${submission.stage}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { alert(err.message || "Download failed"); } finally { setDownloadingId(null); }
  }

  async function handleFormatCheck(id) {
    try {
      const res = await api(`/stages/submissions/${id}/format-check`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { throw new Error(data?.error || 'Format check failed'); }
      setItems((prev) => Array.isArray(prev) ? prev.map((it) => (it.id === id ? { ...it, format: data } : it)) : prev);
      fetchList();
    } catch (err) { alert(err.message || 'Format check failed'); }
  }
  async function handleDownloadReport(id) {
    try {
      const res = await fetch(`${API_BASE}/stages/submissions/${id}/format-report.json`, {
        headers: (() => { const t = localStorage.getItem('token'); return t ? { Authorization: `Bearer ${t}` } : {}; })(),
      });
      if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.error || 'Download failed'); }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `format-report-${id}.json`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { alert(err.message || 'Download failed'); }
  }

  // Full table UI
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Research Stats</h1>
          <p className="text-sm text-[color:var(--neutral-600)]">Review and take actions on submitted documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 rounded-xl border border-[color:var(--neutral-200)] bg-white px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="all">All stages</option>
            {stages.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <button type="button" className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-50)]" onClick={fetchList}>Refresh</button>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="h-10 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none sm:w-72" />
        </div>
      </header>

      {error && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>)}

      <div className="overflow-hidden rounded-2xl border border-[color:var(--neutral-200)]">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
          <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
            <tr>
              <th className="px-6 py-3">Researcher</th>
              <th className="px-6 py-3">Latest Stage</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">AI/NLP</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3" aria-label="Details" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-800)]">
            {loading ? (
              <tr><td className="px-6 py-6 text-center" colSpan={7}>Loading submissions…</td></tr>
            ) : filtered.length ? (
              filtered.map((group, i) => {
                const r = group.researcher || {};
                const last = group.last;
                const key = String(r._id || r.id || r.email || i);
                const open = Boolean(expanded[key]);
                const aiPct = Math.round(last?.analysis?.score ?? last?.analysis?.progress ?? 0);
                return (
                  <Fragment key={key}>
                    <tr className="group">
                      <td className="px-6 py-4 font-semibold text-[color:var(--neutral-900)]">{r.name || r.email || 'Unknown'}</td>
                      <td className="px-6 py-4">{last?.stage || '-'}</td>
                      <td className="px-6 py-4">{last ? <StatusBadge status={last.status} /> : '-'}</td>
                      <td className="px-6 py-4">
                        {last?.analysis?.status === 'completed' ? (
                          <span className="inline-flex rounded-full bg-[color:var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">{aiPct}%</span>
                        ) : last ? (
                          <button type="button" className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--brand-500)]" onClick={() => handleDecision({ ...last, id: last.id }, 'analyze')}>Run AI/NLP</button>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-[color:var(--neutral-200)]">
                            <div className="h-2 rounded-full bg-[color:var(--brand-600)]" style={{ width: `${aiPct}%` }} />
                          </div>
                          <span className="text-xs text-[color:var(--neutral-500)]">{aiPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{last?.submittedAt ? dayjs(last.submittedAt).format('MMM D, YYYY') : '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--brand-50)]" onClick={() => setExpanded((prev) => ({ ...prev, [key]: !open }))}>{open ? 'Hide Details' : 'Details'}</button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={7} className="bg-[color:var(--neutral-50)] px-6 py-4">
                          <div className="space-y-3">
                            {group.submissions.map((sub) => {
                              const isApproved = (sub.status || '').toLowerCase() === 'approved';
                              const approvedDate = sub.reviewed_at || sub.updated_at || sub.submittedAt || sub.created_at;
                              return (
                                <div key={sub.id} className="flex flex-col gap-1 rounded-xl border border-[color:var(--neutral-200)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{sub.stage}</div>
                                    <div className="text-xs text-[color:var(--neutral-600)]">{sub.title}</div>
                                    <div className="text-xs text-[color:var(--neutral-500)]">
                                      {isApproved && approvedDate 
                                        ? `This ${sub.stage?.toLowerCase() || 'submission'} has been approved on ${dayjs(approvedDate).format('MMM D, YYYY')}`
                                        : `Submitted ${dayjs(sub.submittedAt || sub.created_at).format('MMM D, YYYY')}`
                                      }
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {isApproved ? (
                                      <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => handleDownload(sub)} disabled={downloadingId === sub.id}>{downloadingId === sub.id ? "Downloading." : "Download"}</button>
                                    ) : (
                                      <>
                                        {sub?.analysis?.status === 'completed' ? (
                                          <span className="inline-flex rounded-full bg-[color:var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">{`${Math.round(sub?.analysis?.score ?? sub?.analysis?.progress ?? 0)}%`}</span>
                                        ) : (
                                          <button type="button" className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--brand-500)]" onClick={async () => { try { const res = await api(`/stages/submissions/${sub.id}/analyze`, { method: 'POST' }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data?.error || 'Analyze failed'); fetchList(); } catch (err) { alert(err.message || 'Analyze failed'); } }}>Run AI/NLP</button>
                                        )}
                                        {sub?.format ? (
                                          <span className={"inline-flex rounded-full px-3 py-1 text-xs font-semibold " + (sub.format.status === 'pass' ? 'bg-emerald-50 text-emerald-700' : sub.format.status === 'issues' ? 'bg-amber-50 text-amber-700' : 'bg-[color:var(--neutral-100)] text-[color:var(--neutral-700)]')}>
                                            {sub.format.status === 'pass' ? 'Format OK' : sub.format.status === 'issues' ? 'Format Issues' : 'Format Unknown'}
                                          </span>
                                        ) : null}
                                        <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]" onClick={() => handleFormatCheck(sub.id)}>Re-run Format</button>
                                        <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => handleDownloadReport(sub.id)}>Download JSON</button>
                                        <RowActions 
                                          submission={sub} 
                                          onOpenDecision={openDecisionDialog} 
                                          downloadingId={downloadingId} 
                                          onDownload={handleDownload}
                                          modalOpen={modalOpen}
                                          modalSubmission={modalSubmission}
                                          modalDecision={modalDecision}
                                          onModalClose={handleModalClose}
                                          onModalSubmit={handleModalSubmit}
                                        />
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr><td className="px-6 py-6 text-center text-[color:var(--neutral-500)]" colSpan={7}>No submissions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
