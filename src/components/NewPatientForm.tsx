/**
 * @file NewPatientForm.tsx
 * @description Formulario de registro de paciente con soporte de dictado por voz.
 *
 * Permite registrar un nuevo paciente en Firestore con todos los campos
 * clinicos requeridos. Cada campo de texto incluye un boton de microfono
 * que activa la Web Speech API nativa del navegador (es-MX) para dictado.
 *
 * Campos obligatorios: nombre, edad, cama.
 * Campos opcionales: motivo de ingreso, antecedentes, alergias,
 *   medicamentos actuales, aseguradora.
 *
 * El medico responsable se asigna automaticamente desde el perfil
 * del usuario autenticado (UserProfileContext).
 *
 * Dependencias:
 *   - Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 *   - POST /api/patients
 *   - UserProfileContext
 */
'use client';

import { useState, useRef } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';

interface NewPatientFormProps {
  /** Callback invocado al registrar exitosamente el paciente. Recibe el ID generado por Firestore. */
  onPatientCreated: (patientId: string) => void;
  /** Callback para cancelar el formulario y volver al estado anterior. */
  onCancel: () => void;
}

export default function NewPatientForm({ onPatientCreated, onCancel }: NewPatientFormProps) {
  const { profile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Estado del formulario
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [bed, setBed] = useState('');
  const [admissionReason, setAdmissionReason] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('Ninguno');

  /**
   * Inicia el reconocimiento de voz para un campo especifico.
   * Utiliza la Web Speech API nativa del navegador con idioma es-MX.
   * Al finalizar la captura, concatena el resultado al valor actual del campo.
   *
   * @param fieldName    - Identificador del campo (para controlar el estado visual).
   * @param setter       - Funcion de estado para actualizar el valor del campo.
   * @param currentValue - Valor actual del campo, para concatenar el texto dictado.
   */
  const startVoiceInput = (fieldName: string, setter: (val: string) => void, currentValue: string) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta dictado por voz. Usa Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(currentValue ? currentValue + ' ' + transcript : transcript);
      setListening(null);
    };

    recognition.onerror = () => setListening(null);
    recognition.onend = () => setListening(null);

    recognitionRef.current = recognition;
    setListening(fieldName);
    recognition.start();
  };

  /** Detiene la sesion de reconocimiento de voz activa, si existe. */
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(null);
  };

  /**
   * Valida los campos obligatorios y envia los datos del paciente al endpoint
   * POST /api/patients para persistirlo en Firestore.
   * El medico responsable se asigna desde el perfil del usuario autenticado.
   */
  const handleSubmit = async () => {
    if (!name.trim() || !age || !bed.trim()) {
      alert('Nombre, edad y cama son campos obligatorios.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          gender,
          bed: bed.trim(),
          admissionReason: admissionReason.trim(),
          medicalHistory: medicalHistory.trim(),
          allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
          currentMedications: currentMedications.split(',').map(m => m.trim()).filter(Boolean),
          attendingDoctor: profile.name,
          insuranceProvider,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onPatientCreated(data.data._id);
      } else {
        alert('Error al registrar: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al registrar paciente.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Sub-componente reutilizable que renderiza un campo de texto (input o textarea)
   * con un boton adyacente para activar dictado por voz.
   */
  const VoiceField = ({ 
    label, fieldName, value, onChange, placeholder, multiline = false 
  }: { 
    label: string; fieldName: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
  }) => (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">{label}</label>
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors resize-y min-h-[60px]"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
          />
        )}
        <button
          type="button"
          onClick={() => listening === fieldName ? stopVoiceInput() : startVoiceInput(fieldName, onChange, value)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            listening === fieldName
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]'
              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title={listening === fieldName ? 'Detener dictado' : 'Dictar por voz'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Registro de Nuevo Paciente</h3>
          <p className="text-xs text-white/50 mt-0.5">Usa el icono del microfono para dictar por voz cualquier campo</p>
        </div>
        <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre — campo principal con voz */}
        <div className="md:col-span-2">
          <VoiceField label="Nombre completo del paciente *" fieldName="name" value={name} onChange={setName} placeholder="Ej. Juan Carlos López García" />
        </div>

        {/* Edad */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Edad *</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="45"
            min="0" max="120"
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Sexo */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Sexo *</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender('M')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${gender === 'M' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
            >
              Masculino
            </button>
            <button
              type="button"
              onClick={() => setGender('F')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${gender === 'F' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
            >
              Femenino
            </button>
          </div>
        </div>

        {/* Cama */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Cama *</label>
          <input
            type="text"
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            placeholder="UCI-12"
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Aseguradora */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Aseguradora</label>
          <select
            value={insuranceProvider}
            onChange={(e) => setInsuranceProvider(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
          >
            <option value="Ninguno" className="bg-black">Ninguno</option>
            <option value="IMSS" className="bg-black">IMSS</option>
            <option value="ISSSTE" className="bg-black">ISSSTE</option>
            <option value="GNP" className="bg-black">GNP</option>
            <option value="MetLife" className="bg-black">MetLife</option>
            <option value="AXA" className="bg-black">AXA</option>
            <option value="Otro" className="bg-black">Otro</option>
          </select>
        </div>

        {/* Motivo de ingreso */}
        <div className="md:col-span-2">
          <VoiceField label="Motivo de ingreso" fieldName="admissionReason" value={admissionReason} onChange={setAdmissionReason} placeholder="Ej. Dolor torácico agudo, disnea" multiline />
        </div>

        {/* Antecedentes médicos */}
        <div className="md:col-span-2">
          <VoiceField label="Antecedentes médicos" fieldName="medicalHistory" value={medicalHistory} onChange={setMedicalHistory} placeholder="Ej. Hipertensión arterial, Diabetes Mellitus tipo 2" multiline />
        </div>

        {/* Alergias */}
        <div>
          <VoiceField label="Alergias (separar con comas)" fieldName="allergies" value={allergies} onChange={setAllergies} placeholder="Penicilina, Sulfa" />
        </div>

        {/* Medicamentos actuales */}
        <div>
          <VoiceField label="Medicamentos (separar con comas)" fieldName="medications" value={currentMedications} onChange={setCurrentMedications} placeholder="Metformina, Losartán" />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-semibold text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              Registrando...
            </>
          ) : (
            'Registrar Paciente'
          )}
        </button>
      </div>
    </div>
  );
}
