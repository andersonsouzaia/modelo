'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Car, LogOut, Tablet, DollarSign, HelpCircle } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function MotoristaDashboardPage() {
  const router = useRouter()
  const { motorista, logout, loading: authLoading } = useAuth()

  if (authLoading) {
    return <Loading fullScreen text="Carregando..." />
  }

  if (!motorista) {
    router.push('/motorista/completar-cadastro')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-light p-2 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Movello</h1>
                <p className="text-sm text-gray-600">Área do Motorista</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status do Motorista */}
        <div className="mb-6">
          <Badge
            variant={
              motorista.status === 'aprovado'
                ? 'success'
                : motorista.status === 'bloqueado'
                ? 'error'
                : 'warning'
            }
            size="md"
          >
            {motorista.status === 'aprovado'
              ? 'Aprovado'
              : motorista.status === 'bloqueado'
              ? 'Bloqueado'
              : 'Aguardando Aprovação'}
          </Badge>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tablet */}
          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Tablet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Tablet</h3>
                <p className={`text-sm ${
                  motorista?.tablets?.status === 'ativo' 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                }`}>
                  {motorista?.tablets?.status === 'ativo' ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
            {motorista?.tablets?.serial_number && (
              <p className="text-xs text-gray-500">Serial: {motorista.tablets.serial_number}</p>
            )}
          </div>

          {/* Ganhos do Dia */}
          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ganhos do Dia</h3>
                <p className="text-2xl font-bold text-primary">R$ 0,00</p>
              </div>
            </div>
          </div>

          {/* Ganhos do Mês */}
          <div className="bg-white border-2 border-primary-light rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ganhos do Mês</h3>
                <p className="text-2xl font-bold text-primary">R$ 0,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-light p-3 rounded-lg">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Reportar Problema</h3>
              <p className="text-sm text-gray-600 mb-4">
                Encontrou algum problema com seu tablet? Entre em contato conosco.
              </p>
              <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Reportar Problema
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

