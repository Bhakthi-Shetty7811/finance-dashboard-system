const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { signToken } = require('../../utils/jwt');

const register = async ({ name, email, password, role }) => {
  const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length) {
    const err = new Error('Email already in use'); err.statusCode = 409; throw err;
  }
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    'INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,status,created_at',
    [name, email, hash, role]
  );
  return { user: rows[0], token: signToken({ id: rows[0].id, role: rows[0].role }) };
};

const login = async ({ email, password }) => {
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  if (!rows.length) { const e=new Error('Invalid credentials'); e.statusCode=401; throw e; }

  const user = rows[0];
  if (user.status === 'inactive') { const e=new Error('Account deactivated'); e.statusCode=403; throw e; }

  const match = await bcrypt.compare(password, user.password);
  if (!match) { const e=new Error('Invalid credentials'); e.statusCode=401; throw e; }

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: signToken({ id: user.id, role: user.role }) };
};

const getMe = async (id) => {
  const { rows } = await query(
    'SELECT id,name,email,role,status,created_at FROM users WHERE id=$1', [id]
  );
  return rows[0] || null;
};

module.exports = { register, login, getMe };