const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');
const { unauthorized, forbidden } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return unauthorized(res);

    let decoded;
    try {
      decoded = verifyToken(header.split(' ')[1]);
    } catch (e) {
      return unauthorized(res, e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
    }

    const { rows } = await query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!rows.length) return unauthorized(res, 'User not found');
    if (rows[0].status === 'inactive') return forbidden(res, 'Account deactivated');

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return forbidden(res, `Requires role: ${roles.join(' or ')}`);
  }
  next();
};

module.exports = { authenticate, authorize };