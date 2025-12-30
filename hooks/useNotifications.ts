'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Notificacao } from '@/types/database'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadNotifications = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) throw fetchError

        setNotifications(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.lida).length

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('id', notificationId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, lida: true, data_leitura: new Date().toISOString() }
            : n
        )
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      const { error: updateError } = await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('lida', false)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => ({ ...n, lida: true, data_leitura: new Date().toISOString() }))
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}




