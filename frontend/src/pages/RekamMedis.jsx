import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './RekamMedis.css';

export default function RekamMedis() {
  const { medicalRecords, patients, addMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = useData();
  const [searchParams] = useSearchParams();
  const showPrescription = searchParams.get('prescription') === '1';
  const showTemplate = searchParams.get('template') === '1';
  const [modalOpen, setModalOpen] = useState(showPrescription || showTemplate);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({ patient_id: '', notes: '', prescription: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (showPrescription || showTemplate) {
      setModalOpen(true);
    }
  }, [showPrescription, showTemplate]);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setForm({
        patient_id: record.patient_id?.toString() || '',
        notes: record.notes || '',
        prescription: record.prescription || '',
      });
    } else {
      setEditingRecord(null);
      setForm({ patient_id: '', notes: '', prescription: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      const patient = patients.find(p => p.id === parseInt(form.patient_id));
      updateMedicalRecord(editingRecord.id, {
        ...form,
        patient_name: patient?.name || editingRecord.patient_name,
      });
    } else {
      addMedicalRecord(form);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')) {
      deleteMedicalRecord(id);
    }
  };

  const filteredRecords = medicalRecords.filter(r =>
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.prescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Template presets
  const templates = [
    { name: 'Kontrol Rutin', notes: 'Pemeriksaan rutin, kondisi stabil.', prescription: '' },
    { name: 'Flu/Demam', notes: 'Gejala flu: demam, batuk, pilek.', prescription: 'Paracetamol 500mg 3x sehari\nCTM 4mg 3x sehari\nVitamin C 500mg 1x sehari' },
    { name: 'Hipertensi', notes: 'Tekanan darah tinggi, perlu monitoring.', prescription: 'Amlodipine 5mg 1x sehari' },
    { name: 'Diabetes', notes: 'Gula darah perlu dikontrol.', prescription: 'Metformin 500mg 2x sehari' },
  ];

  const applyTemplate = (template) => {
    setForm(f => ({
      ...f,
      notes: template.notes,
      prescription: template.prescription,
    }));
  };

  return (
    <div className="page rekam-page">
      <div className="page-header">
        <h1>Rekam Medis</h1>
        <div className="header-actions">
          <input
            type="search"
            placeholder="Cari rekam medis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="button" className="btn btn-primary" onClick={() => openModal()}>
            + Rekam Baru / Resep Cepat
          </button>
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Pasien</th>
              <th>Catatan</th>
              <th>Resep</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {searchTerm ? 'Tidak ada rekam medis yang cocok dengan pencarian.' : 'Belum ada rekam medis. Gunakan "+ Rekam Baru / Resep Cepat" untuk menambah.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                  <td><strong>{r.patient_name}</strong></td>
                  <td className="notes-cell">{r.notes || '-'}</td>
                  <td className="prescription-cell">{r.prescription || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => openModal(r)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
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
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingRecord ? 'Edit Rekam Medis' : (showTemplate ? 'Template Rekam Medis' : 'Resep Cepat / Rekam Baru')}</h2>
              <button type="button" className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            {!editingRecord && (
              <div className="template-buttons">
                <span className="template-label">Template Cepat:</span>
                {templates.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}

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
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingRecord ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
