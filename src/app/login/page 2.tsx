'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular tiempo de carga
    setTimeout(() => {
      // Por ahora redirigimos directamente al dashboard (la ruta raíz)
      router.push('/');
    }, 1500);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative mx-auto my-auto mt-[10vh]">
      
      {/* Subtle highlight effect on top border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="text-center mb-10 mt-2">
        {/* Logo Placeholder */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 mb-6 shadow-inner">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" x2="12" y1="19" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="text-3xl font-light text-white tracking-tight">
          Auralis <span className="font-semibold">Health</span>
        </h1>
        <p className="text-white/50 text-sm mt-2 font-medium tracking-wide">
          Inteligencia Clínica Avanzada
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 relative z-10">
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold px-1">
            Correo Institucional
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
            placeholder="dr@auralis.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-white/50 font-semibold px-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 bg-white text-black font-semibold rounded-xl px-4 py-3.5 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Ingresar al Sistema'
          )}
        </button>
      </form>

      {/* Decorative ambient light behind form */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.02] blur-3xl rounded-full pointer-events-none -z-10" />
    </div>
  );
}
