import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client.js";

export default function TemplatesWorkspace() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState("proposal");
  const [version, setVersion] = useState(1);
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
      const res = await api("/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, version: Number(version) || 1, url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save template");
      setIsAdding(false);
      setType("proposal");
      setVersion(1);
      setUrl("");
      setToast({ id: Date.now(), message: "Template saved." });
      fetchTemplates();
    } catch (err) {
      setSaveError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
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
          onClick={() => setIsAdding(true)}
        >
          Add Template
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
                <option value="proposal">Proposal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Version</label>
              <input
                type="number"
                min={1}
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
              {saving ? "Saving." : "Save"}
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

