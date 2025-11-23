import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../../../api/client.js";
import { STAGE_ORDER } from "../constants/stages.js";

function normalizeStages(progress, submissions = []) {
  const currentIndex = Number.isInteger(progress?.currentStageIndex)
    ? progress.currentStageIndex
    : 0;
  const stages = progress?.stages || [];
  const lookup = new Map();
  stages.forEach((stage) => lookup.set(stage.name, stage));

  // Helper: latest submission by stage index
  const latestByIndex = new Map();
  submissions.forEach((s) => {
    const existing = latestByIndex.get(s.stageIndex);
    const sTime = new Date(s.submittedAt || s.created_at || 0).getTime();
    const eTime = existing ? new Date(existing.submittedAt || existing.created_at || 0).getTime() : -1;
    if (!existing || sTime > eTime) latestByIndex.set(s.stageIndex, s);
  });

  return STAGE_ORDER.map((name, index) => {
    const info = lookup.get(name) || {};
    let status = info.status || (index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'locked');
    const latest = latestByIndex.get(index);
    
    // Check latest submission status to override stage status
    if (latest) {
      const submissionStatus = latest.status;
      if (submissionStatus === 'needs_changes') {
        status = 'needs_changes';
      } else if (submissionStatus === 'under_review' || submissionStatus === 'awaiting_coordinator') {
        // If there's a submission under review, show that status even if stage is marked as 'current'
        status = 'under_review';
      } else if (submissionStatus === 'approved' && index < currentIndex) {
        status = 'completed';
      }
      // If rejected + synopsis and resubmitUntil active, API already marks 'resubmit'
    }
    
    const baseUnlocked = Boolean(info.unlocked);
    const submitUnlocked = baseUnlocked && (status === 'current' || status === 'resubmit' || status === 'needs_changes');
    return {
      name,
      index,
      unlocked: submitUnlocked,
      status,
      daysLeft: info.daysLeft ?? null,
      latestSubmission: latest || null, // Include latest submission for tooltip
    };
  });
}

export function useResearchProgress() {
  const [progress, setProgress] = useState(null);
  const [templateUrls, setTemplateUrls] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api("/stages/researchers/progress");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load progress");
      setProgress(data);
      setTemplateUrls(data.templateUrls || {});
    } catch (err) {
      setError(err.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    setSubmissionsError("");
    try {
      const res = await api("/stages/submissions");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Failed to load submissions");
      const list = Array.isArray(data?.items) ? data.items : [];
      setSubmissions(list);
    } catch (err) {
      setSubmissionsError(err.message || "Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
    loadSubmissions();
  }, [loadProgress, loadSubmissions]);

  // Auto-refresh on window focus and cross-tab updates (e.g., coordinator reviews)
  useEffect(() => {
    function onFocus() {
      loadProgress();
      loadSubmissions();
    }
    function onStorage(event) {
      if (event.key === 'stageProgressUpdated') {
        loadProgress();
        loadSubmissions();
      }
    }
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadProgress, loadSubmissions]);

  // Light polling while there are pending reviews
  useEffect(() => {
    const hasPending = submissions.some((s) => s.status === 'under_review' || s.status === 'awaiting_coordinator');
    if (!hasPending) return undefined;
    const id = setInterval(() => {
      loadProgress();
      loadSubmissions();
    }, 8000);
    return () => clearInterval(id);
  }, [submissions, loadProgress, loadSubmissions]);

  const stages = useMemo(
    () => normalizeStages(progress || {}, submissions),
    [progress, submissions],
  );

  const currentStage = useMemo(() => {
    if (!progress) return null;
    return stages.find((stage) => stage.index === progress.currentStageIndex) || null;
  }, [progress, stages]);

  function isStageUnlocked(stageName) {
    const stage = stages.find((item) => item.name === stageName);
    return stage ? stage.unlocked : false;
  }

  function getResubmissionCountdown() {
    if (!progress?.resubmitUntil) return null;
    const diff = dayjs(progress.resubmitUntil).diff(dayjs(), "day");
    return diff >= 0 ? diff : null;
  }

  function refreshAll() {
    loadProgress();
    loadSubmissions();
  }

  return {
    progress,
    stages,
    templateUrls,
    submissions,
    loading,
    error,
    loadingSubmissions,
    submissionsError,
    currentStage,
    isStageUnlocked,
    refreshAll,
    getResubmissionCountdown,
    reloadProgress: loadProgress,
    reloadSubmissions: loadSubmissions,
  };
}
