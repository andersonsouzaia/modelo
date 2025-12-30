'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'
import { AssinaturaEmpresa } from '@/types/database'

export function useAssinaturas(empresaId?: string) {
  const [assinaturas, setAssinaturas] = useState<AssinaturaEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useNotification()

  const loadAssinaturas = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('assinaturas_empresa')
        .select('*, empresas(*), plano:planos(*)')
        .order('created_at', { ascending: false })

      if (empresaId) {
        query = query.eq('empresa_id', empresaId)
      }

      const { data, error: err } = await query

      if (err) throw err
      setAssinaturas(data || [])
    } catch (err: any) {
      setError(err.message)
      showToast('Erro ao carregar assinaturas', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssinaturas()
  }, [empresaId])

  const createAssinatura = async (data: Partial<AssinaturaEmpresa>) => {
    try {
      const { data: assinatura, error: err } = await supabase
        .from('assinaturas_empresa')
        .insert(data)
        .select()
        .single()

      if (err) throw err
      showToast('Assinatura criada com sucesso!', 'success')
      await loadAssinaturas()
      return assinatura
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar assinatura', 'error')
      throw err
    }
  }

  const updateAssinatura = async (id: string, data: Partial<AssinaturaEmpresa>) => {
    try {
      const { error: err } = await supabase
        .from('assinaturas_empresa')
        .update(data)
        .eq('id', id)

      if (err) throw err
      showToast('Assinatura atualizada com sucesso!', 'success')
      await loadAssinaturas()
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar assinatura', 'error')
      throw err
    }
  }

  const cancelarAssinatura = async (id: string) => {
    return updateAssinatura(id, { status: 'cancelada' })
  }

  return {
    assinaturas,
    loading,
    error,
    createAssinatura,
    updateAssinatura,
    cancelarAssinatura,
    refresh: loadAssinaturas,
  }
}

