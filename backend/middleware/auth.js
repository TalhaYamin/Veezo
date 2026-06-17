const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'VEEZO2026';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'veezo-admin-token';

function requireAdmin(req, res, next) {
  const providedPassword = req.get('x-admin-password') || req.query.adminPassword;
  const authorization = req.get('authorization') || '';
  const bearerToken = authorization.startsWith('Bearer ') ? authorization.replace('Bearer ', '') : '';
  const headerToken = req.get('x-admin-token') || '';

  if (providedPassword === ADMIN_PASSWORD || bearerToken === ADMIN_TOKEN || headerToken === ADMIN_TOKEN) {
    return next();
  }

  return res.status(401).json({ message: 'Admin access denied. Correct password required.' });
}

module.exports = { requireAdmin, ADMIN_PASSWORD, ADMIN_TOKEN };
