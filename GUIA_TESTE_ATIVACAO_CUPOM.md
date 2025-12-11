# 🧪 Guia de Teste - Ativação de Cupom

## ✅ Verificação Inicial

Após executar `supabase_activate_coupon_function.sql` e receber "Success. No rows returned", execute o script de verificação:

```sql
-- Execute: verificar_ativacao_cupom.sql
```

Este script verifica:
- ✅ Campo `quantidade_disponivel` existe na tabela `coupons`
- ✅ Função `activate_coupon_internal` foi criada
- ✅ Trigger `trigger_update_quantidade_disponivel` existe
- ✅ Função `update_quantidade_disponivel` existe
- ✅ Permissões estão corretas
- ✅ Valores de `quantidade_disponivel` estão corretos

**Resultado esperado**: Todos os componentes devem mostrar `✅ Criado/Criada`

---

## 🧪 Teste Manual no Banco

### 1. Criar Cupom de Teste

```sql
INSERT INTO coupons (code, plan_linked, max_uses, current_uses, is_active, quantidade_disponivel)
VALUES ('TESTE-ATIVACAO', 'academy_starter', 10, 0, true, 10)
ON CONFLICT (code) DO UPDATE
SET quantidade_disponivel = 10, current_uses = 0;
```

### 2. Obter ID de Usuário de Teste

```sql
-- Listar usuários disponíveis (auth.users)
SELECT id, email FROM auth.users LIMIT 5;

-- Verificar se o usuário tem perfil (user_profiles)
SELECT up.id as profile_id, up.user_id, up.name, up.account_type
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
LIMIT 5;

-- Criar perfil de teste se não existir
-- (substitua 'auth-user-id-aqui' pelo UUID de auth.users)
INSERT INTO user_profiles (
  user_id, 
  name, 
  age, 
  gender, 
  height, 
  weight, 
  activity_level, 
  goal,
  account_type
)
VALUES (
  'auth-user-id-aqui'::UUID, 
  'Usuário Teste', 
  30, 
  'Female', 
  170, 
  70, 
  'Moderate', 
  'Lose Weight',
  'USER_GYM'
)
ON CONFLICT (user_id) DO UPDATE SET account_type = 'USER_GYM';
```

### 3. Testar Ativação

```sql
-- IMPORTANTE: Use o id do user_profiles, NÃO o user_id do auth.users
-- Substitua 'profile-id-aqui' pelo UUID do user_profiles.id
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'profile-id-aqui'::UUID);
```

**Resultado esperado**:
```json
{
  "success": true,
  "message": "Cupom ativado com sucesso!",
  "plan_type": "academy_starter",
  "account_type": "USER_GYM"
}
```

### 4. Verificar Decremento

```sql
SELECT 
  code,
  current_uses,
  quantidade_disponivel,
  max_uses
FROM coupons
WHERE code = 'TESTE-ATIVACAO';
```

**Resultado esperado**:
- `current_uses`: 1 (aumentou)
- `quantidade_disponivel`: 9 (diminuiu)

### 5. Verificar Perfil Atualizado

```sql
-- Use o id do user_profiles (não o user_id)
SELECT 
  id,
  user_id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = 'profile-id-aqui';
```

**Resultado esperado**:
- `plan_type`: `'academy_starter'`
- `subscription_status`: `'active'`
- `account_type`: `'USER_GYM'`

---

## 📱 Teste no App

### 1. Preparação
- Ter um usuário autenticado no app
- Ter um cupom válido no banco com `quantidade_disponivel > 0`

### 2. Fluxo de Teste
1. **Fazer login** no app
2. **Abrir menu lateral** (ícone de hambúrguer)
3. **Clicar em "Inserir Cupom"**
4. **Inserir código do cupom** (ex: `TESTE-ATIVACAO`)
5. **Clicar em "Ativar Cupom"**

### 3. Resultados Esperados

#### ✅ Sucesso
- Mensagem verde: "Cupom ativado com sucesso!"
- Redirecionamento automático para dashboard
- Perfil atualizado com novo plano

#### ❌ Erros Possíveis

| Erro | Causa | Solução |
|------|-------|---------|
| "Cupom não encontrado ou inativo" | Cupom não existe ou `is_active = false` | Verificar se cupom existe e está ativo |
| "Este cupom não possui mais ativações disponíveis" | `quantidade_disponivel = 0` | Criar novo cupom ou resetar estoque |
| "Este cupom é válido apenas para perfis de Academia ou Personal Trainer" | Perfil incompatível | Verificar `account_type` do usuário |
| "Perfil do usuário não encontrado" | Usuário não tem perfil | Criar perfil na tabela `user_profiles` |

---

## 🔍 Teste de Casos Extremos

### 1. Teste de Race Condition
```sql
-- Criar cupom com apenas 1 ativação disponível
UPDATE coupons 
SET quantidade_disponivel = 1, max_uses = 1, current_uses = 0
WHERE code = 'TESTE-ATIVACAO';

-- Tentar ativar com 2 usuários diferentes simultaneamente
-- Apenas 1 deve conseguir ativar
```

### 2. Teste de Cupom Esgotado
```sql
-- Esgotar cupom
UPDATE coupons 
SET quantidade_disponivel = 0, current_uses = max_uses
WHERE code = 'TESTE-ATIVACAO';

-- Tentar ativar (deve retornar erro)
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'user-id-aqui'::UUID);
```

### 3. Teste de Perfil Incompatível
```sql
-- Criar usuário B2C
UPDATE user_profiles 
SET account_type = 'USER_B2C'
WHERE id = 'user-id-aqui';

-- Tentar ativar cupom de Academia (deve retornar erro)
SELECT activate_coupon_internal('TESTE-ATIVACAO', 'user-id-aqui'::UUID);
```

---

## 📊 Script de Teste Automatizado

Execute o arquivo `testar_ativacao_cupom.sql` para um teste completo automatizado:

```sql
-- Execute: testar_ativacao_cupom.sql
```

Este script:
1. Cria um cupom de teste
2. Encontra um usuário de teste
3. Executa a ativação
4. Verifica todos os resultados
5. Mostra logs detalhados

**Nota**: Você precisa ter pelo menos 1 usuário no banco para o teste funcionar.

---

## ✅ Checklist de Validação

Após os testes, verifique:

- [ ] Campo `quantidade_disponivel` existe e está sendo atualizado
- [ ] Função `activate_coupon_internal` retorna JSON correto
- [ ] Decremento de estoque funciona corretamente
- [ ] Perfil do usuário é atualizado após ativação
- [ ] Vínculo `user_coupon_links` é criado
- [ ] Erros são retornados corretamente
- [ ] Tela "Inserir Cupom" funciona no app
- [ ] Mensagens de erro/sucesso aparecem corretamente
- [ ] Redirecionamento após sucesso funciona

---

## 🐛 Troubleshooting

### Problema: "function activate_coupon_internal does not exist"
**Solução**: Execute novamente `supabase_activate_coupon_function.sql`

### Problema: "permission denied for function activate_coupon_internal"
**Solução**: Verifique se a função tem `GRANT EXECUTE ON FUNCTION activate_coupon_internal TO authenticated;`

### Problema: "quantidade_disponivel is NULL"
**Solução**: Execute:
```sql
UPDATE coupons 
SET quantidade_disponivel = GREATEST(0, max_uses - current_uses)
WHERE quantidade_disponivel IS NULL;
```

### Problema: Trigger não atualiza quantidade_disponivel
**Solução**: Verifique se o trigger existe:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_quantidade_disponivel';
```

---

**Documento criado em**: 2025-01-27  
**Versão**: 1.0

