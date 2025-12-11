# 🧪 Teste do Webhook Cakto - Após Ajustes

## ✅ Verificação Pré-Teste

Antes de testar, verifique se tudo foi criado:

1. **Execute o script de verificação:**
   ```sql
   -- Cole o conteúdo de verificar_ajustes_cakto.sql no SQL Editor
   ```

2. **Confirme que apareceu:**
   - ✅ Tabela `payment_history` existe
   - ✅ Campos `cakto_customer_id`, `last_payment_date`, `payment_method` em `user_profiles`
   - ✅ Índices criados
   - ✅ Políticas RLS configuradas

---

## 🧪 Teste 1: Evento purchase_approved

### Payload de Teste:
```json
{
  "data": {
    "id": "test-transaction-123",
    "customer": {
      "name": "João Silva",
      "email": "joao@teste.com",
      "phone": "11999999999"
    },
    "amount": 90.00,
    "status": "waiting_payment",
    "paymentMethod": "credit_card",
    "product": {
      "id": "MONTHLY",
      "name": "Plano Mensal"
    }
  },
  "event": "purchase_approved",
  "secret": "seu-webhook-secret-aqui"
}
```

### Como Testar:

1. **Via cURL:**
   ```bash
   curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu-webhook-secret-aqui" \
     -d '{
       "data": {
         "id": "test-transaction-123",
         "customer": {
           "name": "João Silva",
           "email": "joao@teste.com",
           "phone": "11999999999"
         },
         "amount": 90.00,
         "status": "waiting_payment",
         "paymentMethod": "credit_card",
         "product": {
           "id": "MONTHLY",
           "name": "Plano Mensal"
         }
       },
       "event": "purchase_approved",
       "secret": "seu-webhook-secret-aqui"
     }'
   ```

2. **Verificar Logs:**
   - Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
   - Procure por:
     - `✅ Assinatura validada com sucesso`
     - `💳 Processando pagamento aprovado...`
     - `✅ Pagamento aprovado processado`

3. **Verificar Banco de Dados:**
   ```sql
   -- Verificar se usuário foi criado/atualizado
   SELECT 
     user_id,
     name,
     plan_type,
     subscription_status,
     cakto_customer_id,
     last_payment_date,
     payment_method
   FROM user_profiles
   WHERE cakto_customer_id = 'joao@teste.com';
   
   -- Verificar histórico de pagamento
   SELECT 
     transaction_id,
     amount,
     status,
     payment_method,
     created_at
   FROM payment_history
   WHERE transaction_id = 'test-transaction-123';
   ```

### Resultado Esperado:
- ✅ Status 200 OK
- ✅ Usuário criado/atualizado com `plan_type = 'monthly'`
- ✅ `subscription_status = 'active'`
- ✅ Registro em `payment_history` com `status = 'completed'`

---

## 🧪 Teste 2: Evento refund

### Payload de Teste:
```json
{
  "data": {
    "id": "test-refund-456",
    "customer": {
      "name": "João Silva",
      "email": "joao@teste.com"
    },
    "amount": 90.00,
    "status": "refunded",
    "paymentMethod": "refund"
  },
  "event": "refund",
  "secret": "seu-webhook-secret-aqui"
}
```

### Como Testar:

1. **Via cURL:**
   ```bash
   curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu-webhook-secret-aqui" \
     -d '{
       "data": {
         "id": "test-refund-456",
         "customer": {
           "name": "João Silva",
           "email": "joao@teste.com"
         },
         "amount": 90.00,
         "status": "refunded",
         "paymentMethod": "refund"
       },
       "event": "refund",
       "secret": "seu-webhook-secret-aqui"
     }'
   ```

2. **Verificar Logs:**
   - Procure por:
     - `💸 Processando reembolso...`
     - `✅ Reembolso processado com sucesso`

3. **Verificar Banco de Dados:**
   ```sql
   -- Verificar se assinatura foi cancelada
   SELECT 
     user_id,
     plan_type,
     subscription_status
   FROM user_profiles
   WHERE cakto_customer_id = 'joao@teste.com';
   -- Esperado: plan_type = 'free', subscription_status = 'cancelled'
   
   -- Verificar histórico de reembolso
   SELECT 
     transaction_id,
     amount,
     status
   FROM payment_history
   WHERE transaction_id = 'refund_test-refund-456';
   -- Esperado: amount = -90.00, status = 'refunded'
   ```

