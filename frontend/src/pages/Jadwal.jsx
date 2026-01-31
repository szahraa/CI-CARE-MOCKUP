import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import './Jadwal.css';

export default function Jadwal() {
  const { appointments, patients, addAppointment, updateAppointment, deleteAppointment } = useData();
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [form, setForm] = useState({ patient_id: '', scheduled_at: '', type: '', status: 'Terjadwal' });

  const openModal = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setForm({
        patient_id: appointment.patient_id?.toString() || '',
        scheduled_at: appointment.scheduled_at || '',
        type: appointment.type || '',
        status: appointment.status || 'Terjadwal',
      });
    } else {
      setEditingAppointment(null);
      setForm({ patient_id: '', scheduled_at: '', type: '', status: 'Terjadwal' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAppointment) {
      const patient = patients.find(p => p.id === parseInt(form.patient_id));
      updateAppointment(editingAppointment.id, {
        ...form,
        patient_name: patient?.name || editingAppointment.patient_name,
      });
    } else {
      addAppointment(form);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      deleteAppointment(id);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateAppointment(id, { status: newStatus });
  };

  const statusClass = (s) => s === 'Menunggu' ? 'orange' : s === 'Selesai' ? 'green' : s === 'Dibatalkan' ? 'red' : 'gray';

  return (
    <div className="page jadwal-page">
      <div className="page-header">
        <h1>Jadwal</h1>
        <div className="header-actions">
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
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Jadwal Baru
          </button>
        </div>
      </div>

      <div className="card">
        <ul className="jadwal-list">
          {appointments.length === 0 ? (
            <li className="empty-state">Belum ada jadwal. Klik &quot;+ Jadwal Baru&quot; untuk menambah.</li>
          ) : (
            appointments.map((apt) => (
              <li key={apt.id} className="jadwal-row">
                <span className="jadwal-time">{apt.scheduled_at?.includes(' ') ? apt.scheduled_at.split(' ')[1] : apt.scheduled_at}</span>
                <div className="jadwal-detail">
                  <strong>{apt.patient_name}</strong>
                  <span>{apt.type}</span>
                </div>
                <select
                  className={`status-select status-${statusClass(apt.status)}`}
                  value={apt.status}
                  onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                >
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Menunggu">Menunggu</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
                <div className="jadwal-actions">
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(apt)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(apt.id)}>
                    Hapus
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingAppointment ? 'Edit Jadwal' : 'Jadwal Baru'}</h2>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Pasien *</label>
              <select
                value={form.patient_id}
                onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                required
              >
                <option value="">Pilih pasien</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label>Waktu *</label>
              <input
                type="time"
                value={form.scheduled_at}
                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                required
              />
              <label>Jenis Kunjungan *</label>
              <input
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                placeholder="Contoh: Kontrol Rutin, Konsultasi, Follow-up"
                required
              />
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingAppointment ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
