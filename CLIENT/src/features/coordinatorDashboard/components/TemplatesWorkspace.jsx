import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client.js";

export default function TemplatesWorkspace() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [type, setType] = useState("Proposal");
  const [version, setVersion] = useState("1");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState(null);

  const sorted = useMemo(() => {
    return templates.slice().sort((a, b) => (b.version || 0) - (a.version || 0));
  }, [templates]);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api("/templates");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || "Failed to load templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleSave(event) {
    event.preventDefault();
    if (!type || !url.trim()) {
      setSaveError("Type and URL are required");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const payload = { type, version: String(version ?? '').trim() || '1', url: url.trim() };
      const endpoint = editingId ? `/templates/${editingId}` : "/templates";
      const method = editingId ? "PATCH" : "POST";
      const res = await api(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save template");
      setIsAdding(false);
      setEditingId("");
      setType("Proposal");
      setVersion("1");
      setUrl("");
      setToast({ id: Date.now(), message: "Template saved." });
      fetchTemplates();
    } catch (err) {
      setSaveError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  function startAdd() {
    setIsAdding(true);
    setEditingId("");
    setType("Proposal");
    setVersion("1");
    setUrl("");
  }

  function startEdit(tpl) {
    setIsAdding(true);
    setEditingId(tpl._id || "");
    setType(tpl.type || "");
    setVersion(String(tpl.version ?? "1"));
    setUrl(tpl.url || "");
  }

  async function handleDelete(id) {
    if (!id) return;
    if (!window.confirm("Delete this template?")) return;
    try {
      const res = await api(`/templates/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete template');
      }
      setToast({ id: Date.now(), message: 'Template deleted.' });
      fetchTemplates();
    } catch (err) {
      setToast({ id: Date.now(), message: err.message || 'Delete failed' });
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Document Templates</h1>
          <p className="text-sm text-[color:var(--neutral-500)]">Manage stage templates like Proposal.</p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)]"
          onClick={startAdd}
        >
          {isAdding && editingId ? 'Add New' : 'Add Template'}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSave} className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Type</label>
              <select
                className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Synopsis">Synopsis</option>
                <option value="Proposal">Proposal</option>
                <option value="Progress Report I">Progress Report I</option>
                <option value="Progress Report II">Progress Report II</option>
                <option value="Thesis">Thesis</option>
                <option value="Journal Article">Journal Article</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Version</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Template URL</label>
              <input
                type="url"
                placeholder="https://…/proposal-template.docx"
                className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
          {saveError && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{saveError}</p>
          )}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
              onClick={() => {
                if (saving) return;
                setIsAdding(false);
                setEditingId("");
                setSaveError("");
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? (editingId ? 'Updating.' : 'Saving.') : (editingId ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
            <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Version</th>
                <th className="px-6 py-3">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-800)]">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-center" colSpan={3}>Loading templates.</td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-6 py-6 text-center text-red-600" colSpan={3}>{error}</td>
                </tr>
              ) : sorted.length ? (
                sorted.map((tpl) => (
                  <tr key={tpl._id || `${tpl.type}-${tpl.version}-${tpl.url}`} className="group">
                    <td className="px-6 py-4 font-semibold capitalize">{tpl.type || 'proposal'}</td>
                    <td className="px-6 py-4">{tpl.version ?? '-'}</td>
                    <td className="px-6 py-4">
                      {tpl.url ? (
                        <a href={tpl.url} target="_blank" rel="noreferrer" className="text-[color:var(--brand-600)] hover:underline break-all">
                          {tpl.url}
                        </a>
                      ) : (
                        '-'
                      )}
                      <div className="mt-2 flex gap-2 text-xs">
                        <button type="button" className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]" onClick={() => startEdit(tpl)}>Edit</button>
                        <button type="button" className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-600 hover:bg-red-100" onClick={() => handleDelete(tpl._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-6 text-center text-[color:var(--neutral-500)]" colSpan={3}>No templates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="rounded-2xl bg-[color:var(--brand-600)] px-5 py-3 text-sm font-semibold text-white shadow-lg">{toast.message}</div>
        </div>
      )}
    </section>
  );
}
