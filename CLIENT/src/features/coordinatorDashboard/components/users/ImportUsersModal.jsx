import { useState } from "react";
import { api } from "../../../../api/client.js";
import { parseStudentFile } from "../../utils/parseStudentFile.js";

export default function ImportUsersModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);
  const [uploadError, setUploadError] = useState("");

  if (!open) return null;

  function resetState() {
    setFile(null);
    setParsing(false);
    setParseErrors([]);
    setUploadError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setUploadError("");
    if (!file) {
      setUploadError("Please choose a CSV or Excel file.");
      return;
    }

    setParsing(true);
    try {
      const { entries, errors } = await parseStudentFile(file);
      setParseErrors(errors);
      if (!entries.length) {
        setUploadError("No valid rows found. Please fix the highlighted issues and try again.");
        setParsing(false);
        return;
      }

      const res = await api("/student-verifications/import", {
        method: "POST",
        body: JSON.stringify({ entries }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to import students");
      }
      onSuccess?.(data);
      resetState();
      onClose?.();
    } catch (err) {
      setUploadError(err.message || "Unexpected error");
    } finally {
      setParsing(false);
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setUploadError("");
    setParseErrors([]);
    setFile(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--neutral-900)]">Import Researchers</h2>
            <p className="text-sm text-[color:var(--neutral-500)]">
              Upload a CSV or Excel file to queue multiple students.
            </p>
          </div>
          <button
            type="button"
            className="text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-600)]"
            onClick={() => {
              resetState();
              onClose?.();
            }}
            aria-label="Close import modal"
          >
            ?
          </button>
        </div>

        {uploadError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{uploadError}</p>
        )}
        {parseErrors.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-semibold">Issues found in the file:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {parseErrors.slice(0, 5).map((err, idx) => (
                <li key={`${err.student_id || err.index}-${idx}`}>
                  Row {err.index + 2}: {err.error}
                </li>
              ))}
            </ul>
            {parseErrors.length > 5 && (
              <p className="mt-2 text-xs italic">Only the first five issues are shown.</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="student-import">
              Upload file
            </label>
            <input
              id="student-import"
              type="file"
              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-[color:var(--neutral-300)] bg-[color:var(--neutral-50)] px-4 py-10 text-center text-sm text-[color:var(--neutral-500)] hover:border-[color:var(--brand-500)]"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-xs text-[color:var(--neutral-500)]">
              Columns required: First Name, Last Name, StudentID. Optional columns such as Middle Name or Program/Department are also imported.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
              onClick={() => {
                resetState();
                onClose?.();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={parsing}
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {parsing ? "Uploading…" : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

