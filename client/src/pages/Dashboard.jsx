import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import api from '../api/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const fmt = v => `₹${Number(v).toLocaleString('en-IN')}`;

const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px 24px', flex: 1, border: `1px solid #334155`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: color }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</p>
        <p style={{ fontSize: '26px', fontWeight: '700', color: '#f1f5f9' }}>{fmt(value)}</p>
        {sub && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '24px', opacity: 0.6 }}>{icon}</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px 16px' }}>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill, fontSize: '13px', fontWeight: '600' }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [summary,  setSummary]  = useState(null);
  const [trends,   setTrends]   = useState([]);
  const [category, setCategory] = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, c, r] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/trends'),
          api.get('/api/dashboard/category'),
          api.get('/api/dashboard/recent'),
        ]);
        setSummary(s.data.data);
        setTrends(t.data.data);
        setCategory(c.data.data);
        setRecent(r.data.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Layout><div style={{ padding: '40px', color: '#64748b' }}>Loading...</div></Layout>;

  const netPositive = Number(summary?.net_balance) >= 0;

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '1100px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9' }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>All figures are system-wide across all users</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Total Income"   value={summary?.total_income   || 0} icon="↑" color="#22c55e" />
          <StatCard label="Total Expenses" value={summary?.total_expenses || 0} icon="↓" color="#ef4444" />
          <StatCard label="Net Balance"    value={summary?.net_balance    || 0} icon="≈" color={netPositive ? '#3b82f6' : '#f59e0b'}
            sub={netPositive ? 'Surplus' : 'Deficit'} />
        </div>

        {/* Chart */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Monthly Trends <span style={s.cardSub}>All time, grouped by month</span></h3>
          {trends.length === 0
            ? <p style={s.empty}>No trend data available</p>
            : <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '13px', color: '#94a3b8' }} />
                  <Bar dataKey="income"   name="Income"   fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          {/* Category */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>By Category</h3>
            {category.length === 0
              ? <p style={s.empty}>No data</p>
              : category.slice(0, 7).map((c, i) => (
                <div key={i} style={s.row}>
                  <div>
                    <span style={s.rowLabel}>{c.category}</span>
                    <span style={{ ...s.typePill, background: c.type === 'income' ? '#14532d' : '#450a0a', color: c.type === 'income' ? '#4ade80' : '#f87171' }}>
                      {c.type}
                    </span>
                  </div>
                  <span style={{ ...s.rowAmt, color: c.type === 'income' ? '#4ade80' : '#f87171' }}>
                    {fmt(c.total)}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Recent */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Recent Activity</h3>
            {recent.length === 0
              ? <p style={s.empty}>No recent activity</p>
              : recent.slice(0, 7).map((r, i) => (
                <div key={i} style={s.row}>
                  <div>
                    <span style={s.rowLabel}>{r.category}</span>
                    <span style={s.rowDate}>{r.date?.slice(0,10)}</span>
                  </div>
                  <span style={{ ...s.rowAmt, color: r.type === 'income' ? '#4ade80' : '#f87171' }}>
                    {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </Layout>
  );
};

const s = {
  card:      { background: '#1e293b', borderRadius: '12px', padding: '20px 24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' },
  cardSub:   { fontSize: '12px', color: '#64748b', fontWeight: '400', marginLeft: '8px' },
  empty:     { color: '#475569', fontSize: '14px', padding: '20px 0' },
  row:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #0f172a' },
  rowLabel:  { fontSize: '13px', color: '#e2e8f0', marginRight: '8px' },
  rowDate:   { fontSize: '12px', color: '#475569' },
  rowAmt:    { fontSize: '13px', fontWeight: '600' },
  typePill:  { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' },
};

export default Dashboard;