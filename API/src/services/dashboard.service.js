import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { StudentVerification } from '../models/StudentVerification.js';
import { Role } from '../models/Role.js';
import { StageSubmission } from '../models/StageSubmission.js';
import { STAGE_ORDER } from '../constants/stages.js';
import { activityLogService } from './activityLog.service.js';

export const dashboardService = {
  async getStatistics() {
    try {
      // Get role IDs for researchers and supervisors
      const [researcherRole, supervisorRole] = await Promise.all([
        Role.findOne({ name: /researcher/i }),
        Role.findOne({ name: /supervisor/i })
      ]);

      // Count verified researchers (users with researcher role and verified_at field)
      const verifiedResearchersCount = await User.countDocuments({
        role: researcherRole?._id,
        verified_at: { $ne: null },
        status: 'active'
      });

      // Count supervisors (users with supervisor role and active status)
      const supervisorsCount = await User.countDocuments({
        role: supervisorRole?._id,
        status: 'active'
      });

      // Count active research projects (projects with active status)
      const activeResearchCount = await Project.countDocuments({
        status: 'active'
      });

      // Get monthly trends (counts for current month vs previous month)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [currentMonthResearchers, previousMonthResearchers] = await Promise.all([
        User.countDocuments({
          role: researcherRole?._id,
          verified_at: { $ne: null },
          status: 'active',
          created_at: { $gte: currentMonthStart }
        }),
        User.countDocuments({
          role: researcherRole?._id,
          verified_at: { $ne: null },
          status: 'active',
          created_at: { $gte: previousMonthStart, $lt: currentMonthStart }
        })
      ]);

      const [currentMonthSupervisors, previousMonthSupervisors] = await Promise.all([
        User.countDocuments({
          role: supervisorRole?._id,
          status: 'active',
          created_at: { $gte: currentMonthStart }
        }),
        User.countDocuments({
          role: supervisorRole?._id,
          status: 'active',
          created_at: { $gte: previousMonthStart, $lt: currentMonthStart }
        })
      ]);

      const [currentMonthProjects, previousMonthProjects] = await Promise.all([
        Project.countDocuments({
          status: 'active',
          created_at: { $gte: currentMonthStart }
        }),
        Project.countDocuments({
          status: 'active',
          created_at: { $gte: previousMonthStart, $lt: currentMonthStart }
        })
      ]);

      // Get recent researcher activity for dashboard
      let recentActivity = [];
      try {
        const result = await activityLogService.getActivityLog({ limit: 5, page: 1, type: 'researcher' });
        recentActivity = result.activities;
      } catch (error) {
        console.warn('Failed to fetch recent activity for dashboard:', error);
        // Continue without recent activity
      }

      return {
        researchers: {
          total: verifiedResearchersCount,
          trend: currentMonthResearchers - previousMonthResearchers
        },
        supervisors: {
          total: supervisorsCount,
          trend: currentMonthSupervisors - previousMonthSupervisors
        },
        activeResearch: {
          total: activeResearchCount,
          trend: currentMonthProjects - previousMonthProjects
        },
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  },

  async getSubmissionsByStage() {
    try {
      // Get submission counts for each stage
      const stageCounts = await StageSubmission.aggregate([
        {
          $group: {
            _id: '$stage_index',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Create a map of stage index to count
      const stageCountMap = {};
      stageCounts.forEach(item => {
        stageCountMap[item._id] = item.count;
      });

      // Map to stage names with counts
      const submissionsByStage = STAGE_ORDER.map((stageName, index) => ({
        stage: stageName,
        count: stageCountMap[index] || 0
      }));

      return submissionsByStage;
    } catch (error) {
      console.error('Error fetching submissions by stage:', error);
      throw new Error('Failed to fetch submissions by stage');
    }
  }
};
