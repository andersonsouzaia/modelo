'use client'

import { TicketSuporte } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/validations'
import { MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-react'

interface TicketCardProps {
  ticket: TicketSuporte
  onClick?: () => void
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const getPriorityColor = () => {
    const colors: Record<string, string> = {
      urgente: 'text-red-600 bg-red-50',
      alta: 'text-orange-600 bg-orange-50',
      media: 'text-yellow-600 bg-yellow-50',
      baixa: 'text-blue-600 bg-blue-50',
    }
    return colors[ticket.prioridade] || colors.media
  }

  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'resolvido':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'em_andamento':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-6
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">{ticket.assunto}</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.descricao}</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="info">{ticket.tipo}</Badge>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor()}`}>
            {ticket.prioridade}
          </span>
        </div>
        <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
      </div>
    </div>
  )
}




