import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Analitik.css';

export default function Analitik() {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    authFetch('/analytics/summary').then(r => r.json()).then(setData).catch(() => setData({
      visitsPerMonth: [120, 135, 142, 138, 155, 168],
      patientGrowth: 12,
      topConditions: ['Diabetes Type 2', 'Hipertensi', 'Pemulihan'],
    }));
  }, [authFetch]);

  const d = data || { visitsPerMonth: [], patientGrowth: 0, topConditions: [] };
  const maxVisit = Math.max(...d.visitsPerMonth, 1);

  return (
    <div className="page analitik-page">
      <div className="page-header">
        <h1>Analitik</h1>
      </div>

      <div className="analytics-grid">
        <div className="card">
          <h3>Kunjungan per Bulan</h3>
          <div className="chart-bars">
            {d.visitsPerMonth.map((v, i) => (
              <div key={i} className="bar-wrap">
                <div className="bar" style={{ height: `${(v / maxVisit) * 100}%` }} title={v} />
                <span className="bar-label">{['Jan','Feb','Mar','Apr','Mei','Jun'][i] || i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Pertumbuhan Pasien</h3>
          <p className="big-number green">+{d.patientGrowth}%</p>
          <p className="muted">Bulan ini dibanding bulan lalu</p>
        </div>
        <div className="card full-width">
          <h3>Kondisi Terbanyak</h3>
          <ul className="condition-list">
            {d.topConditions.map((c, i) => (
              <li key={i}>
                <span className="cond-badge">{i + 1}</span>
                <strong>{c}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
