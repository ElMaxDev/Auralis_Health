/**
 * @file PrivacyFooter.tsx
 * @description Pie de pagina global con enlace a la politica de privacidad y seguridad.
 *
 * Muestra un enlace discreto en la parte inferior de todas las pantallas.
 * Al hacer clic, despliega un modal con los tres pilares de seguridad:
 *   1. Arquitectura de IA local (Edge-Ready).
 *   2. Diseno orientado a HIPAA y NOM-004-SSA3.
 *   3. Cifrado de extremo a extremo (E2EE) con AES-GCM 256-bit.
 *
 * Nota: El contenido de esta seccion debe reflejar con precision las
 * capacidades tecnicas reales del sistema para evitar responsabilidad legal.
 */
'use client';

import { useState } from 'react';

export default function PrivacyFooter() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer className="w-full py-4 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm z-50 relative">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-white/40 font-medium">
          <p>© {new Date().getFullYear()} Auralis Health. Todos los derechos reservados.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Privacidad de Datos y Cumplimiento
          </button>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Seguridad y Privacidad</h2>
            </div>
            
            <div className="space-y-5 text-sm text-white/70">
              <div>
                <h3 className="text-white/90 font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Arquitectura de IA Local (Edge-Ready)
                </h3>
                <p>El sistema está diseñado para ejecutar modelos de lenguaje estructurado (como Llama 3) de manera local. Durante las pruebas y el desarrollo, si el servidor local no está disponible, el sistema puede enrutar temporalmente a APIs seguras, pero la arquitectura final garantiza que los datos clínicos no salgan de su red local.</p>
              </div>
              
              <div>
                <h3 className="text-white/90 font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Diseño orientado a HIPAA y NOM-004-SSA3
                </h3>
                <p>Nuestra infraestructura incorpora controles de acceso, cierre automático por inactividad y trazabilidad de firmas, preparándola para la certificación oficial de normativas internacionales (HIPAA) y leyes locales sobre el expediente clínico electrónico una vez implementada en servidores dedicados.</p>
              </div>
              
              <div>
                <h3 className="text-white/90 font-semibold mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Cifrado Verdadero de Extremo a Extremo (E2EE)
                </h3>
                <p>Implementamos Web Crypto API nativa en su navegador. Al guardar una nota clínica, sus datos son encriptados con AES-GCM 256-bit utilizando su llave personal <strong>antes</strong> de salir de su computadora. Nuestra base de datos recibe únicamente texto basura indescifrable, blindándolo totalmente contra ataques.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowModal(false)}
              className="mt-8 w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-white/90 transition-transform active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
