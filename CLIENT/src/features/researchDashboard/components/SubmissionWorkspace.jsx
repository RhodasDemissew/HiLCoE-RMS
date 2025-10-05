import { useState } from "react";
import dayjs from "dayjs";
import { useResearchProgress } from "../hooks/useResearchProgress.js";
import StageTimeline from "./submissions/StageTimeline.jsx";
import StageSubmissionTable from "./submissions/StageSubmissionTable.jsx";
import StageSubmissionModal from "./submissions/StageSubmissionModal.jsx";
import { getToken } from "../../../api/client.js";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";

export default function SubmissionWorkspace() {
  const {
    stages,
    progress,
    templateUrls,
    submissions,
    loading,
    error,
    loadingSubmissions,
    submissionsError,
    currentStage,
    refreshAll,
    getResubmissionCountdown,
  } = useResearchProgress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const canSubmit = Boolean(currentStage?.unlocked);
  const resubmitCountdown = getResubmissionCountdown();

  async function handleDownload(submission) {
    try {
      setDownloadError('');
      setDownloadingId(submission.id);
      const token = getToken();
      const res = await fetch(`${API_BASE}/stages/submissions/${submission.id}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to download file');
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
      setDownloadError(err.message || 'Failed to download');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <header className="card rounded-card border border-transparent bg-white px-8 py-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="h2 text-[color:var(--neutral-900)]">Submission</h1>
              <p className="body mt-1 text-[color:var(--neutral-600)]">
                Submit each document in order. Future stages unlock once the previous is approved.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-primary rounded-[14px] px-5 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setIsModalOpen(true)}
                disabled={!canSubmit}
              >
                Upload Document
              </button>
              <button
                type="button"
                className="rounded-[14px] border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
                onClick={refreshAll}
                aria-label="Refresh progress and submissions"
              >
                Refresh
              </button>
            </div>
          </div>
          {progress?.resubmitUntil && (
            <p className="mt-3 text-xs text-[color:var(--neutral-500)]">
              Synopsis resubmission window ends {dayjs(progress.resubmitUntil).format('MMM D, YYYY')}.
            </p>
          )}
        </header>
      </div>

      <div className="col-span-12">
        <StageTimeline stages={stages} resubmitCountdown={resubmitCountdown} />
      </div>

      <div className="col-span-12">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
        <StageSubmissionTable
          submissions={submissions}
          loading={loading || loadingSubmissions}
          error={submissionsError || downloadError}
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
      </div>

      <StageSubmissionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stages={stages}
        templateUrls={templateUrls}
        onSubmitted={refreshAll}
        currentStage={currentStage}
        resubmitCountdown={resubmitCountdown}
      />
    </div>
  );
}
