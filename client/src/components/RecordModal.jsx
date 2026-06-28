import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Salary','Rent','Groceries','Utilities','Travel','Freelance','Electronics','Dining','Other'];

const RecordModal = ({ record, onClose, onSaved }) => {
  const isEdit = !!record?.id;
  const [form, setForm] = useState({
    amount:   record?.amount   || '',
    type:     record?.type     || 'income',
    category: record?.category || 'Salary',
    date:     record?.date?.slice(0,10) || new Date().toISOString().slice(0,10),
    notes:    record?.notes    || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) { await api.patch(`/api/records/${record.id}`, form); toast.success('Record updated'); }
      else        { await api.post('/api/records', form);               toast.success('Record created'); }
      onSaved(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>{isEdit ? 'Edit Record' : 'New Record'}</h2>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Type</label>
              <div style={s.typeToggle}>
                {['income','expense'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({...f, type: t}))}
                    style={{ ...s.typeBtn, background: form.type===t ? (t==='income' ? '#14532d' : '#450a0a') : '#0f172a',
                      color: form.type===t ? (t==='income' ? '#4ade80' : '#f87171') : '#64748b',
                      border: `1px solid ${form.type===t ? (t==='income' ? '#4ade8040' : '#f8717140') : '#334155'}` }}>
                    {t==='income' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Amount</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange}
                style={s.input} required min="0.01" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={s.input}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} style={s.input} required />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Notes <span style={{ color:'#475569', fontWeight:'400' }}>(optional)</span></label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              style={{ ...s.input, height:'80px', resize:'vertical' }} placeholder="Add a note..." />
          </div>

          <div style={s.btnRow}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(2px)' },
  modal:     { background:'#1e293b', borderRadius:'14px', padding:'28px', width:'480px', maxWidth:'95vw', border:'1px solid #334155' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  title:     { fontSize:'17px', fontWeight:'700', color:'#f1f5f9', margin:0 },
  closeBtn:  { background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'18px', padding:'4px' },
  row:       { display:'flex', gap:'16px', marginBottom:'0' },
  field:     { flex:1, marginBottom:'16px' },
  label:     { display:'block', fontSize:'11px', fontWeight:'700', color:'#64748b', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' },
  input:     { width:'100%', padding:'9px 12px', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', fontSize:'14px', color:'#f1f5f9', outline:'none', boxSizing:'border-box' },
  typeToggle:{ display:'flex', gap:'8px' },
  typeBtn:   { flex:1, padding:'8px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', transition:'all 0.15s' },
  btnRow:    { display:'flex', gap:'12px', marginTop:'8px', justifyContent:'flex-end' },
  cancelBtn: { padding:'9px 20px', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', cursor:'pointer', fontSize:'14px', color:'#94a3b8' },
  saveBtn:   { padding:'9px 24px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'14px' },
};

export default RecordModal;