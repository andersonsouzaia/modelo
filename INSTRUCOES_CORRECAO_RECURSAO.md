# 🚨 CORREÇÃO URGENTE: Recursão Infinita em RLS

## ⚠️ Problema Crítico

**Erro:** `infinite recursion detected in policy for relation "admins"`

**Sintomas:**
- Erros 500 ao tentar acessar `admins`, `empresas`, `motoristas`
- Sistema não consegue carregar dados do usuário
- Cadastro não funciona

**Causa:** A política RLS da tabela `admins` está criando um loop infinito ao verificar se o usuário é admin consultando a própria tabela `admins`.

## ✅ Solução Imediata

### Passo 1: Execute o Script SQL

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `SQL_FIX_RECURSION_ADMINS.sql`
4. Clique em **Run**

### Passo 2: Verifique se Funcionou

Execute esta query para verificar:

```sql
-- Verificar se a função foi criada
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin_user';

-- Verificar políticas de admins
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'admins'
ORDER BY policyname;
```

### Passo 3: Teste o Sistema

1. Recarregue a aplicação
2. Tente fazer login
3. Tente cadastrar uma empresa ou motorista
4. Verifique se não há mais erros 500

## 🔍 O Que o Script Faz

1. **Remove políticas problemáticas** que causam recursão
2. **Cria função `is_admin_user()`** com `SECURITY DEFINER` que bypassa RLS temporariamente
3. **Atualiza todas as políticas** para usar a função em vez de consultar `admins` diretamente
4. **Cria políticas básicas** para admins sem recursão

## 📋 Verificação de Erros

Se ainda houver problemas após executar o script:

### 1. Verificar Logs do Supabase
- Dashboard > Logs > Postgres Logs
- Procure por erros relacionados a RLS ou recursão

### 2. Verificar se a Função Está Funcionando
```sql
-- Testar função com seu user ID
SELECT is_admin_user('577735a8-aa45-4a28-9d22-1472c18c27a5'::uuid);
```

### 3. Verificar Políticas Ativas
```sql
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%admins%' THEN '⚠️ Pode causar recursão'
    ELSE '✅ OK'
  END as status
FROM pg_policies
WHERE tablename IN ('users', 'empresas', 'motoristas', 'admins')
ORDER BY tablename, policyname;
```

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Não deve haver mais erros de recursão infinita
- ✅ Queries para todas as tabelas devem funcionar
- ✅ Login deve funcionar normalmente
- ✅ Cadastro deve funcionar normalmente
- ✅ Admin deve conseguir acessar todas as funcionalidades

## ⚠️ Importante

- Execute o script **imediatamente** para resolver o problema
- O script é seguro e não remove dados
- A função `is_admin_user()` é segura e apenas verifica se um usuário é admin
- Não há risco de segurança

## 🆘 Se Ainda Não Funcionar

1. Verifique se executou o script completo
2. Verifique se não há erros de sintaxe SQL
3. Verifique os logs do Supabase
4. Tente fazer logout e login novamente
5. Limpe o cache do navegador




