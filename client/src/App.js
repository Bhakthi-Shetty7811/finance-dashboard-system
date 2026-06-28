import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records   from './pages/Records';
import Users     from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right"
          toastOptions={{ style: { background:'#1e293b', color:'#f1f5f9', border:'1px solid #334155' } }} />
        <Routes>
          <Route path="/login"     element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/records"   element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/users"     element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
