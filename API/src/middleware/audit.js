import { AuditLog } from '../models/AuditLog.js';

export function auditLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;
  res.on('finish', async () => {
    try {
      const duration_ms = Date.now() - start;
      const user = req.user ? { id: String(req.user.id), role: req.user.role, email: req.user.email } : null;
      await AuditLog.create({
        at: new Date(),
        method,
        path: originalUrl,
        status: res.statusCode,
        user,
        duration_ms
      });
    } catch {}
  });
  next();
}

