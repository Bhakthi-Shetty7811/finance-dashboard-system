import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import RecordModal from '../components/RecordModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['','Salary','Rent','Groceries','Utilities','Travel','Freelance','Electronics','Dining','Other'];
const fmt = v => `₹${Number(v).toLocaleString('en-IN')}`;

const Records = () => {
  const { user } = useAuth();
  const [records,    setRecords]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null);
  const [filters,    setFilters]    = useState({ page:1, limit:10, type:'', category:'', search:'' });

  const canCreate = ['analyst','admin'].includes(user?.role);
  const canEdit   = user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      const res = await api.get('/api/records', { params });
      setRecords(res.data.data || []);
      setPagination(res.data.meta || {});
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/api/records/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch { toast.error('Delete failed'); }
  };

  const setFilter = e => setFilters(f => ({ ...f, [e.target.name]: e.target.value, page: 1 }));

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={s.pageTitle}>Financial Records</h1>
            <p style={s.pageSub}>
              {pagination.total || 0} total records
              {!canCreate && <span style={s.roleNote}> · View only</span>}
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setModal('create')} style={s.addBtn}>+ New Record</button>
          )}
        </div>

        {/* Filters */}
        <div style={s.filterBar}>
          <input name="search" placeholder="🔍  Search notes or category..."
            value={filters.search} onChange={setFilter} style={s.searchInput} />
          <select name="type" value={filters.type} onChange={setFilter} style={s.select}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select name="category" value={filters.category} onChange={setFilter} style={s.select}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Date','Category','Type','Amount','Notes', canEdit || canDelete ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={s.empty}>Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} style={s.empty}>No records found</td></tr>
              ) : records.map(r => (
                <tr key={r.id} style={s.tr}>
                  <td style={s.td}>{r.date?.slice(0,10)}</td>
                  <td style={s.td}>{r.category}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: r.type==='income' ? '#14532d' : '#450a0a', color: r.type==='income' ? '#4ade80' : '#f87171' }}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight:'600', color: r.type==='income' ? '#4ade80' : '#f87171' }}>
                    {r.type==='income' ? '+' : '-'}{fmt(r.amount)}
                  </td>
                  <td style={{ ...s.td, color:'#64748b', fontSize:'13px', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.notes || '—'}
                  </td>
                  {(canEdit || canDelete) && (
                    <td style={s.td}>
                      {canEdit   && <button onClick={() => setModal(r)} style={s.editBtn}>Edit</button>}
                      {canDelete && <button onClick={() => handleDelete(r.id)} style={s.delBtn}>Delete</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div style={s.pagination}>
            <button disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({...f, page: f.page - 1}))} style={s.pageBtn}>
              ← Prev
            </button>
            <span style={s.pageInfo}>Page {filters.page} of {pagination.total_pages}</span>
            <button disabled={filters.page >= pagination.total_pages}
              onClick={() => setFilters(f => ({...f, page: f.page + 1}))} style={s.pageBtn}>
              Next →
            </button>
          </div>
        )}
      </div>

      {modal && (
        <RecordModal
          record={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchRecords}
        />
      )}
    </Layout>
  );
};

const s = {
  pageTitle:   { fontSize: '22px', fontWeight: '700', color: '#f1f5f9' },
  pageSub:     { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  roleNote:    { color: '#475569' },
  addBtn:      { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
  filterBar:   { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '220px', padding: '9px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#e2e8f0', outline: 'none' },
  select:      { padding: '9px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#e2e8f0', outline: 'none', cursor: 'pointer' },
  tableWrap:   { background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#475569', borderBottom: '1px solid #0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#1e293b' },
  tr:          { borderBottom: '1px solid #0f172a', transition: 'background 0.1s' },
  td:          { padding: '12px 16px', fontSize: '14px', color: '#cbd5e1' },
  empty:       { padding: '48px', textAlign: 'center', color: '#475569', fontSize: '14px' },
  badge:       { padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  editBtn:     { marginRight: '8px', padding: '4px 12px', background: '#1d4ed820', color: '#60a5fa', border: '1px solid #1d4ed840', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
  delBtn:      { padding: '4px 12px', background: '#dc262620', color: '#f87171', border: '1px solid #dc262640', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
  pagination:  { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  pageBtn:     { padding: '8px 18px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#e2e8f0' },
  pageInfo:    { fontSize: '13px', color: '#64748b' },
};

export default Records;