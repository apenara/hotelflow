// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Por ahora, permitir todo el acceso
  return NextResponse.next();
}

export const config = {
  matcher: []  // No aplicar el middleware por ahora
};