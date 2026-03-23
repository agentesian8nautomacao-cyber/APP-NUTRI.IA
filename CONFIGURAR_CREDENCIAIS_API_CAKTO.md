# 🔐 Configurar Credenciais da API Cakto

## 📋 Diferença entre as Credenciais

**Você tem dois tipos de credenciais Cakto:**

1. **CAKTO_WEBHOOK_SECRET** (já configurado)
   - Usado para **validar webhooks recebidos** da Cakto
   - Já está configurado no Supabase
   - O webhook usa isso para autenticar requisições recebidas

2. **CLIENT ID e CLIENT SECRET** (novos - que você acabou de criar)
   - Usados para fazer **chamadas à API da Cakto** (autenticar requisições que você ENVIA)
   - Úteis para: criar produtos, consultar transações, gerenciar clientes, etc.
   - Ainda não estão configurados

---

## ✅ Suas Credenciais Recebidas

```
CLIENT ID: ya6QRM4UiuYeqUcpFZbjUIM9r0EJCldiH6upeHjQ
CLIENT SECRET: 8lSePzUTFFfbS4DqyOLbAvsPNVFxGobbcOTulwQvIXIRaoaLr9F1pW0cJhkmK4xvaWLWM7wkS8qnwVlMAoDajZSg43mHMvnfcuyth2DRaOXgO02eF57oQZxErP0COm5U
```

⚠️ **IMPORTANTE:** Guarde essas credenciais com segurança! Elas não podem ser exibidas novamente.

---

## 🔧 Onde Configurar

### **Opção 1: No Supabase Edge Functions Secrets** (Recomendado)

Se você planeja usar a API Cakto no futuro (para criar produtos, consultar pagamentos, etc.), adicione no Supabase:

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/settings/functions
2. Role até **"Edge Function Secrets"**
3. Clique em **"Add or replace secrets"**
4. Adicione:

   ```
   Name: CAKTO_CLIENT_ID
   Value: ya6QRM4UiuYeqUcpFZbjUIM9r0EJCldiH6upeHjQ
   ```

   ```
   Name: CAKTO_CLIENT_SECRET
   Value: 8lSePzUTFFfbS4DqyOLbAvsPNVFxGobbcOTulwQvIXIRaoaLr9F1pW0cJhkmK4xvaWLWM7wkS8qnwVlMAoDajZSg43mHMvnfcuyth2DRaOXgO02eF57oQZxErP0COm5U
   ```

5. Clique em **"Save"**

### **Opção 2: Guardar para Uso Futuro**

Se você não vai usar a API Cakto agora, apenas guarde essas credenciais em um local seguro. Você pode configurá-las depois quando necessário.

---

## 🎯 Quando Usar Cada Tipo

### **CAKTO_WEBHOOK_SECRET** (Já configurado ✅)
- **Uso:** Validar webhooks que a Cakto **envia para você**
- **Onde:** Edge Function `cakto-webhook`
- **Status:** ✅ Já configurado no Supabase

### **CLIENT ID / CLIENT SECRET** (Novos)
- **Uso:** Fazer requisições **da sua aplicação para a API Cakto**
- **Exemplos de uso:**
  - Criar produtos via API
  - Consultar status de pagamentos
  - Gerenciar assinaturas
  - Consultar histórico de transações
- **Status:** ⏳ Guardar para uso futuro

---

## 📝 Resumo

| Credencial | Onde Configurar | Status | Uso |
|------------|----------------|--------|-----|
| `CAKTO_WEBHOOK_SECRET` | Supabase Secrets | ✅ Configurado | Validar webhooks recebidos |
| `CAKTO_CLIENT_ID` | Supabase Secrets (opcional) | ⏳ Guardar | Autenticar chamadas à API |
| `CAKTO_CLIENT_SECRET` | Supabase Secrets (opcional) | ⏳ Guardar | Autenticar chamadas à API |

---

## 🔒 Segurança

- ✅ **NUNCA** compartilhe essas credenciais publicamente
- ✅ **NUNCA** commite essas credenciais no Git
- ✅ Guarde em local seguro (gerenciador de senhas, Supabase Secrets, etc.)
- ✅ Use apenas no backend (Edge Functions), nunca no frontend

---

## ✅ Checklist

- [x] Credenciais recebidas da Cakto
- [ ] Credenciais guardadas em local seguro
- [ ] (Opcional) Adicionadas no Supabase se for usar API Cakto no futuro

---

**Nota:** Atualmente, o sistema funciona apenas com webhooks (recebendo eventos da Cakto). As credenciais de API seriam úteis se você quiser fazer chamadas ativas à API da Cakto no futuro.

