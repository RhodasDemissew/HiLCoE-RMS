import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../api/client.js';

export default function ScheduleSynopsis() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState({});
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api('/projects');
      const data = await res.json().catch(() => ([]));
      if (!res.ok) throw new Error(data?.error || 'Failed to load projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message || 'Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => projects.filter((p) => p?.researcher), [projects]);
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError(''); setOk('');
    if (!selectedCount) { setError('Select at least one researcher'); return; }
    if (!date) { setError('Pick a due date'); return; }
    setSubmitting(true);
    try {
      const ids = Object.entries(selected).filter(([,v]) => v).map(([k]) => k);
      let success = 0; let failed = 0;
      await Promise.all(ids.map(async (projectId) => {
        try {
          const res = await api(`/projects/${projectId}/milestones/synopsis/schedule`, {
            method: 'PUT',
            body: JSON.stringify({ due_at: new Date(date).toISOString(), notes }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.error || 'Failed');
          success += 1;
        } catch { failed += 1; }
      }));
      setOk(`Scheduled synopsis for ${success} project(s).${failed ? ` ${failed} failed.` : ''}`);
      setSelected({});
    } catch (e) { setError(e.message || 'Failed to schedule'); }
    finally { setSubmitting(false); }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Schedule Synopsis Submission</h1>
        <p className="text-sm text-[color:var(--neutral-600)]">Pick researchers and set a due date. They will be notified.</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-soft space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Due date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm" required />
          </label>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Instructions (optional)</span>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., upload PDF only" className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm" />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-[color:var(--neutral-600)]">Selected: <span className="font-semibold">{selectedCount}</span></div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Scheduling…' : 'Schedule'}</button>
        </div>
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
        {ok && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{ok}</div>}
      </form>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[color:var(--neutral-900)]">Researchers</h2>
          <button type="button" className="text-xs font-semibold text-[color:var(--brand-600)] hover:underline" onClick={() => {
            const next = {}; filtered.forEach((p) => (next[p._id] = true)); setSelected(next);
          }}>Select all</button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm text-[color:var(--neutral-500)]">Loading projects…</div>
        ) : (
          <ul className="divide-y divide-[color:var(--neutral-200)]">
            {filtered.map((p) => {
              const r = p.researcher || {}; const checked = !!selected[p._id];
              return (
                <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={checked} onChange={(e) => setSelected((prev) => ({ ...prev, [p._id]: e.target.checked }))} />
                    <span className="text-sm font-semibold text-[color:var(--neutral-900)]">{r.name || r.email || 'Unknown'}</span>
                  </label>
                  <span className="text-xs text-[color:var(--neutral-500)]">Project: {p.title}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

