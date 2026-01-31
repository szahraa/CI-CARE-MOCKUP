import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

// Initial sample data
const initialPatients = [
  { id: 1, name: 'Budi Santoso', birth_date: '1985-03-15', condition: 'Diabetes Type 2', status: 'Stabil', last_visit: '2 hari lalu' },
  { id: 2, name: 'Ani Rahayu', birth_date: '1990-07-22', condition: 'Hipertensi', status: 'Monitoring', last_visit: '1 hari lalu' },
  { id: 3, name: 'Citra Dewi', birth_date: '1978-11-08', condition: 'Pemulihan Pasca Operasi', status: 'Pemulihan', last_visit: '3 hari lalu' },
  { id: 4, name: 'Dedi Kurniawan', birth_date: '1995-01-30', condition: 'Asma', status: 'Stabil', last_visit: '5 hari lalu' },
  { id: 5, name: 'Eka Putri', birth_date: '1988-09-12', condition: 'Migrain Kronis', status: 'Monitoring', last_visit: '1 minggu lalu' },
];

const initialAppointments = [
  { id: 1, patient_id: 1, patient_name: 'Budi Santoso', scheduled_at: '09:00', type: 'Kontrol Rutin', status: 'Menunggu' },
  { id: 2, patient_id: 2, patient_name: 'Ani Rahayu', scheduled_at: '10:30', type: 'Konsultasi', status: 'Terjadwal' },
  { id: 3, patient_id: 3, patient_name: 'Citra Dewi', scheduled_at: '14:00', type: 'Follow-up', status: 'Terjadwal' },
  { id: 4, patient_id: 4, patient_name: 'Dedi Kurniawan', scheduled_at: '15:30', type: 'Pemeriksaan', status: 'Terjadwal' },
];

const initialMedicalRecords = [
  { id: 1, patient_id: 1, patient_name: 'Budi Santoso', notes: 'Gula darah terkontrol, lanjutkan obat', prescription: 'Metformin 500mg 2x sehari', created_at: '2026-01-30T10:00:00' },
  { id: 2, patient_id: 2, patient_name: 'Ani Rahayu', notes: 'Tekanan darah masih tinggi, perlu monitoring', prescription: 'Amlodipine 5mg 1x sehari', created_at: '2026-01-29T14:30:00' },
  { id: 3, patient_id: 3, patient_name: 'Citra Dewi', notes: 'Luka operasi sembuh dengan baik', prescription: 'Paracetamol 500mg jika nyeri', created_at: '2026-01-28T09:15:00' },
];

// Helper functions for localStorage
const STORAGE_KEYS = {
  patients: 'ci-care-patients',
  appointments: 'ci-care-appointments',
  medicalRecords: 'ci-care-medical-records',
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export function DataProvider({ children }) {
  // Initialize state from localStorage or use initial data
  const [patients, setPatients] = useState(() => 
    loadFromStorage(STORAGE_KEYS.patients, initialPatients)
  );
  const [appointments, setAppointments] = useState(() => 
    loadFromStorage(STORAGE_KEYS.appointments, initialAppointments)
  );
  const [medicalRecords, setMedicalRecords] = useState(() => 
    loadFromStorage(STORAGE_KEYS.medicalRecords, initialMedicalRecords)
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.patients, patients);
  }, [patients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.appointments, appointments);
  }, [appointments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.medicalRecords, medicalRecords);
  }, [medicalRecords]);

  // Patient CRUD operations
  const addPatient = (patient) => {
    const newPatient = {
      ...patient,
      id: Date.now(),
      last_visit: 'Baru',
    };
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = (id, updates) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePatient = (id) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  // Appointment CRUD operations
  const addAppointment = (appointment) => {
    const patient = patients.find(p => p.id === parseInt(appointment.patient_id));
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      patient_name: patient?.name || 'Unknown',
      status: appointment.status || 'Terjadwal',
    };
    setAppointments(prev => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateAppointment = (id, updates) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Medical Record CRUD operations
  const addMedicalRecord = (record) => {
    const patient = patients.find(p => p.id === parseInt(record.patient_id));
    const newRecord = {
      ...record,
      id: Date.now(),
      patient_name: patient?.name || 'Unknown',
      created_at: new Date().toISOString(),
    };
    setMedicalRecords(prev => [newRecord, ...prev]);
    
    // Update patient's last visit
    if (patient) {
      updatePatient(patient.id, { last_visit: 'Hari ini' });
    }
    
    return newRecord;
  };

  const updateMedicalRecord = (id, updates) => {
    setMedicalRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteMedicalRecord = (id) => {
    setMedicalRecords(prev => prev.filter(r => r.id !== id));
  };

  // Stats for dashboard
  const getStats = () => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(a => {
      // Simple check - in real app would compare dates properly
      return true; // Show all as "today" for demo
    });
    
    return {
      totalPatients: patients.length,
      completedToday: appointments.filter(a => a.status === 'Selesai').length,
      inQueue: appointments.filter(a => a.status === 'Menunggu').length,
      appointmentsToday: todayAppointments.length,
    };
  };

  // Reset to initial data
  const resetData = () => {
    setPatients(initialPatients);
    setAppointments(initialAppointments);
    setMedicalRecords(initialMedicalRecords);
  };

  return (
    <DataContext.Provider value={{
      // Data
      patients,
      appointments,
      medicalRecords,
      
      // Patient operations
      addPatient,
      updatePatient,
      deletePatient,
      
      // Appointment operations
      addAppointment,
      updateAppointment,
      deleteAppointment,
      
      // Medical Record operations
      addMedicalRecord,
      updateMedicalRecord,
      deleteMedicalRecord,
      
      // Utilities
      getStats,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
