import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rotas públicas
  const publicRoutes = ['/', '/login', '/login-empresa', '/login-motorista', '/login-admin', '/cadastro-empresa', '/cadastro-motorista']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'))

  // Se não está autenticado e tentando acessar rota protegida
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se está autenticado e tentando acessar rota de login
  if (session && (pathname.includes('/login') || pathname.includes('/cadastro'))) {
    // Redirecionar baseado no tipo de usuário
    const { data: empresa } = await supabase.from('empresas').select('id').eq('id', session.user.id).single()
    const { data: motorista } = await supabase.from('motoristas').select('id').eq('id', session.user.id).single()
    
    // Verificar admin (com tratamento de erro para evitar recursão)
    let admin = null
    try {
      const { data: adminData } = await supabase.from('admins').select('id').eq('id', session.user.id).eq('ativo', true).single()
      admin = adminData
    } catch (err) {
      // Ignorar erros de recursão ou RLS
    }

    if (admin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    if (empresa) {
      return NextResponse.redirect(new URL('/empresa/dashboard', req.url))
    }
    if (motorista) {
      return NextResponse.redirect(new URL('/motorista/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}




