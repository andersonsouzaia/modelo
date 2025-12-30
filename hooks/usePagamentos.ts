'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { Pagamento } from '@/types/database'

export function usePagamentos(empresaId?: string) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadPagamentos = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('pagamentos')
        .select('*, empresas(*), campanhas(*)')
        .order('created_at', { ascending: false })

      if (empresaId) {
        query = query.eq('empresa_id', empresaId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setPagamentos(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar pagamentos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPagamentos()
  }, [empresaId])

  const createPagamento = async (data: Partial<Pagamento>) => {
    try {
      const { data: pagamento, error: err } = await supabase
        .from('pagamentos')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Pagamento criado com sucesso!', 'success')
      await loadPagamentos()
      return pagamento
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar pagamento', 'error')
      throw err
    }
  }

  const updatePagamento = async (id: string, data: Partial<Pagamento>) => {
    try {
      const { error: err } = await supabase
        .from('pagamentos')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Pagamento atualizado com sucesso!', 'success')
      await loadPagamentos()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar pagamento', 'error')
      throw err
    }
  }

  const marcarComoPago = async (id: string, transacaoId?: string) => {
    return updatePagamento(id, {
      status: 'pago',
      data_pagamento: new Date().toISOString(),
      transacao_id: transacaoId,
    })
  }

  return {
    pagamentos,
    loading,
    error,
    createPagamento,
    updatePagamento,
    marcarComoPago,
    refresh: loadPagamentos,
  }
}




