# 🔧 Correção de Recursão Infinita em RLS

## 🚨 Problema Identificado

**Erro:** `infinite recursion detected in policy for relation "admins"`

**Causa:** As políticas RLS da tabela `admins` estavam criando um loop infinito:
1. Política verifica se usuário é admin consultando tabela `admins`
2. Para consultar `admins`, precisa verificar se é admin
3. Isso cria um loop infinito

## ✅ Solução Implementada

### 1. Função Helper `is_admin_user()`
Criada uma função PostgreSQL com `SECURITY DEFINER` que bypassa RLS temporariamente para verificar se um usuário é admin sem causar recursão.

### 2. Políticas Corrigidas
Todas as políticas que verificavam se o usuário é admin agora usam a função `is_admin_user()` em vez de fazer `EXISTS` diretamente na tabela `admins`.

### 3. Queries Sequenciais no AuthContext
Modificado o `AuthContext` para fazer queries sequenciais em vez de paralelas, evitando múltiplas verificações simultâneas que podem causar problemas.

## 📋 Passos para Corrigir

### 1. Execute o Script SQL
Execute o arquivo `SQL_FIX_RECURSION_ADMINS.sql` no SQL Editor do Supabase.

### 2. Verifique se Funcionou
```sql
-- Verificar políticas de admins
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'admins';

-- Testar função
SELECT is_admin_user('577735a8-aa45-4a28-9d22-1472c18c27a5'::uuid);
```

### 3. Teste o Sistema
- Tente fazer login como admin
- Tente cadastrar uma empresa
- Tente cadastrar um motorista
- Verifique se não há mais erros 500

## 🔍 Verificação de Erros

Se ainda houver problemas:

1. **Verifique os logs do Supabase:**
   - Dashboard > Logs > Postgres Logs
   - Procure por erros relacionados a RLS

2. **Verifique se a função foi criada:**
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'is_admin_user';
   ```

3. **Verifique se as políticas foram atualizadas:**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE policyname LIKE '%admin%'
   ORDER BY tablename, policyname;
   ```

## ⚠️ Importante

- A função `is_admin_user()` usa `SECURITY DEFINER`, o que significa que ela executa com privilégios do criador da função
- Isso é seguro porque a função apenas verifica se um usuário existe na tabela `admins` e está ativo
- Não há risco de segurança, pois não permite acesso não autorizado

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Não deve haver mais erros de recursão infinita
- ✅ Queries para `admins`, `empresas` e `motoristas` devem funcionar
- ✅ Cadastro de usuários deve funcionar normalmente
- ✅ Login de admin deve funcionar




