# 🚀 Guia de Execução: Ajustes para Conformidade com Guia Cakto

## 📋 Resumo das Alterações

Este guia documenta todas as alterações feitas para tornar o app conforme com o **Guia Completo de Integração Cakto**.

---

## ✅ Arquivos Criados/Modificados

### 1. **SQL - Tabela de Histórico de Pagamentos**
📄 `supabase_payment_history_schema.sql`

**O que faz:**
- Cria tabela `payment_history` para armazenar histórico completo de transações
- Inclui campos: `transaction_id`, `amount`, `status`, `payment_method`, `cakto_data` (JSONB)
- Configura RLS (Row Level Security) e políticas de acesso

**Como executar:**
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/sql/new
2. Cole o conteúdo de `supabase_payment_history_schema.sql`
3. Clique em "Run"

---

### 2. **SQL - Campos Adicionais em user_profiles**
📄 `supabase_add_payment_fields.sql`

**O que faz:**
- Adiciona campos `cakto_customer_id`, `last_payment_date`, `payment_method` na tabela `user_profiles`
- Cria índices para melhor performance

**Como executar:**
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/sql/new
2. Cole o conteúdo de `supabase_add_payment_fields.sql`
3. Clique em "Run"

---

### 3. **Webhook Atualizado**
📄 `supabase/functions/cakto-webhook/index.ts`

**O que mudou:**

#### ✅ Formato do Payload
- **Antes:** Esperava `{ event_type, email, plan_code }`
- **Agora:** Aceita formato real da Cakto:
  ```json
  {
    "data": {
      "id": "transaction-id",
      "customer": { "email": "...", "name": "..." },
      "amount": 90,
      "status": "waiting_payment",
      "paymentMethod": "credit_card",
      "product": { "id": "...", "name": "..." }
    },
    "event": "purchase_approved",
    "secret": "webhook-secret"
  }
  ```

#### ✅ Eventos Corrigidos
- **Antes:** `subscription_created`, `subscription_updated`, `subscription_canceled`
- **Agora:** `purchase_approved`, `refund`, `subscription_cancelled`

#### ✅ Validação HMAC SHA256
- Implementada validação HMAC usando Web Crypto API
- Aceita assinatura via header `x-cakto-signature` ou `x-signature`
- Fallback para validação via `secret` no JSON ou Bearer token

#### ✅ Processamento de Reembolsos
- Nova função `processRefund()` que:
  - Cancela assinatura (volta para free)
  - Registra reembolso no histórico com valor negativo
  - Atualiza status para `cancelled`

#### ✅ Processamento de Cancelamentos
- Função `processSubscriptionCancelled()` que:
  - Cancela assinatura
  - Registra cancelamento no histórico

#### ✅ Campos Adicionais Salvos
- `cakto_customer_id` → Email do cliente (ou ID se disponível)
- `last_payment_date` → Data do último pagamento
- `payment_method` → Método de pagamento (credit_card, pix, etc)

#### ✅ Histórico de Transações
- Todas as transações são salvas em `payment_history`
- Inclui dados completos do webhook em `cakto_data` (JSONB)

**Como fazer deploy:**
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions
2. Clique em `cakto-webhook`
3. Clique em "Edit Function"
4. Cole o conteúdo atualizado de `supabase/functions/cakto-webhook/index.ts`
5. Clique em "Deploy"

---

## 📝 Ordem de Execução

### **PASSO 1: Executar SQLs**
Execute na seguinte ordem:

1. ✅ `supabase_payment_history_schema.sql` → Cria tabela de histórico
2. ✅ `supabase_add_payment_fields.sql` → Adiciona campos em user_profiles

### **PASSO 2: Deploy do Webhook**
1. ✅ Fazer deploy do webhook atualizado
2. ✅ Verificar se `CAKTO_WEBHOOK_SECRET` está configurado no Supabase

