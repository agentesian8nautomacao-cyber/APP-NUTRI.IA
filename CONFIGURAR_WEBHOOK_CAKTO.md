# 🔗 Configurar Webhook na Cakto

## 📋 Passo a Passo Completo

### 1. **Preencher o Formulário na Cakto**

Quando você clicar em **"Adicionar Webhook"**, preencha assim:

#### **Nome da Integração:**
```
Nutri.ai - Supabase Webhook
```
*(Ou qualquer nome que você preferir para identificar esta integração)*

#### **URL:**
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

---

### 2. **Configurar Autenticação (Bearer Token)**

Após salvar o webhook, você provavelmente verá uma opção para configurar autenticação. Configure:

- **Tipo de Autenticação**: `Bearer Token` ou `Authorization Header`
- **Token/Secret**: O mesmo valor que você vai colocar no Supabase como `CAKTO_WEBHOOK_SECRET`

**⚠️ IMPORTANTE:** 
- Gere um token seguro (mínimo 32 caracteres)
- Use o **MESMO token** na Cakto e no Supabase
- Anote este token em local seguro

---

### 3. **Eventos para Escutar (se houver opção)**

Se a Cakto permitir escolher quais eventos escutar, selecione:

- ✅ `subscription_created` (Assinatura criada)
- ✅ `subscription_updated` (Assinatura atualizada)
- ✅ `subscription_canceled` (Assinatura cancelada)

---

### 4. **Formato do Payload Esperado**

O webhook espera receber este formato JSON:

```json
{
  "event_type": "subscription_created",
  "email": "usuario@exemplo.com",
  "plan_code": "MONTHLY",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Campos:**
- `event_type`: `"subscription_created"` | `"subscription_updated"` | `"subscription_canceled"`
- `email`: Email do usuário (obrigatório)
- `plan_code`: Código do plano (obrigatório) - ex: `"MONTHLY"`, `"ANNUAL"`, `"ACADEMY_START"`, etc.
- `expires_at`: Data de expiração em ISO 8601 (opcional)

---

### 5. **Códigos de Plano Suportados**

O webhook reconhece estes códigos:

| Código Cakto | Descrição |
|--------------|-----------|
| `FREE` | Plano gratuito |
| `MONTHLY` | Premium mensal |
| `ANNUAL` | Premium anual |
| `ACADEMY_START` | Academia Starter |
| `ACADEMY_GROW` | Academia Growth |
| `PERSONAL_TEAM` | Personal Team |

**⚠️ IMPORTANTE:** Os códigos devem ser enviados em **MAIÚSCULAS**, mas o webhook normaliza automaticamente.

---

## ✅ Checklist de Configuração

### Na Cakto:
- [ ] Nome da integração preenchido
- [ ] URL configurada corretamente
- [ ] Bearer Token/Secret configurado
- [ ] Eventos selecionados (se aplicável)
- [ ] Webhook salvo e ativo

### No Supabase:
- [ ] Secret `CAKTO_WEBHOOK_SECRET` adicionado (mesmo valor da Cakto)
- [ ] Função `cakto-webhook` deployada com código atualizado
- [ ] Logs funcionando

---

## 🧪 Testar o Webhook

### 1. **Teste Manual via cURL**

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "subscription_created",
    "email": "teste@exemplo.com",
    "plan_code": "MONTHLY"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "user_id": "...",
  "plan_type": "monthly"
}
```

### 2. **Teste Real na Cakto**

1. Crie uma assinatura de teste na Cakto
2. Verifique os logs no Supabase: **Edge Functions → cakto-webhook → Logs**
3. Procure por: `✅ Pagamento processado:`

---

## 🔍 Verificar se Está Funcionando

### 1. **Logs do Supabase**

Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs

Procure por:
- `📥 Webhook recebido:` → Webhook chegou
- `✅ Pagamento processado:` → Processado com sucesso
- `❌ Plano não mapeado:` → Plano desconhecido
- `❌ Payload incompleto:` → Dados faltando

### 2. **Verificar no Banco de Dados**

```sql
-- Verificar se o perfil foi atualizado
SELECT 
  user_id,
  email,
  plan_type,
  subscription_status,
  expiry_date,
  updated_at
FROM user_profiles
WHERE email = 'teste@exemplo.com'
ORDER BY updated_at DESC
LIMIT 1;
```

---

## 🚨 Problemas Comuns

### ❌ "Unauthorized" (401)
**Causa:** Token não confere ou não está configurado
**Solução:** Verificar se o token na Cakto é igual ao `CAKTO_WEBHOOK_SECRET` no Supabase

### ❌ "Unknown plan_code" (400)
**Causa:** Código do plano não está mapeado
**Solução:** Verificar se o `plan_code` enviado está na lista de planos suportados

### ❌ "Missing email or plan_code" (400)
**Causa:** Payload incompleto
**Solução:** Verificar se a Cakto está enviando todos os campos obrigatórios

---

## 📞 Próximos Passos

1. ✅ Configurar webhook na Cakto (este guia)
2. ✅ Adicionar `CAKTO_WEBHOOK_SECRET` no Supabase
3. ✅ Fazer deploy da função atualizada
4. ✅ Testar com pagamento real
5. ✅ Monitorar logs por alguns dias

---

**Última atualização**: 2025-01-27



