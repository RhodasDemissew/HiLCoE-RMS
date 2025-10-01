import dayjs from 'dayjs';
import { ResearchProgress } from '../models/ResearchProgress.js';
import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { STAGE_ORDER } from '../constants/stages.js';
import { config } from '../config/env.js';

export async function getOrCreateProgress(researcherId) {
  let progress = await ResearchProgress.findOne({ researcher: researcherId });
  if (!progress) {
    progress = await ResearchProgress.create({
      researcher: researcherId,
      current_stage_index: 0,
      template_urls: { proposal: config.proposalTemplateUrl || '' },
    });
  } else if (!progress.template_urls?.proposal && config.proposalTemplateUrl) {
    progress.template_urls = progress.template_urls || {};
    progress.template_urls.proposal = config.proposalTemplateUrl;
    await progress.save();
  }
  // If still no proposal template URL on record, try to fetch latest from templates collection
  if (!progress.template_urls?.proposal) {
    try {
      const latest = await DocumentTemplate.findOne({ type: /proposal/i }).sort({ version: -1, created_at: -1 });
      if (latest?.url) {
        progress.template_urls = progress.template_urls || {};
        progress.template_urls.proposal = latest.url;
        await progress.save();
      }
    } catch {}
  }
  return progress;
}

export function isStageUnlocked(progress, stageIndex) {
  if (stageIndex < 0 || stageIndex >= STAGE_ORDER.length) return false;
  if (stageIndex < progress.current_stage_index) {
    return true;
  }
  if (stageIndex > progress.current_stage_index) {
    return false;
  }
  if (stageIndex === 0 && progress.resubmit_until) {
    if (dayjs().isAfter(dayjs(progress.resubmit_until))) {
      return false;
    }
  }
  return true;
}

export function getStageStatus(progress, stageIndex) {
  if (stageIndex < progress.current_stage_index) return 'completed';
  if (stageIndex === progress.current_stage_index) {
    if (stageIndex === 0 && progress.resubmit_until && dayjs().isBefore(dayjs(progress.resubmit_until))) {
      const days = dayjs(progress.resubmit_until).diff(dayjs(), 'day');
      return { state: 'resubmit', daysLeft: Math.max(days, 0) };
    }
    return 'current';
  }
  return 'locked';
}

export async function advanceProgress(progress, stageIndex) {
  if (stageIndex >= progress.current_stage_index && stageIndex + 1 <= STAGE_ORDER.length) {
    progress.current_stage_index = Math.max(progress.current_stage_index, stageIndex + 1);
    progress.resubmit_until = null;
    await progress.save();
  }
}

export async function markSynopsisRejected(progress) {
  progress.current_stage_index = 0;
  progress.resubmit_until = dayjs().add(7, 'day').toDate();
  await progress.save();
}

export function getTemplateUrls(progress) {
  return {
    proposal: progress.template_urls?.proposal || config.proposalTemplateUrl || '',
  };
}