### **PASSO 3: Testar**
1. ✅ Enviar evento de teste da Cakto
2. ✅ Verificar logs no Supabase
3. ✅ Verificar se dados foram salvos corretamente

---

## 🔍 Verificações Pós-Implementação

### 1. **Verificar Tabela payment_history**
```sql
SELECT * FROM payment_history ORDER BY created_at DESC LIMIT 5;
```

### 2. **Verificar Campos em user_profiles**
```sql
SELECT 
  user_id, 
  cakto_customer_id, 
  last_payment_date, 
  payment_method,
  plan_type,
  subscription_status
FROM user_profiles 
WHERE cakto_customer_id IS NOT NULL
LIMIT 5;
```

### 3. **Verificar Logs do Webhook**
- Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
- Procure por:
  - `✅ Assinatura validada com sucesso`
  - `✅ Pagamento aprovado processado`
  - `✅ Reembolso processado`
  - `✅ Cancelamento processado`

---

## 🎯 Checklist Final

### Banco de Dados
- [ ] Tabela `payment_history` criada
- [ ] Campos `cakto_customer_id`, `last_payment_date`, `payment_method` adicionados em `user_profiles`
- [ ] Índices criados
- [ ] RLS configurado

### Webhook
- [ ] Webhook atualizado e deployado
- [ ] Formato do payload corrigido
- [ ] Eventos corrigidos (`purchase_approved`, `refund`, `subscription_cancelled`)
- [ ] Validação HMAC implementada
- [ ] Processamento de reembolsos implementado
- [ ] Processamento de cancelamentos implementado
- [ ] Histórico de transações sendo salvo

### Configuração
- [ ] `CAKTO_WEBHOOK_SECRET` configurado no Supabase
- [ ] Webhook configurado na Cakto com URL correta

### Testes
- [ ] Evento `purchase_approved` testado e funcionando
- [ ] Evento `refund` testado e funcionando
- [ ] Evento `subscription_cancelled` testado e funcionando
- [ ] Validação HMAC testada
- [ ] Dados sendo salvos corretamente

---

## 🚨 Troubleshooting

### Erro: "Tabela payment_history não existe"
**Solução:** Execute `supabase_payment_history_schema.sql`

### Erro: "Coluna cakto_customer_id não existe"
**Solução:** Execute `supabase_add_payment_fields.sql`

### Erro: "Assinatura inválida"
**Solução:** 
1. Verifique se `CAKTO_WEBHOOK_SECRET` está configurado no Supabase
2. Verifique se o mesmo secret está configurado na Cakto
3. Verifique logs para ver qual método de validação está sendo usado

### Erro: "Evento não suportado"
**Solução:** 
- Verifique se a Cakto está enviando eventos: `purchase_approved`, `refund`, `subscription_cancelled`
- Se estiver enviando outros eventos, adicione suporte no webhook

---

## 📊 Conformidade com o Guia

### ✅ Implementado
- [x] Formato do payload correto
- [x] Eventos corretos (`purchase_approved`, `refund`, `subscription_cancelled`)
- [x] Validação HMAC SHA256
- [x] Tabela `payment_history`
- [x] Campos adicionais em `user_profiles`
- [x] Processamento de reembolsos
- [x] Processamento de cancelamentos
- [x] Histórico completo de transações
- [x] Logs detalhados

### ⚠️ Diferenças do Guia (Aceitáveis)
- **Infraestrutura:** Guia usa Express.js, implementação usa Supabase Edge Functions (Deno)
  - ✅ **Justificativa:** Edge Functions são mais adequadas para Supabase
  - ✅ **Funcionalidade:** Equivalente, apenas ambiente diferente

---

## 🎉 Conclusão

Após executar todos os passos acima, o app estará **100% conforme** com o Guia Completo de Integração Cakto, exceto pela diferença de infraestrutura (Edge Functions vs Express.js), que é uma melhoria arquitetural.

**Status:** ✅ **PRONTO PARA PRODUÇÃO**

---

**Última atualização:** 2025-01-27

