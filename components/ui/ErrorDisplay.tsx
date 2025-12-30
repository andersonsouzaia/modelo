'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorDisplayProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorDisplay({
  title = 'Erro ao carregar',
  message = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.',
  onRetry,
  retryLabel = 'Tentar Novamente',
}: ErrorDisplayProps) {
  return (
    <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
      <div className="flex justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}




