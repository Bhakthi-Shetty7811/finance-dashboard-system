const { query } = require('../../config/db');

const listUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const [data, count] = await Promise.all([
    query('SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    query('SELECT COUNT(*) FROM users'),
  ]);
  return {
    users: data.rows,
    pagination: { total: +count.rows[0].count, page: +page, limit: +limit, total_pages: Math.ceil(count.rows[0].count / limit) },
  };
};

const getUserById = async (id) => {
  const { rows } = await query('SELECT id,name,email,role,status,created_at FROM users WHERE id=$1', [id]);
  return rows[0] || null;
};

const updateRole = async (id, role, selfId) => {
  if (id === selfId) { const e=new Error('Cannot change your own role'); e.statusCode=400; throw e; }
  const { rows } = await query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role,status', [role, id]);
  if (!rows.length) { const e=new Error('User not found'); e.statusCode=404; throw e; }
  return rows[0];
};

const updateStatus = async (id, status, selfId) => {
  if (id === selfId) { const e=new Error('Cannot change your own status'); e.statusCode=400; throw e; }
  const { rows } = await query('UPDATE users SET status=$1 WHERE id=$2 RETURNING id,name,email,role,status', [status, id]);
  if (!rows.length) { const e=new Error('User not found'); e.statusCode=404; throw e; }
  return rows[0];
};

const updateProfile = async (id, name) => {
  const { rows } = await query('UPDATE users SET name=$1 WHERE id=$2 RETURNING id,name,email,role,status', [name, id]);
  return rows[0];
};

const deleteUser = async (id, selfId) => {
  if (id === selfId) { const e=new Error('Cannot delete yourself'); e.statusCode=400; throw e; }
  const { rows } = await query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
  if (!rows.length) { const e=new Error('User not found'); e.statusCode=404; throw e; }
  return true;
};

module.exports = { listUsers, getUserById, updateRole, updateStatus, updateProfile, deleteUser };