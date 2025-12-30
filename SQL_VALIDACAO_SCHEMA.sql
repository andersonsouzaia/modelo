-- ============================================
-- SCRIPT DE VALIDAÇÃO DO SCHEMA V2.0
-- ============================================
-- Execute este script após executar schema_completo_v2.sql
-- para verificar se tudo foi criado corretamente

-- ============================================
-- VERIFICAR TABELAS CRIADAS
-- ============================================

SELECT 
    'Tabelas criadas: ' || COUNT(*)::text as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
);

-- Listar todas as tabelas criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'empresas', 'motoristas', 'admins', 'tablets', 
            'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
            'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
            'notificacoes', 'tickets_suporte', 'mensagens_ticket',
            'activity_logs', 'configuracoes_sistema', 'planos',
            'assinaturas_empresa', 'historico_localizacao'
        ) THEN '✅'
        ELSE '⚠️'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- VERIFICAR RLS HABILITADO
-- ============================================

SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅'
        ELSE '❌'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
)
ORDER BY tablename;

-- ============================================
-- VERIFICAR POLÍTICAS RLS CRIADAS
-- ============================================

SELECT 
    tablename,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅'
        ELSE '❌'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
)
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- VERIFICAR FUNÇÕES CRIADAS
-- ============================================

SELECT 
    routine_name,
    routine_type,
    '✅' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column',
    'sync_user_from_auth',
    'calcular_ganhos_motorista',
    'atualizar_ganhos_motorista'
)
ORDER BY routine_name;

-- ============================================
-- VERIFICAR TRIGGERS CRIADOS
-- ============================================

SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    '✅' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- ============================================
-- VERIFICAR ÍNDICES CRIADOS
-- ============================================

SELECT 
    tablename,
    indexname,
    '✅' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
)
ORDER BY tablename, indexname;

-- ============================================
-- VERIFICAR FOREIGN KEYS
-- ============================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- VERIFICAR DADOS INICIAIS
-- ============================================

SELECT 
    'Configurações iniciais: ' || COUNT(*)::text as status
FROM configuracoes_sistema;

-- Listar configurações criadas
SELECT 
    chave,
    valor,
    tipo,
    categoria,
    '✅' as status
FROM configuracoes_sistema
ORDER BY categoria, chave;

-- ============================================
-- RESUMO FINAL
-- ============================================

SELECT 
    'RESUMO DA VALIDAÇÃO' as tipo,
    COUNT(DISTINCT t.table_name) as total_tabelas,
    COUNT(DISTINCT p.policyname) as total_policies,
    COUNT(DISTINCT r.routine_name) as total_funcoes,
    COUNT(DISTINCT tr.trigger_name) as total_triggers,
    COUNT(DISTINCT i.indexname) as total_indices
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name
LEFT JOIN information_schema.routines r ON r.routine_schema = 'public'
LEFT JOIN information_schema.triggers tr ON tr.event_object_table = t.table_name
LEFT JOIN pg_indexes i ON i.tablename = t.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'users', 'empresas', 'motoristas', 'admins', 'tablets', 
    'campanhas', 'midias', 'campanha_tablet', 'pagamentos', 
    'repasses', 'ganhos_motorista', 'visualizacoes_campanha',
    'notificacoes', 'tickets_suporte', 'mensagens_ticket',
    'activity_logs', 'configuracoes_sistema', 'planos',
    'assinaturas_empresa', 'historico_localizacao'
);




