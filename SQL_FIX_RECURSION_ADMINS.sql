-- ============================================
-- CORREÇÃO DE RECURSÃO INFINITA EM POLÍTICAS RLS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script corrige o problema de recursão infinita nas políticas de admins

-- ============================================
-- REMOVER POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Remover todas as políticas de admins que causam recursão
DROP POLICY IF EXISTS "Admins têm acesso total a admins" ON admins;
DROP POLICY IF EXISTS "Admins podem gerenciar outros admins" ON admins;

-- ============================================
-- CRIAR POLÍTICA CORRIGIDA PARA ADMINS
-- ============================================

-- Política para admins lerem seus próprios dados (sem recursão)
CREATE POLICY "Admins podem ver seus próprios dados" 
ON admins 
FOR SELECT 
USING (auth.uid() = id);

-- Política para admins atualizarem seus próprios dados (sem recursão)
CREATE POLICY "Admins podem atualizar seus próprios dados" 
ON admins 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para admins inserirem seus próprios dados (sem recursão)
CREATE POLICY "Admins podem inserir seus próprios dados" 
ON admins 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICA PARA ADMINS GERENCIAREM OUTROS ADMINS
-- ============================================
-- Esta política usa uma função que evita recursão verificando diretamente auth.users

-- Criar função helper para verificar se é admin (sem recursão)
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar diretamente na tabela admins sem usar RLS
  -- Usando SECURITY DEFINER para bypass RLS temporariamente
  RETURN EXISTS (
    SELECT 1 
    FROM admins 
    WHERE admins.id = user_id 
    AND admins.ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para admins gerenciarem outros admins (usando função)
CREATE POLICY "Admins podem gerenciar outros admins" 
ON admins 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- ============================================
-- CORRIGIR POLÍTICAS DE ACESSO TOTAL DOS ADMINS
-- ============================================
-- Substituir políticas que usam EXISTS com admins por função helper

-- Atualizar política de users para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a users" ON users;
CREATE POLICY "Admins têm acesso total a users" 
ON users 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de empresas para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a empresas" ON empresas;
CREATE POLICY "Admins têm acesso total a empresas" 
ON empresas 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de motoristas para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a motoristas" ON motoristas;
CREATE POLICY "Admins têm acesso total a motoristas" 
ON motoristas 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de tablets para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a tablets" ON tablets;
CREATE POLICY "Admins têm acesso total a tablets" 
ON tablets 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de campanhas para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a campanhas" ON campanhas;
CREATE POLICY "Admins têm acesso total a campanhas" 
ON campanhas 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de midias para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a midias" ON midias;
CREATE POLICY "Admins têm acesso total a midias" 
ON midias 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de campanha_tablet para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a campanha_tablet" ON campanha_tablet;
CREATE POLICY "Admins têm acesso total a campanha_tablet" 
ON campanha_tablet 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de pagamentos para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a pagamentos" ON pagamentos;
CREATE POLICY "Admins têm acesso total a pagamentos" 
ON pagamentos 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de repasses para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a repasses" ON repasses;
CREATE POLICY "Admins têm acesso total a repasses" 
ON repasses 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de ganhos_motorista para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a ganhos_motorista" ON ganhos_motorista;
CREATE POLICY "Admins têm acesso total a ganhos_motorista" 
ON ganhos_motorista 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de visualizacoes_campanha para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a visualizacoes_campanha" ON visualizacoes_campanha;
CREATE POLICY "Admins têm acesso total a visualizacoes_campanha" 
ON visualizacoes_campanha 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de notificacoes para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a notificacoes" ON notificacoes;
CREATE POLICY "Admins têm acesso total a notificacoes" 
ON notificacoes 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de tickets_suporte para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a tickets_suporte" ON tickets_suporte;
CREATE POLICY "Admins têm acesso total a tickets_suporte" 
ON tickets_suporte 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de mensagens_ticket para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a mensagens_ticket" ON mensagens_ticket;
CREATE POLICY "Admins têm acesso total a mensagens_ticket" 
ON mensagens_ticket 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de activity_logs para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a activity_logs" ON activity_logs;
CREATE POLICY "Admins têm acesso total a activity_logs" 
ON activity_logs 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de configuracoes_sistema para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a configuracoes_sistema" ON configuracoes_sistema;
CREATE POLICY "Admins têm acesso total a configuracoes_sistema" 
ON configuracoes_sistema 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de planos para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a planos" ON planos;
CREATE POLICY "Admins têm acesso total a planos" 
ON planos 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de assinaturas_empresa para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a assinaturas_empresa" ON assinaturas_empresa;
CREATE POLICY "Admins têm acesso total a assinaturas_empresa" 
ON assinaturas_empresa 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Atualizar política de historico_localizacao para usar função
DROP POLICY IF EXISTS "Admins têm acesso total a historico_localizacao" ON historico_localizacao;
CREATE POLICY "Admins têm acesso total a historico_localizacao" 
ON historico_localizacao 
FOR ALL 
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se não há mais políticas problemáticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admins'
ORDER BY policyname;

-- Testar a função
SELECT is_admin_user('577735a8-aa45-4a28-9d22-1472c18c27a5'::uuid);




