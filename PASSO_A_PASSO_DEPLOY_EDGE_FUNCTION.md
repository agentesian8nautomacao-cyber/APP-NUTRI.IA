# 📋 Passo a Passo: Deploy da Edge Function check-voice-access

## 🎯 O que você precisa fazer no Supabase Dashboard

### **Opção 1: Criar Nova Função (Recomendado se ainda não existe)**

1. **Acesse o Dashboard:**
   - Vá para: https://supabase.com/dashboard/project/hflwyatppivyncocllnu/functions

2. **Criar Nova Função:**
   - Clique no botão **"+ New Function"** ou **"Create a new function"**

3. **Nome da Função:**
   - Digite exatamente: `check-voice-access`
   - ⚠️ O nome deve ser **exatamente** esse (com hífens, minúsculas)

4. **Copiar o Código:**
   - Abra o arquivo: `supabase/functions/check-voice-access/index.ts`
   - Selecione **TODO** o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)

5. **Colar no Dashboard:**
   - No editor de código do Dashboard, cole o código (Ctrl+V)

6. **Salvar/Deploy:**
   - Clique em **"Deploy"** ou **"Save"**
   - Aguarde alguns segundos para o deploy concluir

---

### **Opção 2: Se a Função Já Existe (Editar)**

1. **Acesse a Função:**
   - Dashboard → Edge Functions
   - Procure por `check-voice-access` na lista
   - Clique nela

2. **Editar Código:**
   - Vá na aba **"Code"** ou **"Edit Code"**
   - Selecione TODO o código existente
   - Cole o novo código de `supabase/functions/check-voice-access/index.ts`

3. **Deploy:**
   - Clique em **"Deploy"** ou **"Save"**

---

## ✅ Verificar Secrets (Importante!)

A Edge Function precisa ter acesso aos seguintes secrets:

1. **Vá em:** Edge Functions → `check-voice-access` → **Secrets**

2. **Verifique se existem:**
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

   Se não existirem, adicione:
   - `SUPABASE_URL`: Sua URL do Supabase (ex: `https://hflwyatppivyncocllnu.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Sua Service Role Key (encontre em Settings → API)

---

## 🧪 Testar a Função

Após o deploy, você pode testar:

1. **No Dashboard:**
   - Edge Functions → `check-voice-access` → **Invoke**

2. **Body de teste:**
   ```json
   {
     "action": "check"
   }
   ```

3. **Headers necessários:**
   - `Authorization: Bearer <seu-token-de-autenticacao>`
   - `Content-Type: application/json`

---

## 📝 Conteúdo Completo do Arquivo

O arquivo completo está em:
- `supabase/functions/check-voice-access/index.ts`

**Tamanho aproximado:** ~306 linhas

**Principais funcionalidades:**
- Verifica se usuário tem assinatura ativa
- Verifica saldos de minutos disponíveis
- Consome tempo de voz seguindo prioridades
- Retorna saldos restantes

---

## ⚠️ Importante

- ⚠️ O nome da função **DEVE** ser exatamente: `check-voice-access` (com hífens)
- ⚠️ Copie **TODO** o conteúdo do arquivo (não apenas parte)
- ⚠️ Verifique se os Secrets estão configurados
- ⚠️ Aguarde o deploy concluir antes de testar

---

## ✅ Após o Deploy

A função estará disponível em:
```
https://hflwyatppivyncocllnu.supabase.co/functions/v1/check-voice-access
```

O frontend (`LiveConversation.tsx`) já está configurado para chamar essa função automaticamente!

