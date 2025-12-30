# 🔒 Instruções para Corrigir o Erro de RLS

## Erro
```
new row violates row-level security policy for table "motoristas"
```

## Causa
A política de Row Level Security (RLS) não está permitindo que motoristas criem seus próprios registros.

## Solução

### Passo 1: Executar o Script SQL

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `SQL_RLS_FIX.sql`
4. Clique em **Run** para executar

### Passo 2: Verificar se Funcionou

Após executar o script, você deve ver uma tabela com as políticas criadas. Deve aparecer:
- `Motoristas podem ver seus próprios dados` (SELECT)
- `Motoristas podem inserir seus próprios dados` (INSERT) ← **Esta é a importante**
- `Motoristas podem atualizar seus próprios dados` (UPDATE)

### Passo 3: Testar o Cadastro

1. Tente criar um novo motorista através da aplicação
2. O cadastro deve funcionar normalmente

## Se o Problema Persistir

### Verificação 1: Usuário Autenticado
Certifique-se de que o usuário está autenticado quando tenta criar o registro. O código já faz isso corretamente:
```typescript
const { data: authData } = await supabase.auth.signUp({...})
// Usuário criado e autenticado antes do INSERT
```

### Verificação 2: user_id Correto
O `user_id` no INSERT deve corresponder ao `auth.uid()`. O código já faz isso:
```typescript
.insert({
  user_id: authData.user.id, // ← Deve ser igual a auth.uid()
  ...
})
```

### Verificação 3: Conflito com Políticas de Admin
Se você é admin e está testando, pode haver conflito. Tente:
1. Fazer logout
2. Criar uma conta nova de motorista
3. Testar o cadastro

## Script SQL Completo

O arquivo `SQL_RLS_FIX.sql` contém o script completo. Execute-o no SQL Editor do Supabase.

## Contato

Se após seguir estes passos o problema persistir, verifique:
- Console do navegador para erros adicionais
- Logs do Supabase para mais detalhes
- Se a tabela `motoristas` tem RLS habilitado




