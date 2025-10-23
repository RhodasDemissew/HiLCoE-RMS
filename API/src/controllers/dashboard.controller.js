import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  async getStatistics(req, res) {
    try {
      const statistics = await dashboardService.getStatistics();
      res.json(statistics);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
