'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCampanhas } from '@/hooks/useCampanhas'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DataTable } from '@/components/dashboard/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Megaphone, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Plus,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/validations'

export default function EmpresaDashboardPage() {
  const router = useRouter()
  const { empresa, loading: authLoading } = useAuth()
  const { campanhas, loading: campanhasLoading } = useCampanhas(empresa?.id)

  if (authLoading) {
    return null // DashboardLayout já mostra loading
  }

  if (!empresa) {
    return null // DashboardLayout já redireciona
  }

  const campanhasAtivas = campanhas.filter(c => c.status === 'ativa').length
  const campanhasEmAnalise = campanhas.filter(c => c.status === 'em_analise').length
  const campanhasAprovadas = campanhas.filter(c => c.status === 'aprovada').length

  const recentCampanhas = campanhas
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

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
    <DashboardLayout userType="empresa">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo, {empresa.nome_fantasia || empresa.razao_social}
            </p>
          </div>
          <Link href="/empresa/campanhas/nova">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Campanhas"
            value={campanhas.length}
            icon={Megaphone}
            subtitle={`${campanhasAtivas} ativas`}
            onClick={() => router.push('/empresa/campanhas')}
          />
          <StatCard
            title="Campanhas Ativas"
            value={campanhasAtivas}
            icon={TrendingUp}
            subtitle="Em exibição"
            onClick={() => router.push('/empresa/campanhas?status=ativa')}
          />
          <StatCard
            title="Em Análise"
            value={campanhasEmAnalise}
            icon={Clock}
            subtitle="Aguardando aprovação"
            onClick={() => router.push('/empresa/campanhas?status=em_analise')}
          />
          <StatCard
            title="Aprovadas"
            value={campanhasAprovadas}
            icon={CheckCircle}
            subtitle="Prontas para ativar"
            onClick={() => router.push('/empresa/campanhas?status=aprovada')}
          />
        </div>

        {/* Recent Campanhas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Campanhas Recentes</h2>
            <Link href="/empresa/campanhas" className="text-sm text-primary hover:text-primary-dark">
              Ver todas
            </Link>
          </div>

          {campanhasLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center text-gray-500">Carregando...</div>
            </div>
          ) : recentCampanhas.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Nenhuma campanha ainda"
              description="Comece criando sua primeira campanha publicitária"
              action={{
                label: 'Criar Campanha',
                onClick: () => router.push('/empresa/campanhas/nova'),
              }}
            />
          ) : (
            <DataTable
              data={recentCampanhas}
              columns={[
                {
                  header: 'Nome',
                  accessor: 'nome',
                  className: 'font-medium',
                },
                {
                  header: 'Status',
                  accessor: (row) => getStatusBadge(row.status),
                },
                {
                  header: 'Cidade',
                  accessor: 'cidade',
                },
                {
                  header: 'Data Início',
                  accessor: (row) => formatDate(row.data_inicio),
                },
                {
                  header: 'Ações',
                  accessor: (row) => (
                    <Link
                      href={`/empresa/campanhas/${row.id}`}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  ),
                },
              ]}
              onRowClick={(row) => router.push(`/empresa/campanhas/${row.id}`)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

