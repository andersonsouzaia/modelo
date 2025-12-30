-- ============================================
-- CONFIGURAÇÃO DO STORAGE PARA MÍDIAS
-- ============================================
-- Execute este script após criar o bucket no Supabase Dashboard
-- Ou execute manualmente no SQL Editor após criar o bucket 'midias'

-- ============================================
-- CRIAR BUCKET (Execute no Dashboard primeiro)
-- ============================================
-- 1. Vá em Storage no painel do Supabase
-- 2. Clique em "New bucket"
-- 3. Nome: midias
-- 4. Marque como público
-- 5. File size limit: 100 MB
-- 6. Allowed MIME types: image/*,video/*

-- ============================================
-- POLÍTICAS DE STORAGE (RLS)
-- ============================================

-- Política de Leitura (SELECT) - Público
CREATE POLICY "Public Access - Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'midias');

-- Política de Inserção (INSERT) - Usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'midias');

-- Política de Atualização (UPDATE) - Usuários podem atualizar seus próprios arquivos
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'midias'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de Exclusão (DELETE) - Usuários podem deletar seus próprios arquivos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'midias'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.ativo = true
        )
    )
);

-- Política adicional: Admins podem gerenciar todos os arquivos
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'midias'
    AND EXISTS (
        SELECT 1
        FROM admins
        WHERE admins.user_id = auth.uid()
        AND admins.ativo = true
    )
)
WITH CHECK (
    bucket_id = 'midias'
    AND EXISTS (
        SELECT 1
        FROM admins
        WHERE admins.user_id = auth.uid()
        AND admins.ativo = true
    )
);

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- As políticas acima assumem que os arquivos são salvos com estrutura:
-- midias/{campanha_id}/{timestamp}.{ext}
-- 
-- Se você quiser usar estrutura diferente, ajuste as políticas conforme necessário.
-- 
-- Para estrutura com user_id:
-- midias/{user_id}/{campanha_id}/{timestamp}.{ext}
-- Use: (storage.foldername(name))[1] = auth.uid()::text

