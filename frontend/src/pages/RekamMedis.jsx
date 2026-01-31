import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RekamMedis.css';

export default function RekamMedis() {
  const { authFetch } = useAuth();
  const [searchParams] = useSearchParams();
  const showPrescription = searchParams.get('prescription') === '1';
  const showTemplate = searchParams.get('template') === '1';
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(showPrescription || showTemplate);
  const [form, setForm] = useState({ patient_id: '', notes: '', prescription: '' });

  useEffect(() => {
    authFetch('/medical-records').then(r => r.json()).then(setRecords).catch(() => setRecords([]));
    authFetch('/patients').then(r => r.json()).then(setPatients).catch(() => setPatients([])).finally(() => setLoading(false));
  }, [authFetch]);

  const openModal = () => { setModalOpen(true); setForm({ patient_id: '', notes: '', prescription: '' }); };

  return (
    <div className="page rekam-page">
      <div className="page-header">
        <h1>Rekam Medis</h1>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          + Rekam Baru / Resep Cepat
        </button>
      </div>

      <div className="card table-card">
        {loading ? (
          <p className="muted">Memuat...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pasien</th>
                <th>Catatan</th>
                <th>Resep</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="muted">Belum ada rekam medis. Gunakan &quot;Resep Cepat&quot; atau &quot;Template&quot; di Aksi Cepat.</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                    <td><strong>{r.patient_name}</strong></td>
                    <td>{r.notes || '-'}</td>
                    <td>{r.prescription || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{showTemplate ? 'Template Rekam Medis' : 'Resep Cepat / Rekam Baru'}</h2>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }}>
              <label>Pasien</label>
              <select
                value={form.patient_id}
                onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
              >
                <option value="">Pilih pasien</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label>Catatan</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Catatan pemeriksaan..."
              />
              <label>Resep</label>
              <textarea
                rows={3}
                value={form.prescription}
                onChange={e => setForm(f => ({ ...f, prescription: e.target.value }))}
                placeholder="Obat dan dosis..."
              />
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
