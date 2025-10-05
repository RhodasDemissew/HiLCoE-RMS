import { Fragment, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function PreviewTable({ entries = [], errors = [] }) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-5 py-8 text-center text-sm text-[color:var(--neutral-500)]">
        {errors.length ? 'Fix the issues below and re-import.' : 'Upload a file to preview records.'}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--neutral-200)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
          <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
            <tr>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Researcher ID</th>
              <th className="px-4 py-3">Program</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-700)]">
            {entries.slice(0, 10).map((e, idx) => {
              const fullName = [e.first_name, e.middle_name, e.last_name].filter(Boolean).join(' ');
              return (
                <tr key={`${e.student_id || idx}-${idx}`}>
                  <td className="px-4 py-3">{fullName || '-'}</td>
                  <td className="px-4 py-3 font-semibold">{e.student_id || '-'}</td>
                  <td className="px-4 py-3">{e.program || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {entries.length > 10 && (
        <div className="px-4 py-2 text-xs text-[color:var(--neutral-500)]">Showing first 10 of {entries.length} rows.</div>
      )}
    </div>
  );
}

import { api } from '../../../../api/client.js';
import { parseStudentFile } from '../../utils/parseStudentFile.js';

export default function ImportUsersModal({ open, onClose, onSuccess, onToast }) {
  const [fileName, setFileName] = useState('');
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const summary = useMemo(() => ({ count: entries.length, errors: errors.length }), [entries, errors]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setEntries([]); setErrors([]); setFileName('');
      return;
    }
    try {
      const { entries: parsed, errors: parseErrors } = await parseStudentFile(file);
      setEntries(parsed || []);
      setErrors(parseErrors || []);
      setFileName(file.name);
      if (parseErrors?.length) onToast?.({ type: 'error', message: 'Some rows need attention before import.' });
    } catch (err) {
      setEntries([]);
      setErrors([{ index: 0, error: err.message || 'Failed to parse file' }]);
      onToast?.({ type: 'error', message: err.message || 'Failed to parse file' });
    }
  }

  async function handleImport() {
    if (!entries.length) { onToast?.({ type: 'error', message: 'No valid rows to import' }); return; }
    setUploading(true);
    try {
      const res = await api('/student-verifications/import', { method: 'POST', body: JSON.stringify({ entries }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      onToast?.({ type: 'success', message: `Inserted ${data.inserted || 0}${data.duplicates?.length ? `, ${data.duplicates.length} duplicates` : ''}.` });
      onSuccess?.(data);
      try { localStorage.setItem('coordinatorDataUpdated', String(Date.now())); } catch {}
      onClose?.();
    } catch (err) {
      onToast?.({ type: 'error', message: err.message || 'Import failed' });
    } finally { setUploading(false); }
  }

  function handleClose() {
    if (uploading) return;
    setEntries([]); setErrors([]); setFileName('');
    onClose?.();
  }

  if (!open) return null;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">
                <Dialog.Title className="text-xl font-semibold text-[color:var(--neutral-900)]">Import Researchers</Dialog.Title>
                <p className="mt-1 text-sm text-[color:var(--neutral-500)]">Upload a CSV or Excel file with researcher details.</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Upload file</label>
                    <input type="file" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-[color:var(--neutral-300)] bg-[color:var(--neutral-50)] px-4 py-10 text-center text-sm text-[color:var(--neutral-500)] hover:border-[color:var(--brand-500)]" onChange={handleFileChange} />
                    {fileName && <p className="mt-2 text-xs text-[color:var(--neutral-500)]">Selected: {fileName}</p>}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[color:var(--neutral-50)] px-4 py-3 text-sm text-[color:var(--neutral-600)]">
                    <span>Valid rows: <strong>{summary.count}</strong> Â· Errors: <strong>{summary.errors}</strong></span>
                    <span className="text-xs text-[color:var(--neutral-500)]">CSV headers: FirstName, MiddleName, LastName, ResearcherID, Program</span>
                  </div>

                  <PreviewTable entries={entries} errors={errors} />

                  {errors.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                      <p className="font-semibold">Issues found:</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        {errors.slice(0, 5).map((issue, index) => (
                          <li key={`${issue.index}-${index}`}>Row {issue.index + 2}: {issue.error}</li>
                        ))}
                      </ul>
                      {errors.length > 5 && <p className="mt-2 text-xs italic">Only first five issues shown.</p>}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button type="button" className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]" onClick={handleClose}>Cancel</button>
                  <button type="button" disabled={uploading || !entries.length} className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60" onClick={handleImport}>{uploading ? 'Importingâ€¦' : 'Import'}</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
