# ❌ Erro 422 em Todos os Eventos da Cakto

## 🔍 Análise do Problema

Todos os eventos de teste estão retornando **422 (Unprocessable Entity)** da API da Cakto:
- `pix_gerado` → 422
- `refund` → 422  
- `subscription_canceled` → 422
- `purchase_approved` → 422
- `subscription_created` → 422
- `boleto_gerado` → 422

**URLs testadas:**
- `api.cakto.com.br/api/app/events/31275/test/`
- `api.cakto.com.br/api/app/events/32651/test/`

---

## ⚠️ Causa Provável

O erro 422 está vindo da **API da Cakto**, não do nosso webhook. Isso significa que:

1. **A Cakto está rejeitando ANTES de enviar para o webhook**
2. O problema está na **configuração do webhook na plataforma Cakto**
3. Não é um problema do nosso código

---

## ✅ Soluções

### **SOLUÇÃO 1: Verificar Configuração do Webhook na Cakto**

O webhook precisa estar configurado corretamente. Verifique:

#### **1.1 URL do Webhook**
Deve ser exatamente:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
```

⚠️ **Verifique:**
- Não deve ter espaços ou caracteres extras
- Deve ser `cakto-webhook` (não `cakto-webhool` ou variações)
- Deve ser HTTPS (não HTTP)

#### **1.2 Eventos Habilitados**
Na configuração do webhook, verifique quais eventos estão habilitados:
- ✅ `purchase_approved`
- ✅ `refund`
- ✅ `subscription_cancelled` (ou `subscription_canceled`)

⚠️ **Eventos que podem não existir:**
- ❌ `pix_gerado` - Pode não ser um evento válido
- ❌ `subscription_created` - Pode não existir (use `purchase_approved`)
- ❌ `boleto_gerado` - Pode não ser um evento válido

#### **1.3 Autenticação/Secret**
Se há campo de "Secret" ou "Token":
- Deve ser o mesmo valor do `CAKTO_WEBHOOK_SECRET` no Supabase
- Ou deixe vazio se não tiver campo visível

---

### **SOLUÇÃO 2: Verificar se o Webhook Está Ativo**

Na plataforma Cakto:
1. Verifique se o webhook está com status **"Ativo"** ou **"Enabled"**
2. Se estiver "Inativo" ou "Disabled", ative-o
3. Verifique se não há restrições ou condições

---

### **SOLUÇÃO 3: Verificar Logs no Supabase**

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
2. Tente enviar um evento de teste na Cakto
3. **Se NÃO aparecer nada nos logs:**
   - A requisição não está chegando ao webhook
   - Problema está na configuração da Cakto
4. **Se aparecer algo nos logs:**
   - Veja qual erro específico
   - Compartilhe o erro para análise

---

### **SOLUÇÃO 4: Testar Webhook Manualmente**

Para isolar se o problema é da Cakto ou do webhook, teste manualmente:

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

**Se isso funcionar**, o problema está na configuração da Cakto, não no webhook.

---

### **SOLUÇÃO 5: Recriar o Webhook na Cakto**

Se nada funcionar, tente **deletar e recriar o webhook**:

1. Delete o webhook atual na Cakto
2. Crie um novo webhook
3. Configure:
   - URL: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
   - Eventos: Apenas `purchase_approved` primeiro
   - Secret (se houver campo): Use o `CAKTO_WEBHOOK_SECRET` do Supabase
4. Salve e teste novamente

---

### **SOLUÇÃO 6: Verificar Documentação da Cakto**

O erro 422 pode significar:
- Evento não existe
- Formato do payload incorreto
- Falta algum campo obrigatório
- Webhook não está ativo
- Problema de permissões

Consulte a documentação da Cakto sobre eventos de webhook:
- Quais eventos são suportados?
- Qual é o formato correto do payload?
- Há algum campo obrigatório?

---

## 🎯 Checklist de Verificação

Execute este checklist:

- [ ] Webhook está com status "Ativo" na Cakto
- [ ] URL está correta: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
- [ ] Health check GET funciona (abre no navegador e retorna JSON)
- [ ] `CAKTO_WEBHOOK_SECRET` está configurado no Supabase
- [ ] Tentou testar apenas `purchase_approved` (evento mais simples)
- [ ] Testou webhook manualmente via curl
- [ ] Verificou logs do Supabase após tentar enviar evento
- [ ] Webhook foi recriado na Cakto (se necessário)

---

## 💡 Observações Importantes

1. **Erros não críticos (podem ignorar):**
   - ❌ PostHog API key not found (analytics desabilitado - OK)
   - ❌ LogRocket quota exceeded (pode ignorar)
   - ❌ Avatar 404 (imagem faltando - não crítico)

2. **O problema real:**
   - ✅ Erro 422 da API Cakto em TODOS os eventos
   - ✅ Isso indica problema de configuração, não de código

3. **Dois webhooks diferentes:**
   - Vejo IDs diferentes: `31275` e `32651`
   - Pode ter múltiplos webhooks configurados
   - Verifique qual está ativo

---

## 📞 Próximo Passo Imediato

**Faça este teste agora:**

1. Abra no navegador: `https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook`
   - Deve retornar: `{"status":"ok",...}`
   - Se não funcionar, o webhook não está deployado

2. Verifique os logs do Supabase após tentar enviar evento
   - Se não aparecer nada → Cakto não está enviando
   - Se aparecer erro → Compartilhe o erro

3. Se possível, contate o suporte da Cakto
   - O erro 422 em todos os eventos pode ser bug da plataforma
   - Peça orientação sobre configuração correta de webhooks

---

## 🔗 Links Úteis

- Dashboard Supabase: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook/logs
- Health Check: https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook
- Configuração Secrets: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions

