'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Car, ArrowLeft } from 'lucide-react'
import { formatCPF, formatPhone } from '@/lib/utils/validations'

export default function CompletarCadastroMotoristaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    veiculo: '',
    placa: '',
    aceiteTermos: false,
  })

  useEffect(() => {
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login-motorista')
      return
    }

    // Verificar se já tem cadastro completo
    const { data: motorista } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', user.id)
      .single()

    if (motorista) {
      // Se já tem cadastro completo, verificar se precisa completar dados
      if (motorista.cpf && motorista.telefone && motorista.veiculo && motorista.placa) {
        router.push('/motorista/dashboard')
        return
      }
      // Se tem registro mas falta dados, permite completar
      setUser(user)
      // Preencher formulário com dados existentes se houver
      if (motorista.cpf) setFormData(prev => ({ ...prev, cpf: formatCPF(motorista.cpf) }))
      if (motorista.telefone) setFormData(prev => ({ ...prev, telefone: formatPhone(motorista.telefone) }))
      if (motorista.veiculo) setFormData(prev => ({ ...prev, veiculo: motorista.veiculo }))
      if (motorista.placa) setFormData(prev => ({ ...prev, placa: motorista.placa }))
      return
    }

    setUser(user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.aceiteTermos) {
      setError('Você precisa aceitar os termos de uso.')
      return
    }

    setLoading(true)

    try {
      // Verificar se já existe registro
      const { data: existing } = await supabase
        .from('motoristas')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existing) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('motoristas')
          .update({
            cpf: formData.cpf.replace(/\D/g, ''),
            telefone: formData.telefone.replace(/\D/g, ''),
            veiculo: formData.veiculo,
            placa: formData.placa.toUpperCase(),
          })
          .eq('id', user.id)

        if (updateError) {
          setError(updateError.message || 'Erro ao atualizar cadastro.')
          return
        }
      } else {
        // Criar novo registro do motorista
        const { error: insertError } = await supabase
          .from('motoristas')
          .insert({
            id: user.id, // id referencia users.id no schema V2.0
            cpf: formData.cpf.replace(/\D/g, ''),
            telefone: formData.telefone.replace(/\D/g, ''),
            veiculo: formData.veiculo,
            placa: formData.placa.toUpperCase(),
            status: 'aguardando_aprovacao',
          })

        if (insertError) {
          setError(insertError.message || 'Erro ao completar cadastro.')
          return
        }
      }

      router.push('/motorista/dashboard')
    } catch (err) {
      setError('Erro ao completar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-light p-2 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Completar Cadastro</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Complete seus dados para começar a usar o Movello
          </p>
        </div>

        <div className="bg-white border-2 border-primary-light rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                  setFormData({ ...formData, cpf: formatted })
                }}
                maxLength={14}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="000.000.000-00"
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                id="telefone"
                type="text"
                value={formData.telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                  setFormData({ ...formData, telefone: formatted })
                }}
                maxLength={15}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Veículo */}
            <div>
              <label htmlFor="veiculo" className="block text-sm font-medium text-gray-700 mb-1">
                Veículo
              </label>
              <input
                id="veiculo"
                type="text"
                value={formData.veiculo}
                onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="Ex: Honda Civic"
              />
            </div>

            {/* Placa */}
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-1">
                Placa
              </label>
              <input
                id="placa"
                type="text"
                value={formData.placa}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  setFormData({ ...formData, placa: value })
                }}
                maxLength={7}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none transition-colors"
                placeholder="ABC1234"
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
              {loading ? 'Salvando...' : 'Completar Cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

