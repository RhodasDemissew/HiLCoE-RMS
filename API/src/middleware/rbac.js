export function requireRole(...roles) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ error: 'Forbidden' });
    if (!allowed.has(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

