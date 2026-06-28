const { query } = require('../../config/db');

// Replace scopeClause usage — just remove it
const getSummary = async (user) => {
  const { rows } = await query(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE -amount END), 0) AS net_balance,
      COUNT(*) AS total_records
    FROM financial_records
    WHERE is_deleted = FALSE
  `);
  return rows[0];
};

const getByCategory = async (user) => {
  const { rows } = await query(`
    SELECT category, type,
      COALESCE(SUM(amount), 0) AS total,
      COUNT(*) AS count
    FROM financial_records
    WHERE is_deleted = FALSE
    GROUP BY category, type
    ORDER BY total DESC
  `);
  return rows;
};

const getMonthlyTrends = async (user) => {
  const { rows } = await query(`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM financial_records
    WHERE is_deleted = FALSE
      AND date >= NOW() - INTERVAL '48 months'
    GROUP BY month
    ORDER BY month ASC
  `);
  return rows;
};

const getRecentActivity = async (user, limit = 10) => {
  const { rows } = await query(`
    SELECT r.*, u.name AS created_by
    FROM financial_records r
    JOIN users u ON r.user_id = u.id
    WHERE r.is_deleted = FALSE
    ORDER BY r.created_at DESC
    LIMIT $1
  `, [limit]);
  return rows;
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecentActivity };