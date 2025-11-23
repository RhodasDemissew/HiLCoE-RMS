import { Dialog, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import DocumentTypeSelect from "./DocumentTypeSelect.jsx";
import { getToken } from "../../../../api/client.js";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";
// 10 MB max upload size
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function stageKeyFromName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/__+/g, '_');
}


function humanFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB', 'TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
}

export default function StageSubmissionModal({
  open,
  onClose,
  stages,
  templateUrls,
  onSubmitted,
  currentStage,
  resubmitCountdown,
}) {
  const unlockedStages = useMemo(() => stages.filter((stage) => stage.unlocked), [stages]);
  const defaultStage = unlockedStages[0]?.name ?? '';

  const [documentType, setDocumentType] = useState(defaultStage);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Pause focus-based polling while modal is open
    try { if (typeof document !== 'undefined') document.body.dataset.modalOpen = '1'; } catch {}
    // Reset only when modal opens, not when stages/defaultStage change due to polling
    setDocumentType(defaultStage);
    setTitle('');
    setNotes('');
    setAcknowledged(false);
    setFile(null);
    setError('');
    setProgress(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => { try { if (typeof document !== 'undefined') delete document.body.dataset.modalOpen; } catch {} };
  }, []);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 10 MB.');
      setFile(null);
      return;
    }
    setFile(selected);
    setError('');
  }

  function handleDrop(event) {
    event.preventDefault();
    if (uploading) return;
    const selected = event.dataTransfer.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 10 MB.');
      setFile(null);
      return;
    }
    setFile(selected);
    setError('');
  }

  function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const selectedKey = stageKeyFromName(documentType);
  const selectedTemplate = templateUrls?.[selectedKey] || (selectedKey === 'proposal' ? templateUrls?.proposal : undefined);

  const isValid = documentType && title.trim() && file && acknowledged && !uploading;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid) return;

    setError('');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('notes', notes);
    formData.append('documentType', documentType);
    formData.append('acknowledged', acknowledged);

    const xhr = new XMLHttpRequest();
    abortRef.current = xhr;
    xhr.open('POST', `${API_BASE}/stages/submissions`);
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      setProgress(percent);
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText || '{}');
          onSubmitted?.(response);
          onClose?.();
        } catch (_err) {
          onSubmitted?.();
          onClose?.();
        }
      } else {
        const message = (() => {
          try {
            const payload = JSON.parse(xhr.responseText || '{}');
            return payload?.error || 'Upload failed';
          } catch (err) {
            return 'Upload failed';
          }
        })();
        setError(message);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      setError('Upload failed');
    };

    xhr.send(formData);
  }

  function handleCancel() {
    if (uploading && abortRef.current) {
      abortRef.current.abort();
    }
    onClose?.();
  }

  const currentStageLabel = currentStage ? `${currentStage.name} � ${currentStage.status === 'completed' ? 'Completed' : currentStage.status === 'current' ? 'Waiting for submission' : currentStage.status === 'resubmit' ? `Re-submit (${resubmitCountdown ?? 0} days left)` : currentStage.status}` : '';

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
                <Dialog.Title className="text-xl font-semibold text-[color:var(--neutral-900)]">Submit Document</Dialog.Title>
                {currentStageLabel && (
                  <p className="mt-2 inline-flex rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                    Current stage: {currentStageLabel}
                  </p>
                )}

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="submission-title">
                      Title
                    </label>
                    <input
                      id="submission-title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">Document Type</label>
                    <DocumentTypeSelect stages={stages} value={documentType} onChange={setDocumentType} />
                    {selectedTemplate && (
                      <a
                        href={selectedTemplate}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-xs font-semibold text-[color:var(--brand-600)] hover:underline"
                      >
                        Download template
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="submission-notes">
                      Notes <span className="text-[color:var(--neutral-400)]">(optional)</span>
                    </label>
                    <textarea
                      id="submission-notes"
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                    />
                  </div>

                  <div
                    onDrop={handleDrop}
                    onDragOver={preventDefault}
                    onDragEnter={preventDefault}
                    onDragLeave={preventDefault}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--brand-600)]/40 bg-[color:var(--brand-600)]/5 px-8 py-10 text-center transition hover:border-[color:var(--brand-600)] hover:bg-[color:var(--brand-600)]/10"
                  >
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" id="stage-upload" onChange={handleFileChange} disabled={uploading} />
                    <label htmlFor="stage-upload" className="flex flex-col items-center text-sm font-semibold text-[color:var(--neutral-800)]">
                      {file ? (
                        <>
                          <span>{file.name}</span>
                          <span className="mt-1 text-xs text-[color:var(--neutral-500)]">{humanFileSize(file.size)}</span>
                        </>
                      ) : (
                        <>
                          <span>Click to upload or drag and drop</span>
                          <span className="mt-1 text-xs text-[color:var(--neutral-500)]">PDF or DOCX up to 10 MB</span>
                        </>
                      )}
                    </label>
                    {uploading && (
                      <div className="mt-4 w-full max-w-md rounded-full bg-[color:var(--neutral-200)]">
                        <div
                          className="rounded-full bg-[color:var(--brand-600)] py-1 text-xs font-semibold text-white"
                          style={{ width: `${progress}%` }}
                        >
                          <span className="ml-2">{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 text-sm text-[color:var(--neutral-600)]">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(event) => setAcknowledged(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[color:var(--neutral-300)] text-[color:var(--brand-600)] focus:ring-[color:var(--brand-600)]"
                    />
                    <span>
                      I confirm that this document complies with the submission guidelines and does not exceed the allowed file size.
                    </span>
                  </label>

                  {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                      onClick={handleCancel}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!isValid}
                    >
                      {uploading ? 'Submitting�' : 'Submit'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

