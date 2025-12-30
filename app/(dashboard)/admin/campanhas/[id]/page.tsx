'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useCampanhas } from '@/hooks/useCampanhas'
import { useCampanhaTablet } from '@/hooks/useCampanhaTablet'
import { useVisualizacoes } from '@/hooks/useVisualizacoes'
import { StatCard } from '@/components/dashboard/StatCard'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Tablet, Eye, MousePointerClick, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'
import { formatCurrency } from '@/lib/utils/format'
import Link from 'next/link'

export default function AdminCampanhaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const campanhaId = params.id as string
  const { campanhas, loading: campanhaLoading } = useCampanhas()
  const { vinculos, loading: vinculosLoading } = useCampanhaTablet(campanhaId)
  const { visualizacoes, stats, loading: visualizacoesLoading } = useVisualizacoes(campanhaId)

  const campanha = campanhas.find(c => c.id === campanhaId)

  if (campanhaLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!campanha) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Campanha não encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
      ativa: { label: 'Ativa', variant: 'success' },
      em_analise: { label: 'Em Análise', variant: 'warning' },
      aprovada: { label: 'Aprovada', variant: 'info' },
      pausada: { label: 'Pausada', variant: 'warning' },
      reprovada: { label: 'Reprovada', variant: 'error' },
    }
    const config = statusMap[status] || { label: status, variant: 'info' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/campanhas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{campanha.nome}</h1>
            <p className="text-gray-600 mt-1">
              {campanha.empresas?.nome_fantasia || campanha.empresas?.razao_social}
            </p>
          </div>
          {getStatusBadge(campanha.status)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Visualizações"
            value={stats.totalVisualizacoes.toLocaleString('pt-BR')}
            icon={Eye}
            subtitle="Total"
          />
          <StatCard
            title="Cliques"
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
          <StatCard
            title="Tablets Vinculados"
            value={vinculos.length}
            icon={Tablet}
            subtitle="Ativos"
          />
        </div>

        {/* Informações da Campanha */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Campanha</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Região</p>
              <p className="font-medium text-gray-900">{campanha.regiao}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cidade</p>
              <p className="font-medium text-gray-900">{campanha.cidade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Início</p>
              <p className="font-medium text-gray-900">{formatDate(campanha.data_inicio)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Fim</p>
              <p className="font-medium text-gray-900">{formatDate(campanha.data_fim)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Horário</p>
              <p className="font-medium text-gray-900">
                {campanha.horario_inicio} - {campanha.horario_fim}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frequência</p>
              <p className="font-medium text-gray-900">{campanha.frequencia}x por dia</p>
            </div>
            {campanha.valor_total && (
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-medium text-gray-900">{formatCurrency(campanha.valor_total)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tablets Vinculados */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tablets Vinculados</h2>
          {vinculosLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center text-gray-500">Carregando...</div>
            </div>
          ) : (
            <DataTable
              data={vinculos}
              columns={[
                {
                  header: 'Serial Number',
                  accessor: (row) => (row.tablet as any)?.serial_number || 'N/A',
                  className: 'font-medium',
                },
                {
                  header: 'Status',
                  accessor: (row) => (
                    <Badge variant={row.ativo ? 'success' : 'warning'}>
                      {row.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  ),
                },
                {
                  header: 'Visualizações',
                  accessor: 'visualizacoes',
                },
                {
                  header: 'Cliques',
                  accessor: 'cliques',
                },
                {
                  header: 'Última Exibição',
                  accessor: (row) => row.ultima_exibicao
                    ? formatDate(row.ultima_exibicao)
                    : 'Nunca',
                },
              ]}
              emptyMessage="Nenhum tablet vinculado a esta campanha"
            />
          )}
        </div>

        {/* Visualizações Recentes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualizações Recentes</h2>
          {visualizacoesLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center text-gray-500">Carregando...</div>
            </div>
          ) : (
            <DataTable
              data={visualizacoes.slice(0, 20)}
              columns={[
                {
                  header: 'Tablet',
                  accessor: (row) => (row.tablet as any)?.serial_number || 'N/A',
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

