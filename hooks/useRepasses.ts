'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { Repasse } from '@/types/database'

export function useRepasses(motoristaId?: string) {
  const [repasses, setRepasses] = useState<Repasse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadRepasses = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('repasses')
        .select('*, motorista:motoristas(*)')
        .order('created_at', { ascending: false })

      if (motoristaId) {
        query = query.eq('motorista_id', motoristaId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setRepasses(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar repasses', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepasses()
  }, [motoristaId])

  const createRepasse = async (data: Partial<Repasse>) => {
    try {
      const { data: repasse, error: err } = await supabase
        .from('repasses')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Repasse criado com sucesso!', 'success')
      await loadRepasses()
      return repasse
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar repasse', 'error')
      throw err
    }
  }

  const updateRepasse = async (id: string, data: Partial<Repasse>) => {
    try {
      const { error: err } = await supabase
        .from('repasses')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Repasse atualizado com sucesso!', 'success')
      await loadRepasses()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar repasse', 'error')
      throw err
    }
  }

  const marcarComoPago = async (id: string, comprovanteUrl?: string) => {
    return updateRepasse(id, {
      status: 'pago',
      data_pagamento: new Date().toISOString(),
      comprovante_url: comprovanteUrl,
    })
  }

  return {
    repasses,
    loading,
    error,
    createRepasse,
    updateRepasse,
    marcarComoPago,
    refresh: loadRepasses,
  }
}

