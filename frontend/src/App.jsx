import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pasien from './pages/Pasien';
import Jadwal from './pages/Jadwal';
import RekamMedis from './pages/RekamMedis';
import Analitik from './pages/Analitik';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Logout component that clears session and redirects to login
function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);
  
  return <div style={{ padding: 40, textAlign: 'center' }}>Logging out...</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pasien" element={<Pasien />} />
        <Route path="jadwal" element={<Jadwal />} />
        <Route path="rekam-medis" element={<RekamMedis />} />
        <Route path="analitik" element={<Analitik />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
