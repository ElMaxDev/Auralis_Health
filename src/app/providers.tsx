/**
 * @file providers.tsx
 * @description Wrapper de proveedores de contexto para componentes del lado del cliente.
 *
 * Next.js App Router requiere que el layout raiz sea un Server Component.
 * Este archivo actua como frontera "use client" para envolver los hijos
 * con los Context Providers necesarios (UserProfileProvider).
 *
 * Si se agregan nuevos contextos globales (e.g., ThemeProvider, AuthProvider),
 * deben anidarse aqui para mantener el layout limpio.
 */
'use client';

import { UserProfileProvider } from '@/context/UserProfileContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      {children}
    </UserProfileProvider>
  );
}
