import { submissionsService } from '../services/submissions.service.js';

export const submissionsController = {
  async create(req, res) {
    try {
      const sub = await submissionsService.create(req.body, req.user.id);
      res.status(201).json(sub);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  async file(req, res) {
    try {
      const { file, stream } = await submissionsService.fileStream(req.params.id, req.params.index);
      res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
      stream.pipe(res);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

