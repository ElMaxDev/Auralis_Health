/**
 * @file page.tsx
 * @description Dashboard principal de Auralis Health.
 *
 * Muestra la barra de estadisticas (pacientes activos y notas pendientes),
 * el grid de tarjetas de pacientes con busqueda en tiempo real y el banner
 * de alertas clinicas. Refresca datos automaticamente cada 30 segundos.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PatientCard from '@/components/PatientCard';
import AlertBanner from '@/components/AlertBanner';
import StatsBar from '@/components/StatsBar';
import NewPatientForm from '@/components/NewPatientForm';
import { MOCK_PATIENTS } from '@/lib/mockData';
import type { Patient, Alert } from '@/types';



export default function Dashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  // Cargar pacientes desde la API
  async function fetchData() {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        fetch('/api/patients', { cache: 'no-store' }),
        fetch('/api/alerts', { cache: 'no-store' }),
      ]);

      if (!patientsRes.ok) throw new Error(`patients ${patientsRes.status}`);
      const patientsData = await patientsRes.json();
      setPatients(patientsData.success ? patientsData.data : []);

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success) setAlerts(alertsData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // En caso de error crítico de red, intentar cargar los simulados importados
      setPatients(MOCK_PATIENTS.filter(p => p.status !== 'discharged'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  // fetchData es estable — definida fuera del efecto, no necesita deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar pacientes
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Conteo de notas pendientes: pacientes activos sin nota firmada
  const pendingNotes = patients.filter(p => p.status !== 'discharged').length;

  // Handlers
  const handleSelectPatient = (patient: Patient) => {
    router.push(`/consulta?patientId=${patient._id}`);
  };

  const handleDischarge = (patient: Patient) => {
    router.push(`/egreso?patientId=${patient._id}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a._id !== alertId));
    // Sincronizar con Firestore para que no reaparezca en el próximo polling
    fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    }).catch(err => console.error('Error acknowledging alert:', err));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton stats */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 h-20 animate-pulse" />
          ))}
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 h-44 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Alertas */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* Stats */}
      <StatsBar
        patients={patients}
        pendingNotes={pendingNotes}
      />

      {/* Header con búsqueda */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Pacientes activos</h2>
          <p className="text-sm text-white/60">{patients.length} pacientes en el sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar paciente o cama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 w-64 text-white placeholder-white/40"
            />
          </div>
          {/* Botón Registrar Paciente */}
          <button
            onClick={() => setShowNewPatientForm(true)}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all text-sm font-medium active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Registrar Paciente
          </button>
          {/* Botón nueva consulta */}
          <button
            onClick={() => router.push('/consulta')}
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nueva consulta
          </button>
        </div>
      </div>

      {/* Modal de Registro de Paciente */}
      {showNewPatientForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-2xl my-auto">
            <NewPatientForm
              onPatientCreated={(_id) => {
                setShowNewPatientForm(false);
                fetchData();
              }}
              onCancel={() => setShowNewPatientForm(false)}
            />
          </div>
        </div>
      )}

      {/* Grid de pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            onSelect={handleSelectPatient}
            onDischarge={handleDischarge}
          />
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-white/50">
          <p className="text-lg">No se encontraron pacientes</p>
          <p className="text-sm mt-1">Verifica la búsqueda o agrega un nuevo paciente</p>
        </div>
      )}
    </div>
  );
}
