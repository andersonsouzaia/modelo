'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { Plano } from '@/types/database'

export function usePlanos() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadPlanos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('valor_mensal', { ascending: true })

      if (err) throw err
      setPlanos(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar planos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanos()
  }, [])

  const createPlano = async (data: Partial<Plano>) => {
    try {
      const { data: plano, error: err } = await supabase
        .from('planos')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Plano criado com sucesso!', 'success')
      await loadPlanos()
      return plano
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar plano', 'error')
      throw err
    }
  }

  const updatePlano = async (id: string, data: Partial<Plano>) => {
    try {
      const { error: err } = await supabase
        .from('planos')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Plano atualizado com sucesso!', 'success')
      await loadPlanos()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar plano', 'error')
      throw err
    }
  }

  return {
    planos,
    loading,
    error,
    createPlano,
    updatePlano,
    refresh: loadPlanos,
  }
}




