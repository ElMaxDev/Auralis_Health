// ============================================
// PANTALLA DE EGRESO — DUEÑO: Uri (P4)
// Pantalla 3: Checklist + Generación docs + Envío aseguradora
// ============================================
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PATIENTS } from '@/lib/mockData';
import type { Patient, DischargeDocuments, InsuranceSubmission } from '@/types';

function EgresoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [checklist, setChecklist] = useState({
    notesSigned: true,
    labResultsReady: true,
    dischargeInstructions: false,
    prescriptionReady: false,
    insuranceFormReady: false,
  });
  const [documents, setDocuments] = useState<DischargeDocuments | null>(null);
  const [insurance, setInsurance] = useState<InsuranceSubmission | null>(null);
  const [step, setStep] = useState<'checklist' | 'generating' | 'review' | 'sending' | 'complete'>('checklist');
  const [voiceFeedback, setVoiceFeedback] = useState('');

  // Cargar paciente
  useEffect(() => {
    if (!patientId) return;
    async function load() {
      // Primero buscar en mock
      const mockFound = MOCK_PATIENTS.find(p => p._id === patientId);
      if (mockFound) {
        setPatient(mockFound);
        return;
      }

      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) setPatient(data.data);
      } catch (error) {
        console.error('Error loading patient for egreso:', error);
      }
    }
    load();
  }, [patientId]);

  // Generar documentos de egreso
  const handleGenerateDocuments = async () => {
    setStep('generating');

    // Simular para pacientes mock
    if (patientId?.startsWith('mock-')) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setDocuments({
        prescription: {
          medications: [
            { name: 'Paracetamol', dose: '500mg', route: 'Oral', frequency: 'cada 8 horas', duration: '5 días' },
            { name: 'Ciprofloxacino', dose: '500mg', route: 'Oral', frequency: 'cada 12 horas', duration: '7 días' }
          ],
          general_instructions: 'Tomar con alimentos. No suspender tratamiento.'
        },
        discharge_summary: {
          admission_reason: 'Dificultad respiratoria y fiebre',
          hospital_course: 'Tratamiento antibiótico intravenoso con buena respuesta',
          discharge_diagnosis: 'Neumonía adquirida en la comunidad, en resolución.',
          discharge_condition: 'Estable, afebril, con buena saturación de oxígeno.',
          follow_up_instructions: 'Cita en consulta externa en 7 días.'
        },
        patient_instructions: {
          diet: 'Líquidos abundantes, dieta blanda',
          activity: 'Reposo en casa',
          warning_signs: ['Fiebre mayor a 38.5C', 'Dificultad respiratoria', 'Dolor torácico intenso'],
          next_appointment: 'En 7 días'
        },
        insurance_form: {
          diagnosis_code: 'J18.9',
          procedure_codes: ['99214'],
          length_of_stay: '3 días',
          total_charges_estimate: '12500 MXN'
        }
      });
      setChecklist(prev => ({
        ...prev,
        dischargeInstructions: true,
        prescriptionReady: true,
        insuranceFormReady: true,
      }));
      setStep('review');
      return;
    }

    try {
      const res = await fetch('/api/egreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
        setChecklist(prev => ({
          ...prev,
          dischargeInstructions: true,
          prescriptionReady: true,
          insuranceFormReady: true,
        }));
        setStep('review');
      } else {
        alert(data.error || 'Error generando documentos');
        setStep('checklist');
      }
    } catch {
      alert('Error de conexión');
      setStep('checklist');
    }
  };

  // Enviar a aseguradora
  const handleSendInsurance = async () => {
    if (!patient) return;
    setStep('sending');

    // Simular para pacientes mock
    if (patientId?.startsWith('mock-')) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockInsurance: InsuranceSubmission = {
        provider: patient.insuranceProvider,
        claimId: 'CLM-' + Math.floor(100000 + Math.random() * 900000),
        status: 'received',
        documentsReceived: 4,
        estimatedProcessingTime: '3-5 días hábiles',
        message: 'Documentos recibidos correctamente.',
        timestamp: new Date().toISOString(),
      };
      setInsurance(mockInsurance);
      setStep('complete');
      const feedback = `Doctor, el egreso del paciente ${patient.name} ha sido completado exitosamente. Documentos enviados a ${patient.insuranceProvider}.`;
      setVoiceFeedback(feedback);
      playVoiceFeedback(feedback);
      
      // Marcar como discharged
      fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'discharged' })
      }).catch(console.error);
      
      return;
    }

    try {
      const res = await fetch('/api/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          provider: patient.insuranceProvider,
          documents: ['receta', 'resumen_clinico', 'indicaciones', 'formato_aseguradora'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInsurance(data.data);
        setStep('complete');
        setVoiceFeedback(
          `Doctor, el egreso del paciente ${patient.name} ha sido completado exitosamente. Documentos enviados a ${patient.insuranceProvider}.`
        );
        // Intentar reproducir con ElevenLabs
        playVoiceFeedback(
          `Doctor, el egreso del paciente ${patient.name} ha sido completado. Documentos enviados a ${patient.insuranceProvider}.`
        );
        
        // Marcar como discharged
        fetch(`/api/patients/${patientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'discharged' })
        }).catch(console.error);
      }
    } catch {
      alert('Error enviando a aseguradora');
      setStep('review');
    }
  };

  // ElevenLabs voice feedback
  const playVoiceFeedback = async (text: string) => {
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl));
        audio.addEventListener('error', () => URL.revokeObjectURL(audioUrl));
        audio.play();
      }
    } catch {
      console.warn('ElevenLabs no disponible, usando SpeechSynthesis');
      // Fallback: usar SpeechSynthesis del browser
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const checklistItems = [
    { key: 'notesSigned', label: 'Nota médica firmada', icon: '📋' },
    { key: 'labResultsReady', label: 'Resultados de laboratorio', icon: '🔬' },
    { key: 'dischargeInstructions', label: 'Indicaciones de egreso', icon: '📄' },
    { key: 'prescriptionReady', label: 'Receta médica', icon: '💊' },
    { key: 'insuranceFormReady', label: `Formato aseguradora (${patient?.insuranceProvider || '...'})`, icon: '🏢' },
  ];

  const allReady = Object.values(checklist).every(Boolean);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/50">
        <button onClick={() => router.push('/')} className="hover:text-white transition-colors">Dashboard</button>
        <span className="opacity-30">/</span>
        <span className="text-white font-medium">Egreso Clínico</span>
      </div>

      {/* Patient header */}
      {patient ? (
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400">
              <span className="text-2xl font-bold">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{patient.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-white/60">
                <p>Edad: <span className="text-white/80">{patient.age} años</span></p>
                <p>Cama: <span className="text-white/80">{patient.bed}</span></p>
                <p>Aseguradora: <span className="text-white/80">{patient.insuranceProvider}</span></p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Estado de Alta</p>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold">
              En proceso
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center text-red-400">
          ⚠️ Paciente no encontrado. Por favor, selecciona un paciente válido del Dashboard.
        </div>
      )}

      {/* ---- STEP: CHECKLIST ---- */}
      {(step === 'checklist' || step === 'review') && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              Checklist de Egreso
            </h3>
            <span className="text-xs text-white/40 font-medium italic">Paso 1 de 2</span>
          </div>

          <div className="space-y-3">
            {checklistItems.map(item => {
              const done = checklist[item.key as keyof typeof checklist];
              return (
                <div key={item.key} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  done ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/5'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    done ? 'bg-green-500 text-white' : 'bg-white/10 text-white/20'
                  }`}>
                    {done ? '✓' : ''}
                  </div>
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-sm font-medium ${done ? 'text-white' : 'text-white/40'}`}>{item.label}</span>
                  {done && <span className="ml-auto text-xs text-green-400 font-bold uppercase tracking-wider">Listo</span>}
                </div>
              );
            })}
          </div>

          {/* Botón generar */}
          {!documents && (
            <button
              onClick={handleGenerateDocuments}
              disabled={!checklist.notesSigned}
              className="w-full mt-8 bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-xl"
            >
              Generar Documentos de Egreso
            </button>
          )}
        </div>
      )}

      {/* ---- STEP: GENERATING ---- */}
      {step === 'generating' && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Generando documentación con IA</h3>
          <p className="text-sm text-white/40 max-w-sm mx-auto">Estamos procesando el historial de la estancia para crear la receta, indicaciones y formatos de aseguradora...</p>
        </div>
      )}

      {/* ---- STEP: REVIEW (documentos generados) ---- */}
      {step === 'review' && documents && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              Documentos Generados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Receta Médica', icon: '💊', data: documents.prescription, color: 'text-blue-400' },
                { name: 'Resumen Clínico', icon: '📋', data: documents.discharge_summary, color: 'text-purple-400' },
                { name: 'Indicaciones al Paciente', icon: '📝', data: documents.patient_instructions, color: 'text-green-400' },
                { name: `Formato ${patient?.insuranceProvider}`, icon: '🏢', data: documents.insurance_form, color: 'text-yellow-400' },
              ].map(doc => (
                <button key={doc.name} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all text-left group">
                  <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {doc.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{doc.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-semibold tracking-wider mt-0.5">Vista previa disponible</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen del discharge summary */}
          {documents.discharge_summary && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
              <h4 className="text-xs font-bold text-primary-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                Resumen Clínico para Aseguradora
              </h4>
              <div className="grid gap-4 text-sm">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-white/40 text-[10px] uppercase font-bold mb-1">Diagnóstico de Egreso</p>
                  <p className="text-white font-medium">{documents.discharge_summary.discharge_diagnosis}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase font-bold mb-1">Condición</p>
                    <p className="text-white font-medium">{documents.discharge_summary.discharge_condition}</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-white/40 text-[10px] uppercase font-bold mb-1">Seguimiento</p>
                    <p className="text-white font-medium">{documents.discharge_summary.follow_up_instructions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón enviar a aseguradora */}
          <button
            onClick={handleSendInsurance}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-sm shadow-2xl active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            Completar Egreso y Enviar a {patient?.insuranceProvider}
          </button>
        </div>
      )}

      {/* ---- STEP: SENDING ---- */}
      {step === 'sending' && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">Enviando a {patient?.insuranceProvider}</h3>
          <p className="text-sm text-white/40">Transmitiendo documentos cifrados mediante canal seguro...</p>
        </div>
      )}

      {/* ---- STEP: COMPLETE ---- */}
      {step === 'complete' && insurance && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-green-500/20 p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Egreso Completado</h2>
          <p className="text-white/60 mb-4">Todos los documentos han sido generados, firmados y enviados exitosamente.</p>
          {voiceFeedback && (
            <p className="text-sm text-primary-300 italic mb-6 max-w-md mx-auto">{voiceFeedback}</p>
          )}

          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-8 max-w-md mx-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Folio {insurance.provider}</span>
              <span className="text-primary-400 font-mono font-bold text-sm">{insurance.claimId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Estado</span>
              <span className="text-green-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                Recibido ✓
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="bg-white text-black hover:bg-white/90 px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-[0.98]"
          >
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function EgresoPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-white rounded-xl" />}>
      <EgresoContent />
    </Suspense>
  );
}
