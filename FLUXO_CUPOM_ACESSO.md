# 📋 Fluxo de Cupom de Acesso - Nutri.IA

## 🎯 Visão Geral

Este documento descreve o fluxo completo de primeiro acesso via código de convite, incluindo a validação de cupons vinculados a pagamentos Cakto.

## 🔄 Fluxo de Primeiro Acesso

### 1. **Tela Inicial (Boas-vindas)**
- Ao abrir o app pela primeira vez, o usuário vê um campo em destaque: **"Inserir Código de Convite"**
- **Não pede e-mail nem senha ainda**
- Opção: "Já tenho uma conta" (para login direto, sem cupom)

### 2. **Validação do Código**
- O usuário digita o cupom (ex: `ACADEMIA-X`, `PERSONAL-Y`)
- O sistema verifica:
  - ✅ Se o cupom existe e está ativo
  - ✅ Se ainda tem vagas disponíveis (`current_uses < max_uses`)
  - ✅ **Se está vinculado a um pagamento Cakto:**
    - Verifica se o pagamento está ativo (`status = 'active'`)
    - Verifica se o pagamento não expirou (`expiry_date > now()`)
    - Verifica se há vagas disponíveis (`linked_accounts_count < max_linked_accounts`)

### 3. **Tela de Criação de Conta (Cadastro)**
- Após validar o cupom, o app mostra os campos:
  - "Defina seu E-mail"
  - "Crie sua Senha"
  - "Confirmar Senha"
- O usuário preenche e clica em **"Concluir Cadastro"**

### 4. **Vínculo Automático**
- O sistema cria o usuário no banco de dados
- Automaticamente marca o usuário como **Premium** (baseado no `plan_linked` do cupom)
- O sistema desconta **-1** uso do cupom (`current_uses++`)
- Cria registro na tabela `user_coupon_links` para rastrear o vínculo

### 5. **Acessos Futuros (Vida Normal)**
- Se o usuário sair do app (logoff) e voltar amanhã, ele **NÃO usa mais o cupom**
- Ele vai direto na opção **"Já tenho conta"** e entra com E-mail e Senha

## 🔗 Vínculo com Pagamentos Cakto

### Regra de Negócio
> **OBS:** A conta criada via cupom de convite deve estar ligada ao único pagamento realizado pela academia/personal. As contas devem estar no mesmo registro. Se o pagamento da academia/personal não tiver as contas ligadas, não terão acesso.

### Como Funciona

1. **Cupom Vinculado a Pagamento:**
   - Quando um cupom é criado, ele pode ter um `cakto_customer_id`
   - Este ID vincula o cupom ao pagamento da academia/personal

2. **Validação de Acesso:**
   - Antes de permitir o uso do cupom, o sistema verifica:
     - Se existe um `user_profiles` com `cakto_customer_id` igual ao do cupom
     - Se esse perfil tem `status = 'active'`
     - Se o pagamento não expirou (`expiry_date > now()`)

3. **Limite de Contas:**
   - Cada cupom pode ter um `max_linked_accounts` (número máximo de contas permitidas)
   - O sistema rastreia quantas contas já foram criadas via `linked_accounts_count`
   - Se `linked_accounts_count >= max_linked_accounts`, o cupom não pode ser usado

## 📊 Estrutura do Banco de Dados

### Tabela `coupons` (atualizada)
```sql
- id (UUID)
- code (TEXT) - Código do cupom
- plan_linked (plan_type) - Plano vinculado
- max_uses (INTEGER) - Máximo de usos
- current_uses (INTEGER) - Usos atuais
- is_active (BOOLEAN) - Se está ativo
- cakto_customer_id (TEXT) - ID do cliente Cakto (NOVO)
- linked_accounts_count (INTEGER) - Contas vinculadas (NOVO)
- max_linked_accounts (INTEGER) - Máximo de contas (NOVO)
```

### Tabela `user_coupon_links` (nova)
```sql
- id (UUID)
- user_id (UUID) - Referência a auth.users
- coupon_id (UUID) - Referência a coupons
- created_at (TIMESTAMPTZ)
```

### Função SQL `check_coupon_payment_access()`
- Verifica se o cupom está vinculado a um pagamento ativo
- Retorna `TRUE` se o acesso é permitido, `FALSE` caso contrário

## 🛠️ Implementação Técnica

### Componentes Criados

1. **`InviteCodeEntry.tsx`**
   - Tela de entrada do código de convite
   - Valida o cupom em tempo real
   - Mostra mensagens de erro/sucesso

2. **`LoginOrRegister.tsx`**
   - Tela de login ou cadastro
   - Suporta cadastro com cupom ou login normal
   - Validação de senha e confirmação

### Serviços Atualizados

1. **`couponService.validateCoupon()`**
   - Agora verifica vínculo com pagamento Cakto
   - Valida se o pagamento está ativo
   - Verifica limites de contas vinculadas

2. **`authFlowService.registerWithInvite()`**
   - Cria vínculo na tabela `user_coupon_links`
   - Incrementa `current_uses` e `linked_accounts_count`

3. **`authService.getCurrentUserProfile()`**
   - Nova função para verificar se o usuário tem perfil
   - Usada para decidir se vai para onboarding ou dashboard

### Fluxo no App.tsx

```typescript
1. Verifica autenticação ao carregar
2. Se não autenticado → mostra 'invite_code'
3. Após validar cupom → mostra 'login_register'
4. Após login/cadastro → verifica se tem perfil
5. Se não tem perfil → mostra 'onboarding'
6. Se tem perfil → mostra 'dashboard'
```

## 📝 Scripts SQL Necessários

Execute o arquivo `supabase_coupon_payment_link.sql` no Supabase SQL Editor para:
- Adicionar campos de vínculo na tabela `coupons`
- Criar tabela `user_coupon_links`
- Criar função `check_coupon_payment_access()`
- Criar triggers para atualizar contadores

## ✅ Checklist de Configuração

- [ ] Executar `supabase_coupon_payment_link.sql` no Supabase
- [ ] Criar cupons de teste com `cakto_customer_id`
- [ ] Testar fluxo completo: Cupom → Cadastro → Onboarding
- [ ] Testar login direto (sem cupom)
- [ ] Verificar se contas vinculadas são rastreadas corretamente
- [ ] Testar bloqueio quando pagamento está inativo
- [ ] Testar bloqueio quando limite de contas é atingido

## 🚀 Próximos Passos

1. Integrar com webhook Cakto para atualizar `cakto_customer_id` nos cupons
2. Criar painel admin para gerenciar cupons e ver contas vinculadas
3. Adicionar notificações quando limite de contas está próximo
4. Implementar renovação automática de cupons baseada em pagamentos recorrentes

