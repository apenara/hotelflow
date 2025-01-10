// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener la sesión actual
  const session = request.cookies.get('session')?.value;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/register', '/'];
  
  // Verificar si es una ruta de hotel-admin
  const isHotelAdminPath = request.nextUrl.pathname.startsWith('/(hotel-admin)');

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/(hotel-admin)/:path*',
    '/auth/:path*'
  ],
};