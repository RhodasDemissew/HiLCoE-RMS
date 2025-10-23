import { activityLogService } from '../services/activityLog.service.js';

export const activityLogController = {
  async getActivityLog(req, res) {
    try {
      const { limit = 50, page = 1, type = 'all' } = req.query;
      const result = await activityLogService.getActivityLog({ limit, page, type });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getRecentActivity(req, res) {
    try {
      const { limit = 10 } = req.query;
      const activities = await activityLogService.getRecentActivity({ limit });
      res.json({ activities });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
