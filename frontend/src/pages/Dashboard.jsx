import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    authFetch('/dashboard/stats').then(r => r.json()).then(setStats).catch(() => setStats({
      totalPatients: 234, completedToday: 18, inQueue: 3, appointmentsToday: 8,
    }));
    authFetch('/appointments').then(r => r.json()).then(setAppointments).catch(() => setAppointments([]));
    authFetch('/patients').then(r => r.json()).then(setPatients).catch(() => setPatients([]));
  }, [authFetch]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const statCards = stats ? [
    { label: 'Total Pasien', value: stats.totalPatients, sub: '+12%', subColor: 'green', icon: 'people', bg: 'var(--color-primary-light)' },
    { label: 'Pasien Selesai', value: stats.completedToday, sub: '5 hari ini', icon: 'check', bg: 'var(--color-green-light)' },
    { label: 'Pasien Antri', value: stats.inQueue, sub: 'Menunggu', subColor: 'orange', icon: 'clock', bg: 'var(--color-orange-light)' },
    { label: 'Jadwal Temu', value: stats.appointmentsToday, sub: 'Hari ini', icon: 'cal', bg: 'var(--color-purple-light)' },
  ] : [];

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h2>{greeting()}, {user?.name?.split(' ').slice(0, 2).join(' ') || 'User'} 👋</h2>
        <p>Anda memiliki {stats?.appointmentsToday ?? 8} pasien hari ini • {stats?.inQueue ?? 3} menunggu</p>
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
            {(appointments.length ? appointments.slice(0, 5) : [
              { scheduled_at: '09:00', patient_name: 'Budi Santoso', type: 'Kontrol Rutin', status: 'Menunggu' },
              { scheduled_at: '10:30', patient_name: 'Ani Rahayu', type: 'Konsultasi', status: 'Terjadwal' },
              { scheduled_at: '14:00', patient_name: 'Citra Dewi', type: 'Follow-up', status: 'Terjadwal' },
            ]).map((apt, i) => (
              <li key={i} className="schedule-item">
                <span className="schedule-time">{apt.scheduled_at?.includes(' ') ? apt.scheduled_at.split(' ')[1] : apt.scheduled_at}</span>
                <div className="schedule-info">
                  <strong>{apt.patient_name}</strong>
                  <span>{apt.type}</span>
                </div>
                <span className={`badge badge-${apt.status === 'Menunggu' ? 'orange' : 'gray'}`}>{apt.status}</span>
              </li>
            ))}
          </ul>
          <Link to="/jadwal" className="card-link">Lihat Semua Jadwal</Link>
        </div>

        <div className="card patients-card">
          <div className="card-head">
            <h3>Pasien Terkini</h3>
            <span className="card-icon">👥</span>
          </div>
          <ul className="patients-list">
            {(patients.length ? patients.slice(0, 5) : [
              { name: 'Budi Santoso', condition: 'Diabetes Type 2', last_visit: '2 hari lalu', status: 'Stabil' },
              { name: 'Ani Rahayu', condition: 'Hipertensi', last_visit: '1 hari lalu', status: 'Monitoring' },
              { name: 'Citra Dewi', condition: 'Pemulihan Pasca Operasi', last_visit: '3 hari lalu', status: 'Pemulihan' },
            ]).map((p, i) => (
              <li key={i} className="patient-item">
                <div className="patient-avatar">{p.name?.charAt(0) || '?'}</div>
                <div className="patient-info">
                  <strong>{p.name}</strong>
                  <span className="patient-meta">• {p.condition}</span>
                  <span className="patient-visit">Kunjungan terakhir: {p.last_visit}</span>
                </div>
                <span className={`badge badge-status badge-${p.status === 'Stabil' ? 'green' : p.status === 'Monitoring' ? 'yellow' : 'blue'}`}>{p.status}</span>
                <Link to={`/pasien?id=${p.id}`} className="patient-arrow">→</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
