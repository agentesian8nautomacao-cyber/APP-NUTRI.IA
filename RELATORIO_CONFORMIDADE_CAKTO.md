# 📊 Relatório de Conformidade: Integração Cakto

## Comparação entre o Guia Completo e a Implementação Atual

**Data:** 2025-01-27  
**Status:** ⚠️ **PARCIALMENTE CONFORME** - Requer ajustes

---

## ✅ O QUE ESTÁ CONFORME

### 1. **Infraestrutura Básica**
- ✅ Webhook implementado como Edge Function do Supabase
- ✅ Autenticação via `CAKTO_WEBHOOK_SECRET` configurável
- ✅ Logs detalhados para debug
- ✅ Tratamento de erros implementado
- ✅ Criação automática de usuários quando necessário

### 2. **Banco de Dados**
- ✅ Tabela `user_profiles` existe e tem campos de pagamento
- ✅ Campos `plan_type`, `subscription_status`, `expiry_date` presentes
- ✅ Mapeamento de planos implementado (FREE, MONTHLY, ANNUAL, etc.)

### 3. **Processamento de Pagamentos**
- ✅ Atualização de perfil do usuário quando pagamento é processado
- ✅ Cálculo automático de `expiry_date` baseado em `duration_days`
- ✅ Suporte a múltiplos tipos de plano

---

## ❌ O QUE ESTÁ FALTANDO OU DIFERENTE

### 1. **Estrutura do Webhook** ⚠️ CRÍTICO

**Guia espera:**
- Servidor Express.js com Node.js
- Endpoint: `/api/webhooks/cakto`
- Validação HMAC SHA256 com header `x-cakto-signature`

**Implementação atual:**
- Edge Function do Supabase (Deno)
- Endpoint: `/functions/v1/cakto-webhook`
- Validação simples via Bearer token (não HMAC)

**Impacto:** A Cakto pode estar enviando assinatura HMAC que não está sendo validada.

---

### 2. **Formato do Payload** ⚠️ CRÍTICO

**Guia espera:**
```json
{
  "data": {
    "id": "transaction-id",
    "customer": {
      "name": "Nome",
      "email": "email@exemplo.com",
      "phone": "11999999999"
    },
    "amount": 90,
    "status": "waiting_payment",
    "paymentMethod": "credit_card",
    "product": {
      "id": "product-id",
      "name": "Nome do Produto"
    }
  },
  "event": "purchase_approved",
  "secret": "seu-webhook-secret"
}
```

**Implementação atual espera:**
```json
{
  "event_type": "subscription_created",
  "email": "email@exemplo.com",
  "plan_code": "MONTHLY",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Impacto:** O webhook atual não processa o formato real que a Cakto envia.

---

### 3. **Eventos Suportados** ⚠️ CRÍTICO

**Guia suporta:**
- `purchase_approved` → Atualiza para premium
- `refund` → Cancela assinatura (volta para free)
- `subscription_cancelled` → Cancela assinatura

**Implementação atual suporta:**
- `subscription_created` → Ativa assinatura
- `subscription_updated` → Atualiza assinatura
- `subscription_canceled` → Cancela assinatura

**Impacto:** Os eventos não correspondem. A Cakto envia `purchase_approved`, mas o webhook espera `subscription_created`.

---

### 4. **Tabela de Histórico de Pagamentos** ❌ FALTANDO

**Guia exige:**
```sql
CREATE TABLE payment_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    cakto_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status atual:** ❌ Tabela não existe no schema

**Impacto:** Não há histórico de transações, reembolsos ou cancelamentos.

---

### 5. **Validação HMAC** ❌ FALTANDO

