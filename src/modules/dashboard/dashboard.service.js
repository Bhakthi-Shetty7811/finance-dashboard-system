const { query } = require('../../config/db');

// Scope records to user unless admin
const scopeClause = (user, startIndex = 1) => {
  if (user.role === 'admin') return { clause: '', params: [], next: startIndex };
  return { clause: `AND user_id = $${startIndex}`, params: [user.id], next: startIndex + 1 };
};

const getSummary = async (user) => {
  const { clause, params } = scopeClause(user);
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE -amount END), 0) AS net_balance,
      COUNT(*) AS total_records
    FROM financial_records
    WHERE is_deleted = FALSE ${clause}
  `, params);
  return rows[0];
};

const getByCategory = async (user) => {
  const { clause, params } = scopeClause(user);
  const { rows } = await query(`
    SELECT
      category,
      type,
      COALESCE(SUM(amount), 0) AS total,
      COUNT(*) AS count
    FROM financial_records
    WHERE is_deleted = FALSE ${clause}
    GROUP BY category, type
    ORDER BY total DESC
  `, params);
  return rows;
};

const getMonthlyTrends = async (user) => {
  const { clause, params } = scopeClause(user);
  const { rows } = await query(`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM financial_records
    WHERE is_deleted = FALSE
      AND date >= NOW() - INTERVAL '6 months'
      ${clause}
    GROUP BY month
    ORDER BY month ASC
  `, params);
  return rows;
};

const getRecentActivity = async (user, limit = 10) => {
  const { clause, params, next } = scopeClause(user);
  const { rows } = await query(`
    SELECT r.*, u.name AS created_by
    FROM financial_records r
    JOIN users u ON r.user_id = u.id
    WHERE r.is_deleted = FALSE ${clause}
    ORDER BY r.created_at DESC
    LIMIT $${next}
  `, [...params, limit]);
  return rows;
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecentActivity };