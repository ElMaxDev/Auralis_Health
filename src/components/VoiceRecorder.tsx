/**
 * @file VoiceRecorder.tsx
 * @description Componente principal de grabacion de voz con transcripcion en tiempo real.
 *
 * Utiliza Azure Speech SDK (a traves de @/lib/speech) para capturar audio
 * del microfono del usuario, transcribirlo continuamente y devolver el texto
 * completo al componente padre al finalizar la grabacion.
 *
 * Caracteristicas:
 *   - Transcripcion parcial en tiempo real (texto provisional mientras habla).
 *   - Transcripcion acumulativa (texto confirmado que se concatena progresivamente).
 *   - Temporizador de duracion visible.
 *   - Manejo de errores con retroalimentacion visual.
 *
 * Dependencias:
 *   - @/lib/speech (createSpeechRecognizer)
 *   - Variables de entorno: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createSpeechRecognizer } from '@/lib/speech';

interface VoiceRecorderProps {
  /** Callback invocado al detener la grabacion. Recibe el texto completo transcrito. */
  onTranscriptionComplete: (fullText: string) => void;
  /** Callback opcional invocado durante la grabacion con el texto parcial acumulado. */
  onTranscribing?: (partialText: string) => void;
  /** Deshabilita el boton de grabacion (e.g., mientras se procesa una nota anterior). */
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscriptionComplete, onTranscribing, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  // Referencia al reconocedor de voz activo (Azure Speech SDK)
  const recognizerRef = useRef<Awaited<ReturnType<typeof createSpeechRecognizer>> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Referencia mutable para acumular texto confirmado sin causar re-renders
  const transcriptRef = useRef('');

  // Temporizador de duracion: incrementa cada segundo mientras se graba
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  /** Formatea segundos a formato MM:SS para la interfaz. */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /**
   * Inicia una sesion de reconocimiento de voz.
   * Crea una instancia del reconocedor de Azure Speech y registra los callbacks
   * para texto parcial (onTranscribing) y texto confirmado (onRecognized).
   */
  const startRecording = useCallback(async () => {
    setError('');
    setPartialText('');
    setFullTranscript('');
    setDuration(0);
    transcriptRef.current = '';

    try {
      const recognizer = await createSpeechRecognizer({
        onTranscribing: (text) => {
          setPartialText(text);
          onTranscribing?.(transcriptRef.current + ' ' + text);
        },
        onRecognized: (text) => {
          transcriptRef.current += (transcriptRef.current ? ' ' : '') + text;
          setFullTranscript(transcriptRef.current);
          setPartialText('');
          onTranscribing?.(transcriptRef.current);
        },
        onError: (err) => {
          console.error('Speech error:', err);
          setError(err);
        },
      });

      if (!recognizer) {
        setError('No se pudo iniciar el reconocimiento de voz. Usa Chrome.');
        return;
      }

      recognizerRef.current = recognizer;
      await recognizer.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Error al iniciar micrófono: ${err}`);
    }
  }, [onTranscribing]);

  /**
   * Detiene la grabacion activa, libera el reconocedor de voz y dispara
   * el callback onTranscriptionComplete con el texto final acumulado.
   */
  const stopRecording = useCallback(async () => {
    if (recognizerRef.current) {
      await recognizerRef.current.stop();
      recognizerRef.current.dispose();
      recognizerRef.current = null;
    }
    setIsRecording(false);

    const finalText = transcriptRef.current.trim();
    if (finalText) {
      onTranscriptionComplete(finalText);
    }
  }, [onTranscriptionComplete]);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          Grabación de consulta
        </h3>
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span className="text-sm font-mono text-red-400">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Botón principal */}
      <div className="flex justify-center mb-6 relative">
        {/* Glow de fondo para el botón (cuando graba) */}
        {isRecording && <div className="absolute inset-0 m-auto w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse pointer-events-none" />}
        
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="w-20 h-20 bg-white/10 hover:bg-white/20 border border-white/20 disabled:bg-white/5 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl backdrop-blur-md"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="relative z-10 w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all animate-recording shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        )}
      </div>

      <p className="text-center text-xs text-white/50 mb-4 tracking-wide">
        {isRecording
          ? 'Grabando... Presiona el boton rojo para detener'
          : 'Presiona el microfono para iniciar la consulta'}
      </p>

      {/* Guia de dictado clinico */}
      {!isRecording && !fullTranscript && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">Guia de dictado - Informacion que puede incluir:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/60">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-white/10 font-bold">S</span>
              <div>
                <p className="text-white/80 font-medium">Subjetivo</p>
                <p>Motivo de consulta, sintomas, tiempo de evolucion, antecedentes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-white/10 font-bold">O</span>
              <div>
                <p className="text-white/80 font-medium">Objetivo</p>
                <p>Signos vitales, hallazgos de exploracion fisica, resultados de laboratorio</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-white/10 font-bold">A</span>
              <div>
                <p className="text-white/80 font-medium">Analisis</p>
                <p>Diagnostico principal, diagnosticos diferenciales, razonamiento clinico</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-white/10 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-white/10 font-bold">P</span>
              <div>
                <p className="text-white/80 font-medium">Plan</p>
                <p>Medicamentos, dosis, frecuencia, estudios solicitados, seguimiento</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcripción en vivo */}
      {(fullTranscript || partialText) && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-5 max-h-48 overflow-y-auto mt-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Transcripción en vivo</p>
          <p className="text-sm text-white/90 leading-relaxed font-light">
            {fullTranscript}
            {partialText && (
              <span className="text-white/50 italic"> {partialText}...</span>
            )}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
    </div>
  );
}
