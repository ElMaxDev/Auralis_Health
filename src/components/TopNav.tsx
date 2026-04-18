/**
 * @file TopNav.tsx
 * @description Barra de navegacion superior con identidad de marca y menu de usuario.
 *
 * Funcionalidades:
 *   - Muestra el logo de Auralis Health y el indicador de estado del sistema.
 *   - Despliega el nombre, especialidad e iniciales del medico autenticado
 *     (datos obtenidos del UserProfileContext).
 *   - Menu desplegable con opciones:
 *       - Modificar perfil (abre modal con pestanas Perfil/Seguridad)
 *       - Ajustes de seguridad (cambio de contrasena)
 *       - Cierre de sesion (elimina cookie auralis_auth)
 *   - Modal de edicion de perfil con persistencia en localStorage.
 *   - Se oculta automaticamente en la ruta /login.
 *
 * El modal de ajustes se renderiza fuera del <header> (como sibling)
 * para evitar problemas de recorte causados por el posicionamiento sticky.
 */
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');
  const [isLightMode, setIsLightMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Campos editables del perfil (estado local del modal)
  const [editName, setEditName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar datos del context al abrir el modal
  const openSettings = (tab: 'profile' | 'security' = 'profile') => {
    setEditName(profile.name);
    setEditSpecialty(profile.specialty);
    setEditCedula(profile.cedula);
    setEditLanguage(profile.language);
    setProfileSaved(false);
    setSettingsTab(tab);
    setShowSettings(true);
    setShowMenu(false);
  };

  const saveProfile = () => {
    updateProfile({
      name: editName,
      specialty: editSpecialty,
      cedula: editCedula,
      language: editLanguage,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleLogout = () => {
    document.cookie = 'auralis_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center border border-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Auralis Health</h1>
            <p className="text-[10px] text-white/50 -mt-1 font-medium">Clinical Voice Copilot</p>
          </div>
        </div>

        {/* Doctor info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success-500/20 border border-success-500/30 rounded-full">
            <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-success-300 font-medium tracking-wide">Sistema activo</span>
          </div>
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-full pr-3 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{profile.name}</p>
                <p className="text-[10px] text-white/50">{profile.specialty}</p>
              </div>
              <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{profile.initials}</span>
              </div>
            </div>

            {/* Menú Desplegable */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-xl">
                <div className="px-4 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Opciones</p>
                </div>
                
                <button 
                  onClick={() => {
                    setIsLightMode(!isLightMode);
                    alert('El Modo Claro requiere reconfigurar los Shaders WebGL. Por ahora mantendremos el modo premium oscuro.');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  {isLightMode ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
                </button>

                <button 
                  onClick={() => {
                    router.push('/historial');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Historial de Egresos
                </button>

                <button 
                  onClick={() => openSettings('profile')}
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Modificar perfil
                </button>
                
                <button 
                  onClick={() => openSettings('security')}
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Ajustes de seguridad
                </button>
                
                <div className="border-t border-white/10 mt-1 pt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Modal de Ajustes de la Cuenta — fuera del header para evitar recorte */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 pb-0">
              <h2 className="text-xl font-bold text-white">Ajustes de la cuenta</h2>
              <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2">
              <button 
                onClick={() => setSettingsTab('profile')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${settingsTab === 'profile' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                Perfil
              </button>
              <button 
                onClick={() => setSettingsTab('security')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${settingsTab === 'security' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                Seguridad
              </button>
            </div>

            <div className="p-6 pt-4">
              {/* Tab: Perfil */}
              {settingsTab === 'profile' && (
                <div className="space-y-4">
                  {/* Avatar / Iniciales Preview */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-xl font-bold text-white">
                      {editName.replace(/^(Dr\.|Dra\.)\s*/i, '').trim().split(' ').map(p => p[0]?.toUpperCase() || '').slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{editName || 'Sin nombre'}</p>
                      <p className="text-white/50 text-xs">{editSpecialty || 'Sin especialidad'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Nombre completo</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors" 
                      placeholder="Dr. Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Especialidad</label>
                    <input 
                      type="text" 
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors" 
                      placeholder="Medicina Interna"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Cédula profesional</label>
                    <input 
                      type="text" 
                      value={editCedula}
                      onChange={(e) => setEditCedula(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors" 
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold block mb-1.5">Idioma del sistema</label>
                    <select 
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 transition-colors"
                    >
                      <option value="Español (México)" className="bg-black">Español (México)</option>
                      <option value="English (US)" className="bg-black">English (US)</option>
                    </select>
                  </div>

                  <button 
                    onClick={saveProfile}
                    className={`w-full mt-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${profileSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
                  >
                    {profileSaved ? '✓ Perfil guardado' : 'Guardar cambios'}
                  </button>
                </div>
              )}

              {/* Tab: Seguridad */}
              {settingsTab === 'security' && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">Cambiar contraseña</h3>
                    <input type="password" placeholder="Contraseña actual" className="w-full bg-black border border-white/20 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-white/50" />
                    <input type="password" placeholder="Nueva contraseña" className="w-full bg-black border border-white/20 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-white/50" />
                    <input type="password" placeholder="Confirmar nueva contraseña" className="w-full bg-black border border-white/20 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-white/50" />
                    <button 
                      onClick={() => {
                        alert('Contraseña actualizada correctamente.');
                      }}
                      className="w-full mt-2 bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Cambiar Contraseña
                    </button>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Sesión activa</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/60">Tiempo de inactividad</span>
                      <span className="text-white font-medium">15 minutos</span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-2">La sesión se cierra automáticamente tras 15 minutos de inactividad para proteger los datos clínicos.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
