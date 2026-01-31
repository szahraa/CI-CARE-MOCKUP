import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pasien.css';

export default function Pasien() {
  const { authFetch } = useAuth();
  const [searchParams] = useSearchParams();
  const showNew = searchParams.get('new') === '1';
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(showNew);
  const [form, setForm] = useState({ name: '', birth_date: '', condition: '', status: 'Stabil' });

  useEffect(() => {
    authFetch('/patients').then(r => r.json()).then(data => { setPatients(data); setLoading(false); }).catch(() => setLoading(false));
  }, [authFetch]);

  const openModal = () => { setModalOpen(true); setForm({ name: '', birth_date: '', condition: '', status: 'Stabil' }); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const newPatient = await res.json();
      setPatients(prev => [newPatient, ...prev]);
      closeModal();
    } catch (err) {
      alert('Gagal menambah pasien.');
    }
  };

  const statusColors = { Stabil: 'green', Monitoring: 'yellow', Pemulihan: 'blue' };

  return (
    <div className="page pasien-page">
      <div className="page-header">
        <h1>Pasien</h1>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          + Pasien Baru
        </button>
      </div>

      <div className="card table-card">
        {loading ? (
          <p className="muted">Memuat...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>Kondisi</th>
                <th>Status</th>
                <th>Kunjungan Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-patient">
                      <span className="avatar-sm">{p.name?.charAt(0)}</span>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>{p.birth_date || '-'}</td>
                  <td>{p.condition || '-'}</td>
                  <td><span className={`badge badge-${statusColors[p.status] || 'gray'}`}>{p.status}</span></td>
                  <td>{p.last_visit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Pasien Baru</h2>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Nama Lengkap *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <label>Tanggal Lahir</label>
              <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
              <label>Kondisi</label>
              <input value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} placeholder="Contoh: Diabetes Type 2" />
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="Stabil">Stabil</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Pemulihan">Pemulihan</option>
              </select>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
