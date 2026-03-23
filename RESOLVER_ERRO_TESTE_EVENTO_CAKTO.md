# 🔧 Resolver Erro ao Enviar Evento de Teste na Cakto

## ⚠️ Problema
Ao tentar enviar qualquer evento de teste na plataforma Cakto, aparece erro: **"Erro ao enviar um evento teste webhook"** (Status 422).

---

## 🔍 Possíveis Causas

### 1. **URL do Webhook Incorreta**
A URL configurada na Cakto pode estar errada ou inacessível.

### 2. **Autenticação Falhando**
O secret/token configurado não corresponde ou está faltando.

### 3. **Eventos Não Suportados**
A Cakto pode estar tentando enviar eventos que não existem ou não estão habilitados.

### 4. **Webhook Não Está Respondendo Corretamente**
O endpoint pode estar retornando erro antes de processar.

---

## ✅ Soluções Passo a Passo

### **PASSO 1: Verificar URL do Webhook na Cakto**

A URL correta deve ser:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

**Verifique na Cakto:**
1. Acesse a configuração do webhook
2. Confirme que a URL está exatamente como acima
3. Não deve ter espaços ou caracteres extras
4. Deve ser `cakto-webhook` (não `cakto-webhool` ou outros)

---

### **PASSO 2: Testar o Webhook Diretamente**

Teste se o webhook está acessível e funcionando:

**Teste 1: Health Check (GET)**
Abra no navegador:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "cakto-webhook",
  "supported_methods": ["POST"],
  "message": "Webhook endpoint is active. Use POST method to send webhook events."
}
```

Se não funcionar, o webhook não está deployado ou há problema com a URL.

---

**Teste 2: Enviar Evento Manual (POST)**

Use curl ou Postman para testar:

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "purchase_approved",
    "data": {
      "id": "test-123",
      "customer": {
        "name": "Teste",
        "email": "teste@exemplo.com"
      },
      "amount": 100,
      "status": "paid",
      "paymentMethod": "pix"
    }
  }'
```

**Resposta esperada:**
- Status 200 ou 400 (se dados inválidos, mas deve processar)
- Ver logs no Supabase para ver o que aconteceu

---

### **PASSO 3: Verificar Secret/Token**

**No Supabase:**
1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Verifique se `CAKTO_WEBHOOK_SECRET` existe
3. Copie o valor

**Na Cakto:**
1. Acesse a configuração do webhook
2. Verifique o campo "Chave Secreta" ou "Secret" ou "Token"
3. Deve ser **exatamente igual** ao `CAKTO_WEBHOOK_SECRET` do Supabase

⚠️ **Se não houver campo de autenticação visível na Cakto:**
- Algumas versões da Cakto não mostram o campo
- O webhook funciona sem autenticação se `CAKTO_WEBHOOK_SECRET` não estiver configurado
- Mas a Cakto pode estar exigindo autenticação na interface de teste

---

### **PASSO 4: Verificar Eventos Suportados**

O webhook atual suporta apenas estes eventos:
- ✅ `purchase_approved`
- ✅ `refund`
- ✅ `subscription_cancelled` (ou `subscription_canceled`)

**Eventos que NÃO funcionam:**
- ❌ `pix_gerado`
- ❌ `subscription_created`
- ❌ `payment_created`
- ❌ Outros eventos customizados

**Na Cakto, ao testar:**
- Use apenas `purchase_approved` primeiro
- Se funcionar, teste os outros

---

### **PASSO 5: Verificar Logs do Webhook**

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
2. Tente enviar um evento de teste na Cakto
3. Veja os logs para entender o erro

**O que procurar nos logs:**
- Se a requisição chegou ao webhook
- Qual erro está sendo retornado
- Se a validação está falhando

---

### **PASSO 6: Configuração Alternativa**

Se a interface de teste da Cakto continuar dando erro, tente:

**Opção A: Testar via API da Cakto**

Se você tem as credenciais de API (CLIENT ID e SECRET), pode criar um webhook via API:

```bash
curl -X POST https://api.cakto.com.br/api/webhooks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "url": "https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook",
    "events": ["purchase_approved", "refund", "subscription_cancelled"],
    "secret": "SEU_CAKTO_WEBHOOK_SECRET"
  }'
```

**Opção B: Deixar sem Autenticação Temporariamente**

Se o problema for autenticação, você pode remover temporariamente a validação no webhook para testar (não recomendado para produção).

---

## 🔍 Diagnóstico Rápido

Execute este checklist:

- [ ] URL do webhook está correta: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
- [ ] Health check GET funciona (retorna JSON com status "ok")
- [ ] `CAKTO_WEBHOOK_SECRET` está configurado no Supabase
- [ ] Tentou testar apenas o evento `purchase_approved`
- [ ] Verificou os logs do webhook no Supabase
- [ ] Webhook foi deployado recentemente (após últimas alterações)

---

## 💡 Solução Mais Provável

O erro 422 geralmente significa que:

1. **A Cakto não consegue enviar para a URL** → Verifique se a URL está correta
2. **Autenticação está falhando** → Verifique se o secret está configurado corretamente
3. **Formato do evento está incorreto** → Use apenas eventos suportados

---

## 📞 Próximos Passos

1. **Teste o health check primeiro** (GET)
2. **Verifique os logs no Supabase** após tentar enviar evento
3. **Teste manualmente via curl** para isolar o problema
4. **Contate suporte da Cakto** se o problema persistir (pode ser bug na interface de teste deles)

---

## 🎯 Teste Rápido

Execute este comando para testar se o webhook está funcionando:

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "purchase_approved",
    "data": {
      "id": "test-manual-123",
      "customer": {
        "name": "Cliente Teste",
        "email": "teste@exemplo.com",
        "phone": "11999999999",
        "docNumber": "12345678909"
      },
      "amount": 10000,
      "status": "paid",
      "paymentMethod": "pix",
      "product": {
        "id": "PRODUTO_TESTE",
        "name": "Produto de Teste"
      }
    }
  }'
```

Se isso funcionar, o problema está na configuração da Cakto, não no webhook.

