'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Globe } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('cadastro') === 'sucesso') {
        setSuccessMessage('Conta criada com sucesso! Faça login para continuar.')
        // Limpar a mensagem após 5 segundos
        setTimeout(() => {
          setSuccessMessage('')
        }, 5000)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Credenciais inválidas.')
        setLoading(false)
        return
      }

      if (data.user) {
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
            router.push('/admin/dashboard')
            return
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
          router.push('/empresa/dashboard')
          return
        }

        // Verificar motorista
        const { data: motorista } = await supabase
          .from('motoristas')
          .select('*')
          .eq('id', userId)
          .single()

        if (motorista) {
          router.push('/motorista/dashboard')
          return
        }

        // Se não encontrou nenhum tipo de usuário
        setError('Usuário não encontrado. Entre em contato com o administrador.')
        await supabase.auth.signOut()
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        {/* Scattered dots */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-start px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              </svg>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-2">
              Acesse sua conta
            </h1>
            <p className="text-gray-400 mb-8 text-sm">
              Gerencie seus assistentes de voz com IA em um único painel.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Mensagem de sucesso */}
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <p className="text-sm text-green-400">✅ {successMessage}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Sua senha"
                />
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Botão Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">ou</span>
              </div>
            </div>

            {/* Opções de Cadastro */}
            <div className="space-y-3">
              <p className="text-center text-gray-400 text-sm mb-4">
                Novo usuário? Crie sua conta:
              </p>
              
              <a
                href="/cadastro-empresa"
                className="block w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white font-medium py-3 rounded-lg transition-all text-center"
              >
                Criar conta Empresa
              </a>
              
              <a
                href="/cadastro-motorista"
                className="block w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white font-medium py-3 rounded-lg transition-all text-center"
              >
                Criar conta Motorista
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Ao usar o Geon AI você concorda com nossos{' '}
              <a href="/termos" className="text-blue-400 hover:text-blue-300">
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a href="/privacidade" className="text-blue-400 hover:text-blue-300">
                Política de Privacidade
              </a>
              .
            </p>
            <button className="text-gray-500 hover:text-gray-400 transition-colors">
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

