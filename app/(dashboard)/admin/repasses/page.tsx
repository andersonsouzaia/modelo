'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useRepasses } from '@/hooks/useRepasses'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatCard } from '@/components/dashboard/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { DollarSign, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/validations'

export default function AdminRepassesPage() {
  const { repasses, loading, createRepasse, marcarComoPago } = useRepasses()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [selectedRepasse, setSelectedRepasse] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    motorista_id: '',
    periodo_inicio: '',
    periodo_fim: '',
    valor_total: '',
    metodo_pagamento: 'pix' as 'pix' | 'transferencia',
  })

  const repassesPendentes = repasses.filter(r => r.status === 'pendente')
  const repassesPagos = repasses.filter(r => r.status === 'pago')
  const totalPendente = repassesPendentes.reduce((sum, r) => sum + Number(r.valor_total), 0)
  const totalPago = repassesPagos.reduce((sum, r) => sum + Number(r.valor_total), 0)

  const handleCreateRepasse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRepasse({
        ...formData,
        valor_total: parseFloat(formData.valor_total),
        visualizacoes: 0,
        status: 'pendente',
      })
      setShowCreateModal(false)
      setFormData({
        motorista_id: '',
        periodo_inicio: '',
        periodo_fim: '',
        valor_total: '',
        metodo_pagamento: 'pix',
      })
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleMarcarComoPago = async () => {
    if (!selectedRepasse) return
    try {
      await marcarComoPago(selectedRepasse)
      setShowPagarModal(false)
      setSelectedRepasse(null)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pago: 'success',
      pendente: 'warning',
      processando: 'info',
      falhou: 'error',
    }
    return <Badge variant={statusMap[status] || 'info'}>{status}</Badge>
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repasses para Motoristas</h1>
            <p className="text-gray-600 mt-1">Gerencie os repasses de ganhos</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Repasse
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Pago"
            value={formatCurrency(totalPago)}
            icon={CheckCircle}
            subtitle={`${repassesPagos.length} repasses`}
          />
          <StatCard
            title="Pendente"
            value={formatCurrency(totalPendente)}
            icon={Clock}
            subtitle={`${repassesPendentes.length} repasses`}
          />
          <StatCard
            title="Total de Repasses"
            value={repasses.length}
            icon={DollarSign}
            subtitle="Todos os registros"
          />
        </div>

        {/* Repasses List */}
        <DataTable
          data={repasses}
          loading={loading}
          columns={[
            {
              header: 'Motorista',
              accessor: (row) => (row.motorista as any)?.user?.nome || 'N/A',
              className: 'font-medium',
            },
            {
              header: 'Período',
              accessor: (row) => `${formatDate(row.periodo_inicio)} - ${formatDate(row.periodo_fim)}`,
            },
            {
              header: 'Valor',
              accessor: (row) => formatCurrency(row.valor_total),
              className: 'font-semibold',
            },
            {
              header: 'Visualizações',
              accessor: 'visualizacoes',
            },
            {
              header: 'Status',
              accessor: (row) => getStatusBadge(row.status),
            },
            {
              header: 'Ações',
              accessor: (row) => (
                row.status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRepasse(row.id)
                      setShowPagarModal(true)
                    }}
                  >
                    Marcar como Pago
                  </Button>
                )
              ),
            },
          ]}
        />

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Repasse"
        >
          <form onSubmit={handleCreateRepasse} className="space-y-4">
            <Input
              label="ID do Motorista *"
              value={formData.motorista_id}
              onChange={(e) => setFormData({ ...formData, motorista_id: e.target.value })}
              required
              placeholder="UUID do motorista"
            />
            <Input
              label="Período Início *"
              type="date"
              value={formData.periodo_inicio}
              onChange={(e) => setFormData({ ...formData, periodo_inicio: e.target.value })}
              required
            />
            <Input
              label="Período Fim *"
              type="date"
              value={formData.periodo_fim}
              onChange={(e) => setFormData({ ...formData, periodo_fim: e.target.value })}
              required
            />
            <Input
              label="Valor Total *"
              type="number"
              step="0.01"
              value={formData.valor_total}
              onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
              required
              placeholder="0.00"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Repasse</Button>
            </div>
          </form>
        </Modal>

        {/* Pagar Modal */}
        <Modal
          isOpen={showPagarModal}
          onClose={() => {
            setShowPagarModal(false)
            setSelectedRepasse(null)
          }}
          title="Marcar Repasse como Pago"
        >
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja marcar este repasse como pago?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowPagarModal(false)
                setSelectedRepasse(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleMarcarComoPago}>
              Confirmar Pagamento
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

