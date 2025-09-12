export function buildQueryOptions(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const sort = query.sort || '-created_at';
  return { page, limit, skip, sort };
}