# Teste Após Deploy - Webhook Cakto

## ✅ Status Atual

- ✅ Função `cakto-webhook` atualizada com sucesso
- ✅ Health check funcionando: `{"status":"ok","service":"cakto-webhook"}`
- ✅ Código corrigido está em execução

## 🧪 Teste dos Eventos

### 1. Eventos Suportados

Teste estes eventos na plataforma Cakto:

✅ **Eventos que DEVEM funcionar:**
- `purchase_approved` - Pagamento aprovado
- `refund` - Reembolso
- `subscription_cancelled` - Cancelamento de assinatura

❌ **Eventos que NÃO são suportados (serão ignorados):**
- `pix_gerado`
- `subscription_created`
- `boleto_gerado`
- Qualquer outro evento

### 2. Como Testar

1. **Na plataforma Cakto:**
   - Vá para a seção de Webhooks ou Eventos
   - Selecione o evento: `purchase_approved`
   - Envie um evento de teste

2. **Verificar os logs no Supabase:**
   - Dashboard → Edge Functions → cakto-webhook → Logs
   - Procure por mensagens como:
     - ✅ `Assinatura validada com sucesso`
     - ✅ `Processando pagamento aprovado...`
     - ✅ `Webhook processado com sucesso`
     - ❌ **NÃO deve aparecer:** `getUserByEmail is not a function`

### 3. O Que Esperar

**Se funcionar corretamente, você verá nos logs:**
```
✅ Assinatura validada com sucesso (método: json_secret)
💳 Processando pagamento aprovado...
✅ Pagamento aprovado processado: { email: "...", transaction_id: "..." }
✅ Webhook processado com sucesso
```

**Se ainda houver erro:**
```
❌ Erro ao processar pagamento aprovado: [mensagem de erro]
```

### 4. Verificar Secret

Certifique-se de que o secret está correto:
- **Cakto:** `807b102d-5dff-4a82-97a9-110bf6966f44`
- **Supabase (CAKTO_WEBHOOK_SECRET):** `807b102d-5dff-4a82-97a9-110bf6966f44`
- ✅ Devem ser **exatamente iguais**

## 📋 Checklist de Teste

- [ ] Evento `purchase_approved` enviado da Cakto
- [ ] Logs no Supabase mostram processamento bem-sucedido
- [ ] Não aparece erro `getUserByEmail is not a function`
- [ ] Secret está configurado corretamente
- [ ] Resposta do webhook é 200 OK

## 🎉 Se Tudo Funcionar

Parabéns! O webhook está funcionando corretamente. Você pode:
- Processar pagamentos aprovados
- Processar reembolsos
- Processar cancelamentos de assinatura

## ⚠️ Se Ainda Houver Problemas

Se ainda aparecer algum erro, compartilhe:
1. Os logs completos do Supabase
2. O evento que você está tentando enviar
3. A mensagem de erro completa

