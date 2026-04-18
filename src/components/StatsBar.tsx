/**
 * @file StatsBar.tsx
 * @description Barra de estadisticas interactiva del dashboard principal.
 *
 * Cada tarjeta funciona como una carpeta expandible con animacion de apertura.
 * Al hacer clic, se despliega un panel con el detalle de los pacientes
 * correspondientes, agrupados por estado clinico o por notas pendientes.
 *
 * Dependencias:
 *   - Recibe el array completo de pacientes desde el dashboard padre.
 *   - Utiliza useRouter para navegar a la consulta del paciente seleccionado.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient } from '@/types';

interface StatsBarProps {
  /** Array completo de pacientes activos. */
  patients: Patient[];
  /** Numero de notas clinicas pendientes de firma. */
  pendingNotes: number;
}

/**
 * Calcula la fecha limite de entrega de notas pendientes (24h desde ahora).
 */
function getDeadline(): string {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 24);
  return deadline.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Indicador de color segun el status del paciente.
 */
function statusBadge(status: string) {
  switch (status) {
    case 'critical':
      return { label: 'Critico', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', dot: 'bg-red-400' };
    case 'warning':
      return { label: 'Vigilancia', bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', dot: 'bg-yellow-400' };
    default:
      return { label: 'Estable', bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', dot: 'bg-green-400' };
  }
}

/**
 * Panel expandible con animacion suave de altura.
 * Mide el contenido real y anima la transicion con estilos inline.
 */
function ExpandablePanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      // Medir despues de un tick para que el DOM este listo
      requestAnimationFrame(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      style={{
        maxHeight: open ? `${height}px` : '0px',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

export default function StatsBar({ patients, pendingNotes }: StatsBarProps) {
  const router = useRouter();
  const [patientsOpen, setPatientsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const criticalPatients = patients.filter(p => p.status === 'critical');
  const warningPatients = patients.filter(p => p.status === 'warning');
  const stablePatients = patients.filter(p => p.status === 'stable');

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Tarjeta: Pacientes activos */}
      <div>
        <button
          onClick={() => { setPatientsOpen(!patientsOpen); setNotesOpen(false); }}
          className="w-full bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg flex items-center gap-4 hover:bg-white/[0.06] transition-all group text-left"
        >
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-white drop-shadow-md">{patients.length}</p>
            <p className="text-xs text-white/60 font-medium">Pacientes activos</p>
          </div>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-white/30 group-hover:text-white/60 transition-all duration-300 ${patientsOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <ExpandablePanel open={patientsOpen}>
          <div className="mt-2 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg space-y-4">
            {/* Seccion: Criticos */}
            {criticalPatients.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Criticos ({criticalPatients.length})
                </p>
                <div className="space-y-1.5">
                  {criticalPatients.map(p => (
                    <button key={p._id} onClick={() => router.push(`/consulta?patientId=${p._id}`)}
                      className="w-full flex items-center justify-between bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-red-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-red-300 border border-red-500/20">
                          {p.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-white/40">Cama {p.bed}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-red-400 font-medium">Critico</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seccion: Vigilancia */}
            {warningPatients.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-yellow-400 font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  En vigilancia ({warningPatients.length})
                </p>
                <div className="space-y-1.5">
                  {warningPatients.map(p => (
                    <button key={p._id} onClick={() => router.push(`/consulta?patientId=${p._id}`)}
                      className="w-full flex items-center justify-between bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/10 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-yellow-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-yellow-300 border border-yellow-500/20">
                          {p.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-white/40">Cama {p.bed}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-yellow-400 font-medium">Vigilancia</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seccion: Estables */}
            {stablePatients.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-green-400 font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Estables ({stablePatients.length})
                </p>
                <div className="space-y-1.5">
                  {stablePatients.map(p => (
                    <button key={p._id} onClick={() => router.push(`/consulta?patientId=${p._id}`)}
                      className="w-full flex items-center justify-between bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-green-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-green-300 border border-green-500/20">
                          {p.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-white/40">Cama {p.bed}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-green-400 font-medium">Estable</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {patients.length === 0 && (
              <p className="text-xs text-white/40 text-center py-2">No hay pacientes activos</p>
            )}
          </div>
        </ExpandablePanel>
      </div>

      {/* Tarjeta: Notas pendientes */}
      <div>
        <button
          onClick={() => { setNotesOpen(!notesOpen); setPatientsOpen(false); }}
          className="w-full bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg flex items-center gap-4 hover:bg-white/[0.06] transition-all group text-left"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingNotes > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={pendingNotes > 0 ? 'text-amber-400' : 'text-green-400'}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className={`text-3xl font-bold drop-shadow-md ${pendingNotes > 0 ? 'text-amber-400' : 'text-green-400'}`}>{pendingNotes}</p>
            <p className="text-xs text-white/60 font-medium">Notas pendientes</p>
            {pendingNotes > 0 && (
              <p className="text-[10px] text-amber-400/70 mt-0.5">Limite: {getDeadline()}</p>
            )}
          </div>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-white/30 group-hover:text-white/60 transition-all duration-300 ${notesOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <ExpandablePanel open={notesOpen}>
          <div className="mt-2 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg">
            {pendingNotes > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  Pacientes con nota pendiente
                </p>
                {patients.map(p => {
                  const badge = statusBadge(p.status);
                  return (
                    <button key={p._id} onClick={() => router.push(`/consulta?patientId=${p._id}`)}
                      className="w-full flex items-center justify-between bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-300 border border-amber-500/20">
                          {p.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-white/40">Cama {p.bed} - Nota SOAP pendiente</p>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                        {badge.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-green-400/70 text-center py-2">Todas las notas estan al dia</p>
            )}
          </div>
        </ExpandablePanel>
      </div>
    </div>
  );
}
