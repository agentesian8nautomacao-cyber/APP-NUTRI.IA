# 🔧 Resolver Erro: Coluna account_type não existe

## ❌ Erro Encontrado

```
ERROR: 42703: column "account_type" of relation "user_profiles" does not exist
```

## ✅ Solução

A coluna `account_type` precisa ser adicionada à tabela `user_profiles` antes de usar a funcionalidade de ativação de cupom.

### Passo 1: Executar Script de Adição

Execute o script SQL:

```sql
-- Execute: adicionar_account_type.sql
```

Este script irá:
1. ✅ Criar o ENUM `account_type` (se não existir)
2. ✅ Adicionar a coluna `account_type` em `user_profiles` com valor padrão `'USER_B2C'`
3. ✅ Criar índice para performance
4. ✅ Adicionar comentário de documentação

### Passo 2: Verificar Criação

Após executar, verifique se a coluna foi criada:

```sql
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'account_type';
```

**Resultado esperado**: Deve retornar 1 linha com informações da coluna.

### Passo 3: Testar Novamente

Após adicionar a coluna, execute novamente:

```sql
-- Execute: testar_ativacao_cupom.sql
```

---

## 📋 Valores do ENUM account_type

- `'USER_B2C'` - Usuário Comum (paga própria assinatura)
- `'USER_GYM'` - Aluno de Academia (vinculado a conta mãe)
- `'USER_PERSONAL'` - Personal Trainer (conta administrativa)

---

## 🔗 Scripts Relacionados

Se você já executou `supabase_roles_permissions_schema.sql`, a coluna já deveria existir. Se não, execute:

1. `adicionar_account_type.sql` - Adiciona apenas a coluna (mais simples)
2. `supabase_roles_permissions_schema.sql` - Sistema completo de roles e permissões (mais completo)

---

**Nota**: O script `testar_ativacao_cupom.sql` foi atualizado para verificar se a coluna existe antes de tentar atualizá-la, evitando erros futuros.

