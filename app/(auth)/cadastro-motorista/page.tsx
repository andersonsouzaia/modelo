'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Car, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCPF, formatPhone } from '@/lib/utils/validations'

export default function CadastroMotoristaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    confirmarEmail: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: '',
    veiculo: '',
    placa: '',
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

      // Se não há sessão, pode ser que o email precise ser confirmado
      if (!authData.session) {
        // Tentar fazer login para estabelecer a sessão
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.senha,
        })

        if (signInError || !signInData.session) {
          setError('Conta criada com sucesso! Por favor, verifique seu email para confirmar a conta e faça login.')
          router.push('/login?cadastro=sucesso')
          return
        }
      }

      // Usar o user_id do usuário criado (sempre disponível mesmo sem sessão)
      const userId = authData.user.id

      // Primeiro: Criar registro na tabela users (obrigatório no schema V2.0)
      // O trigger pode já ter criado um registro básico, então usamos upsert
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          tipo: 'motorista',
          email: formData.email,
          nome: '', // Será preenchido depois ou pode ser opcional
          telefone: formData.telefone.replace(/\D/g, ''),
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
              tipo: 'motorista',
              email: formData.email,
              telefone: formData.telefone.replace(/\D/g, ''),
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

      // Segundo: Criar registro do motorista (referencia users.id)
      const { error: motoristaError } = await supabase
        .from('motoristas')
        .insert({
          id: userId, // id referencia users.id no schema V2.0
          cpf: formData.cpf.replace(/\D/g, ''),
          telefone: formData.telefone.replace(/\D/g, ''),
          veiculo: formData.veiculo,
          placa: formData.placa.toUpperCase(),
          status: 'aguardando_aprovacao',
        })

      if (motoristaError) {
        console.error('Erro ao criar registro em motoristas:', motoristaError)
        setError(motoristaError.message || 'Erro ao criar cadastro do motorista. Por favor, entre em contato com o suporte.')
        // Tentar limpar o registro de users se o motorista falhar
        await supabase.from('users').delete().eq('id', userId)
        return
      }

      // Sucesso - redirecionar para dashboard (dados já foram salvos)
      router.push('/motorista/dashboard')
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
              <Car className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Criar Conta Motorista
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Preencha os dados para criar sua conta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="seu@email.com"
            />

            {/* Confirmar Email */}
            <Input
              label="Confirmar Email *"
              type="email"
              value={formData.confirmarEmail}
              onChange={(e) => setFormData({ ...formData, confirmarEmail: e.target.value })}
              required
              placeholder="seu@email.com"
            />

            {/* Senha */}
            <Input
              label="Senha * (mínimo 8 caracteres)"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
              minLength={8}
              placeholder="••••••••"
            />

            {/* Confirmar Senha */}
            <Input
              label="Confirmar Senha *"
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
              required
              placeholder="••••••••"
            />

            {/* CPF */}
            <Input
              label="CPF *"
              type="text"
              value={formData.cpf}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                setFormData({ ...formData, cpf: formatted })
              }}
              maxLength={14}
              required
              placeholder="000.000.000-00"
            />

            {/* Telefone */}
            <Input
              label="Telefone *"
              type="text"
              value={formData.telefone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                setFormData({ ...formData, telefone: formatted })
              }}
              maxLength={15}
              required
              placeholder="(00) 00000-0000"
            />

            {/* Veículo */}
            <Input
              label="Veículo *"
              type="text"
              value={formData.veiculo}
              onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
              required
              placeholder="Ex: Honda Civic"
            />

            {/* Placa */}
            <Input
              label="Placa *"
              type="text"
              value={formData.placa}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                setFormData({ ...formData, placa: value })
              }}
              maxLength={7}
              required
              placeholder="ABC1234"
            />

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
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Criar Conta
            </Button>

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

