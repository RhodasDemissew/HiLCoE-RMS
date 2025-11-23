import { usersService } from '../services/users.service.js';

export const usersController = {
  async list(_req, res) {
    const users = await usersService.list();
    res.json(users);
  },
  async create(req, res) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json(user);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },

  async updateProfile(req, res) {
    try {
      const user = await usersService.updateProfile(req.user.id, req.body);
      res.json(user);
    } catch (e) { 
      console.error('Profile update error:', e);
      res.status(400).json({ error: e.message }); 
    }
  },

  async updatePreferences(req, res) {
    try {
      const preferences = await usersService.updatePreferences(req.user.id, req.body);
      res.json(preferences);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },

  async getPreferences(req, res) {
    try {
      const preferences = await usersService.getPreferences(req.user.id);
      res.json(preferences);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      await usersService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

