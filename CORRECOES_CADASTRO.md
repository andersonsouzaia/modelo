# ✅ Correções Implementadas - Cadastro e Lint

## 🔧 Problemas Identificados e Corrigidos

### 1. ✅ Erros de Lint
**Problema:** Componentes `Image` do Lucide React não precisam de `alt` (são ícones SVG, não imagens HTML).

**Solução:** Removido `alt` incorreto dos componentes `Image` do Lucide.

### 2. ✅ Cadastro Não Salvando no Banco
**Problema:** O schema V2.0 requer que primeiro seja criado um registro na tabela `users` antes de criar em `empresas` ou `motoristas`.

**Causa Raiz:**
- O código estava tentando inserir diretamente em `empresas`/`motoristas`
- A foreign key `empresas.id REFERENCES users(id)` não era satisfeita
- As políticas RLS podem estar bloqueando INSERT sem registro em `users`

**Solução Implementada:**

#### Para Cadastro de Empresa (`cadastro-empresa/page.tsx`):
1. Criar usuário no Supabase Auth
2. **NOVO:** Criar registro na tabela `users` primeiro
3. Criar registro na tabela `empresas` (referencia `users.id`)
4. Se falhar em qualquer etapa, limpar dados criados

#### Para Cadastro de Motorista (`cadastro-motorista/page.tsx`):
1. Criar usuário no Supabase Auth
2. **NOVO:** Criar registro na tabela `users` primeiro
3. Criar registro na tabela `motoristas` (referencia `users.id`)
4. Se falhar em qualquer etapa, limpar dados criados

## 📋 Script SQL para Corrigir RLS

Criei o arquivo `SQL_FIX_RLS_INSERT.sql` com políticas RLS que garantem:
- Usuários podem inserir seus próprios registros em `users`
- Empresas podem inserir seus próprios registros em `empresas`
- Motoristas podem inserir seus próprios registros em `motoristas`

**Execute este script no SQL Editor do Supabase** para garantir que as políticas RLS estejam corretas.

## 🔍 Verificação

### Verificar se as políticas RLS estão corretas:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'empresas', 'motoristas')
ORDER BY tablename, policyname;
```

### Verificar se há registros sendo criados:
```sql
-- Verificar users criados recentemente
SELECT id, tipo, email, nome, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar empresas criadas recentemente
SELECT id, cnpj, razao_social, status, created_at 
FROM empresas 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar motoristas criados recentemente
SELECT id, cpf, telefone, veiculo, status, created_at 
FROM motoristas 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚨 Possíveis Problemas Restantes

### 1. Email Confirmation
Se o Supabase estiver configurado para exigir confirmação de email:
- O usuário será criado no Auth, mas não terá sessão
- O código tenta criar em `users` sem sessão, o que pode falhar por RLS

**Solução:** O código já trata isso tentando fazer login após signUp se não houver sessão.

### 2. RLS Policies
Se as políticas RLS não permitirem INSERT:
- Verifique se o script `SQL_FIX_RLS_INSERT.sql` foi executado
- Verifique se `auth.uid()` retorna o ID correto durante o INSERT

### 3. Foreign Key Constraints
Se houver erro de foreign key:
- Verifique se o registro em `users` foi criado antes de tentar criar em `empresas`/`motoristas`
- Verifique se o `id` usado é o mesmo do `auth.users`

## 📝 Próximos Passos

1. ✅ Executar `SQL_FIX_RLS_INSERT.sql` no Supabase
2. ✅ Testar cadastro de empresa
3. ✅ Testar cadastro de motorista
4. ✅ Verificar logs do console para erros específicos
5. ✅ Verificar se os registros estão sendo criados no banco

## 🐛 Debug

Se ainda houver problemas:

1. **Verificar console do navegador** para erros específicos
2. **Verificar Network tab** para ver as requisições ao Supabase
3. **Verificar logs do Supabase** em Dashboard > Logs
4. **Verificar RLS policies** com a query acima
5. **Testar INSERT manual** no SQL Editor do Supabase

## ✅ Checklist de Teste

- [ ] Executar `SQL_FIX_RLS_INSERT.sql`
- [ ] Testar cadastro de empresa
- [ ] Verificar se registro foi criado em `users`
- [ ] Verificar se registro foi criado em `empresas`
- [ ] Testar cadastro de motorista
- [ ] Verificar se registro foi criado em `users`
- [ ] Verificar se registro foi criado em `motoristas`
- [ ] Verificar se não há erros no console
- [ ] Verificar se build compila sem erros




