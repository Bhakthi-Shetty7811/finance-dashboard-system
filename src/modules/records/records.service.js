const { query } = require('../../config/db');

const buildFilterQuery = (filters, userId, isAdmin) => {
  const conditions = ['r.is_deleted = FALSE'];
  const params = [];
  let i = 1;

  // Non admins only see their own records
  if (!isAdmin) {
    conditions.push(`r.user_id = $${i++}`);
    params.push(userId);
  }

  if (filters.type)       { conditions.push(`r.type = $${i++}`);            params.push(filters.type); }
  if (filters.category)   { conditions.push(`r.category ILIKE $${i++}`);   params.push(`%${filters.category}%`); }
  if (filters.start_date) { conditions.push(`r.date >= $${i++}`);           params.push(filters.start_date); }
  if (filters.end_date)   { conditions.push(`r.date <= $${i++}`);           params.push(filters.end_date); }
  if (filters.search)     { conditions.push(`(r.notes ILIKE $${i++} OR r.category ILIKE $${i-1})`); params.push(`%${filters.search}%`); }

  return { where: conditions.join(' AND '), params, nextIndex: i };
};

const listRecords = async (filters, user) => {
  const isAdmin   = user.role === 'admin';
  const { where, params, nextIndex } = buildFilterQuery(filters, user.id, isAdmin);

  const sortCol   = ['date','amount','created_at'].includes(filters.sort_by) ? filters.sort_by : 'date';
  const sortDir   = filters.sort_order === 'asc' ? 'ASC' : 'DESC';
  const limit     = filters.limit  || 20;
  const offset    = ((filters.page || 1) - 1) * limit;

  const dataQuery = `
    SELECT r.*, u.name AS created_by_name
    FROM financial_records r
    JOIN users u ON r.user_id = u.id
    WHERE ${where}
    ORDER BY r.${sortCol} ${sortDir}
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) FROM financial_records r WHERE ${where}
  `;

  const [data, count] = await Promise.all([
    query(dataQuery, [...params, limit, offset]),
    query(countQuery, params),
  ]);

  return {
    records: data.rows,
    pagination: {
      total:       +count.rows[0].count,
      page:        +(filters.page || 1),
      limit:       +limit,
      total_pages: Math.ceil(count.rows[0].count / limit),
    },
  };
};

const getRecordById = async (id, user) => {
  const isAdmin = user.role === 'admin';
  const sql = isAdmin
    ? 'SELECT * FROM financial_records WHERE id=$1 AND is_deleted=FALSE'
    : 'SELECT * FROM financial_records WHERE id=$1 AND user_id=$2 AND is_deleted=FALSE';
  const params = isAdmin ? [id] : [id, user.id];
  const { rows } = await query(sql, params);
  return rows[0] || null;
};

const createRecord = async (data, userId) => {
  const { amount, type, category, date, notes } = data;
  const { rows } = await query(
    'INSERT INTO financial_records(user_id,amount,type,category,date,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [userId, amount, type, category, date, notes || null]
  );
  return rows[0];
};

const updateRecord = async (id, data, user) => {
  const existing = await getRecordById(id, user);
  if (!existing) { const e=new Error('Record not found'); e.statusCode=404; throw e; }

  // Only admin or the owner can update
  if (user.role !== 'admin' && existing.user_id !== user.id) {
    const e=new Error('Not authorized'); e.statusCode=403; throw e;
  }

  const fields  = Object.keys(data);
  const values  = Object.values(data);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  const { rows } = await query(
    `UPDATE financial_records SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0];
};

const deleteRecord = async (id, user) => {
  const existing = await getRecordById(id, user);
  if (!existing) { const e=new Error('Record not found'); e.statusCode=404; throw e; }

  // Soft delete
  await query('UPDATE financial_records SET is_deleted=TRUE WHERE id=$1', [id]);
  return true;
};

module.exports = { listRecords, getRecordById, createRecord, updateRecord, deleteRecord };