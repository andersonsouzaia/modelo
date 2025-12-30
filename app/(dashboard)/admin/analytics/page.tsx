'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useVisualizacoes } from '@/hooks/useVisualizacoes'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { Eye, MousePointerClick, Share2, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminAnalyticsPage() {
  const { visualizacoes, stats, loading } = useVisualizacoes()

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Estatísticas e métricas do sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Visualizações"
            value={stats.totalVisualizacoes.toLocaleString('pt-BR')}
            icon={Eye}
            subtitle="Todas as campanhas"
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

        {/* Recent Visualizations */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualizações Recentes</h2>
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center text-gray-500">Carregando...</div>
            </div>
          ) : (
            <DataTable
              data={visualizacoes.slice(0, 20)}
              columns={[
                {
                  header: 'Campanha',
                  accessor: (row) => row.campanha?.nome || 'N/A',
                  className: 'font-medium',
                },
                {
                  header: 'Tablet',
                  accessor: (row) => row.tablet?.serial_number || 'N/A',
                },
                {
                  header: 'Tipo',
                  accessor: (row) => row.tipo_interacao || 'visualizacao',
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




