-- ============================================
-- CORREÇÃO COMPLETA DE RLS PARA MOTORISTAS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script garante que motoristas possam criar seus próprios registros

-- ============================================
-- PASSO 1: Verificar se RLS está habilitado
-- ============================================
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 2: Remover todas as políticas antigas de motoristas
-- ============================================
DROP POLICY IF EXISTS "Motoristas podem ver seus próprios dados" ON motoristas;
DROP POLICY IF EXISTS "Motoristas podem inserir seus próprios dados" ON motoristas;
DROP POLICY IF EXISTS "Motoristas podem atualizar seus próprios dados" ON motoristas;

-- ============================================
-- PASSO 3: Criar políticas corretas
-- ============================================

-- Política para SELECT - Motoristas podem ver seus próprios dados
CREATE POLICY "Motoristas podem ver seus próprios dados" 
ON motoristas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERT - Motoristas podem criar seu próprio registro
-- IMPORTANTE: Esta política permite que qualquer usuário autenticado crie um registro
-- onde o user_id corresponde ao seu próprio auth.uid()
CREATE POLICY "Motoristas podem inserir seus próprios dados" 
ON motoristas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE - Motoristas podem atualizar seus próprios dados
CREATE POLICY "Motoristas podem atualizar seus próprios dados" 
ON motoristas 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PASSO 4: Verificar se as políticas foram criadas
-- ============================================
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
WHERE tablename = 'motoristas'
ORDER BY cmd, policyname;

-- ============================================
-- PASSO 5: Testar a política (opcional)
-- ============================================
-- Esta query simula o que acontece quando um usuário tenta inserir
-- Execute após fazer login como um usuário de teste
/*
-- Verificar se o usuário está autenticado
SELECT auth.uid() as current_user_id;

-- Tentar inserir (substitua pelos valores reais)
-- O user_id DEVE ser igual ao auth.uid()
INSERT INTO motoristas (
  user_id,
  cpf,
  telefone,
  veiculo,
  placa,
  status
) VALUES (
  auth.uid(),  -- IMPORTANTE: usar auth.uid() aqui
  '12345678901',
  '11999999999',
  'Honda Civic',
  'ABC1234',
  'aguardando_aprovacao'
);
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. A política de INSERT verifica se auth.uid() = user_id
-- 2. Isso significa que o user_id no INSERT DEVE ser o ID do usuário autenticado
-- 3. Se você está usando authData.user.id após signUp, certifique-se de que:
--    - O usuário está realmente autenticado (tem sessão)
--    - O user_id no INSERT corresponde ao auth.uid()
-- 4. Se a confirmação de email estiver habilitada, o usuário precisa confirmar antes
--    de poder fazer operações no banco

-- ============================================
-- VERIFICAR CONFIGURAÇÃO DE EMAIL
-- ============================================
-- No Supabase Dashboard:
-- 1. Vá em Authentication > Settings
-- 2. Verifique "Enable email confirmations"
-- 3. Se estiver habilitado, usuários precisam confirmar email antes de operações
-- 4. Para desenvolvimento, você pode desabilitar temporariamente

