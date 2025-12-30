'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCampanhas } from '@/hooks/useCampanhas'
import { useVisualizacoes } from '@/hooks/useVisualizacoes'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/Badge'
import { useParams } from 'next/navigation'
import { ArrowLeft, Eye, MousePointerClick, Share2, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'
import Link from 'next/link'

export default function EmpresaCampanhaAnalyticsPage() {
  const params = useParams()
  const { empresa } = useAuth()
  const campanhaId = params.id as string
  const { campanhas } = useCampanhas(empresa?.id)
  const { visualizacoes, stats, loading } = useVisualizacoes(campanhaId)

  const campanha = campanhas.find(c => c.id === campanhaId)

  if (!campanha) {
    return (
      <DashboardLayout userType="empresa">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Campanha não encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userType="empresa">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/empresa/campanhas/${campanhaId}`}>
            <button className="text-primary hover:text-primary-dark flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Analytics - {campanha.nome}</h1>
            <p className="text-gray-600 mt-1">Métricas e estatísticas da campanha</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Visualizações"
            value={stats.totalVisualizacoes.toLocaleString('pt-BR')}
            icon={Eye}
            subtitle="Todas as visualizações"
          />
          <StatCard
            title="Visualizações Hoje"
            value={stats.visualizacoesHoje.toLocaleString('pt-BR')}
            icon={TrendingUp}
            subtitle="Últimas 24 horas"
          />
          <StatCard
            title="Total de Cliques"
            value={stats.totalCliques.toLocaleString('pt-BR')}
            icon={MousePointerClick}
            subtitle="Interações"
          />
          <StatCard
            title="Compartilhamentos"
            value={stats.totalCompartilhamentos.toLocaleString('pt-BR')}
            icon={Share2}
            subtitle="Total"
          />
        </div>

        {/* Visualizações por Período */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualizações Recentes</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : (
            <DataTable
              data={visualizacoes.slice(0, 50)}
              columns={[
                {
                  header: 'Tablet',
                  accessor: (row) => (row.tablet as any)?.serial_number || 'N/A',
                },
                {
                  header: 'Tipo',
                  accessor: (row) => (
                    <Badge variant="info">{row.tipo_interacao || 'visualizacao'}</Badge>
                  ),
                },
                {
                  header: 'Data/Hora',
                  accessor: (row) => formatDate(row.timestamp),
                },
              ]}
              emptyMessage="Nenhuma visualização registrada ainda"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
