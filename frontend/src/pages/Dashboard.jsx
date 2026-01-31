import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { patients, appointments, getStats } = useData();
  const location = useLocation();

  // Get email from login page navigation state
  const displayEmail = location.state?.email || user?.email || '';

  const stats = getStats();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const userName = user?.name?.split(' ').slice(0, 2).join(' ') || displayEmail?.split('@')[0] || 'User';

  const statCards = [
    { label: 'Total Pasien', value: stats.totalPatients, sub: '+12%', subColor: 'green', icon: 'people', bg: 'var(--color-primary-light)' },
    { label: 'Pasien Selesai', value: stats.completedToday, sub: '5 hari ini', icon: 'check', bg: 'var(--color-green-light)' },
    { label: 'Pasien Antri', value: stats.inQueue, sub: 'Menunggu', subColor: 'orange', icon: 'clock', bg: 'var(--color-orange-light)' },
    { label: 'Jadwal Temu', value: stats.appointmentsToday, sub: 'Hari ini', icon: 'cal', bg: 'var(--color-purple-light)' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>{greeting()}, {userName} 👋</h2>
        {displayEmail && <p className="dashboard-email">{displayEmail}</p>}
      </div>

      <div className="stat-cards">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg }}>
              {card.icon === 'people' && <span>👥</span>}
              {card.icon === 'check' && <span>✓</span>}
              {card.icon === 'clock' && <span>🕐</span>}
              {card.icon === 'cal' && <span>📅</span>}
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
              <span className={`stat-sub ${card.subColor ? `stat-${card.subColor}` : ''}`}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card schedule-card">
          <div className="card-head">
            <h3>Jadwal Hari Ini</h3>
            <span className="card-icon">📅</span>
          </div>
          <ul className="schedule-list">
            {appointments.length === 0 ? (
              <li className="empty-state">Belum ada jadwal. <Link to="/jadwal">Tambah jadwal baru</Link></li>
            ) : (
              appointments.slice(0, 5).map((apt) => (
                <li key={apt.id} className="schedule-item">
                  <span className="schedule-time">{apt.scheduled_at?.includes(' ') ? apt.scheduled_at.split(' ')[1] : apt.scheduled_at}</span>
                  <div className="schedule-info">
                    <strong>{apt.patient_name}</strong>
                    <span>{apt.type}</span>
                  </div>
                  <span className={`badge badge-${apt.status === 'Menunggu' ? 'orange' : apt.status === 'Selesai' ? 'green' : 'gray'}`}>{apt.status}</span>
                </li>
              ))
            )}
          </ul>
          <Link to="/jadwal" className="card-link">Lihat Semua Jadwal</Link>
        </div>

        <div className="card patients-card">
          <div className="card-head">
            <h3>Pasien Terkini</h3>
            <span className="card-icon">👥</span>
          </div>
          <ul className="patients-list">
            {patients.length === 0 ? (
              <li className="empty-state">Belum ada pasien. <Link to="/pasien?new=1">Tambah pasien baru</Link></li>
            ) : (
              patients.slice(0, 5).map((p) => (
                <li key={p.id} className="patient-item">
                  <div className="patient-avatar">{p.name?.charAt(0) || '?'}</div>
                  <div className="patient-info">
                    <strong>{p.name}</strong>
                    <span className="patient-meta">• {p.condition || 'Tidak ada kondisi'}</span>
                    <span className="patient-visit">Kunjungan terakhir: {p.last_visit || '-'}</span>
                  </div>
                  <span className={`badge badge-status badge-${p.status === 'Stabil' ? 'green' : p.status === 'Monitoring' ? 'yellow' : 'blue'}`}>{p.status}</span>
                  <Link to={`/pasien?id=${p.id}`} className="patient-arrow">→</Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
