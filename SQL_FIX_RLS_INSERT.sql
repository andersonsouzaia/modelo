-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS PARA INSERT
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Este script garante que usuários possam criar seus próprios registros

-- ============================================
-- POLÍTICAS PARA TABELA users
-- ============================================

-- Permitir que usuários criem seu próprio registro após signUp
DROP POLICY IF EXISTS "Users podem inserir seus próprios dados" ON users;

CREATE POLICY "Users podem inserir seus próprios dados" ON users FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- Permitir que usuários leiam seus próprios dados
DROP POLICY IF EXISTS "Users podem ler seus próprios dados" ON users;

CREATE POLICY "Users podem ler seus próprios dados" ON users FOR
SELECT USING (auth.uid () = id);

-- Permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Users podem atualizar seus próprios dados" ON users;

CREATE POLICY "Users podem atualizar seus próprios dados" ON users FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- ============================================
-- POLÍTICAS PARA TABELA empresas
-- ============================================

-- Permitir que usuários criem registro de empresa após criar em users
DROP POLICY IF EXISTS "Empresas podem inserir seus próprios dados" ON empresas;

CREATE POLICY "Empresas podem inserir seus próprios dados" ON empresas FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- Permitir que empresas leiam seus próprios dados
DROP POLICY IF EXISTS "Empresas podem ler seus próprios dados" ON empresas;

CREATE POLICY "Empresas podem ler seus próprios dados" ON empresas FOR
SELECT USING (auth.uid () = id);

-- Permitir que empresas atualizem seus próprios dados
DROP POLICY IF EXISTS "Empresas podem atualizar seus próprios dados" ON empresas;

CREATE POLICY "Empresas podem atualizar seus próprios dados" ON empresas FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- ============================================
-- POLÍTICAS PARA TABELA motoristas
-- ============================================

-- Permitir que usuários criem registro de motorista após criar em users
DROP POLICY IF EXISTS "Motoristas podem inserir seus próprios dados" ON motoristas;

CREATE POLICY "Motoristas podem inserir seus próprios dados" ON motoristas FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- Permitir que motoristas leiam seus próprios dados
DROP POLICY IF EXISTS "Motoristas podem ler seus próprios dados" ON motoristas;

CREATE POLICY "Motoristas podem ler seus próprios dados" ON motoristas FOR
SELECT USING (auth.uid () = id);

-- Permitir que motoristas atualizem seus próprios dados
DROP POLICY IF EXISTS "Motoristas podem atualizar seus próprios dados" ON motoristas;

CREATE POLICY "Motoristas podem atualizar seus próprios dados" ON motoristas FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se as políticas foram criadas:

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
    tablename IN (
        'users',
        'empresas',
        'motoristas'
    )
ORDER BY tablename, policyname;


