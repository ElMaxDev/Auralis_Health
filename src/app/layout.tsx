import type { Metadata } from 'next';
import AnimatedBackground from '@/components/AnimatedBackground';
import TopNav from '@/components/TopNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auralis Health — El doctor habla, el sistema hace todo lo demás',
  description: 'Copiloto de documentación clínica por voz — Auralis Health',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AnimatedBackground>
          <div className="flex flex-col min-h-screen w-full relative z-10">
            <TopNav />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </AnimatedBackground>
      </body>
    </html>
  );
}
