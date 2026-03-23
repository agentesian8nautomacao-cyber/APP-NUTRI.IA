# 📊 Status da Implementação de Ativação de Cupom

## ✅ Componentes Criados com Sucesso

### 1. Estrutura do Banco de Dados
- ✅ Campo `quantidade_disponivel` na tabela `coupons`
- ✅ Função `activate_coupon_internal` criada
- ✅ Trigger `trigger_update_quantidade_disponivel` criado
- ✅ Função `update_quantidade_disponivel` criada
- ✅ Coluna `account_type` em `user_profiles` criada

### 2. Estado Atual do Cupom de Teste
```json
{
  "code": "TESTE-ATIVACAO",
  "current_uses": 0,
  "quantidade_disponivel": 10,
  "max_uses": 10
}
```

**Status**: Cupom criado e pronto para ativação ✅

---

## 🧪 Próximos Passos para Testar

### Opção 1: Teste Automatizado (Recomendado)

```sql
-- Execute: testar_ativacao_cupom_simples.sql
-- Este script busca automaticamente um usuário e executa a ativação
```

### Opção 2: Teste Manual via SQL

```sql
-- 1. Obter ID de um perfil de usuário
SELECT id, user_id, name, account_type 
FROM user_profiles 
LIMIT 1;

-- 2. Ativar o cupom (substitua o UUID abaixo pelo ID real retornado acima)
-- Exemplo: SELECT activate_coupon_internal('TESTE-ATIVACAO', '123e4567-e89b-12d3-a456-426614174000'::UUID);
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'COLE-O-UUID-AQUI'::UUID);

-- 3. Verificar resultado
SELECT 
  code,
  current_uses,
  quantidade_disponivel,
  max_uses
FROM coupons
WHERE code = 'TESTE-ATIVACAO';
```

**Resultado esperado após ativação**:
- `current_uses`: 1 (aumentou)
- `quantidade_disponivel`: 9 (diminuiu)

### Opção 2: Teste no App

1. **Fazer login** no app
2. **Abrir menu lateral** → Clicar em **"Inserir Cupom"**
3. **Inserir código**: `TESTE-ATIVACAO`
4. **Clicar em "Ativar Cupom"**
5. **Verificar**:
   - Mensagem de sucesso aparece
   - Perfil é atualizado com novo plano
   - Cupom é decrementado

---

## 🔍 Verificações Adicionais

### Verificar se há usuários no banco:

```sql
-- Listar usuários autenticados
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- Listar perfis de usuários
SELECT 
  up.id as profile_id,
  up.user_id,
  up.name,
  up.account_type,
  up.plan_type,
  up.subscription_status
FROM user_profiles up
LIMIT 5;
```

### Verificar estado completo do cupom:

```sql
SELECT 
  code,
  plan_linked,
  max_uses,
  current_uses,
  quantidade_disponivel,
  is_active,
  CASE 
    WHEN quantidade_disponivel > 0 THEN '✅ Disponível'
    WHEN quantidade_disponivel = 0 THEN '❌ Esgotado'
    ELSE '⚠️ Indefinido'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';
```

---

## 📝 Notas Importantes

1. **ID do Perfil vs ID do Usuário**:
   - A função `activate_coupon_internal` espera o **`id`** do `user_profiles` (não o `user_id` do `auth.users`)
   - Use `user_profiles.id`, não `user_profiles.user_id`

2. **Account Type**:
   - Para cupons de Academia (`academy_starter`, `academy_growth`, `academy_pro`):
     - Usuário deve ter `account_type = 'USER_GYM'` ou `NULL`
   - Para cupons de Personal (`personal_team_5`, `personal_team_15`):
     - Usuário deve ter `account_type = 'USER_GYM'` ou `NULL`
   - Para cupons B2C (`mensal`, `anual`, `free`):
     - Sem restrição de `account_type`

3. **Cupom de Teste**:
   - O cupom `TESTE-ATIVACAO` está configurado como `academy_starter`
   - Portanto, o usuário precisa ter `account_type = 'USER_GYM'` ou `NULL`

---

## ✅ Checklist de Validação

Após testar a ativação, verifique:

- [ ] `current_uses` do cupom aumentou
- [ ] `quantidade_disponivel` do cupom diminuiu
- [ ] `plan_type` do usuário foi atualizado
- [ ] `subscription_status` do usuário foi atualizado para `'active'`
- [ ] `account_type` do usuário foi atualizado (se aplicável)
- [ ] Vínculo em `user_coupon_links` foi criado
- [ ] Função retornou `{"success": true, ...}`

---

## 🐛 Troubleshooting

### Se a ativação não funcionar:

1. **Verificar se o usuário tem perfil**:
   ```sql
   SELECT * FROM user_profiles WHERE id = 'seu-profile-id';
   ```

2. **Verificar se o cupom está ativo**:
   ```sql
   SELECT * FROM coupons WHERE code = 'TESTE-ATIVACAO';
   ```

3. **Verificar account_type do usuário**:
   ```sql
   SELECT id, account_type, plan_type 
   FROM user_profiles 
   WHERE id = 'seu-profile-id';
   ```

4. **Verificar logs da função**:
   - Execute a função e veja o JSON retornado
   - Se `success: false`, verifique o campo `error` e `message`

---

**Última atualização**: 2025-01-27  
**Status**: ✅ Estrutura criada, pronto para testes

