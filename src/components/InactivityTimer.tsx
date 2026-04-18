/**
 * @file InactivityTimer.tsx
 * @description Componente de seguridad que cierra la sesion del usuario
 * tras un periodo de inactividad prolongado.
 *
 * Monitorea los siguientes eventos del DOM para detectar actividad:
 *   - mousemove
 *   - keydown
 *   - scroll
 *   - click
 *
 * Si no se detecta ninguno de estos eventos durante el tiempo configurado
 * (por defecto 15 minutos), se elimina la cookie de autenticacion y se
 * redirige al usuario a la pantalla de login.
 *
 * Este componente no renderiza ningun elemento visible en el DOM.
 * Se excluye automaticamente en la ruta /login.
 *
 * @constant INACTIVITY_TIMEOUT_MS - Tiempo de inactividad en milisegundos (900,000 = 15 min).
 */
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const INACTIVITY_TIMEOUT_MS = 900000; // 15 minutos

export default function InactivityTimer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // No aplicar el temporizador en la pantalla de login
    if (pathname === '/login') return;

    let timeoutId: NodeJS.Timeout;

    /**
     * Elimina la cookie de sesion y redirige al login.
     * Se invoca cuando el temporizador de inactividad expira.
     */
    const logout = () => {
      document.cookie = 'auralis_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    };

    /**
     * Reinicia el temporizador de inactividad.
     * Se ejecuta cada vez que se detecta un evento de interaccion del usuario.
     */
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT_MS);
    };

    const monitoredEvents = ['mousemove', 'keydown', 'scroll', 'click'];

    monitoredEvents.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      monitoredEvents.forEach(event => document.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [pathname, router]);

  return null;
}
