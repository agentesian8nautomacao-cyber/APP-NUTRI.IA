# 🔐 Configurar CAKTO_WEBHOOK_SECRET

## ⚠️ Problema Identificado

O secret `CAKTO_WEBHOOK_SECRET` **não está configurado** no Supabase. Sem ele, o webhook não funcionará!

---

## 📋 Passo a Passo

### 1. **Gerar ou Obter o Secret**

Você precisa do token de autenticação que a Cakto usa para enviar webhooks. Este token deve ser:

- **O mesmo token** configurado na Cakto como "Webhook Secret" ou "Bearer Token"
- **Um token seguro** (recomendado: pelo menos 32 caracteres aleatórios)

**Se você ainda não tem:**
1. Acesse o painel da Cakto
2. Vá em **Configurações → Webhooks**
3. Copie o "Secret" ou "Bearer Token" configurado
4. **OU** gere um novo token seguro

**Para gerar um token seguro (opcional):**
```bash
# No terminal (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### 2. **Adicionar no Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Role até a seção **"Edge Function Secrets"**
3. Clique em **"Add or replace secrets"**
4. Preencha:
   - **Name**: `CAKTO_WEBHOOK_SECRET`
   - **Value**: Cole o token que você copiou/gerou
5. Clique em **"Save"**

---

### 3. **Configurar na Cakto (se necessário)**

Se você gerou um novo token, precisa configurá-lo na Cakto também:

1. Acesse o painel da Cakto
2. Vá em **Configurações → Webhooks**
3. Configure o webhook para:
   - **URL**: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
   - **Bearer Token** ou **Secret**: O mesmo valor que você colocou no Supabase
4. Salve as configurações

---

## ✅ Verificar se Está Funcionando

### 1. **Verificar no Dashboard**

Após adicionar, você deve ver na lista de secrets:

| Name | Digest | Updated at |
|------|--------|------------|
| ... | ... | ... |
| **CAKTO_WEBHOOK_SECRET** | ... | (data atual) |

### 2. **Testar o Webhook**

Use este comando (substitua `SEU_SECRET` pelo valor real):

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_SECRET' \
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

**Resposta esperada (erro de autenticação):**
```
Unauthorized
```

Se retornar "Unauthorized", o secret não está correto ou não foi configurado.

---

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** compartilhe o `CAKTO_WEBHOOK_SECRET` publicamente
- **NUNCA** commite o secret no Git
- Use um token forte (mínimo 32 caracteres)
- Mantenha o mesmo token na Cakto e no Supabase

---

## 📝 Checklist

- [ ] Token gerado/obtido da Cakto
- [ ] Secret adicionado no Supabase Dashboard
- [ ] Secret configurado na Cakto (se necessário)
- [ ] Teste manual retornou sucesso
- [ ] Webhook funcionando corretamente

---

**Última atualização**: 2025-01-27

