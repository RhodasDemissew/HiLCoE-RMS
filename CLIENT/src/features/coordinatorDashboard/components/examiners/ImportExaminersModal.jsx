import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../../../../api/client.js";

function PreviewTable({ entries, errors }) {
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Examiner ID</th>
              <th className="px-4 py-3">Specializations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-700)]">
            {entries.slice(0, 10).map((entry, index) => (
              <tr key={`${entry.email}-${entry.examinerId}-${index}`}>
                <td className="px-4 py-3">{[entry.firstName, entry.middleName, entry.lastName].filter(Boolean).join(' ')}</td>
                <td className="px-4 py-3 text-[color:var(--brand-600)]">{entry.email}</td>
                <td className="px-4 py-3 font-semibold">{entry.examinerId || '-'}</td>
                <td className="px-4 py-3">{entry.specializations || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length > 10 && (
        <div className="px-4 py-2 text-xs text-[color:var(--neutral-500)]">
          Showing first 10 of {entries.length} rows.
        </div>
      )}
    </div>
  );
}

export default function ImportExaminersModal({ open, onClose, onSuccess, onToast }) {
  const [fileName, setFileName] = useState('');
  const [entries, setEntries] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);

  const validEntries = useMemo(() => {
    return entries.filter(entry => !entry.errors || entry.errors.length === 0);
  }, [entries]);

  const errorEntries = useMemo(() => {
    return entries.filter(entry => entry.errors && entry.errors.length > 0);
  }, [entries]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName('');
      setEntries([]);
      setErrors([]);
      return;
    }

    setFileName(file.name);
    setEntries([]);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setErrors(['File must contain at least a header row and one data row.']);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['firstname', 'lastname', 'email'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
          return;
        }

        const parsedEntries = [];
        const fileErrors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const entry = {};
          const entryErrors = [];

          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header) {
              case 'firstname':
                entry.firstName = value;
                if (!value) entryErrors.push('First name is required');
                break;
              case 'middlename':
                entry.middleName = value;
                break;
              case 'lastname':
                entry.lastName = value;
                if (!value) entryErrors.push('Last name is required');
                break;
              case 'email':
                entry.email = value.toLowerCase();
                if (!value) {
                  entryErrors.push('Email is required');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  entryErrors.push('Invalid email format');
                }
                break;
              case 'examinerid':
                entry.examinerId = value;
                break;
              case 'specializations':
                entry.specializations = value;
                break;
            }
          });

          if (entryErrors.length > 0) {
            entry.errors = entryErrors;
          }

          parsedEntries.push(entry);
        }

        setEntries(parsedEntries);
        setErrors(fileErrors);
      } catch (err) {
        setErrors(['Failed to parse file. Please check the format.']);
      }
    };

    reader.readAsText(file);
  }

  async function handleImport() {
    if (importing || validEntries.length === 0) return;

    setImporting(true);
    try {
      const payload = validEntries.map(entry => ({
        first_name: entry.firstName,
        middle_name: entry.middleName || '',
        last_name: entry.lastName,
        name: [entry.firstName, entry.middleName, entry.lastName].filter(Boolean).join(' '),
        email: entry.email,
        examiner_id: entry.examinerId || null,
        specializations: entry.specializations || null,
        role: 'Examiner',
        status: 'active'
      }));

      const res = await api('/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: payload })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to import examiners');
      }

      onSuccess?.();
      onToast?.({ type: 'success', message: `Successfully imported ${validEntries.length} examiners.` });
      onClose?.();
    } catch (err) {
      onToast?.({ type: 'error', message: err.message || 'Failed to import examiners' });
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    if (importing) return;
    setFileName('');
    setEntries([]);
    setErrors([]);
    onClose?.();
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold text-[color:var(--neutral-900)]">
                  Import Examiners
                </Dialog.Title>
                <p className="mt-1 text-sm text-[color:var(--neutral-500)]">
                  Upload a CSV or Excel file with examiner details.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                      Upload file
                    </label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-[color:var(--neutral-500)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[color:var(--brand-50)] file:text-[color:var(--brand-700)] hover:file:bg-[color:var(--brand-100)]"
                    />
                    {fileName && (
                      <p className="mt-1 text-xs text-[color:var(--neutral-500)]">
                        Selected: {fileName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-[color:var(--brand-600)]">
                      Valid rows: {validEntries.length}
                    </span>
                    <span className="font-semibold text-red-600">
                      Errors: {errorEntries.length}
                    </span>
                  </div>

                  <div className="text-xs text-[color:var(--neutral-500)]">
                    <p className="font-semibold">CSV headers:</p>
                    <p>FirstName, MiddleName, LastName, Email, ExaminerID, Specializations</p>
                  </div>

                  {errors.length > 0 && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <PreviewTable entries={entries} errors={errors} />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                    onClick={handleClose}
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleImport}
                    disabled={importing || validEntries.length === 0}
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
