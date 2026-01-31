import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Jadwal.css';

export default function Jadwal() {
  const { authFetch } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week

  useEffect(() => {
    authFetch('/appointments').then(r => r.json()).then(setAppointments).catch(() => setAppointments([])).finally(() => setLoading(false));
  }, [authFetch]);

  const statusClass = (s) => s === 'Menunggu' ? 'orange' : s === 'Selesai' ? 'green' : 'gray';

  return (
    <div className="page jadwal-page">
      <div className="page-header">
        <h1>Jadwal</h1>
        <div className="filter-tabs">
          {['all', 'today', 'week'].map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Semua' : f === 'today' ? 'Hari Ini' : 'Minggu Ini'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Memuat jadwal...</p>
        ) : (
          <ul className="jadwal-list">
            {appointments.length === 0 ? (
              <li className="empty-state">Belum ada jadwal. Gunakan tombol &quot;Jadwal&quot; di Aksi Cepat untuk menambah.</li>
            ) : (
              appointments.map((apt) => (
                <li key={apt.id} className="jadwal-row">
                  <span className="jadwal-time">{apt.scheduled_at?.includes(' ') ? apt.scheduled_at.split(' ')[1] : apt.scheduled_at}</span>
                  <div className="jadwal-detail">
                    <strong>{apt.patient_name}</strong>
                    <span>{apt.type}</span>
                  </div>
                  <span className={`badge badge-${statusClass(apt.status)}`}>{apt.status}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
