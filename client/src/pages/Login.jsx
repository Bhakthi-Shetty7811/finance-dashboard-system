import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.data.user, res.data.data.token);
      toast.success(`Welcome, ${res.data.data.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = email => setForm({ email, password: 'Password@123' });

  const demos = [
    { label: 'Admin',   email: 'admin@finance.dev',   desc: 'Full access' },
    { label: 'Analyst', email: 'analyst@finance.dev', desc: 'Create records' },
    { label: 'Viewer',  email: 'viewer@finance.dev',  desc: 'Read only' },
  ];

  return (
    <div style={s.page}>
      <div style={s.left}>
        <h2 style={s.heading}>Role-based finance<br />management system</h2>
        <p style={s.sub}>Built with Node.js, Express & PostgreSQL</p>
        <div style={s.features}>
          {['Three access levels: Admin, Analyst, Viewer', 'Full CRUD with audit-safe soft delete', 'Live analytics: trends, categories, net balance', 'JWT auth with per request access control'].map(f => (
            <div key={f} style={s.feature}>
              <span style={s.check}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Sign in</h2>
          <p style={s.cardSub}>Try a role instantly</p>

          <div style={s.demoRow}>
            {demos.map(d => (
              <button key={d.email} onClick={() => fillDemo(d.email)} style={s.demoChip}>
                <span style={s.demoLabel}>{d.label}</span>
                <span style={s.demoDesc}>{d.desc}</span>
              </button>
            ))}
          </div>

          <div style={s.divider}><span style={s.dividerText}>or sign in with your account</span></div>

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} style={s.input}
                placeholder="admin@finance.dev" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} style={s.input}
                placeholder="••••••••" required />
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const s = {
  page:      { display: 'flex', minHeight: '100vh', background: '#0f172a' },
  left:      { flex: 1, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  right:     { width: '440px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', borderLeft: '1px solid #334155' },
  brand:     { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
  brandIcon: { fontSize: '28px' },
  brandName: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9' },
  heading:   { fontSize: '36px', fontWeight: '700', color: '#f1f5f9', lineHeight: '1.25', marginBottom: '16px' },
  sub:       { fontSize: '15px', color: '#64748b', marginBottom: '40px' },
  features:  { display: 'flex', flexDirection: 'column', gap: '12px' },
  feature:   { fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' },
  check:     { color: '#22c55e', fontWeight: '700' },
  card:      { width: '100%', maxWidth: '360px' },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' },
  cardSub:   { fontSize: '13px', color: '#64748b', marginBottom: '24px' },
  demoRow:   { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
  demoChip:  { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' },
  demoLabel: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0' },
  demoDesc:  { fontSize: '12px', color: '#64748b' },
  divider:   { textAlign: 'center', position: 'relative', margin: '20px 0', borderTop: '1px solid #334155' },
  dividerText:{ background: '#1e293b', padding: '0 12px', fontSize: '12px', color: '#64748b', position: 'relative', top: '-10px' },
  field:     { marginBottom: '16px' },
  label:     { display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:     { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#f1f5f9', outline: 'none' },
  btn:       { width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
};

export default Login;