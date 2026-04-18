'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient } from '@/types';

export default function HistorialEgresos() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchDischarged() {
      try {
        const res = await fetch('/api/historial', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setPatients(data.data);
        }
      } catch (err) {
        console.error('Error fetching historial:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDischarged();
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.curp && p.curp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Historial de Egresos</h1>
            <p className="text-sm text-white/50">Registro de pacientes dados de alta y enviados a aseguradora</p>
          </div>
        </div>

        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o CURP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 w-64 text-white placeholder-white/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-white/30 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <h3 className="text-xl font-medium text-white mb-2">No hay egresos registrados</h3>
          <p className="text-white/50 max-w-md mx-auto">Aún no se ha completado el proceso de egreso para ningún paciente en el sistema.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Identificadores</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Aseguradora</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Fecha de Egreso</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(patient => (
                <tr key={patient._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm border border-white/10">
                        {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{patient.name}</p>
                        <p className="text-xs text-white/50">{patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-white/70 space-y-1">
                      {patient.curp && <p><span className="text-white/40">CURP:</span> {patient.curp}</p>}
                      {patient.rfc && <p><span className="text-white/40">RFC:</span> {patient.rfc}</p>}
                      {!patient.curp && !patient.rfc && <p className="text-white/30 italic">No registrados</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {patient.insuranceProvider || 'Ninguno'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {new Date(patient.updatedAt).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => alert(`El ID de reclamación para ${patient.name} se encuentra en el archivo del paciente.`)}
                      className="text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-400/10 hover:bg-primary-400/20 px-3 py-1.5 rounded-lg transition-colors border border-primary-400/20"
                    >
                      Ver Resumen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