**Guia implementa:**
```javascript
export function validateWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', CAKTO_CONFIG.webhookSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

**Status atual:** ❌ Validação HMAC não implementada

**Impacto:** Vulnerabilidade de segurança. Qualquer pessoa com o token pode enviar webhooks falsos.

---

### 6. **Processamento de Reembolsos** ❌ FALTANDO

**Guia implementa:**
- Função `processRefund()` que:
  - Cancela assinatura (volta para free)
  - Registra reembolso no histórico
  - Atualiza status para `cancelled`

**Status atual:** ❌ Não processa eventos de reembolso

**Impacto:** Reembolsos não são processados automaticamente.

---

### 7. **Campos Adicionais no Perfil** ⚠️ PARCIAL

**Guia exige:**
- `cakto_customer_id` → ID do cliente na Cakto
- `last_payment_date` → Data do último pagamento
- `payment_method` → Método de pagamento usado

**Status atual:** ⚠️ Campos não estão sendo salvos no webhook

**Impacto:** Não há rastreamento de cliente Cakto ou método de pagamento.

---

## 📋 CHECKLIST DE CONFORMIDADE

### Estrutura e Infraestrutura
- [x] Webhook implementado
- [x] Autenticação configurável
- [ ] Validação HMAC SHA256
- [ ] Formato de payload correto
- [ ] Eventos corretos (`purchase_approved`, `refund`, `subscription_cancelled`)

### Banco de Dados
- [x] Tabela `user_profiles` com campos de pagamento
- [ ] Tabela `payment_history` criada
- [ ] Campos `cakto_customer_id`, `last_payment_date`, `payment_method` sendo salvos

### Processamento
- [x] Atualização de perfil quando pagamento aprovado
- [ ] Processamento de reembolsos
- [ ] Processamento de cancelamentos
- [ ] Salvamento de histórico de transações

### Segurança
- [x] Autenticação básica (Bearer token)
- [ ] Validação HMAC SHA256
- [ ] Validação de assinatura do webhook

---

## 🔧 AÇÕES NECESSÁRIAS

### Prioridade ALTA 🔴

1. **Ajustar formato do payload**
   - Modificar webhook para aceitar formato real da Cakto
   - Extrair dados de `data.customer.email`, `data.id`, `data.amount`, etc.

2. **Corrigir eventos**
   - Mapear `purchase_approved` → processar pagamento
   - Mapear `refund` → processar reembolso
   - Mapear `subscription_cancelled` → processar cancelamento

3. **Implementar validação HMAC**
   - Adicionar função `validateWebhookSignature()` no webhook
   - Validar header `x-cakto-signature` ou `x-signature`

4. **Criar tabela `payment_history`**
   - Executar migration SQL
   - Salvar todas as transações no histórico

### Prioridade MÉDIA 🟡

5. **Salvar campos adicionais**
   - `cakto_customer_id` do payload
   - `last_payment_date` quando pagamento aprovado
   - `payment_method` do payload

6. **Implementar processamento de reembolsos**
   - Função para processar evento `refund`
   - Cancelar assinatura e registrar no histórico

### Prioridade BAIXA 🟢

7. **Melhorar logs**
   - Adicionar mais detalhes sobre payload recebido
   - Logs de validação HMAC

8. **Documentação**
   - Atualizar documentação com formato real do payload
   - Adicionar exemplos de eventos da Cakto

---

## 📝 RESUMO

### Conformidade Geral: **40%**

**Pontos Fortes:**
- ✅ Infraestrutura básica funcionando
- ✅ Atualização de perfil implementada
- ✅ Mapeamento de planos correto

**Pontos Fracos:**
- ❌ Formato do payload não corresponde ao real
- ❌ Eventos não correspondem
- ❌ Validação HMAC não implementada
- ❌ Histórico de pagamentos não existe

**Recomendação:** ⚠️ **Ajustar antes de produção**

O webhook atual funciona, mas não está processando o formato real que a Cakto envia. É necessário ajustar o código para corresponder ao formato documentado no guia.

---

## 🚀 PRÓXIMOS PASSOS

1. **Verificar formato real do payload da Cakto**
   - Testar webhook e ver logs
   - Comparar com formato esperado no guia

2. **Ajustar webhook para formato real**
   - Modificar parsing do payload
   - Ajustar extração de dados

3. **Implementar validação HMAC**
   - Adicionar função de validação
   - Testar com eventos reais

4. **Criar tabela `payment_history`**
   - Executar migration
   - Atualizar webhook para salvar histórico

5. **Testar com eventos reais da Cakto**
   - Enviar teste de pagamento
   - Verificar processamento correto

---

**Última atualização:** 2025-01-27

