import { authService } from '../services/auth.service.js';

export const authController = {
  async login(req, res) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async register(req, res) {
    try {
      const result = await authService.register(req.body.name, req.body.email, req.body.student_id);
      const isProd = (process.env.NODE_ENV || 'development') === 'production';
      if (isProd) return res.status(201).json({ id: result.id, status: result.status });
      return res.status(201).json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async me(req, res) {
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.user.id).populate('role');
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role?.name });
  },
  async invite(req, res) {
    try {
      const result = await authService.invite(req.body.name, req.body.email, req.body.roleName);
      res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async activate(req, res) {
    try {
      const result = await authService.activate(req.body.token, req.body.password);
      res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async resetRequest(req, res) {
    try {
      const result = await authService.requestReset(req.body.email);
      const isProd = (process.env.NODE_ENV || 'development') === 'production';
      if (isProd) return res.json({ ok: true });
      return res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async resetConfirm(req, res) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
