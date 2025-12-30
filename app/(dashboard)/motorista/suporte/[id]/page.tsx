'use client'

import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTickets } from '@/hooks/useTickets'
import { useMensagensTicket } from '@/hooks/useMensagensTicket'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, User, Clock } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils/validations'
import { useState } from 'react'
import Link from 'next/link'

export default function MotoristaTicketDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const ticketId = params.id as string
  const { tickets, loading: ticketsLoading } = useTickets(user?.id)
  const { mensagens, loading: mensagensLoading, enviarMensagem } = useMensagensTicket(ticketId)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  const ticket = tickets.find(t => t.id === ticketId)

  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaMensagem.trim()) return

    setEnviando(true)
    try {
      await enviarMensagem(novaMensagem)
      setNovaMensagem('')
    } catch (err) {
      // Erro já tratado no hook
    } finally {
      setEnviando(false)
    }
  }

  if (ticketsLoading) {
    return (
      <DashboardLayout userType="motorista">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout userType="motorista">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Ticket não encontrado</p>
        </div>
      </DashboardLayout>
    )
  }

  const getPriorityColor = () => {
    const colors: Record<string, string> = {
      urgente: 'text-red-600 bg-red-50',
      alta: 'text-orange-600 bg-orange-50',
      media: 'text-yellow-600 bg-yellow-50',
      baixa: 'text-blue-600 bg-blue-50',
    }
    return colors[ticket.prioridade] || colors.media
  }

  const getStatusBadge = () => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      resolvido: 'success',
      em_andamento: 'info',
      aberto: 'warning',
      fechado: 'info',
    }
    return <Badge variant={statusMap[ticket.status] || 'info'}>{ticket.status}</Badge>
  }

  return (
    <DashboardLayout userType="motorista">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/motorista/suporte">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.assunto}</h1>
            <div className="flex items-center space-x-3 mt-2">
              {getStatusBadge()}
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor()}`}>
                {ticket.prioridade}
              </span>
              <span className="text-sm text-gray-500">
                Criado em {formatDate(ticket.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.descricao}</p>
        </div>

        {/* Mensagens */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mensagens</h2>
          
          {mensagensLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando mensagens...</div>
          ) : mensagens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma mensagem ainda</div>
          ) : (
            <div className="space-y-4">
              {mensagens.map((mensagem) => {
                const isOwnMessage = mensagem.user_id === user?.id
                return (
                  <div
                    key={mensagem.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-lg p-4 ${
                        isOwnMessage
                          ? 'bg-primary-light text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {mensagem.users?.nome || 'Usuário'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(mensagem.created_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{mensagem.mensagem}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Formulário de Nova Mensagem */}
          {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && (
            <form onSubmit={handleEnviarMensagem} className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <Textarea
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                  className="flex-1"
                />
                <Button type="submit" disabled={enviando || !novaMensagem.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

