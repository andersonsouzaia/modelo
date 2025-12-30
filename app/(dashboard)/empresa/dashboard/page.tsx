'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCampanhas } from '@/hooks/useCampanhas'
import { Building2, LogOut, Plus, Image, TrendingUp } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/validations'

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const { empresa, logout, loading: authLoading } = useAuth()
  const { campanhas, loading: campanhasLoading } = useCampanhas(empresa?.id)

  if (authLoading) {
    return <Loading fullScreen text="Carregando..." />
  }

  if (!empresa) {
    router.push('/login-empresa')
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
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Movello</h1>
                <p className="text-sm text-gray-600">{empresa?.nome}</p>
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
        {/* Status da Empresa */}
        <div className="mb-6">
          <div className={`inline-block px-4 py-2 rounded-lg ${
            empresa?.status === 'ativa' 
              ? 'bg-green-100 text-green-800' 
              : empresa?.status === 'bloqueada'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            Status: {empresa?.status === 'ativa' ? 'Ativa' : empresa?.status === 'bloqueada' ? 'Bloqueada' : 'Aguardando Aprovação'}
          </div>
        </div>

        {/* Cards de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/empresa/campanhas/nova" className="bg-white border-2 border-primary-light hover:border-primary rounded-lg p-6 text-left transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Nova Campanha</h3>
                <p className="text-sm text-gray-600">Criar uma nova campanha</p>
              </div>
            </div>
          </Link>

          <Link href="/empresa/campanhas" className="bg-white border-2 border-primary-light hover:border-primary rounded-lg p-6 text-left transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <Image className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Minhas Campanhas</h3>
                <p className="text-sm text-gray-600">Gerenciar campanhas e mídias</p>
              </div>
            </div>
          </Link>

          <div className="bg-white border-2 border-primary-light rounded-lg p-6 text-left">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-light p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Métricas</h3>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campanhas Recentes */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Campanhas Recentes</h2>
            <Link href="/empresa/campanhas" className="text-primary hover:text-primary-dark text-sm font-semibold">
              Ver todas
            </Link>
          </div>
          {campanhasLoading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : campanhas.length === 0 ? (
            <p className="text-gray-600">Nenhuma campanha criada ainda.</p>
          ) : (
            <div className="space-y-4">
              {campanhas.slice(0, 5).map((campanha) => (
                <div key={campanha.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{campanha.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {campanha.cidade} • {formatDate(campanha.data_inicio)} - {formatDate(campanha.data_fim)}
                    </p>
                  </div>
                  <Badge variant={
                    campanha.status === 'ativa' ? 'success' :
                    campanha.status === 'aprovada' ? 'info' :
                    campanha.status === 'reprovada' ? 'error' :
                    campanha.status === 'pausada' ? 'default' : 'warning'
                  }>
                    {campanha.status === 'ativa' ? 'Ativa' :
                     campanha.status === 'aprovada' ? 'Aprovada' :
                     campanha.status === 'reprovada' ? 'Reprovada' :
                     campanha.status === 'pausada' ? 'Pausada' : 'Em Análise'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

