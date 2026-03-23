# 📋 Resumo da Implementação - Fluxo de Cupom de Acesso

## 🎯 O Que Foi Implementado

### 1. **Sistema de Cupons com Vínculo Cakto**
- Validação de cupons vinculados a pagamentos Cakto
- Verificação de pagamento ativo antes de permitir acesso
- Rastreamento de contas vinculadas por cupom
- Limite de contas por cupom/pagamento

### 2. **Novos Componentes React**
- **`InviteCodeEntry.tsx`**: Tela de entrada do código de convite
- **`LoginOrRegister.tsx`**: Tela de login/cadastro com suporte a cupom

### 3. **Fluxo de Autenticação Completo**
- Verificação automática de sessão ao carregar o app
- Fluxo: Cupom → Login/Cadastro → Onboarding/Dashboard
- Suporte a login direto (sem cupom) via "Já tenho conta"

### 4. **Estrutura de Banco de Dados**
- Tabela `user_coupon_links` para rastrear vínculos
- Campos adicionais em `coupons`: `cakto_customer_id`, `linked_accounts_count`, `max_linked_accounts`
- Função SQL `check_coupon_payment_access()` para validação
- Triggers automáticos para atualizar contadores

### 5. **Serviços Atualizados**
- `couponService.validateCoupon()`: Valida cupom e verifica pagamento Cakto
- `authFlowService.registerWithInvite()`: Cria conta e vincula ao cupom
- `authService.getCurrentUserProfile()`: Verifica perfil do usuário

## 🔄 Como Funciona o App

### Fluxo de Primeiro Acesso

```
1. Usuário abre o app
   ↓
2. Sistema verifica se está autenticado
   ↓
3. Se NÃO autenticado:
   → Mostra tela "Inserir Código de Convite"
   ↓
4. Usuário digita código (ex: ACADEMIA-X)
   ↓
5. Sistema valida:
   ✓ Cupom existe e está ativo
   ✓ Ainda tem vagas (current_uses < max_uses)
   ✓ Se vinculado a Cakto: pagamento está ativo
   ✓ Se vinculado a Cakto: há vagas disponíveis
   ↓
6. Se válido → Tela de Login/Cadastro
   ↓
7. Usuário cria conta (email + senha)
   ↓
8. Sistema:
   ✓ Cria usuário no auth.users
   ✓ Vincula ao plano do cupom
   ✓ Incrementa uso do cupom
   ✓ Cria registro em user_coupon_links
   ↓
9. Se usuário tem perfil → Dashboard
   Se não tem perfil → Onboarding
```

### Fluxo de Acesso Futuro

```
1. Usuário abre o app
   ↓
2. Sistema verifica autenticação
   ↓
3. Se autenticado:
   → Carrega perfil
   → Vai direto para Dashboard
   ↓
4. Se não autenticado:
   → Opção "Já tenho conta"
   → Login com email/senha
   → Dashboard
```

### Validação de Cupons Vinculados a Cakto

Quando um cupom tem `cakto_customer_id`:

1. **Verifica se existe pagamento ativo:**
   ```sql
   SELECT * FROM user_profiles
   WHERE cakto_customer_id = 'cakto_customer_123'
     AND status = 'active'
     AND (expiry_date IS NULL OR expiry_date > now())
   ```

2. **Verifica limite de contas:**
   ```sql
   SELECT linked_accounts_count, max_linked_accounts
   FROM coupons
   WHERE code = 'ACADEMIA-X'
   ```

3. **Se pagamento inativo ou sem vagas:**
   - ❌ Bloqueia o uso do cupom
   - ❌ Mostra mensagem de erro

## 📊 Planos Disponíveis

O app suporta os seguintes planos:

1. **`free`** - Plano gratuito (sem cupom)
2. **`monthly`** - Plano mensal premium
3. **`annual`** - Plano anual premium
4. **`academy_starter`** - Plano para academias (starter)
5. **`academy_growth`** - Plano para academias (growth)
6. **`personal_team`** - Plano para personal trainers

## 🧪 Como Testar

### Pré-requisitos

1. ✅ Executar `supabase_coupon_payment_link.sql` no Supabase
2. ✅ Executar `cupons_teste_todos_planos.sql` para criar cupons de teste
3. ✅ Ter as variáveis de ambiente configuradas (`.env.local`)

### Teste 1: Cupom Simples (Sem Vínculo Cakto)

**Cupom:** `TESTE-FREE`

1. Abra o app
2. Clique em "Inserir Código de Convite"
3. Digite: `TESTE-FREE`
4. Deve validar com sucesso ✅
5. Preencha email e senha
6. Clique em "Concluir Cadastro"
7. Deve criar conta e ir para Onboarding ✅

**Resultado Esperado:**
- Conta criada com `plan_type = 'free'`
- `current_uses` do cupom incrementado
- Registro criado em `user_coupon_links`

### Teste 2: Cupom Vinculado a Cakto (Com Pagamento Ativo)

**Cupom:** `ACADEMIA-STARTER`

**Pré-requisito:** Criar perfil de pagamento ativo:

```sql
-- Primeiro, crie um usuário de teste
INSERT INTO auth.users (id, email, encrypted_password)
VALUES (
  gen_random_uuid(),
  'academia@teste.com',
  crypt('senha123', gen_salt('bf'))
) RETURNING id;

-- Depois, crie o perfil de pagamento
INSERT INTO user_profiles (
  user_id,
  cakto_customer_id,
  plan_type,
  status,
  expiry_date,
  name
)
VALUES (
  'id-do-usuario-criado',
  'cakto_customer_academia_starter',
  'academy_starter',
  'active',
  '2025-12-31'::date,
  'Academia Teste'
);
```

