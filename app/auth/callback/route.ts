import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Verificar tipo de usuário e redirecionar
    const userId = data.user.id

    // Verificar admin primeiro
    try {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .eq('ativo', true)
        .single()

      if (admin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    } catch (adminErr) {
      // Ignorar erros de recursão ou RLS
    }

    // Verificar empresa
    const { data: empresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', userId)
      .single()

    if (empresa) {
      return NextResponse.redirect(new URL('/empresa/dashboard', request.url))
    }

    // Verificar motorista
    const { data: motorista } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', userId)
      .single()

    if (motorista) {
      // Verificar se tem dados completos
      if (motorista.cpf && motorista.telefone && motorista.veiculo && motorista.placa) {
        return NextResponse.redirect(new URL('/motorista/dashboard', request.url))
      } else {
        // Tem registro mas falta dados
        return NextResponse.redirect(new URL('/motorista/completar-cadastro', request.url))
      }
    }

    // Se não existe, redirecionar para completar cadastro (assumindo motorista)
    return NextResponse.redirect(new URL('/motorista/completar-cadastro', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}

