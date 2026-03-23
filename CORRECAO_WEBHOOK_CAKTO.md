# Correção do Webhook Cakto

## ✅ Problema Corrigido

### Erro: `supabaseAdmin.auth.admin.getUserByEmail is not a function`

**Problema:** O método `getUserByEmail` não existe no Supabase JS v2.

**Solução:** Criada função helper `getUserByEmail()` que usa `listUsers()` para buscar usuários por email.

**Arquivo modificado:** `supabase/functions/cakto-webhook/index.ts`

---

## ⚠️ Problema do Secret (Configuração Necessária)

### Secret Não Correspondente

**Situação atual:**
- Secret na Cakto: `807b102d-5dff-4a82-97a9-110bf6966f44`
- Secret no Supabase: `5c4AIxgLSJMJyqMl23qUYYXQ7RDEHg2c`

**⚠️ IMPORTANTE:** Os secrets precisam ser **IGUAIS** em ambos os lugares!

**O que fazer:**

Você precisa usar a **MESMA** chave em ambos os lugares (Cakto e Supabase).

### ✅ Solução Recomendada: Usar a chave da Cakto no Supabase

1. Acesse o Supabase Dashboard
2. Vá para: **Edge Functions** → **cakto-webhook** → **Secrets**
3. Edite o secret `CAKTO_WEBHOOK_SECRET`
4. Defina o valor como: `807b102d-5dff-4a82-97a9-110bf6966f44` (mesma chave que está na Cakto)
5. Salve

### Alternativa: Usar a chave do Supabase na Cakto

Se preferir usar a chave do Supabase:

1. Acesse a plataforma Cakto
2. Vá para as configurações do webhook
3. Atualize o secret do webhook para: `5c4AIxgLSJMJyqMl23qUYYXQ7RDEHg2c` (mesma chave que está no Supabase)

---

## 📋 Próximos Passos

1. ✅ Erro do `getUserByEmail` corrigido (já feito)
2. ⚠️ Atualizar secret no Supabase ou na Cakto (você precisa fazer)
3. 🔄 Fazer deploy da Edge Function atualizada
4. ✅ Testar novamente os eventos na plataforma Cakto

---

## 🚀 Deploy da Edge Function

Após corrigir o secret, faça o deploy da função atualizada:

```bash
cd supabase/functions/cakto-webhook
supabase functions deploy cakto-webhook
```

Ou use o Supabase CLI se estiver configurado.

---

## ✅ Teste

Após o deploy e atualização do secret, teste novamente os eventos na plataforma Cakto. Os eventos suportados são:

- `purchase_approved` ✅
- `refund` ✅
- `subscription_cancelled` ✅

**Nota:** Eventos como `pix_gerado`, `subscription_created`, `boleto_gerado` não são suportados e serão ignorados pelo webhook.