### Resultado Esperado:
- ✅ Status 200 OK
- ✅ `plan_type` mudou para `'free'`
- ✅ `subscription_status = 'cancelled'`
- ✅ Registro em `payment_history` com `amount = -90.00` e `status = 'refunded'`

---

## 🧪 Teste 3: Evento subscription_cancelled

### Payload de Teste:
```json
{
  "data": {
    "id": "test-cancel-789",
    "customer": {
      "name": "João Silva",
      "email": "joao@teste.com"
    },
    "status": "cancelled"
  },
  "event": "subscription_cancelled",
  "secret": "seu-webhook-secret-aqui"
}
```

### Como Testar:

1. **Via cURL:**
   ```bash
   curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu-webhook-secret-aqui" \
     -d '{
       "data": {
         "id": "test-cancel-789",
         "customer": {
           "name": "João Silva",
           "email": "joao@teste.com"
         },
         "status": "cancelled"
       },
       "event": "subscription_cancelled",
       "secret": "seu-webhook-secret-aqui"
     }'
   ```

2. **Verificar Logs:**
   - Procure por:
     - `🚫 Processando cancelamento de assinatura...`
     - `✅ Cancelamento processado com sucesso`

3. **Verificar Banco de Dados:**
   ```sql
   -- Verificar se assinatura foi cancelada
   SELECT 
     user_id,
     plan_type,
     subscription_status
   FROM user_profiles
   WHERE cakto_customer_id = 'joao@teste.com';
   
   -- Verificar histórico de cancelamento
   SELECT 
     transaction_id,
     amount,
     status
   FROM payment_history
   WHERE transaction_id = 'cancel_test-cancel-789';
   ```

### Resultado Esperado:
- ✅ Status 200 OK
- ✅ `plan_type = 'free'`
- ✅ `subscription_status = 'cancelled'`
- ✅ Registro em `payment_history` com `status = 'cancelled'`

---

## 🔍 Verificação de Validação HMAC

Para testar a validação HMAC, você precisa:

1. **Calcular HMAC SHA256 do payload:**
   ```javascript
   // Exemplo em Node.js
   const crypto = require('crypto');
   const payload = JSON.stringify({
     data: { ... },
     event: "purchase_approved"
   });
   const secret = "seu-webhook-secret";
   const signature = crypto.createHmac('sha256', secret)
     .update(payload)
     .digest('hex');
   console.log(signature);
   ```

2. **Enviar com header:**
   ```bash
   curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
     -H "Content-Type: application/json" \
     -H "x-cakto-signature: assinatura-hmac-aqui" \
     -d 'payload-json-aqui'
   ```

---

## ✅ Checklist de Testes

- [ ] Teste 1: `purchase_approved` → Status 200, usuário atualizado, histórico salvo
- [ ] Teste 2: `refund` → Status 200, assinatura cancelada, reembolso registrado
- [ ] Teste 3: `subscription_cancelled` → Status 200, assinatura cancelada, cancelamento registrado
- [ ] Validação HMAC funcionando
- [ ] Logs mostrando processamento correto
- [ ] Dados sendo salvos corretamente no banco

---

## 🚨 Troubleshooting

### Erro: "Tabela payment_history não existe"
**Solução:** Execute `supabase_payment_history_schema.sql` novamente

### Erro: "Coluna cakto_customer_id não existe"
**Solução:** Execute `supabase_add_payment_fields.sql` novamente

### Erro: "Assinatura inválida"
**Solução:** 
- Verifique se `CAKTO_WEBHOOK_SECRET` está configurado
- Use o mesmo secret no payload ou header
- Verifique logs para ver qual método de validação está sendo usado

### Erro: "Evento não suportado"
**Solução:** 
- Verifique se está usando: `purchase_approved`, `refund`, `subscription_cancelled`
- Não use: `subscription_created`, `subscription_updated`, `subscription_canceled`

---

**Última atualização:** 2025-01-27

