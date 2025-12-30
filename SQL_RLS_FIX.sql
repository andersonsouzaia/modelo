-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS PARA MOTORISTAS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script corrige o problema de RLS que impede motoristas de criar seus próprios registros

-- 1. Verificar se RLS está habilitado
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;

-- 2. Remover política antiga se existir (para recriar corretamente)
DROP POLICY IF EXISTS "Motoristas podem inserir seus próprios dados" ON motoristas;

-- 3. Criar política de INSERT para motoristas
-- Permite que usuários autenticados criem seu próprio registro de motorista
CREATE POLICY "Motoristas podem inserir seus próprios dados" ON motoristas FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- 4. Verificar se as políticas foram criadas corretamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE
    tablename = 'motoristas'
ORDER BY policyname;

-- ============================================
-- VERIFICAÇÃO ADICIONAL
-- ============================================
-- Se ainda houver problemas, verifique:

-- 1. Se o usuário está autenticado quando faz o INSERT
--    (auth.uid() deve retornar o ID do usuário)

-- 2. Se o user_id no INSERT corresponde ao auth.uid()
--    Exemplo correto:
--    INSERT INTO motoristas (user_id, cpf, ...)
--    VALUES (auth.uid(), '12345678901', ...);

-- 3. Se há conflito com outras políticas
--    (a política de admin pode estar interferindo)