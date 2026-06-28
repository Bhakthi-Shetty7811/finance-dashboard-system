import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin:   '#ef4444',
    analyst: '#f59e0b',
    viewer:  '#3b82f6',
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>💰 Finance Dashboard</span>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/records"   style={styles.link}>Records</Link>
        {user?.role === 'admin' && (
          <Link to="/users" style={styles.link}>Users</Link>
        )}
      </div>
      <div style={styles.right}>
        <span style={{ ...styles.badge, background: roleBadgeColor[user?.role] }}>
          {user?.role}
        </span>
        <span style={styles.name}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1e293b', color:'#fff' },
  left:      { display:'flex', alignItems:'center', gap:'24px' },
  right:     { display:'flex', alignItems:'center', gap:'12px' },
  logo:      { fontWeight:'bold', fontSize:'18px', marginRight:'16px' },
  link:      { color:'#94a3b8', textDecoration:'none', fontSize:'14px' },
  badge:     { padding:'2px 10px', borderRadius:'999px', fontSize:'12px', color:'#fff', fontWeight:'bold' },
  name:      { fontSize:'14px', color:'#cbd5e1' },
  logoutBtn: { background:'#ef4444', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
};

export default Navbar;