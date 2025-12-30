'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useCampanhas } from '@/hooks/useCampanhas'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, CheckCircle, XCircle, Clock, Play, Pause, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminCampanhasPage() {
  const router = useRouter()
  const { campanhas, loading, updateCampanha } = useCampanhas()
  const [showAprovarModal, setShowAprovarModal] = useState(false)
  const [showReprovarModal, setShowReprovarModal] = useState(false)
  const [selectedCampanha, setSelectedCampanha] = useState<string | null>(null)
  const [motivoReprovacao, setMotivoReprovacao] = useState('')

  const campanhasEmAnalise = campanhas.filter(c => c.status === 'em_analise').length
  const campanhasAprovadas = campanhas.filter(c => c.status === 'aprovada').length
  const campanhasAtivas = campanhas.filter(c => c.status === 'ativa').length
  const campanhasReprovadas = campanhas.filter(c => c.status === 'reprovada').length

  const handleAprovar = async () => {
    if (!selectedCampanha) return
    try {
      await updateCampanha(selectedCampanha, { status: 'aprovada' })
      setShowAprovarModal(false)
      setSelectedCampanha(null)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleReprovar = async () => {
    if (!selectedCampanha || !motivoReprovacao) return
    try {
      await updateCampanha(selectedCampanha, { status: 'reprovada' })
      setShowReprovarModal(false)
      setSelectedCampanha(null)
      setMotivoReprovacao('')
    } catch (err) {
      // Erro já tratado no hook
    }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Campanhas</h1>
          <p className="text-gray-600 mt-1">Aprove, reprove e gerencie todas as campanhas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Em Análise"
            value={campanhasEmAnalise}
            icon={Clock}
            subtitle="Aguardando aprovação"
          />
          <StatCard
            title="Aprovadas"
            value={campanhasAprovadas}
            icon={CheckCircle}
            subtitle="Prontas para ativar"
          />
          <StatCard
            title="Ativas"
            value={campanhasAtivas}
            icon={Play}
            subtitle="Em exibição"
          />
          <StatCard
            title="Reprovadas"
            value={campanhasReprovadas}
            icon={XCircle}
            subtitle="Não aprovadas"
          />
        </div>

        {/* Campanhas List */}
        <DataTable
          data={campanhas}
          loading={loading}
          columns={[
            {
              header: 'Nome',
              accessor: 'nome',
              className: 'font-medium',
            },
            {
              header: 'Empresa',
              accessor: (row) => row.empresas?.nome_fantasia || row.empresas?.razao_social || 'N/A',
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
              header: 'Data Fim',
              accessor: (row) => formatDate(row.data_fim),
            },
            {
              header: 'Ações',
              accessor: (row) => (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/admin/campanhas/${row.id}`)}
                    className="text-primary hover:text-primary-dark"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {row.status === 'em_analise' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedCampanha(row.id)
                          setShowAprovarModal(true)
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Aprovar"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCampanha(row.id)
                          setShowReprovarModal(true)
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Reprovar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          onRowClick={(row) => router.push(`/admin/campanhas/${row.id}`)}
        />

        {/* Aprovar Modal */}
        <Modal
          isOpen={showAprovarModal}
          onClose={() => {
            setShowAprovarModal(false)
            setSelectedCampanha(null)
          }}
          title="Aprovar Campanha"
        >
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja aprovar esta campanha? Ela ficará disponível para ativação.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAprovarModal(false)
                setSelectedCampanha(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAprovar}>
              Aprovar Campanha
            </Button>
          </div>
        </Modal>

        {/* Reprovar Modal */}
        <Modal
          isOpen={showReprovarModal}
          onClose={() => {
            setShowReprovarModal(false)
            setSelectedCampanha(null)
            setMotivoReprovacao('')
          }}
          title="Reprovar Campanha"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Informe o motivo da reprovação:
            </p>
            <textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none"
              rows={4}
              placeholder="Descreva o motivo da reprovação..."
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReprovarModal(false)
                  setSelectedCampanha(null)
                  setMotivoReprovacao('')
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReprovar}
                disabled={!motivoReprovacao.trim()}
              >
                Reprovar Campanha
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

