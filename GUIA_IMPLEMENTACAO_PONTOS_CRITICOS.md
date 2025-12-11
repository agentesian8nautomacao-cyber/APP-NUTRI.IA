# 🎯 Guia de Implementação: Pontos Críticos de Atenção

Este documento descreve as implementações realizadas para resolver os pontos críticos identificados no relatório de conformidade.

---

## ✅ 1. Renovação Automática de Planos

### **Status:** ✅ **Implementado**

### **Arquivos Criados:**
- `supabase_auto_renewal_function.sql` - Função SQL para renovação automática
- `supabase_cron_jobs_auto_renewal.sql` - Cron job para executar diariamente

### **Como Funciona:**
1. **Função `auto_renew_subscriptions()`:**
   - Verifica usuários com planos expirando nos próximos 3 dias ou já expirados
   - Verifica se há pagamento recente (últimos 30 dias) indicando renovação via Cakto
   - Se houver pagamento recente: renova automaticamente estendendo `expiry_date`
   - Se não houver pagamento: marca plano como `expired` e muda para `free`

2. **Cron Job:**
   - Executa diariamente às 02:00 UTC (23:00 BRT do dia anterior)
   - Processa todas as renovações automaticamente

### **Execução:**
```sql
-- 1. Criar função
\i supabase_auto_renewal_function.sql

-- 2. Adicionar ao cron
\i supabase_cron_jobs_auto_renewal.sql

-- 3. Verificar execução
SELECT * FROM cron.job WHERE jobname = 'auto-renew-subscriptions';
```

### **Notas:**
- A renovação depende de pagamentos recorrentes via Cakto
- Se o Cakto enviar webhook de renovação, o webhook atualiza automaticamente
- Esta função serve como backup para casos onde o webhook não foi processado

---

## ✅ 2. Validação de Limites de Licenças B2B

### **Status:** ✅ **Implementado**

### **Arquivos Criados:**
- `supabase_validate_b2b_limits.sql` - Função de validação B2B
- Atualização em `services/supabaseService.ts` - Validação antes de ativar

### **Como Funciona:**
1. **Função `validate_b2b_coupon_availability()`:**
   - Valida se cupom existe e está ativo
   - Conta licenças ativas vinculadas ao cupom
   - Calcula licenças disponíveis (`max_linked_accounts` ou `max_uses` - `active_licenses`)
   - Retorna JSON com informações detalhadas

2. **Integração no Serviço:**
   - `couponService.activateCoupon()` agora valida antes de ativar
   - Se não houver licenças disponíveis, retorna erro antes de processar

### **Execução:**
```sql
-- Criar função
\i supabase_validate_b2b_limits.sql
```

### **Uso:**
```typescript
// Validação automática ao ativar cupom
const result = await couponService.activateCoupon('ACADEMIA-X', userId);
// Se não houver licenças, retorna erro antes de processar
```

---

## ✅ 3. Notificações de Renovação de Assinatura

### **Status:** ✅ **Implementado**

### **Arquivos Atualizados:**
- `services/notificationService.ts` - Adicionada função `checkAndNotifySubscriptionRenewal()`

### **Como Funciona:**
1. **Verificação Periódica:**
   - Verifica `expiry_date` do plano do usuário
   - Calcula dias até expiração
   - Envia notificações em momentos específicos:
     - **7 dias antes:** "Sua assinatura expira em 7 dias..."
     - **3 dias antes:** "Sua assinatura expira em 3 dias..."
     - **1 dia antes:** "Sua assinatura expira amanhã..."
     - **Expirado:** "Sua assinatura expirou..."

2. **Integração:**
   - Executa a cada hora via `initializeNotifications()`
   - Também executa imediatamente ao inicializar

### **Uso:**
```typescript
// Já integrado automaticamente
initializeNotifications(userId);
// Verifica renovação a cada hora
```

---

## 📋 Checklist de Implementação

### **Passo 1: Executar Scripts SQL**
```bash
# No Supabase SQL Editor ou via CLI:

# 1. Renovação automática
\i supabase_auto_renewal_function.sql
\i supabase_cron_jobs_auto_renewal.sql

# 2. Validação B2B
\i supabase_validate_b2b_limits.sql
```

### **Passo 2: Verificar Implementação**
```sql
-- Verificar função de renovação
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'auto_renew_subscriptions';

-- Verificar função de validação B2B
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'validate_b2b_coupon_availability';

-- Verificar cron jobs
SELECT * FROM cron.job WHERE jobname = 'auto-renew-subscriptions';
```

### **Passo 3: Testar Funcionalidades**

#### **Teste de Renovação:**
```sql
-- Criar usuário com plano expirando em 2 dias
UPDATE user_profiles
SET expiry_date = NOW() + INTERVAL '2 days',
    subscription_status = 'active',
    plan_type = 'monthly'
WHERE user_id = 'SEU_USER_ID';

-- Simular pagamento recente
INSERT INTO payment_history (user_id, transaction_id, amount, status, created_at)
VALUES ('SEU_USER_ID', 'test-renewal', 34.90, 'completed', NOW());

-- Executar função manualmente
SELECT * FROM auto_renew_subscriptions();
```

#### **Teste de Validação B2B:**
```sql
-- Validar cupom B2B
SELECT * FROM validate_b2b_coupon_availability('ACADEMIA-X');
```

#### **Teste de Notificações:**
- Fazer login no app
- Verificar se notificações de renovação aparecem (se plano estiver próximo de expirar)

---

## 🔍 Monitoramento

### **Verificar Renovações:**
```sql
-- Ver usuários com planos expirando
SELECT 
  user_id,
  plan_type,
  subscription_status,
  expiry_date,
  cakto_customer_id,
  expiry_date - NOW() as days_until_expiry
FROM user_profiles
WHERE plan_type IN ('monthly', 'annual', 'academy_starter', 'academy_growth', 'academy_pro', 'personal_team')
  AND subscription_status = 'active'
  AND expiry_date IS NOT NULL
  AND expiry_date <= NOW() + INTERVAL '7 days'
ORDER BY expiry_date;
```

### **Verificar Logs de Renovação:**
```sql
-- Ver últimos resultados da função de renovação
-- (Nota: A função retorna JSONB com detalhes, mas não salva em tabela)
-- Para logging completo, considere criar uma tabela de logs
```

---

## ⚠️ Notas Importantes

1. **Renovação Automática:**
   - Depende de pagamentos recorrentes via Cakto
   - Se Cakto enviar webhook de renovação, o webhook processa primeiro
   - A função serve como backup/verificação adicional

2. **Validação B2B:**
   - Validação acontece ANTES de ativar cupom
   - Evita ativações quando não há licenças disponíveis
   - Dashboard B2B mostra informações, mas validação bloqueia ativações

3. **Notificações:**
   - Apenas browser notifications (não push notifications completas)
   - Para push notifications completas, é necessário integrar FCM ou OneSignal
   - Notificações aparecem apenas se usuário deu permissão

---

## 🚀 Próximos Passos (Opcional)

1. **Criar Tabela de Logs de Renovação:**
   - Armazenar histórico de renovações automáticas
   - Facilitar auditoria e debugging

2. **Integrar Push Notifications Completas:**
   - Firebase Cloud Messaging (FCM) ou OneSignal
   - Registrar tokens de dispositivo
   - Enviar notificações via backend

3. **Dashboard de Renovações:**
   - Visualizar planos expirando
   - Estatísticas de renovações
   - Alertas para administradores

---

**Última atualização:** 2025-12-09  
**Status:** ✅ **Implementado e Pronto para Teste**

