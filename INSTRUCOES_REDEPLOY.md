# Instruções para Redeploy da Função cakto-webhook

## ✅ Situação Atual

- ✅ Função `cakto-webhook` já existe no Supabase
- ✅ Código corrigido está em `supabase/functions/cakto-webhook/index.ts`
- ⚠️ Precisamos fazer **REDEPLOY** para atualizar com o código corrigido

## 🚀 Redeploy via Dashboard (Recomendado)

### Passo a Passo:

1. **Acesse o Dashboard:**
   - Vá para: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions/cakto-webhook

2. **Vá para a aba "Code":**
   - No menu da função, clique em **"Code"** ou **"Edit Code"**

3. **Substitua o código:**
   - Abra o arquivo local: `supabase/functions/cakto-webhook/index.ts`
   - Selecione TODO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)
   - No dashboard, selecione TODO o código existente
   - Cole o código novo (Ctrl+V)

4. **Salve e Deploy:**
   - Clique em **"Deploy"** ou **"Save"**
   - Aguarde alguns segundos para o deploy concluir

5. **Verifique os Secrets:**
   - Vá em **Edge Functions** → **cakto-webhook** → **Secrets**
   - Certifique-se que `CAKTO_WEBHOOK_SECRET` = `807b102d-5dff-4a82-97a9-110bf6966f44`

## ✅ Verificar se Funcionou

1. **Teste o health check:**
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

2. **Teste com evento da Cakto:**
   - Vá na plataforma Cakto
   - Envie um evento de teste: `purchase_approved`
   - Verifique os logs no Supabase Dashboard → Edge Functions → cakto-webhook → Logs
   - **NÃO deve mais aparecer o erro** `getUserByEmail is not a function`

## 🔍 O Que Foi Corrigido

- ✅ Função `getUserByEmail()` corrigida para usar `listUsers()`
- ✅ `processPaymentApproved` usando a função corrigida
- ✅ `processRefund` usando a função corrigida  
- ✅ `processSubscriptionCancelled` usando a função corrigida
- ✅ Melhor tratamento de erros

## 📋 Checklist Pós-Redeploy

- [ ] Código atualizado no dashboard
- [ ] Deploy concluído com sucesso
- [ ] Health check retorna status "ok"
- [ ] Secret `CAKTO_WEBHOOK_SECRET` configurado corretamente
- [ ] Teste com evento da Cakto funciona
- [ ] Logs não mostram mais erro `getUserByEmail is not a function`

