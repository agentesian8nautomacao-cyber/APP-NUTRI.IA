# 🔧 Resolver Erro: subscription_status 'trial' não é válido

## Problema
Ao tentar criar/atualizar um usuário trial, ocorre o erro:
```
ERROR: 23514: new row for relation "user_profiles" violates check constraint "user_profiles_subscription_status_check"
```

Isso acontece porque a constraint CHECK de `subscription_status` não permite o valor `'trial'`.

## Valores Atuais Permitidos
A constraint atual só permite:
- `'FREE'`
- `'PREMIUM_UNLIMITED'`
- `'active'`
- `'inactive'`
- `'expired'`

## Solução

### Opção 1: Adicionar 'trial' à Constraint (Recomendado)

Execute o script `adicionar_trial_subscription_status.sql` no Supabase SQL Editor:

```sql
-- Este script adiciona 'trial' como valor válido para subscription_status
-- Execute este script PRIMEIRO antes de criar usuários trial
```

**Passos:**
1. Acesse **Supabase Dashboard > SQL Editor**
2. Execute `adicionar_trial_subscription_status.sql`
3. Depois execute `criar_atualizar_usuario_trial.sql`

### Opção 2: Usar 'FREE' Temporariamente

Se você não quiser adicionar 'trial' à constraint, o script `criar_atualizar_usuario_trial.sql` foi atualizado para usar `'FREE'` temporariamente.

**Nota:** Se usar esta opção, você precisará verificar `subscription_expiry` no código para identificar usuários trial, ao invés de verificar `subscription_status === 'trial'`.

## Scripts Disponíveis

1. **`adicionar_trial_subscription_status.sql`**
   - Adiciona 'trial' à constraint CHECK
   - Execute PRIMEIRO

2. **`criar_atualizar_usuario_trial.sql`**
   - Cria/atualiza perfil de usuário trial
   - Agora usa 'FREE' temporariamente (ou 'trial' se você executou o script acima)

## Verificar Constraint Atual

Para verificar quais valores são permitidos atualmente:

```sql
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND conname = 'user_profiles_subscription_status_check';
```

## Após Corrigir

Após executar `adicionar_trial_subscription_status.sql`, você pode usar `subscription_status = 'trial'` normalmente nos scripts.

**Exemplo:**
```sql
UPDATE user_profiles
SET subscription_status = 'trial',
    subscription_expiry = (NOW() + INTERVAL '3 days')::TIMESTAMPTZ
WHERE user_id = '...';
```

## Nota Importante

Se você já tem usuários com `subscription_status = 'FREE'` que deveriam ser trial, você pode atualizá-los depois:

```sql
-- Atualizar usuários FREE com subscription_expiry para 'trial'
UPDATE user_profiles
SET subscription_status = 'trial'
WHERE subscription_status = 'FREE'
  AND subscription_expiry IS NOT NULL
  AND subscription_expiry > NOW();
```

