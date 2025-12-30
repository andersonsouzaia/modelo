'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Building2, ArrowLeft } from 'lucide-react'

export default function CadastroEmpresaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    cnpj: '',
    nome: '',
    instagram: '',
    email: '',
    confirmarEmail: '',
    senha: '',
    confirmarSenha: '',
    aceiteTermos: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (formData.email !== formData.confirmarEmail) {
      setError('Os emails não coincidem.')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.')
      return
    }

    if (formData.senha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (!formData.aceiteTermos) {
      setError('Você precisa aceitar os termos de uso.')
      return
    }

    setLoading(true)

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      })

      if (authError) {
        setError(authError.message || 'Erro ao criar conta.')
        return
      }

      if (!authData.user) {
        setError('Erro ao criar usuário.')
        return
      }

      const userId = authData.user.id

      // Primeiro: Criar registro na tabela users (obrigatório no schema V2.0)
      // O trigger pode já ter criado um registro básico, então usamos upsert
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          tipo: 'empresa',
          email: formData.email,
          nome: formData.nome,
          status: 'ativo',
        }, {
          onConflict: 'id'
        })

      if (userError) {
        console.error('Erro ao criar registro em users:', userError)
        // Se o erro for de duplicação, pode ser que o trigger já criou
        if (userError.code === '23505' || userError.message?.includes('duplicate')) {
          // Tentar atualizar o registro existente
          const { error: updateError } = await supabase
            .from('users')
            .update({
              tipo: 'empresa',
              email: formData.email,
              nome: formData.nome,
              status: 'ativo',
            })
            .eq('id', userId)
          
          if (updateError) {
            setError(updateError.message || 'Erro ao atualizar perfil do usuário. Por favor, entre em contato com o suporte.')
            return
          }
        } else {
          setError(userError.message || 'Erro ao criar perfil do usuário. Por favor, entre em contato com o suporte.')
          return
        }
      }

      // Segundo: Criar registro da empresa (referencia users.id)
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert({
          id: userId,
          cnpj: formData.cnpj.replace(/\D/g, ''),
          razao_social: formData.nome,
          nome_fantasia: formData.nome,
          instagram: formData.instagram || null,
          status: 'aguardando_aprovacao',
        })

      if (empresaError) {
        console.error('Erro ao criar registro em empresas:', empresaError)
        setError(empresaError.message || 'Erro ao criar cadastro da empresa. Por favor, entre em contato com o suporte.')
        // Tentar limpar o registro de users se a empresa falhar
        await supabase.from('users').delete().eq('id', userId)
        return
      }

      // Sucesso - redirecionar para login
      router.push('/login?cadastro=sucesso')
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <Link href="/login" className="inline-flex items-center text-primary-dark mb-8 hover:text-primary transition-colors">
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
            Criar Conta Empresa
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Preencha os dados para criar sua conta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CNPJ */}
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                id="cnpj"
                type="text"
                value={formData.cnpj}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  const formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                  setFormData({ ...formData, cnpj: formatted })
                }}
                maxLength={18}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="00.000.000/0000-00"
              />
            </div>

            {/* Nome da Empresa */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa *
              </label>
              <input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="Nome da sua empresa"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram (opcional)
              </label>
              <input
                id="instagram"
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="@suaempresa"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {/* Confirmar Email */}
            <div>
              <label htmlFor="confirmarEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Email *
              </label>
              <input
                id="confirmarEmail"
                type="email"
                value={formData.confirmarEmail}
                onChange={(e) => setFormData({ ...formData, confirmarEmail: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha * (mínimo 8 caracteres)
              </label>
              <input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                id="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Aceite de Termos */}
            <div className="flex items-start space-x-2">
              <input
                id="aceiteTermos"
                type="checkbox"
                checked={formData.aceiteTermos}
                onChange={(e) => setFormData({ ...formData, aceiteTermos: e.target.checked })}
                required
                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-light"
              />
              <label htmlFor="aceiteTermos" className="text-sm text-gray-700">
                Aceito os{' '}
                <a href="/termos" className="text-primary hover:text-primary-dark">
                  termos de uso
                </a>{' '}
                e{' '}
                <a href="/privacidade" className="text-primary hover:text-primary-dark">
                  política de privacidade
                </a>
              </label>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>

            {/* Link para Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

