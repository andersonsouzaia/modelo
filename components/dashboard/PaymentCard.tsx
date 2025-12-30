'use client'

import { Pagamento } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils/validations'
import { CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface PaymentCardProps {
  pagamento: Pagamento
  onClick?: () => void
}

export function PaymentCard({ pagamento, onClick }: PaymentCardProps) {
  const getStatusIcon = () => {
    switch (pagamento.status) {
      case 'pago':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'falhou':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'processando':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = () => {
    const statusMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
      pago: 'success',
      falhou: 'error',
      processando: 'warning',
      pendente: 'info',
      reembolsado: 'error',
    }
    return <Badge variant={statusMap[pagamento.status] || 'info'}>{pagamento.status}</Badge>
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
        <div className="flex items-center space-x-3">
          <div className="bg-primary-light p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{formatCurrency(pagamento.valor)}</h3>
            <p className="text-sm text-gray-500 capitalize">{pagamento.metodo_pagamento}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          {getStatusBadge()}
        </div>
        {pagamento.data_vencimento && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Vencimento: {formatDate(pagamento.data_vencimento)}</span>
          </div>
        )}
        {pagamento.data_pagamento && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Pago em: {formatDate(pagamento.data_pagamento)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

