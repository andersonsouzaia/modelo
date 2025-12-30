'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityLog } from '@/types/database'

export function useActivityLogs(filters?: {
  userId?: string
  entidade?: string
  entidadeId?: string
  acao?: string
  limit?: number
}) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('activity_logs')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false })

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters?.entidade) {
        query = query.eq('entidade', filters.entidade)
      }
      if (filters?.entidadeId) {
        query = query.eq('entidade_id', filters.entidadeId)
      }
      if (filters?.acao) {
        query = query.eq('acao', filters.acao)
      }

      const limit = filters?.limit || 100
      query = query.limit(limit)

      const { data, error: err } = await query

      if (err) throw err
      setLogs(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [filters?.userId, filters?.entidade, filters?.entidadeId, filters?.acao])

  const registrarLog = async (log: Partial<ActivityLog>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase.from('activity_logs').insert({
        ...log,
        user_id: user?.id || null,
        created_at: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error('Erro ao registrar log:', err)
    }
  }

  return {
    logs,
    loading,
    error,
    registrarLog,
    refresh: loadLogs,
  }
}

