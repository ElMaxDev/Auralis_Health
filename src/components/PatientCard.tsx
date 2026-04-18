// ============================================
// PATIENT CARD — DUEÑO: Cris (P3)
// Tarjeta de paciente para el dashboard
// ============================================
'use client';

import { Patient } from '@/types';

interface PatientCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
  onDischarge: (patient: Patient) => void;
}

const statusConfig = {
  stable:     { color: 'bg-green-500',  label: 'Estable',  icon: '🟢' },
  warning:    { color: 'bg-yellow-500', label: 'Vigilar',  icon: '🟡' },
  critical:   { color: 'bg-red-500',    label: 'Crítico',  icon: '🔴' },
  discharged: { color: 'bg-white/40',   label: 'Egresado', icon: '⚪' },
};

const triageBadge = {
  1: { color: 'bg-red-600',    label: 'Nivel 1 - Inmediato' },
  2: { color: 'bg-orange-500', label: 'Nivel 2 - Urgente' },
  3: { color: 'bg-yellow-500', label: 'Nivel 3 - Urgencia menor' },
  4: { color: 'bg-green-500',  label: 'Nivel 4 - Estándar' },
  5: { color: 'bg-blue-500',   label: 'Nivel 5 - No urgente' },
};

export default function PatientCard({ patient, onSelect, onDischarge }: PatientCardProps) {
  const status = statusConfig[patient.status] || statusConfig.stable;
  const triage = triageBadge[patient.triageLevel] || triageBadge[3];

  return (
    <div
      className={`card-hover rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-lg p-4 cursor-pointer relative overflow-hidden`}
      onClick={() => onSelect(patient)}
    >
      {/* Indicator bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${status.color}`} />

      {/* Header */}
      <div className="flex items-start justify-between ml-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{status.icon}</span>
            <h3 className="font-semibold text-white text-sm">{patient.name}</h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5 font-medium">
            {patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
          </p>
        </div>
        <span className={`${triage.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
          T{patient.triageLevel}
        </span>
      </div>

      {/* Bed + Doctor */}
      <div className="ml-2 mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
            <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
          </svg>
          <span className="text-xs font-medium text-white/80">{patient.bed}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-xs text-white/50">{patient.attendingDoctor}</span>
        </div>
      </div>

      {/* Admission reason */}
      <p className="ml-2 mt-2 text-xs text-white/70 line-clamp-1 font-medium">
        {patient.admissionReason}
      </p>

      {/* Actions */}
      <div className="ml-2 mt-3 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(patient); }}
          className="flex-1 text-xs bg-white/10 text-white py-1.5 rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/5"
        >
          Nueva consulta
        </button>
        {patient.status !== 'discharged' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDischarge(patient); }}
            className="text-xs border border-white/20 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Egreso
          </button>
        )}
      </div>
    </div>
  );
}
