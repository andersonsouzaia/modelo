'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading, SkeletonCard } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useNotification } from '@/contexts/NotificationContext'
import { Search, CheckCircle, XCircle, Tablet } from 'lucide-react'
import { formatDate, formatCPF, formatPhone } from '@/lib/utils/validations'

export default function AdminMotoristasPage() {
  const { admin } = useAuth()
  const { showToast } = useNotification()
  const [motoristas, setMotoristas] = useState<any[]>([])
  const [tablets, setTablets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [approveModal, setApproveModal] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [tabletModal, setTabletModal] = useState<string | null>(null)
  const [selectedTablet, setSelectedTablet] = useState('')

  useEffect(() => {
    if (admin) {
      loadMotoristas()
      loadTablets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const loadMotoristas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('motoristas')
        .select('*, tablets(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMotoristas(data || [])
    } catch (err: any) {
      showToast('Erro ao carregar motoristas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadTablets = async () => {
    try {
      const { data, error } = await supabase
        .from('tablets')
        .select('*')
        .order('serial_number')

      if (error) throw error
      setTablets(data || [])
    } catch (err: any) {
      console.error(err)
    }
  }

  const approveMotorista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('motoristas')
        .update({ status: 'aprovado' })
        .eq('id', id)

      if (error) throw error
      showToast('Motorista aprovado com sucesso!', 'success')
      setApproveModal(null)
      await loadMotoristas()
    } catch (err: any) {
      showToast('Erro ao aprovar motorista', 'error')
    }
  }

  const rejectMotorista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('motoristas')
        .update({ status: 'bloqueado' })
        .eq('id', id)

      if (error) throw error
      showToast('Motorista bloqueado', 'info')
      setRejectModal(null)
      await loadMotoristas()
    } catch (err: any) {
      showToast('Erro ao bloquear motorista', 'error')
    }
  }

  const assignTablet = async () => {
    if (!tabletModal || !selectedTablet) return

    try {
      // Desvincular tablet anterior se houver
      const motorista = motoristas.find((m) => m.id === tabletModal)
      if (motorista?.tablet_id) {
        await supabase
          .from('tablets')
          .update({ motorista_id: null })
          .eq('id', motorista.tablet_id)
      }

      // Vincular novo tablet
      await supabase
        .from('tablets')
        .update({ motorista_id: tabletModal, status: 'ativo' })
        .eq('id', selectedTablet)

      await supabase
        .from('motoristas')
        .update({ tablet_id: selectedTablet })
        .eq('id', tabletModal)

      showToast('Tablet vinculado com sucesso!', 'success')
      setTabletModal(null)
      setSelectedTablet('')
      await loadMotoristas()
    } catch (err: any) {
      showToast('Erro ao vincular tablet', 'error')
    }
  }

  if (!admin) {
    return <Loading fullScreen text="Carregando..." />
  }

  const filteredMotoristas = motoristas.filter((motorista) => {
    const matchesSearch =
      motorista.cpf.includes(searchTerm) ||
      motorista.telefone.includes(searchTerm) ||
      motorista.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorista.placa.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || motorista.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const availableTablets = tablets.filter(
    (tablet) => !tablet.motorista_id || tablet.id === motoristas.find((m) => m.id === tabletModal)?.tablet_id
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestão de Motoristas</h1>

        {/* Filtros */}
        <div className="bg-white border-2 border-primary-light rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por CPF, telefone, veículo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary outline-none"
            >
              <option value="all">Todos os status</option>
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="aprovado">Aprovado</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredMotoristas.length === 0 ? (
          <div className="bg-white border-2 border-primary-light rounded-lg p-12 text-center">
            <p className="text-gray-600">Nenhum motorista encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotoristas.map((motorista) => (
              <div
                key={motorista.id}
                className="bg-white border-2 border-primary-light rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {motorista.veiculo}
                    </h3>
                    <Badge
                      variant={
                        motorista.status === 'aprovado'
                          ? 'success'
                          : motorista.status === 'bloqueado'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {motorista.status === 'aprovado'
                        ? 'Aprovado'
                        : motorista.status === 'bloqueado'
                        ? 'Bloqueado'
                        : 'Aguardando Aprovação'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p><strong>CPF:</strong> {formatCPF(motorista.cpf)}</p>
                  <p><strong>Telefone:</strong> {formatPhone(motorista.telefone)}</p>
                  <p><strong>Placa:</strong> {motorista.placa}</p>
                  {motorista.tablets && (
                    <p>
                      <strong>Tablet:</strong>{' '}
                      {motorista.tablets.serial_number || 'Não vinculado'}
                    </p>
                  )}
                  <p><strong>Cadastro:</strong> {formatDate(motorista.created_at)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {motorista.status === 'aguardando_aprovacao' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApproveModal(motorista.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRejectModal(motorista.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Bloquear
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTabletModal(motorista.id)
                      setSelectedTablet(motorista.tablet_id || '')
                    }}
                    className="flex-1"
                  >
                    <Tablet className="w-4 h-4 mr-2" />
                    Tablet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Aprovar */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Aprovar Motorista"
        footer={
          <div className="flex space-x-4">
            <Button onClick={() => approveMotorista(approveModal!)}>
              Confirmar Aprovação
            </Button>
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja aprovar este motorista?</p>
      </Modal>

      {/* Modal Bloquear */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Bloquear Motorista"
        footer={
          <div className="flex space-x-4">
            <Button variant="danger" onClick={() => rejectMotorista(rejectModal!)}>
              Confirmar Bloqueio
            </Button>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancelar
            </Button>
          </div>
        }
      >
        <p>Tem certeza que deseja bloquear este motorista?</p>
      </Modal>

      {/* Modal Tablet */}
      <Modal
        isOpen={!!tabletModal}
        onClose={() => {
          setTabletModal(null)
          setSelectedTablet('')
        }}
        title="Vincular Tablet"
        footer={
          <div className="flex space-x-4">
            <Button onClick={assignTablet} disabled={!selectedTablet}>
              Vincular
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTabletModal(null)
                setSelectedTablet('')
              }}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <Select
          label="Selecione o Tablet"
          value={selectedTablet}
          onChange={(e) => setSelectedTablet(e.target.value)}
          options={[
            { value: '', label: 'Selecione...' },
            ...availableTablets.map((tablet) => ({
              value: tablet.id,
              label: `${tablet.serial_number} - ${tablet.status}`,
            })),
          ]}
        />
      </Modal>
    </div>
  )
}

