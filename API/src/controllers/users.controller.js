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
  }
};

