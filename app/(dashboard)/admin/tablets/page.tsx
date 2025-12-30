'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useTablets } from '@/hooks/useTablets'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { Tablet, MapPin, Plus, Wifi, WifiOff, Settings } from 'lucide-react'
import { formatDate } from '@/lib/utils/validations'

export default function AdminTabletsPage() {
  const { tablets, loading, createTablet, vincularMotorista, atualizarStatus } = useTablets()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [selectedTablet, setSelectedTablet] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    serial_number: '',
    modelo: '',
    versao_os: '',
    versao_app: '',
  })

  const tabletsAtivos = tablets.filter(t => t.status === 'ativo').length
  const tabletsOffline = tablets.filter(t => t.status === 'offline').length
  const tabletsManutencao = tablets.filter(t => t.status === 'manutencao').length

  const handleCreateTablet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTablet({
        ...formData,
        status: 'offline',
      })
      setShowCreateModal(false)
      setFormData({ serial_number: '', modelo: '', versao_os: '', versao_app: '' })
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
      ativo: { label: 'Ativo', variant: 'success' },
      offline: { label: 'Offline', variant: 'error' },
      manutencao: { label: 'Manutenção', variant: 'warning' },
      desativado: { label: 'Desativado', variant: 'info' },
    }
    const config = statusMap[status] || { label: status, variant: 'info' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Tablets</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os tablets do sistema</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Tablet
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Tablets"
            value={tablets.length}
            icon={Tablet}
          />
          <StatCard
            title="Tablets Ativos"
            value={tabletsAtivos}
            icon={Wifi}
          />
          <StatCard
            title="Tablets Offline"
            value={tabletsOffline}
            icon={WifiOff}
          />
          <StatCard
            title="Em Manutenção"
            value={tabletsManutencao}
            icon={Settings}
          />
        </div>

        {/* Tablets List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center text-gray-500">Carregando...</div>
          </div>
        ) : tablets.length === 0 ? (
          <EmptyState
            icon={Tablet}
            title="Nenhum tablet cadastrado"
            description="Comece adicionando um novo tablet ao sistema"
            action={{
              label: 'Adicionar Tablet',
              onClick: () => setShowCreateModal(true),
            }}
          />
        ) : (
          <DataTable
            data={tablets}
            columns={[
              {
                header: 'Serial Number',
                accessor: 'serial_number',
                className: 'font-medium',
              },
              {
                header: 'Modelo',
                accessor: 'modelo',
              },
              {
                header: 'Status',
                accessor: (row) => getStatusBadge(row.status),
              },
              {
                header: 'Motorista',
                accessor: (row) => row.motorista?.user?.nome || 'Não vinculado',
              },
              {
                header: 'Última Sincronização',
                accessor: (row) => row.ultima_sincronizacao
                  ? formatDate(row.ultima_sincronizacao)
                  : 'Nunca',
              },
              {
                header: 'Bateria',
                accessor: (row) => row.bateria_percentual !== null
                  ? `${row.bateria_percentual}%`
                  : 'N/A',
              },
            ]}
          />
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Tablet"
        >
          <form onSubmit={handleCreateTablet} className="space-y-4">
            <Input
              label="Serial Number *"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              required
              placeholder="ABC123456"
            />
            <Input
              label="Modelo"
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              placeholder="Ex: Samsung Galaxy Tab A8"
            />
            <Input
              label="Versão OS"
              value={formData.versao_os}
              onChange={(e) => setFormData({ ...formData, versao_os: e.target.value })}
              placeholder="Ex: Android 13"
            />
            <Input
              label="Versão App"
              value={formData.versao_app}
              onChange={(e) => setFormData({ ...formData, versao_app: e.target.value })}
              placeholder="Ex: 1.0.0"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Tablet</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

