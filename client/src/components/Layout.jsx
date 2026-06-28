import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', background: '#0f172a' }}>
      {children}
    </main>
  </div>
);

export default Layout;