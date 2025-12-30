'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Car, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginMotoristaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'email' | 'google'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('cadastro') === 'sucesso') {
        setSuccessMessage('Conta criada com sucesso! Faça login para continuar.')
      }
    }
  }, [])

  // Verificar se há mensagem de sucesso no cadastro
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('cadastro') === 'sucesso') {
      setError('')
      // Mostrar mensagem de sucesso temporariamente
      setTimeout(() => {
        // Mensagem será limpa automaticamente
      }, 5000)
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
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
        // Verificar se é um motorista
        const { data: motorista } = await supabase
          .from('motoristas')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (motorista) {
          router.push('/motorista/dashboard')
        } else {
          setError('Este usuário não é um motorista.')
          await supabase.auth.signOut()
        }
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('Erro ao fazer login com Google. Tente novamente.')
        setLoading(false)
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
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
              <Car className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Login Motorista
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Escolha como deseja acessar
          </p>

          {/* Seleção de Tipo de Login */}
          <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Email e Senha
            </button>
            <button
              type="button"
              onClick={() => setLoginType('google')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'google'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Google
            </button>
          </div>

          {/* Mensagem de sucesso */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                ✅ {successMessage}
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Aviso de tentativas */}
          {attempts > 0 && loginType === 'email' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Tentativas restantes: {3 - attempts} de 3
              </p>
            </div>
          )}

          {/* Formulário de Login por Email */}
          {loginType === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />

              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              {/* Esqueci minha senha */}
              <div className="text-right">
                <Link href="/recuperar-senha-motorista" className="text-sm text-primary hover:text-primary-dark transition-colors">
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Login */}
              <Button
                type="submit"
                loading={loading}
                disabled={loading || attempts >= 3}
                className="w-full"
              >
                Entrar
              </Button>

              {/* Criar conta */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link href="/cadastro-motorista" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                    Criar conta
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <>
              {/* Botão Google */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  'Carregando...'
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Entrar com Google</span>
                  </>
                )}
              </Button>

              {/* Texto informativo */}
              <p className="text-xs text-center text-gray-500 mt-6">
                Ao continuar, você concorda com os{' '}
                <Link href="/termos" className="text-primary hover:text-primary-dark">
                  termos de uso
                </Link>{' '}
                e{' '}
                <Link href="/privacidade" className="text-primary hover:text-primary-dark">
                  política de privacidade
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
