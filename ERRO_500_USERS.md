# 🔍 Análise do Erro 500 ao Criar Registro em Users

## 🚨 Problema

**Erro:** `Failed to load resource: the server responded with a status of 500 ()`
**Mensagem:** `Erro ao criar registro em users`

## 🔍 Causa Raiz Identificada

### Problema 1: Trigger Automático
O schema tem um trigger `sync_user_on_auth_insert` que tenta criar automaticamente um registro em `users` quando um usuário é criado no `auth.users`. 

**Problemas possíveis:**
1. O trigger pode estar falhando por RLS
2. O trigger pode criar um registro básico (só `id` e `email`)
3. Quando tentamos criar manualmente com mais campos, pode dar conflito ou erro 500

### Problema 2: Falta de Política RLS para INSERT
O schema original não tem política RLS para INSERT em `users`, apenas SELECT e UPDATE.

### Problema 3: Conflito entre Trigger e Inserção Manual
- Trigger cria registro básico automaticamente
- Código tenta criar registro completo manualmente
- Pode dar erro de duplicação ou RLS

## ✅ Soluções Implementadas

### 1. Script SQL (`SQL_FIX_USERS_INSERT.sql`)
- Corrige o trigger para usar `SECURITY DEFINER` (bypass RLS)
- Adiciona tratamento de erros no trigger
- Cria política RLS para INSERT em `users`
- Garante que o trigger funcione corretamente

### 2. Código Atualizado
- Mudado de `insert()` para `upsert()` nos cadastros
- Adicionado tratamento para erro de duplicação
- Se já existir (criado pelo trigger), atualiza em vez de criar

## 📋 Passos para Resolver

### Passo 1: Execute o Script SQL (URGENTE)
1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o arquivo `SQL_FIX_USERS_INSERT.sql`
4. Verifique se não há erros

### Passo 2: Verifique se Funcionou
```sql
-- Verificar se a função foi criada corretamente
SELECT proname, prosecdef, prosrc
FROM pg_proc 
WHERE proname = 'sync_user_from_auth';

-- Verificar políticas de users
SELECT tablename, policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'users';

-- Verificar trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'sync_user_on_auth_insert';
```

### Passo 3: Teste o Cadastro
1. Tente cadastrar uma nova empresa
2. Verifique o console do navegador
3. Verifique se o registro foi criado no banco:
   ```sql
   SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM empresas ORDER BY created_at DESC LIMIT 5;
   ```

## 🔧 O Que Foi Modificado no Código

### `cadastro-empresa/page.tsx` e `cadastro-motorista/page.tsx`:
- ✅ Mudado de `insert()` para `upsert()` com `onConflict: 'id'`
- ✅ Adicionado tratamento para erro de duplicação
- ✅ Se já existir, atualiza em vez de criar novo

## 🎯 Resultado Esperado

Após executar o script SQL:
- ✅ Trigger cria registro básico automaticamente quando auth user é criado
- ✅ Código atualiza o registro com campos completos usando `upsert`
- ✅ Não deve haver mais erro 500
- ✅ Cadastro deve funcionar normalmente

## ⚠️ Importante

- Execute o script SQL **imediatamente**
- O script é seguro e não remove dados existentes
- A função `sync_user_from_auth()` agora usa `SECURITY DEFINER` para bypass RLS
- O código agora lida corretamente com registros já existentes

## 🐛 Se Ainda Não Funcionar

1. Verifique os logs do Supabase (Dashboard > Logs > Postgres Logs)
2. Verifique se o trigger está funcionando:
   ```sql
   -- Verificar últimos registros criados
   SELECT id, email, tipo, created_at 
   FROM users 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
3. Verifique se há erros de constraint:
   ```sql
   -- Verificar constraints da tabela users
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'users'::regclass;
   ```




