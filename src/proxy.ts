/**
 * @file middleware.ts
 * @description Middleware de autenticacion a nivel de servidor (Next.js Edge Runtime).
 *
 * Intercepta todas las solicitudes HTTP entrantes y verifica la existencia
 * de la cookie de sesion "auralis_auth". Si la cookie no esta presente y el
 * usuario intenta acceder a cualquier ruta protegida, se le redirige
 * automaticamente a /login.
 *
 * Rutas excluidas del middleware:
 *   - /api/*           (endpoints de la API REST)
 *   - /_next/static/*  (archivos estaticos de Next.js)
 *   - /_next/image/*   (optimizacion de imagenes)
 *   - /favicon.ico     (icono del sitio)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('auralis_auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Redirigir a login si no hay sesion activa
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Evitar que un usuario autenticado vuelva al login manualmente
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

/**
 * Configuracion del matcher: define a que rutas aplica este middleware.
 * Se excluyen rutas de API, archivos estaticos y el favicon.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
