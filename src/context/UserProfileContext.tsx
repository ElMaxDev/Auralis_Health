/**
 * @file UserProfileContext.tsx
 * @description Contexto global de React para la gestion del perfil del usuario.
 *
 * Almacena y distribuye los datos del perfil del medico autenticado a todos
 * los componentes de la aplicacion (nombre, especialidad, cedula, idioma).
 *
 * Persistencia:
 *   Los datos del perfil se serializan en localStorage bajo la clave
 *   "auralis_profile". Esto permite que los cambios sobrevivan a recargas
 *   de pagina sin necesidad de un backend dedicado para preferencias.
 *
 * Auto-generacion de iniciales:
 *   Al actualizar el campo "name", se recalculan automaticamente las
 *   iniciales eliminando prefijos como "Dr." o "Dra." y tomando la
 *   primera letra de los dos primeros segmentos del nombre.
 *
 * Uso:
 *   import { useUserProfile } from '@/context/UserProfileContext';
 *   const { profile, updateProfile } = useUserProfile();
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/** Estructura del perfil del usuario autenticado. */
interface UserProfile {
  /** Nombre completo con titulo (e.g., "Dr. Juan Perez"). */
  name: string;
  /** Especialidad medica (e.g., "Medicina Interna"). */
  specialty: string;
  /** Iniciales derivadas del nombre, maximo 2 caracteres. */
  initials: string;
  /** Idioma preferido del sistema. */
  language: string;
  /** Cedula profesional del medico. */
  cedula: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  /** Actualiza uno o mas campos del perfil. Acepta un objeto parcial. */
  updateProfile: (updates: Partial<UserProfile>) => void;
}

/** Valores por defecto cuando no existe perfil guardado en localStorage. */
const defaultProfile: UserProfile = {
  name: 'Dr. Martinez',
  specialty: 'Medicina Interna',
  initials: 'DM',
  language: 'Espanol (Mexico)',
  cedula: '',
};

const UserProfileContext = createContext<UserProfileContextType>({
  profile: defaultProfile,
  updateProfile: () => {},
});

/**
 * Proveedor del contexto de perfil de usuario.
 * Debe envolver el arbol de componentes en el layout principal.
 */
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  // Cargar perfil desde localStorage al montar el componente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('auralis_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error al cargar perfil desde localStorage:', e);
    }
    setLoaded(true);
  }, []);

  // Persistir cambios en localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('auralis_profile', JSON.stringify(profile));
    }
  }, [profile, loaded]);

  /**
   * Actualiza parcialmente el perfil del usuario.
   * Si se actualiza el nombre, las iniciales se recalculan automaticamente.
   * @param updates - Objeto con los campos a actualizar.
   */
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      if (updates.name) {
        const parts = updated.name.replace(/^(Dr\.|Dra\.)\s*/i, '').trim().split(' ');
        updated.initials = parts.map(p => p[0]?.toUpperCase() || '').slice(0, 2).join('');
      }
      return updated;
    });
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

/**
 * Hook para acceder al perfil del usuario desde cualquier componente.
 * @returns Objeto con el perfil actual y la funcion updateProfile.
 */
export function useUserProfile() {
  return useContext(UserProfileContext);
}
