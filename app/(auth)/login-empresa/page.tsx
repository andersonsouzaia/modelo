'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Building2, ArrowLeft } from 'lucide-react'

export default function LoginEmpresaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (attempts >= 3) {
      setError('Máximo de tentativas excedido. Sua conta foi bloqueada temporariamente.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAttempts(prev => prev + 1)
        setError(`Credenciais inválidas. Tentativas restantes: ${3 - attempts - 1}`)
        return
      }

      if (data.user) {
        // Verificar se é uma empresa
        const { data: empresa } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (empresa) {
          router.push('/empresa/dashboard')
        } else {
          setError('Este usuário não é uma empresa.')
          await supabase.auth.signOut()
        }
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-primary-dark mb-8 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <div className="bg-white border-2 border-primary-light rounded-lg p-8 shadow-sm">
          {/* Logo/Ícone */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary-light p-4 rounded-full">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Login Empresa
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Acesse sua conta para gerenciar suas campanhas
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Aviso de tentativas */}
            {attempts > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Tentativas restantes: {3 - attempts} de 3
                </p>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Esqueci minha senha */}
            <div className="text-right">
              <Link href="/recuperar-senha-empresa" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              disabled={loading || attempts >= 3}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {/* Criar conta */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/cadastro-empresa" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                  Criar conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}




