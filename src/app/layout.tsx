/**
 * @file layout.tsx
 * @description Layout raiz de la aplicacion Next.js (App Router).
 *
 * Estructura de componentes (de exterior a interior):
 *   Providers            - Contextos de React (UserProfile)
 *     InactivityTimer    - Cierre de sesion por inactividad (15 min)
 *     AnimatedBackground - Fondo WebGL con particulas animadas
 *       TopNav           - Barra de navegacion superior con menu de usuario
 *       {children}       - Contenido de la pagina actual
 *       PrivacyFooter    - Pie de pagina con enlace a politicas de privacidad
 *
 * Metadata:
 *   title       - "Auralis Health - El doctor habla, el sistema hace todo lo demas"
 *   description - "Copiloto de documentacion clinica por voz"
 */
import type { Metadata } from 'next';
import AnimatedBackground from '@/components/AnimatedBackground';
import TopNav from '@/components/TopNav';
import InactivityTimer from '@/components/InactivityTimer';
import PrivacyFooter from '@/components/PrivacyFooter';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auralis Health — El doctor habla, el sistema hace todo lo demás',
  description: 'Copiloto de documentación clínica por voz — Auralis Health',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          <InactivityTimer />
          <AnimatedBackground>
            <div className="flex flex-col min-h-screen w-full relative z-10">
              <TopNav />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
                {children}
              </main>
              <PrivacyFooter />
            </div>
          </AnimatedBackground>
        </Providers>
      </body>
    </html>
  );
}
