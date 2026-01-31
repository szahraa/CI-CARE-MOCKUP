import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/pasien', label: 'Pasien', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/jadwal', label: 'Jadwal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/rekam-medis', label: 'Rekam Medis', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/analitik', label: 'Analitik', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  ];

  const quickActions = [
    { label: 'Pasien Baru', color: 'blue', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', path: '/pasien?new=1' },
    { label: 'Resep Cepat', color: 'green', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/rekam-medis?prescription=1' },
    { label: 'Template', color: 'purple', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', path: '/rekam-medis?template=1' },
    { label: 'Jadwal', color: 'orange', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/jadwal' },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-brand">
          <div className="header-logo">
            <svg viewBox="0 0 40 40" fill="none"><path d="M8 20 L14 14 L20 20 L26 12 L32 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
          </div>
          <div>
            <h1 className="header-title">CI-CARE</h1>
            <p className="header-subtitle">Smart Healthcare System</p>
          </div>
        </div>
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input type="search" placeholder="Cari pasien, rekam medis, atau obat..." />
        </div>
        <div className="header-actions">
          <button type="button" className="icon-btn" title="Notifikasi">🔔</button>
          <div className="header-user">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Dokter Umum'}</span>
          </div>
          <button type="button" className="header-avatar-btn" onClick={() => { if (window.confirm('Keluar dari CI-CARE?')) { logout(); navigate('/login'); } }} title={`${user?.name} - Keluar`}>
            <span className="header-avatar">{initials}</span>
          </button>
        </div>
      </header>

      <aside className="layout-sidebar">
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-quick">
          <span className="quick-label">AKSI CEPAT</span>
          {quickActions.map(({ label, color, icon, path }) => (
            <button
              key={label}
              type="button"
              className={`quick-btn quick-${color}`}
              onClick={() => navigate(path)}
            >
              <svg className="quick-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
