import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: '▦',
  records:   '≡',
  users:     '◎',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleColor = {
    admin:   { bg: '#fef2f2', text: '#dc2626' },
    analyst: { bg: '#fffbeb', text: '#d97706' },
    viewer:  { bg: '#eff6ff', text: '#2563eb' },
  };
  const rc = roleColor[user?.role] || roleColor.viewer;

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    color: isActive ? '#fff' : '#94a3b8',
    background: isActive ? '#3b82f6' : 'transparent',
    transition: 'all 0.15s',
  });

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>💰</span>
        <span style={s.logoText}>FinanceOS</span>
      </div>

      <nav style={s.nav}>
        <p style={s.navLabel}>MENU</p>
        <NavLink to="/dashboard" style={linkStyle}>
          <span>{icons.dashboard}</span> Dashboard
        </NavLink>
        <NavLink to="/records" style={linkStyle}>
          <span>{icons.records}</span> Records
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" style={linkStyle}>
            <span>{icons.users}</span> Users
          </NavLink>
        )}
      </nav>

      <div style={s.bottom}>
        <div style={s.userCard}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <p style={s.userName}>{user?.name}</p>
            <span style={{ ...s.roleBadge, background: rc.bg, color: rc.text }}>
              {user?.role}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>
          ⎋ Logout
        </button>
      </div>
    </aside>
  );
};

const s = {
  sidebar:   { width: '220px', minHeight: '100vh', background: '#1e293b', display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'fixed', left: 0, top: 0, borderRight: '1px solid #334155' },
  logo:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px', marginBottom: '28px' },
  logoIcon:  { fontSize: '22px' },
  logoText:  { fontSize: '18px', fontWeight: '700', color: '#f1f5f9' },
  nav:       { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navLabel:  { fontSize: '11px', color: '#475569', fontWeight: '600', letterSpacing: '0.08em', margin: '0 6px 8px' },
  bottom:    { borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  userCard:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 6px' },
  avatar:    { width: '34px', height: '34px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#fff', flexShrink: 0 },
  userInfo:  { display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' },
  userName:  { fontSize: '13px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge: { fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '999px', width: 'fit-content', textTransform: 'uppercase' },
  logoutBtn: { background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', textAlign: 'left' },
};

export default Sidebar;