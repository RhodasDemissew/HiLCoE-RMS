import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../../../api/client.js";

function StatusBadge({ status }) {
  const meta = {
    under_review: { label: "Under Review", cls: "bg-blue-50 text-blue-700" },
    needs_changes: { label: "Needs Changes", cls: "bg-amber-50 text-amber-700" },
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
    rejected: { label: "Rejected", cls: "bg-red-50 text-red-600" },
  }[status] || { label: status, cls: "bg-[color:var(--neutral-100)] text-[color:var(--neutral-700)]" };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>;
}

function RowActions({ submission, onDecision, downloadingId, onDownload }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" onClick={() => onDecision(submission, "approve")}>Approve</button>
      <button type="button" className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100" onClick={() => onDecision(submission, "needs_changes")}>Needs Changes</button>
      <button type="button" className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => onDecision(submission, "reject")}>Reject</button>
      <button type="button" className="rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)] hover:bg-[color:var(--brand-100)]" onClick={() => onDownload(submission)} disabled={downloadingId === submission.id}>{downloadingId === submission.id ? "Downloading." : "Download"}</button>
    </div>
  );
}

export default function ReviewWorkspace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);

  const stages = [
    "Synopsis",
    "Proposal",
    "Progress Report 1",
    "Progress Report 2",
    "Thesis Report",
    "Final Draft (Pre-Defense)",
    "Final Draft (Post-Defense)",
    "Journal Article",
  ];

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = stageFilter !== "all" ? `?stage=${encodeURIComponent(stageFilter)}` : "";
      const res = await api(`/stages/coordinator/submissions${qs}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load submissions");
      const arr = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
    } catch (err) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      const r = it.researcher || {};
      const key = String(r._id || r.id || r.email || it.id || Math.random());
      if (!map.has(key)) map.set(key, { researcher: r, submissions: [] });
      map.get(key).submissions.push(it);
    });
    return Array.from(map.values()).map((g) => ({
      researcher: g.researcher,
      submissions: g.submissions.sort((a, b) => new Date(b.submittedAt || b.created_at || 0) - new Date(a.submittedAt || a.created_at || 0)),
      lastSubmitted: g.submissions.reduce((acc, cur) => {
        const d = new Date(cur.submittedAt || cur.created_at || 0).getTime();
        return Math.max(acc, d);
      }, 0),
    })).sort((a, b) => b.lastSubmitted - a.lastSubmitted);
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return grouped;
    return grouped.filter((g) => (g.researcher?.name || g.researcher?.email || "").toLowerCase().includes(term));
  }, [grouped, search]);

  async function handleDecision(submission, decision) {
    if (decision === 'analyze') {
      try {
        const res = await api(`/stages/submissions/${submission.id}/analyze`, { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Analyze failed');
        setItems((prev) => prev.map((it) => (it.id === submission.id ? { ...it, analysis: data.analysis } : it)));
      } catch (err) {
        alert(err.message || 'Analyze failed');
      }
      return;
    }
    try {
      const res = await api(`/stages/submissions/${submission.id}/review`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit review");
      setItems((prev) => prev.map((it) => (it.id === submission.id ? { ...it, status: data.status || decision } : it)));
      try { localStorage.setItem('stageProgressUpdated', String(Date.now())); } catch {}
    } catch (err) {
      alert(err.message || "Review failed");
    }
  }

  async function handleDownload(submission) {
    try {
      setDownloadingId(submission.id);
      const base = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";
      const res = await fetch(`${base}/stages/submissions/${submission.id}/file`, {
        headers: (() => {
          const t = localStorage.getItem('token');
          return t ? { Authorization: `Bearer ${t}` } : {};
        })(),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.file?.filename || `${submission.stage}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Research Stats</h1>
          <p className="text-sm text-[color:var(--neutral-600)]">Review and take actions on submitted documents.</p>
        </div>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <select className="h-10 rounded-xl border border-[color:var(--neutral-200)] bg-white px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="all">All stages</option>
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="button" className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-50)]" onClick={fetchList}>
              Refresh
            </button>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="h-10 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none sm:w-72" />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[color:var(--neutral-200)]">
          <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
            <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
              <tr>
                <th className="px-6 py-3">Student</th>
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
                <tr>
                  <td className="px-6 py-6 text-center" colSpan={7}>Loading submissions.</td>
                </tr>
              ) : filtered.length ? (
                filtered.map((group, i) => {
                  const last = group.submissions[0];
                  const r = group.researcher || {};
                  const key = String(r._id || r.id || i);
                  const open = Boolean(expanded[key]);
                  return (
                    <>
                      <tr key={key} className="group">
                        <td className="px-6 py-4 font-semibold text-[color:var(--neutral-900)]">{r.name || r.email || 'Unknown'}</td>
                        <td className="px-6 py-4">{last?.stage}</td>
                        <td className="px-6 py-4"><StatusBadge status={last?.status} /></td>
                        <td className="px-6 py-4">
                          {last?.analysis?.status === 'completed' ? (
                            <span className="inline-flex rounded-full bg-[color:var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                              {`${Math.round(last?.analysis?.score ?? last?.analysis?.progress ?? 0)}%`}
                            </span>
                          ) : (
                            <button type="button" className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--brand-500)]" onClick={() => handleDecision({ ...last, id: last.id }, 'analyze')}
                            >
                              Check
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-[color:var(--neutral-200)]">
                              <div className="h-2 rounded-full bg-[color:var(--brand-600)]" style={{ width: `${Math.round(last?.analysis?.progress ?? 0)}%` }} />
                            </div>
                            <span className="text-xs text-[color:var(--neutral-500)]">{Math.round(last?.analysis?.progress ?? 0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{last?.submittedAt ? dayjs(last.submittedAt).format('MMM D, YYYY') : '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--brand-50)]" onClick={() => setExpanded((prev) => ({ ...prev, [key]: !open }))}>
                            {open ? 'Hide Details' : 'Details'}
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={7} className="bg-[color:var(--neutral-50)] px-6 py-4">
                            <div className="space-y-3">
                              {group.submissions.map((sub) => (
                                <div key={sub.id} className="flex flex-col gap-1 rounded-xl border border-[color:var(--neutral-200)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-[color:var(--neutral-900)]">{sub.stage}</div>
                                    <div className="text-xs text-[color:var(--neutral-600)]">{sub.title}</div>
                                    <div className="text-xs text-[color:var(--neutral-500)]">Submitted {dayjs(sub.submittedAt || sub.created_at).format('MMM D, YYYY')}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      {sub?.analysis?.status === 'completed' ? (
                                        <span className="inline-flex rounded-full bg-[color:var(--brand-600)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                                          {`${Math.round(sub?.analysis?.score ?? sub?.analysis?.progress ?? 0)}%`}
                                        </span>
                                      ) : (
                                        <button type="button" className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--brand-500)]" onClick={async () => {
                                          try {
                                            const res = await api(`/stages/submissions/${sub.id}/analyze`, { method: 'POST' });
                                            const data = await res.json().catch(() => ({}));
                                            if (!res.ok) throw new Error(data?.error || 'Analyze failed');
                                            setItems((prev) => prev.map((it) => (it.id === sub.id ? { ...it, analysis: data.analysis } : it)));
                                          } catch (err) { alert(err.message || 'Analyze failed'); }
                                        }}>Check</button>
                                      )}
                                      <div className="hidden sm:block h-2 w-24 rounded-full bg-[color:var(--neutral-200)]">
                                        <div className="h-2 rounded-full bg-[color:var(--brand-600)]" style={{ width: `${Math.round(sub?.analysis?.progress ?? 0)}%` }} />
                                      </div>
                                    </div>
                                    <StatusBadge status={sub.status} />
                                    <RowActions submission={sub} onDecision={handleDecision} downloadingId={downloadingId} onDownload={handleDownload} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-6 text-center text-[color:var(--neutral-500)]" colSpan={5}>No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
