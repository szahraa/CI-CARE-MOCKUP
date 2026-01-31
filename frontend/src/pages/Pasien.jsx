import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './Pasien.css';

export default function Pasien() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const [searchParams] = useSearchParams();
  const showNew = searchParams.get('new') === '1';
  const [modalOpen, setModalOpen] = useState(showNew);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({ name: '', birth_date: '', condition: '', status: 'Stabil' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (showNew) {
      setModalOpen(true);
    }
  }, [showNew]);

  const openModal = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setForm({
        name: patient.name || '',
        birth_date: patient.birth_date || '',
        condition: patient.condition || '',
        status: patient.status || 'Stabil',
      });
    } else {
      setEditingPatient(null);
      setForm({ name: '', birth_date: '', condition: '', status: 'Stabil' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient(editingPatient.id, form);
    } else {
      addPatient(form);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
      deletePatient(id);
    }
  };

  const statusColors = { Stabil: 'green', Monitoring: 'yellow', Pemulihan: 'blue' };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page pasien-page">
      <div className="page-header">
        <h1>Pasien</h1>
        <div className="header-actions">
          <input
            type="search"
            placeholder="Cari pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Pasien Baru
          </button>
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tanggal Lahir</th>
              <th>Kondisi</th>
              <th>Status</th>
              <th>Kunjungan Terakhir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  {searchTerm ? 'Tidak ada pasien yang cocok dengan pencarian.' : 'Belum ada pasien. Klik "+ Pasien Baru" untuk menambah.'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => (
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
                  <td>
                    <div className="action-buttons">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingPatient ? 'Edit Pasien' : 'Pasien Baru'}</h2>
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
                <button type="submit" className="btn btn-primary">{editingPatient ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
