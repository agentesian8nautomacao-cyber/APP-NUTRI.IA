# 🚀 Deploy Manual do Webhook Cakto

## Problema com CLI

O Supabase CLI está com problemas de autenticação. Use o deploy via Dashboard.

---

## 📋 Passo a Passo - Deploy via Dashboard

### 1. **Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Faça login se necessário
3. Vá em **Edge Functions** no menu lateral

### 2. **Editar a Função cakto-webhook**

1. Clique na função `cakto-webhook`
2. Clique em **"Edit Function"** ou **"Edit Code"**
3. **Substitua todo o código** pelo conteúdo do arquivo:
   - `supabase/functions/cakto-webhook/index.ts`

### 3. **Código Completo para Copiar**

O arquivo `supabase/functions/cakto-webhook/index.ts` já está atualizado com todas as melhorias:
- ✅ Logs detalhados
- ✅ Normalização de códigos
- ✅ Respostas JSON estruturadas
- ✅ Tratamento de erros melhorado

### 4. **Salvar e Deploy**

1. Clique em **"Deploy"** ou **"Save"**
2. Aguarde a confirmação de sucesso

---

## 🔍 Verificar se Deploy Funcionou

### 1. **Verificar Logs**

1. No Dashboard, vá em **Edge Functions → cakto-webhook → Logs**
2. Procure por mensagens recentes
3. Se aparecer `✅ Pagamento processado:`, está funcionando!

### 2. **Testar Manualmente**

Use este comando (substitua `SEU_SECRET` pelo valor real):

```bash
curl -X POST 'https://hflwyatppivyncocllnu.supabase.co/functions/v1/cakto-webhook' \
  -H 'Authorization: Bearer SEU_CAKTO_WEBHOOK_SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_type": "subscription_created",
    "email": "teste@exemplo.com",
    "plan_code": "MONTHLY"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "user_id": "...",
  "plan_type": "monthly"
}
```

---

## 🔑 Verificar Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas:

1. No Dashboard: **Settings → Edge Functions → Secrets**
2. Verifique se existe:
   - `CAKTO_WEBHOOK_SECRET` (deve ser o mesmo configurado na Cakto)

---

## ✅ Checklist

- [ ] Código atualizado no Dashboard
- [ ] Função deployada com sucesso
- [ ] Logs aparecendo corretamente
- [ ] Teste manual retornou sucesso
- [ ] Variável `CAKTO_WEBHOOK_SECRET` configurada

---

## 🆘 Se Ainda Não Funcionar

1. **Verificar permissões da conta** no Supabase
2. **Verificar se o projeto está ativo** (não pausado)
3. **Tentar fazer login novamente** no CLI:
   ```bash
   supabase login
   ```
4. **Depois tentar deploy novamente**:
   ```bash
   supabase functions deploy cakto-webhook --no-verify-jwt
   ```

---

**Última atualização**: 2025-01-27

