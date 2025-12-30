-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS PARA ADMINS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script corrige problemas de RLS que podem causar erro 406

-- 1. Verificar se RLS está habilitado
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem gerenciar outros admins" ON admins;

-- 3. Criar política para admins verem e gerenciarem outros admins
CREATE POLICY "Admins podem gerenciar outros admins" 
ON admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.ativo = true
  )
);

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
WHERE tablename = 'admins'
ORDER BY policyname;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- O erro 406 (Not Acceptable) geralmente ocorre quando:
-- 1. O usuário não está autenticado (auth.uid() retorna NULL)
-- 2. A política RLS está bloqueando a requisição
-- 3. Os headers da requisição estão incorretos

-- Para verificar se o usuário está autenticado:
-- SELECT auth.uid() as current_user_id;

-- Se retornar NULL, o usuário não está autenticado.
-- Certifique-se de fazer login antes de acessar áreas protegidas.