1. Abra o app
2. Digite: `ACADEMIA-STARTER`
3. Deve validar com sucesso ✅
4. Crie conta
5. Deve criar com `plan_type = 'academy_starter'` ✅

### Teste 3: Cupom Vinculado a Cakto (Pagamento Inativo)

**Cupom:** `ACADEMIA-INATIVO`

1. Crie um perfil com `status = 'expired'` ou `expiry_date < now()`
2. Tente usar o cupom `ACADEMIA-INATIVO`
3. Deve mostrar erro: "Pagamento inativo" ❌

### Teste 4: Cupom Esgotado

**Cupom:** `TESTE-ESGOTADO`

1. Use o cupom até `current_uses >= max_uses`
2. Tente usar novamente
3. Deve mostrar erro: "Código de convite atingiu o limite de usos" ❌

### Teste 5: Login Direto (Sem Cupom)

1. Abra o app
2. Clique em "Já tenho uma conta"
3. Preencha email e senha de uma conta existente
4. Deve fazer login e ir para Dashboard ✅

### Teste 6: Verificação de Vínculo

Após criar conta com cupom:

```sql
-- Verificar vínculo criado
SELECT 
  u.email,
  c.code as coupon_code,
  c.plan_linked,
  ucl.created_at
FROM user_coupon_links ucl
JOIN auth.users u ON u.id = ucl.user_id
JOIN coupons c ON c.id = ucl.coupon_id
ORDER BY ucl.created_at DESC;
```

**Resultado Esperado:**
- Deve mostrar o usuário vinculado ao cupom usado
- `linked_accounts_count` do cupom deve estar incrementado

### Teste 7: Limite de Contas Vinculadas

**Cupom:** `PERSONAL-LIMITADO` (max_linked_accounts = 2)

1. Crie 2 contas usando este cupom
2. Tente criar uma 3ª conta
3. Deve mostrar erro: "Código de convite atingiu o limite de usos" ❌

## 📝 Checklist de Testes

- [ ] Teste 1: Cupom simples (sem Cakto) funciona
- [ ] Teste 2: Cupom com Cakto ativo funciona
- [ ] Teste 3: Cupom com Cakto inativo é bloqueado
- [ ] Teste 4: Cupom esgotado é bloqueado
- [ ] Teste 5: Login direto funciona
- [ ] Teste 6: Vínculo é criado corretamente
- [ ] Teste 7: Limite de contas é respeitado
- [ ] Verificar que `current_uses` é incrementado
- [ ] Verificar que `linked_accounts_count` é incrementado
- [ ] Verificar que usuário recebe `plan_type` correto
- [ ] Verificar que usuário recebe `subscription_status = 'active'`

## 🔍 Queries Úteis para Debug

### Ver todos os cupons e seus status:
```sql
SELECT 
  code,
  plan_linked,
  current_uses,
  max_uses,
  cakto_customer_id,
  linked_accounts_count,
  max_linked_accounts,
  is_active
FROM coupons
ORDER BY created_at DESC;
```

### Ver contas vinculadas a um cupom:
```sql
SELECT 
  u.email,
  ucl.created_at,
  up.plan_type,
  up.status
FROM user_coupon_links ucl
JOIN auth.users u ON u.id = ucl.user_id
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE ucl.coupon_id = (SELECT id FROM coupons WHERE code = 'ACADEMIA-STARTER');
```

### Ver pagamentos Cakto ativos:
```sql
SELECT 
  cakto_customer_id,
  plan_type,
  status,
  expiry_date,
  COUNT(*) as linked_accounts
FROM user_profiles
WHERE cakto_customer_id IS NOT NULL
GROUP BY cakto_customer_id, plan_type, status, expiry_date;
```

## 🚨 Problemas Comuns e Soluções

### Erro: "Código de convite inválido"
- **Causa:** Cupom não existe ou está inativo
- **Solução:** Verificar se o cupom existe e `is_active = true`

### Erro: "Pagamento inativo"
- **Causa:** Cupom vinculado a Cakto, mas pagamento não está ativo
- **Solução:** Criar/atualizar `user_profiles` com `status = 'active'` e `expiry_date` futuro

### Erro: "Código de convite atingiu o limite de usos"
- **Causa:** `current_uses >= max_uses` ou `linked_accounts_count >= max_linked_accounts`
- **Solução:** Verificar contadores e aumentar limites se necessário

### Conta criada mas sem vínculo
- **Causa:** Erro ao criar registro em `user_coupon_links`
- **Solução:** Verificar logs do console e permissões RLS

## 📚 Arquivos Importantes

- `FLUXO_CUPOM_ACESSO.md` - Documentação detalhada do fluxo
- `INSTRUCOES_EXECUCAO_SQL.md` - Como executar scripts SQL
- `supabase_coupon_payment_link.sql` - Estrutura do banco
- `cupons_teste_todos_planos.sql` - Cupons de teste
- `components/InviteCodeEntry.tsx` - Componente de entrada de código
- `components/LoginOrRegister.tsx` - Componente de login/cadastro
- `services/supabaseService.ts` - Lógica de negócio

## 🎯 Próximos Passos

1. ✅ Executar scripts SQL no Supabase
2. ✅ Criar cupons de teste
3. ✅ Testar fluxo completo
4. ⏳ Integrar com webhook Cakto real
5. ⏳ Criar painel admin para gerenciar cupons
6. ⏳ Adicionar notificações de limite próximo

