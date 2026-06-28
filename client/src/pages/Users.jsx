import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const roleColor = {
  admin:   { bg: '#450a0a', text: '#f87171' },
  analyst: { bg: '#451a03', text: '#fb923c' },
  viewer:  { bg: '#172554', text: '#60a5fa' },
};

const Users = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      setUsers(res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (id, role) => {
    try { await api.patch(`/api/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const toggleStatus = async (id, current) => {
    const status = current === 'active' ? 'inactive' : 'active';
    try { await api.patch(`/api/users/${id}/status`, { status }); toast.success(`User ${status}`); fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const deleteUser = async id => {
    if (!window.confirm('Permanently delete this user?')) return;
    try { await api.delete(`/api/users/${id}`); toast.success('User deleted'); fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9' }}>User Management</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{users.length} users in system</p>
        </div>

        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['User','Email','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={s.empty}>Loading...</td></tr>
              ) : users.map(u => {
                const rc = roleColor[u.role] || roleColor.viewer;
                return (
                  <tr key={u.id} style={s.tr}>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={s.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: '13px' }}>{u.email}</td>
                    <td style={s.td}>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        style={{ ...s.roleSelect, background: rc.bg, color: rc.text, borderColor: rc.text + '40' }}>
                        <option value="viewer">viewer</option>
                        <option value="analyst">analyst</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, background: u.status==='active' ? '#14532d' : '#450a0a', color: u.status==='active' ? '#4ade80' : '#f87171' }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#64748b', fontSize: '13px' }}>{u.created_at?.slice(0,10)}</td>
                    <td style={s.td}>
                      <button onClick={() => toggleStatus(u.id, u.status)}
                        style={{ ...s.actionBtn, color: u.status==='active' ? '#f87171' : '#4ade80' }}>
                        {u.status==='active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => deleteUser(u.id)} style={{ ...s.actionBtn, color: '#f87171' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const s = {
  tableWrap:   { background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', borderBottom: '1px solid #0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tr:          { borderBottom: '1px solid #0f172a' },
  td:          { padding: '13px 16px', fontSize: '14px', color: '#cbd5e1' },
  empty:       { padding: '48px', textAlign: 'center', color: '#475569', fontSize: '14px' },
  userCell:    { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:      { width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  roleSelect:  { padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid', cursor: 'pointer', outline: 'none' },
  statusBadge: { padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  actionBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', marginRight: '12px', padding: '4px 0' },
};

export default Users;