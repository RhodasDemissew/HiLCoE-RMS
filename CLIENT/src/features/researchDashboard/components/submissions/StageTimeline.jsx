import { LockClosedIcon, CheckIcon } from "@heroicons/react/24/solid";

function dotStyles(stage) {
  switch (stage.status) {
    case 'completed':
      return 'bg-[color:var(--brand-700)] ring-2 ring-[color:var(--brand-200)] text-white';
    case 'under_review':
      // Show under review with a distinct color (e.g., blue)
      return 'bg-blue-600 ring-2 ring-blue-200 text-white';
    case 'current':
      return 'bg-[color:var(--brand-600)] ring-2 ring-[color:var(--brand-200)] text-white';
    case 'resubmit':
    case 'needs_changes':
      return 'bg-amber-500 ring-2 ring-amber-200 text-white';
    default:
      return 'bg-[color:var(--neutral-300)] text-[color:var(--neutral-600)]';
  }
}

export default function StageTimeline({ stages, resubmitCountdown }) {
  const totalSegments = Math.max(stages.length - 1, 1);
  const completedSegments = Math.min(
    totalSegments,
    stages.filter((s) => s.status === 'completed').length
  );
  const progressPercent = Math.round((completedSegments / totalSegments) * 100);

  function statusText(stage) {
    // Check if there's a submission with status that should override the stage status
    const submissionStatus = stage.latestSubmission?.status;
    
    if (submissionStatus === 'under_review' || submissionStatus === 'awaiting_coordinator') {
      return 'Under Review';
    }
    
    switch (stage.status) {
      case 'completed':
        return 'Approved';
      case 'under_review':
        return 'Under Review';
      case 'current':
        // Only show "Waiting for submission" if there's no active submission
        if (!submissionStatus || (submissionStatus !== 'under_review' && submissionStatus !== 'awaiting_coordinator')) {
          return 'Waiting for submission';
        }
        return 'Under Review';
      case 'needs_changes':
        return 'Needs changes — re-submit same stage';
      case 'resubmit': {
        const days = stage.daysLeft ?? resubmitCountdown ?? 0;
        return `Resubmission window: ${days} day${days === 1 ? '' : 's'} left`;
      }
      default:
        return 'Locked until previous stage is approved';
    }
  }

  return (
    <div className="rounded-3xl border border-[color:var(--neutral-200)] bg-white p-6 shadow-soft">
      <h2 className="h3 text-[color:var(--neutral-900)]">Submission Flow</h2>
      <div className="relative mt-6 px-2">
        {/* Base connecting line */}
        <div className="pointer-events-none absolute left-0 right-0 top-4 h-0.5 bg-[color:var(--neutral-200)]" />
        {/* Progress line */}
        <div
          className="pointer-events-none absolute left-0 top-4 h-0.5 bg-[color:var(--brand-600)] transition-all"
          style={{ width: `${progressPercent}%` }}
        />

        <ol className="relative z-10 flex items-start justify-between">
          {stages.map((stage) => {
            const classes = dotStyles(stage);
            return (
              <li key={stage.name} className="relative group flex w-full flex-col items-center text-center">
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 z-20 hidden w-max max-w-[14rem] -translate-y-1/2 rounded-md bg-[color:var(--neutral-900)] px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition group-hover:block group-hover:opacity-100">
                  {statusText(stage)}
                  <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[color:var(--neutral-900)]" />
                </div>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${classes}`}
                  aria-label={`${stage.name} ${stage.status}`}
                >
                  {stage.status === 'completed' ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : stage.status === 'resubmit' ? (
                    <span className="text-[10px] font-bold leading-none">{stage.daysLeft ?? resubmitCountdown ?? ''}</span>
                  ) : stage.unlocked ? (
                    <span className="text-[10px] font-semibold leading-none">{stage.index + 1}</span>
                  ) : (
                    <LockClosedIcon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="mt-2 max-w-[8rem] text-[11px] font-medium text-[color:var(--neutral-800)]">
                  {stage.name}
                </span>
              </li>
            );
          })}
        </ol>
        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-[color:var(--neutral-700)]">
          <LegendItem label="Approved" className="bg-[color:var(--brand-700)]" />
          <LegendItem label="Current" className="bg-[color:var(--brand-600)]" />
          <LegendItem label="Resubmission" className="bg-amber-500" />
          <LegendItem label="Locked" className="bg-[color:var(--neutral-300)]" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, className = '' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-full ${className}`} />
      <span className="font-medium">{label}</span>
    </span>
  );
}
