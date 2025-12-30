'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTickets } from '@/hooks/useTickets'
import { TicketCard } from '@/components/dashboard/TicketCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { MessageSquare, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function MotoristaSuportePage() {
  const { user } = useAuth()
  const { tickets, loading, createTicket } = useTickets(user?.id)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'tecnico' as 'tecnico' | 'financeiro' | 'campanha' | 'outro',
    assunto: '',
    descricao: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
  })

  const ticketsAbertos = tickets.filter(t => t.status === 'aberto').length
  const ticketsResolvidos = tickets.filter(t => t.status === 'resolvido').length
  const ticketsEmAndamento = tickets.filter(t => t.status === 'em_andamento').length

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await createTicket({
        ...formData,
        user_id: user.id,
        status: 'aberto',
      })
      setShowCreateModal(false)
      setFormData({
        tipo: 'tecnico',
        assunto: '',
        descricao: '',
        prioridade: 'media',
      })
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  return (
    <DashboardLayout userType="motorista">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
            <p className="text-gray-600 mt-1">Abra um ticket para receber ajuda</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tickets Abertos"
            value={ticketsAbertos}
            icon={AlertCircle}
          />
          <StatCard
            title="Em Andamento"
            value={ticketsEmAndamento}
            icon={Clock}
          />
          <StatCard
            title="Resolvidos"
            value={ticketsResolvidos}
            icon={CheckCircle}
          />
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center text-gray-500">Carregando...</div>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhum ticket criado"
            description="Crie um ticket para receber suporte da equipe Movello"
            action={{
              label: 'Criar Ticket',
              onClick: () => setShowCreateModal(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Novo Ticket de Suporte"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <Select
              label="Tipo *"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              required
              options={[
                { value: 'tecnico', label: 'Técnico' },
                { value: 'financeiro', label: 'Financeiro' },
                { value: 'campanha', label: 'Campanha' },
                { value: 'outro', label: 'Outro' },
              ]}
            />
            <Select
              label="Prioridade *"
              value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
              required
              options={[
                { value: 'baixa', label: 'Baixa' },
                { value: 'media', label: 'Média' },
                { value: 'alta', label: 'Alta' },
                { value: 'urgente', label: 'Urgente' },
              ]}
            />
            <Input
              label="Assunto *"
              value={formData.assunto}
              onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
              required
              placeholder="Descreva brevemente o problema"
            />
            <Textarea
              label="Descrição *"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              placeholder="Descreva detalhadamente o problema ou dúvida"
              rows={5}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Ticket</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}




