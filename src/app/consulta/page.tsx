/**
 * @file consulta/page.tsx
 * @description Pagina principal de consulta clinica.
 *
 * Flujo de uso:
 *   1. El medico llega con o sin un paciente seleccionado (via query param ?patientId=X).
 *   2. Si no hay paciente, la consulta es general (el registro se hace en el Dashboard).
 *   3. Graba la consulta por voz (VoiceRecorder -> Azure Speech SDK).
 *   4. La transcripcion se envia a POST /api/notes para generar la nota SOAP con IA.
 *   5. La nota generada se muestra en campos editables (textarea) para revision manual.
 *   6. Al firmar, se abre el modal de cifrado E2EE (AES-GCM 256-bit).
 *   7. El documento cifrado se persiste en Firestore y el texto plano se elimina.
 *
 * Componentes utilizados:
 *   - VoiceRecorder     - Grabacion de voz con transcripcion en vivo
 *   - NewPatientForm    - Formulario de alta de paciente con dictado por voz
 *   - encryptData       - Cifrado E2EE del documento clinico
 *
 * Dependencias de API:
 *   - GET  /api/patients/:id
 *   - POST /api/notes
 *   - PUT  /api/notes/encrypt
 */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VoiceRecorder from '@/components/VoiceRecorder';
import { MOCK_PATIENTS } from '@/lib/mockData';
import type { Patient, ClinicalDocument } from '@/types';
import { encryptData } from '@/lib/crypto';

function ConsultaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [clinicalNote, setClinicalNote] = useState<ClinicalDocument | null>(null);
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [encryptedPreview, setEncryptedPreview] = useState<{ciphertext: string, iv: string, salt: string} | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    async function fetchPatient() {
      try {
        // Primero intentamos buscar en los datos simulados si el ID corresponde
        const mockP = MOCK_PATIENTS.find(p => p._id === patientId);
        if (mockP) {
          setPatient(mockP);
          setLoading(false);
          return;
        }

        // Si no es un mock, buscamos en la API real
        const res = await fetch(`/api/patients/${patientId}`);
        const data = await res.json();
        if (data.success) {
          setPatient(data.data);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [patientId]);

  const handleTranscriptionComplete = async (transcription: string) => {
    if (!transcription.trim()) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription, patientId: patientId || 'unknown' })
      });
      const data = await res.json();
      
      if (data.success) {
        setClinicalNote(data.data);
      } else {
        alert('Error al generar la nota SOAP (revisa los logs del servidor API).');
      }
    } catch (error) {
      console.error('Error procesando nota:', error);
      alert('Error de red al procesar la nota');
    } finally {
      setProcessing(false);
    }
  };

  const updateField = (section: string, field: string, value: string) => {
    setClinicalNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        document_content: {
          ...prev.document_content,
          [section]: {
            ...(prev.document_content?.[section] || {}),
            [field]: value
          }
        }
      };
    });
  };

  const updateTopLevelField = (field: string, value: string) => {
    setClinicalNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        document_content: {
          ...prev.document_content,
          [field]: value
        }
      };
    });
  };

  const handleSignNote = () => {
    // En lugar de guardar directo, abrimos el modal de cifrado
    setShowEncryptModal(true);
  };

  const executeE2EEncryption = async () => {
    if (!encryptionKey || encryptionKey.length < 4) {
      alert('La llave debe tener al menos 4 caracteres.');
      return;
    }

    try {
      // 1. Extraemos el contenido confidencial a cifrar
      const sensitiveData = JSON.stringify(clinicalNote?.document_content);
      
      // 2. Ciframos usando Web Crypto API (AES-GCM 256-bit)
      const encryptedResult = await encryptData(sensitiveData, encryptionKey);
      
      // 3. Mostramos el resultado cifrado para demostración
      setEncryptedPreview(encryptedResult);
      
    } catch (error) {
      console.error(error);
      alert('Error en el proceso criptográfico.');
    }
  };

  const finishSaveProcess = async () => {
    if (!clinicalNote?._id || !encryptedPreview) return;

    try {
      const res = await fetch('/api/notes/encrypt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: clinicalNote._id,
          encrypted: encryptedPreview,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Nota cifrada y guardada en Firestore. El texto plano ha sido eliminado del servidor.');
        router.push('/');
      } else {
        alert('⚠️ No se pudo guardar en el servidor: ' + (data.error || 'Error desconocido') + '\nLa nota sigue abierta para que puedas reintentar.');
      }
    } catch (error) {
      console.error('Error saving encrypted note:', error);
      alert('⚠️ Error de conexión. La nota sigue abierta, intenta guardar de nuevo.');
    }
  };

  if (loading) return <div className="p-8 text-center text-primary-500 animate-pulse">Cargando paciente...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header y botón de volver */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 bg-white/5 rounded-full border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Consulta Médica</h2>
      </div>

      {/* Info del paciente seleccionado (Sticky) */}
      <div className="sticky top-[80px] z-30 mb-6 transition-all duration-300">
        {patient ? (
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400">
                <span className="text-2xl font-bold">{patient.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{patient.name}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <p className="text-sm text-white/60 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                    Cama: <span className="text-white/90 font-medium">{patient.bed}</span>
                  </p>
                  <p className="text-sm text-white/60 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${patient.status === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : patient.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${patient.status === 'critical' ? 'bg-red-500' : patient.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                Estado: {patient.status === 'critical' ? 'Crítico' : patient.status === 'warning' ? 'Vigilancia' : 'Estable'}
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Paciente Registrado</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-dashed border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
            <p className="text-sm text-white/50 italic">Consulta general (sin paciente específico seleccionado).</p>
          </div>
        )}
      </div>

      {/* Grabadora */}
      {!clinicalNote && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-sm text-blue-200 shadow-lg backdrop-blur-md">
            <strong className="text-blue-300">Instrucciones:</strong> Presiona el botón del micrófono y comienza a dictar la nota clínica en voz alta. Al terminar, presiona el botón rojo para detener la grabación. La IA procesará tu audio y estructurará automáticamente el formato SOAP.
          </div>
          
          <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} disabled={processing} />
          
          {processing && (
            <div className="text-center py-10 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
              <div className="w-10 h-10 border-4 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80 font-medium animate-pulse">Procesando audio y estructurando nota SOAP...</p>
              <p className="text-xs text-white/40 mt-2">Usando Inteligencia Artificial Local</p>
            </div>
          )}
        </div>
      )}

      {/* Resultado Documento Clínico */}
      {clinicalNote && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Documento Clínico: {clinicalNote.audit_metadata?.document_type || 'SOAP'}</h3>
              <p className="text-xs text-white/50 mt-1">Estructurado automáticamente con IA</p>
            </div>
            <button onClick={handleSignNote} className="bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Firmar y Guardar
            </button>
          </div>
          
          <div className="space-y-5">
            {clinicalNote.audit_metadata?.document_type === 'SOAP' && (
              <>
                <div>
                  <h4 className="text-sm font-bold text-white/70 uppercase mb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center border border-white/10">S</span> 
                     Subjetivo
                  </h4>
                  <div className="text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                    <div>
                      <strong className="text-white/90 block mb-1">Motivo de consulta:</strong>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[60px]"
                        value={clinicalNote.document_content?.subjective?.chief_complaint || ''}
                        onChange={(e) => updateField('subjective', 'chief_complaint', e.target.value)}
                      />
                    </div>
                    <div>
                      <strong className="text-white/90 block mb-1">Historia:</strong>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                        value={clinicalNote.document_content?.subjective?.history_present_illness || ''}
                        onChange={(e) => updateField('subjective', 'history_present_illness', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-white/70 uppercase mb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center border border-white/10">O</span> 
                     Objetivo
                  </h4>
                  <div className="text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5">
                    <strong className="text-white/90 block mb-1">Exploración física:</strong>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[100px]"
                      value={clinicalNote.document_content?.objective?.physical_exam || ''}
                      onChange={(e) => updateField('objective', 'physical_exam', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-white/70 uppercase mb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center border border-white/10">A</span> 
                     Análisis
                  </h4>
                  <div className="text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                    <div>
                      <strong className="text-white block mb-1">Diagnóstico:</strong>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[60px]"
                        value={clinicalNote.document_content?.assessment?.primary_diagnosis_natural_language || ''}
                        onChange={(e) => updateField('assessment', 'primary_diagnosis_natural_language', e.target.value)}
                      />
                    </div>
                    <div>
                      <strong className="text-white/90 block mb-1">Razonamiento:</strong>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                        value={clinicalNote.document_content?.assessment?.clinical_reasoning || ''}
                        onChange={(e) => updateField('assessment', 'clinical_reasoning', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-white/70 uppercase mb-2 flex items-center gap-2">
                     <span className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center border border-white/10">P</span> 
                     Plan
                  </h4>
                  <div className="text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5">
                    {clinicalNote.document_content?.plan?.medications && clinicalNote.document_content.plan.medications.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-white/90 mb-1">Medicamentos detectados (Solo lectura):</p>
                        <ul className="list-disc list-inside mb-4 bg-white/5 p-3 rounded-lg border border-white/10 text-white/70">
                          {clinicalNote.document_content.plan.medications.map((m: any, i: number) => (
                            <li key={i}>{m.name} {m.dose} - {m.frequency} por {m.duration}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <strong className="text-white/90 block mb-1">Seguimiento y Plan:</strong>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                        value={clinicalNote.document_content?.plan?.follow_up || ''}
                        onChange={(e) => updateField('plan', 'follow_up', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {clinicalNote.audit_metadata?.document_type === 'EVOLUTION' && (
              <div className="space-y-4 text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <strong className="text-white/90 block mb-1">Motivo de consulta:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[60px]"
                    value={clinicalNote.document_content?.consultationReason || ''}
                    onChange={(e) => updateTopLevelField('consultationReason', e.target.value)}
                  />
                </div>
                
                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-2">Signos Vitales:</strong>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Tensión Arterial</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.vitals?.bloodPressure || ''}
                        onChange={(e) => {
                          setClinicalNote(prev => prev ? {
                            ...prev, document_content: {
                              ...prev.document_content, vitals: { ...(prev.document_content.vitals || {}), bloodPressure: e.target.value }
                            }
                          } : prev);
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Frecuencia Cardiaca</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.vitals?.heartRate || ''}
                        onChange={(e) => {
                          setClinicalNote(prev => prev ? {
                            ...prev, document_content: {
                              ...prev.document_content, vitals: { ...(prev.document_content.vitals || {}), heartRate: e.target.value }
                            }
                          } : prev);
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Frec. Respiratoria</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.vitals?.respiratoryRate || ''}
                        onChange={(e) => {
                          setClinicalNote(prev => prev ? {
                            ...prev, document_content: {
                              ...prev.document_content, vitals: { ...(prev.document_content.vitals || {}), respiratoryRate: e.target.value }
                            }
                          } : prev);
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Temperatura</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.vitals?.temperature || ''}
                        onChange={(e) => {
                          setClinicalNote(prev => prev ? {
                            ...prev, document_content: {
                              ...prev.document_content, vitals: { ...(prev.document_content.vitals || {}), temperature: e.target.value }
                            }
                          } : prev);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-1">Exploración física:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                    value={clinicalNote.document_content?.physicalExam || ''}
                    onChange={(e) => updateTopLevelField('physicalExam', e.target.value)}
                  />
                </div>
                
                <div>
                  <strong className="text-white/90 block mb-1">Diagnósticos Actualizados:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[60px]"
                    placeholder="Ingrese diagnósticos separados por saltos de línea"
                    value={clinicalNote.document_content?.updatedDiagnoses?.join('\n') || ''}
                    onChange={(e) => {
                      const arr = e.target.value.split('\n');
                      setClinicalNote(prev => prev ? { ...prev, document_content: { ...prev.document_content, updatedDiagnoses: arr } } : prev);
                    }}
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-1">Evolución clínica:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[100px]"
                    value={clinicalNote.document_content?.clinicalEvolution || ''}
                    onChange={(e) => updateTopLevelField('clinicalEvolution', e.target.value)}
                  />
                </div>
                <div>
                  <strong className="text-white/90 block mb-1">Tratamiento médico indicado:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                    value={clinicalNote.document_content?.medicalTreatment || ''}
                    onChange={(e) => updateTopLevelField('medicalTreatment', e.target.value)}
                  />
                </div>
              </div>
            )}

            {clinicalNote.audit_metadata?.document_type === 'POST_OP' && (
              <div className="space-y-4 text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="text-white/90 block mb-1">Inicio de cirugía:</strong>
                    <input type="time"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                      value={clinicalNote.document_content?.surgeryStartTime || ''}
                      onChange={(e) => updateTopLevelField('surgeryStartTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <strong className="text-white/90 block mb-1">Término de cirugía:</strong>
                    <input type="time"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                      value={clinicalNote.document_content?.surgeryEndTime || ''}
                      onChange={(e) => updateTopLevelField('surgeryEndTime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <strong className="text-white/90">¿Cirugía planeada?</strong>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" 
                      checked={!!clinicalNote.document_content?.isPlannedSurgery}
                      onChange={(e) => updateTopLevelField('isPlannedSurgery', e.target.checked as any)}
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-1">Diagnóstico Postoperatorio:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[60px]"
                    value={clinicalNote.document_content?.diagnosis || ''}
                    onChange={(e) => updateTopLevelField('diagnosis', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <strong className="text-white/90 block mb-1">Técnicas Quirúrgicas:</strong>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                      value={clinicalNote.document_content?.surgicalTechniques?.join('\n') || ''}
                      onChange={(e) => {
                        const arr = e.target.value.split('\n');
                        setClinicalNote(prev => prev ? { ...prev, document_content: { ...prev.document_content, surgicalTechniques: arr } } : prev);
                      }}
                    />
                  </div>
                  <div>
                    <strong className="text-white/90 block mb-1">Hallazgos:</strong>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 resize-y min-h-[80px]"
                      value={clinicalNote.document_content?.findings?.join('\n') || ''}
                      onChange={(e) => {
                        const arr = e.target.value.split('\n');
                        setClinicalNote(prev => prev ? { ...prev, document_content: { ...prev.document_content, findings: arr } } : prev);
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-1">Incidentes / Accidentes:</strong>
                  <input type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                    value={clinicalNote.document_content?.incidents || ''}
                    onChange={(e) => updateTopLevelField('incidents', e.target.value)}
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <strong className="text-white/90 block mb-2">Equipo Quirúrgico:</strong>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Anestesiólogo</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.anesthesiologist || ''}
                        onChange={(e) => updateTopLevelField('anesthesiologist', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Instrumentista</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.instrumentist || ''}
                        onChange={(e) => updateTopLevelField('instrumentist', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/50 mb-1 block">Enfermera Circulante</span>
                      <input type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30"
                        value={clinicalNote.document_content?.circulatingNurse || ''}
                        onChange={(e) => updateTopLevelField('circulatingNurse', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {clinicalNote.audit_metadata?.document_type === 'NURSE_NOTE' && (
              <div className="space-y-4 text-sm text-white/80 bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <strong className="text-white/90 block mb-1">Materiales, insumos y equipo:</strong>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:outline-none focus:border-white/30 min-h-[150px] resize-y"
                    placeholder="Ingrese un material por línea"
                    value={clinicalNote.document_content?.materialsSuppliesAndEquipment?.join('\n') || ''}
                    onChange={(e) => {
                      const arr = e.target.value.split('\n');
                      setClinicalNote(prev => {
                        if (!prev) return prev;
                        return { ...prev, document_content: { ...prev.document_content, materialsSuppliesAndEquipment: arr } };
                      });
                    }}
                  />
                </div>
              </div>
            )}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center text-xs text-white/40">
               <div><strong className="text-white/60">ID Autor:</strong> {clinicalNote.audit_metadata?.author_id} ({clinicalNote.audit_metadata?.author_role})</div>
               <div><strong className="text-white/60">Firma IA:</strong> {clinicalNote.audit_metadata?.created_at_iso}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Encriptación E2EE */}
      {showEncryptModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
            {!encryptedPreview ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center border border-purple-500/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Cifrado de Extremo a Extremo</h3>
                </div>
                <p className="text-sm text-white/70 mb-6">
                  Antes de enviar la nota clínica al servidor, establezca una llave criptográfica. Toda la información será encriptada en su navegador mediante <strong>AES-GCM 256-bit</strong>. El servidor será incapaz de leer el contenido.
                </p>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Ingrese llave secreta (ej. clave de su cédula)"
                    className="w-full bg-black border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowEncryptModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-semibold">
                      Cancelar
                    </button>
                    <button onClick={executeE2EEncryption} className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors font-bold flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                      Cifrar Documento
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center border border-green-500/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Documento Encriptado</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  ¡Éxito! Su nota médica ha sido convertida a texto ininteligible. Esto es lo <strong>único</strong> que verá el servidor de la base de datos:
                </p>
                <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6 relative">
                  <span className="absolute top-2 right-3 text-[10px] text-green-400 font-mono">AES-256-GCM</span>
                  <p className="text-[10px] font-mono text-white/50 break-all h-32 overflow-y-auto">
                    {encryptedPreview.ciphertext}
                  </p>
                </div>
                <button onClick={finishSaveProcess} className="w-full py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-colors font-bold">
                  Enviar de forma segura al servidor
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Consulta() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse text-primary-500">Cargando...</div>}>
      <ConsultaContent />
    </Suspense>
  );
}
