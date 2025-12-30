-- ============================================
-- VERIFICAR TODAS AS POLÍTICAS RLS
-- ============================================
-- Execute este script para verificar todas as políticas RLS

-- Ver todas as políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'Sem USING'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'Sem WITH CHECK'
    END as with_check_clause
FROM pg_policies
WHERE
    schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- Verificar se RLS está habilitado em todas as tabelas
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE
    schemaname = 'public'
ORDER BY tablename;

-- Verificar usuário atual (se autenticado)
SELECT
    auth.uid () as current_user_id,
    auth.email () as current_user_email,
    CASE
        WHEN auth.uid () IS NULL THEN '❌ Não autenticado'
        ELSE '✅ Autenticado'
    END as auth_status;

-- Verificar se há admin ativo para o usuário atual
SELECT
    a.*,
    CASE
        WHEN a.user_id = auth.uid () THEN '✅ Este é seu registro'
        ELSE 'Outro admin'
    END as status
FROM admins a
WHERE
    a.ativo = true
    AND a.user_id = auth.uid ();


