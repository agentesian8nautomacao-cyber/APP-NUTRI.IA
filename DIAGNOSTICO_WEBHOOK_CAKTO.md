# Diagnóstico do Webhook Cakto

## ✅ Configuração Confirmada

- **Cakto Secret:** `807b102d-5dff-4a82-97a9-110bf6966f44`
- **Supabase Secret:** `807b102d-5dff-4a82-97a9-110bf6966f44`
- **Status:** ✅ Secrets correspondem

## 🔍 Checklist de Diagnóstico

### 1. Verificar se a Edge Function foi deployada

Certifique-se de que a função atualizada foi deployada no Supabase:

```bash
supabase functions deploy cakto-webhook
```

Ou através do dashboard do Supabase.

### 2. Verificar logs do Supabase

Acesse os logs da Edge Function no Supabase Dashboard:
- **Edge Functions** → **cakto-webhook** → **Logs**

Procure por:
- ✅ `Assinatura validada com sucesso`
- ❌ `Assinatura do webhook inválida`
- ❌ `Evento não suportado`
- ❌ `Erro ao processar`

### 3. Eventos Suportados

O webhook **APENAS** processa os seguintes eventos:

✅ **Eventos Suportados:**
- `purchase_approved` - Pagamento aprovado
- `refund` - Reembolso
- `subscription_cancelled` - Cancelamento de assinatura (ou `subscription_canceled` com um "l")

❌ **Eventos NÃO Suportados (serão ignorados):**
- `pix_gerado`
- `subscription_created`
- `boleto_gerado`
- Qualquer outro evento

### 4. Estrutura Esperada do Payload

O webhook espera o seguinte formato:

```json
{
  "secret": "807b102d-5dff-4a82-97a9-110bf6966f44",
  "event": "purchase_approved",
  "data": {
    "id": "transaction-id",
    "customer": {
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário"
    },
    "amount": 90,
    "status": "paid",
    "paymentMethod": "credit_card"
  }
}
```

### 5. Possíveis Problemas

#### Problema A: Evento não suportado
**Sintoma:** Retorna 400 com mensagem "Evento não suportado"
**Solução:** Use apenas `purchase_approved`, `refund`, ou `subscription_cancelled`

#### Problema B: Secret não corresponde
**Sintoma:** Retorna 400 com mensagem "Assinatura inválida"
**Solução:** Verifique se ambos os secrets são exatamente iguais (sem espaços)

#### Problema C: Payload incompleto
**Sintoma:** Retorna 400 com mensagem "Missing required fields"
**Solução:** Verifique se o payload tem `data.customer.email` e `event`

#### Problema D: Erro ao processar (500)
**Sintoma:** Retorna 500 com erro interno
**Solução:** Verifique os logs para identificar o erro específico

#### Problema E: Usuário não encontrado
**Sintoma:** Retorna erro no processamento
**Solução:** O email do cliente no webhook deve corresponder a um usuário cadastrado no Supabase Auth

### 6. Teste Manual com cURL

Teste o webhook diretamente:

```bash
curl -X POST https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "807b102d-5dff-4a82-97a9-110bf6966f44",
    "event": "purchase_approved",
    "data": {
      "id": "test-transaction-123",
      "customer": {
        "email": "teste@exemplo.com",
        "name": "Teste"
      },
      "amount": 90,
      "status": "paid",
      "paymentMethod": "credit_card"
    }
  }'
```

### 7. Verificar Status da Função

Teste o endpoint de health check:

```bash
curl https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

Deve retornar:
```json
{
  "status": "ok",
  "service": "cakto-webhook",
  "supported_methods": ["POST"]
}
```

## 📋 Próximos Passos

1. **Verifique os logs do Supabase** para ver qual erro específico está ocorrendo
2. **Confirme qual evento** está sendo enviado na Cakto (deve ser um dos 3 suportados)
3. **Verifique se o usuário existe** no Supabase Auth com o email do webhook
4. **Teste com cURL** para isolar o problema

## 🔧 Se Ainda Não Funcionar

Forneça:
1. Os logs completos do Supabase Edge Function
2. O evento específico que está tentando enviar
3. A resposta completa (status code e body) que está recebendo

