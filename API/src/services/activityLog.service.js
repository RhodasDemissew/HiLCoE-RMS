import { StageSubmission } from '../models/StageSubmission.js';
import { Submission } from '../models/Submission.js';
import { Review } from '../models/Review.js';
import { Milestone } from '../models/Milestone.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

export const activityLogService = {
  async getActivityLog({ limit = 50, page = 1, type = 'all' } = {}) {
    try {
      const skip = (page - 1) * limit;
      const activities = [];

      // Get stage submissions activities (Researcher and Supervisor activities)
      if (type === 'all' || type === 'researcher' || type === 'supervisor') {
        const stageSubmissions = await StageSubmission.find({})
          .populate('researcher', 'name email')
          .populate('reviewer', 'name email')
          .sort({ created_at: -1 })
          .limit(limit)
          .skip(skip);

        for (const submission of stageSubmissions) {
          const researcherName = submission.researcher?.name || 'Unknown Researcher';
          const reviewerName = submission.reviewer?.name || 'Unknown Reviewer';
          
          // Add researcher submission activities
          if (type === 'all' || type === 'researcher') {
            activities.push({
              id: submission._id,
              type: 'stage_submission',
              date: submission.created_at,
              author: researcherName,
              action: 'Submitted Document',
              description: `Submitted ${submission.stage_key} - ${submission.title}`,
              status: submission.status,
              researcher: submission.researcher,
              reviewer: submission.reviewer,
              stage: submission.stage_key,
              title: submission.title
            });
          }

          // Add supervisor review activities
          if ((type === 'all' || type === 'supervisor') && submission.reviewed_at && submission.reviewer) {
            activities.push({
              id: `${submission._id}_review`,
              type: 'review',
              date: submission.reviewed_at,
              author: reviewerName,
              action: submission.status === 'approved' ? 'Approved Document' : 
                     submission.status === 'rejected' ? 'Rejected Document' : 
                     submission.status === 'needs_changes' ? 'Requested Changes' : 'Reviewed Document',
              description: `${submission.status === 'approved' ? 'Approved' : 
                           submission.status === 'rejected' ? 'Rejected' : 
                           submission.status === 'needs_changes' ? 'Requested changes for' : 'Reviewed'} ${submission.stage_key} by ${researcherName}`,
              status: submission.status,
              researcher: submission.researcher,
              reviewer: submission.reviewer,
              stage: submission.stage_key,
              title: submission.title
            });
          }
        }
      }

      // Get milestone activities with better data
      if (type === 'all' || type === 'milestone') {
        const milestones = await Milestone.find({})
          .populate('project', 'title researcher')
          .populate('approved_by', 'name email')
          .populate('project.researcher', 'name email')
          .sort({ created_at: -1 })
          .limit(limit)
          .skip(skip);

        for (const milestone of milestones) {
          const projectTitle = milestone.project?.title || 'Unknown Project';
          const approverName = milestone.approved_by?.name || 'System';
          const researcherName = milestone.project?.researcher?.name || 'Unknown Researcher';
          
          let action = 'Milestone Updated';
          let description = `${milestone.type} milestone for project: ${projectTitle}`;
          
          if (milestone.status === 'approved') {
            action = 'Approved Milestone';
            description = `Approved ${milestone.type} milestone for ${researcherName}'s project: ${projectTitle}`;
          } else if (milestone.status === 'scheduled') {
            action = 'Scheduled Milestone';
            description = `Scheduled ${milestone.type} milestone for ${researcherName}'s project: ${projectTitle}`;
          } else if (milestone.status === 'graded') {
            action = 'Graded Milestone';
            description = `Graded ${milestone.type} milestone for ${researcherName}'s project: ${projectTitle}`;
          }
          
          activities.push({
            id: milestone._id,
            type: 'milestone',
            date: milestone.created_at,
            author: approverName,
            action: action,
            description: description,
            status: milestone.status,
            milestone_type: milestone.type,
            project: milestone.project
          });
        }
      }


      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Get total counts for pagination
      const totalCounts = await Promise.all([
        StageSubmission.countDocuments(),
        Milestone.countDocuments()
      ]);
      const total = totalCounts.reduce((sum, count) => sum + count, 0);

      return {
        activities: activities.slice(0, limit),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw new Error('Failed to fetch activity log');
    }
  },

  async getRecentActivity({ limit = 10 } = {}) {
    try {
      const result = await this.getActivityLog({ limit, page: 1, type: 'all' });
      return result.activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }
};
