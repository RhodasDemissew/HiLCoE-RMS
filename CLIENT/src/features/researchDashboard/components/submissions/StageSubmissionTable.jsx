import dayjs from "dayjs";
import { SUBMISSION_STATUS_META } from "../../constants/stages.js";

function StatusBadge({ status }) {
  const meta = SUBMISSION_STATUS_META[status] || { label: status, tone: 'info' };
  const toneClass = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-600',
  }[meta.tone] || 'bg-blue-50 text-blue-700';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>{meta.label}</span>;
}

export default function StageSubmissionTable({ submissions, loading, error, onDownload, downloadingId }) {
  return (
    <section className="card rounded-card border border-muted bg-white shadow-soft px-0 py-0">
      <div className="flex items-center justify-between px-6 py-6">
        <div>
          <h2 className="h3 text-[color:var(--neutral-900)]">Submission History</h2>
          <p className="body mt-1 text-[color:var(--neutral-600)]">Track all submitted documents across each stage.</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-b-[24px] border-t border-[color:var(--neutral-200)]">
        <table className="min-w-full table-auto text-left text-sm text-[color:var(--neutral-700)]">
          <thead className="bg-[color:var(--neutral-100)] text-xs uppercase tracking-wide text-[color:var(--neutral-600)]">
            <tr>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold">Document Type</th>
              <th className="px-6 py-3 font-semibold">Size</th>
              <th className="px-6 py-3 font-semibold">Submitted</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-sm text-[color:var(--neutral-500)]" colSpan={6}>
                  Loading submissions…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-6 py-6 text-center text-sm text-red-600" colSpan={6}>
                  {error}
                </td>
              </tr>
            ) : submissions.length ? (
              submissions.map((submission) => (
                <tr key={submission.id} className="border-t border-[color:var(--neutral-200)] hover:bg-[color:var(--neutral-100)]/60">
                  <td className="px-6 py-3 font-medium text-[color:var(--neutral-900)]">{submission.title}</td>
                  <td className="px-6 py-3">{submission.stage}</td>
                  <td className="px-6 py-3">{submission.file ? formatSize(submission.file.size) : '—'}</td>
                  <td className="px-6 py-3">{dayjs(submission.submittedAt || submission.created_at).format('MMM D, YYYY')}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={submission.status} />
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[color:var(--brand-600)] hover:underline"
                      onClick={() => onDownload?.(submission)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-sm text-[color:var(--neutral-500)]" colSpan={6}>
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const thresh = 1024;
  if (bytes < thresh) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
}

