import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/contexts/NotificationContext'

export function useMidias() {
  const [uploading, setUploading] = useState(false)
  const { showToast } = useNotification()

  const uploadMidia = async (file: File, campanhaId: string, tipo: 'video' | 'imagem') => {
    try {
      setUploading(true)

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${campanhaId}/${Date.now()}.${fileExt}`
      const filePath = `midias/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('midias')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('midias')
        .getPublicUrl(filePath)

      // Criar registro na tabela midias
      const { data: midia, error: dbError } = await supabase
        .from('midias')
        .insert({
          campanha_id: campanhaId,
          tipo,
          url: publicUrl,
          status: 'em_analise',
        })
        .select()
        .single()

      if (dbError) throw dbError

      showToast('Mídia enviada com sucesso! Aguardando aprovação.', 'success')
      return midia
    } catch (err: any) {
      showToast(err.message || 'Erro ao fazer upload da mídia', 'error')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const deleteMidia = async (id: string, url: string) => {
    try {
      // Extrair caminho do arquivo da URL
      const urlPath = url.split('/midias/')[1]
      
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('midias')
        .remove([urlPath])

      if (storageError) throw storageError

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('midias')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      showToast('Mídia deletada com sucesso!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erro ao deletar mídia', 'error')
      throw err
    }
  }

  const approveMidia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('midias')
        .update({ status: 'aprovada' })
        .eq('id', id)

      if (error) throw error
      showToast('Mídia aprovada!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Erro ao aprovar mídia', 'error')
      throw err
    }
  }

  const rejectMidia = async (id: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('midias')
        .update({ status: 'reprovada', motivo_reprovacao: motivo })
        .eq('id', id)

      if (error) throw error
      showToast('Mídia reprovada.', 'info')
    } catch (err: any) {
      showToast(err.message || 'Erro ao reprovar mídia', 'error')
      throw err
    }
  }

  return {
    uploadMidia,
    deleteMidia,
    approveMidia,
    rejectMidia,
    uploading,
  }
}




