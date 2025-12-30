'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { Tablet } from '@/types/database'

export function useTablets() {
  const [tablets, setTablets] = useState<Tablet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadTablets = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('tablets')
        .select('*, motoristas(*)')
        .order('created_at', { ascending: false })

      if (err) throw err
      setTablets(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar tablets', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTablets()
  }, [])

  const createTablet = async (data: Partial<Tablet>) => {
    try {
      const { data: tablet, error: err } = await supabase
        .from('tablets')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Tablet criado com sucesso!', 'success')
      await loadTablets()
      return tablet
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar tablet', 'error')
      throw err
    }
  }

  const updateTablet = async (id: string, data: Partial<Tablet>) => {
    try {
      const { error: err } = await supabase
        .from('tablets')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Tablet atualizado com sucesso!', 'success')
      await loadTablets()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar tablet', 'error')
      throw err
    }
  }

  const vincularMotorista = async (tabletId: string, motoristaId: string) => {
    return updateTablet(tabletId, { motorista_id: motoristaId })
  }

  const desvincularMotorista = async (tabletId: string) => {
    return updateTablet(tabletId, { motorista_id: null })
  }

  const atualizarStatus = async (tabletId: string, status: Tablet['status']) => {
    return updateTablet(tabletId, { status })
  }

  const atualizarLocalizacao = async (
    tabletId: string,
    localizacao: { lat: number; lng: number; endereco?: string }
  ) => {
    return updateTablet(tabletId, {
      ultima_localizacao: {
        ...localizacao,
        timestamp: new Date().toISOString(),
      },
      ultima_sincronizacao: new Date().toISOString(),
    })
  }

  return {
    tablets,
    loading,
    error,
    createTablet,
    updateTablet,
    vincularMotorista,
    desvincularMotorista,
    atualizarStatus,
    atualizarLocalizacao,
    refresh: loadTablets,
  }
}




