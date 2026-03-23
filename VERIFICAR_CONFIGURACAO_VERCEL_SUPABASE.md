# ✅ Verificar Configuração Vercel + Supabase

## 📋 Configurações Atuais

### ✅ Variáveis de Ambiente na Vercel

As seguintes variáveis estão configuradas corretamente:

- ✅ `VITE_SUPABASE_URL` = `https://hflwyatppivyncocllnu.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon public key)
- ✅ `GEMINI_API_KEY` = Configurada

### ✅ Configurações no Supabase

- ✅ **anon public key**: Corresponde à chave na Vercel
- ✅ **Project URL**: `https://hflwyatppivyncocllnu.supabase.co`
- ✅ **service_role key**: Configurada (não usar no frontend)

---

## 🔍 Verificações Necessárias

### 1. Verificar Site URL no Supabase

**IMPORTANTE**: Esta é a configuração mais crítica para resolver o erro CORS!

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em: **Authentication** → **Settings**
3. Verifique o campo **Site URL**:
   - **Deve ser**: `https://app-nutri-ia.vercel.app`
   - Se estiver diferente (ex: `http://localhost:3000`), **ATUALIZE** para o domínio do Vercel
4. Clique em **Save**

### 2. Verificar Redirect URLs

Na mesma página (**Authentication** → **Settings**):

1. Procure a seção **Redirect URLs** ou **Redirect URLs (Allowlist)**
2. Verifique se contém:
   - `https://app-nutri-ia.vercel.app/**`
   - `https://app-nutri-ia-*.vercel.app/**` (para preview deployments)
3. Se não existir, **adicione**:
   - Clique em **Add URL** ou **+ Add**
   - Digite: `https://app-nutri-ia.vercel.app/**`
   - Clique em **Save**

### 3. Verificar se as Variáveis Estão Sincronizadas

**Vercel:**
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2NsbG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMxNzUsImV4cCI6MjA3OTU1OTE3NX0.OCn9SX9eV7V5RswNQJJfRcDCjh4XqUq-CH_hEMKCuMM`

**Supabase:**
- **anon public** = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2NsbG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMxNzUsImV4cCI6MjA3OTU1OTE3NX0.OCn9SX9eV7V5RswNQJJfRcDCjh4XqUq-CH_hEMKCuMM`

✅ **CORRETO**: As chaves correspondem!

**Vercel:**
- `VITE_SUPABASE_URL` = `https://hflwyatppivyncocllnu.supabase.co`

**Supabase:**
- **Project URL** = `https://hflwyatppivyncocllnu.supabase.co`

✅ **CORRETO**: As URLs correspondem!

---

## 🚀 Próximos Passos

### Passo 1: Configurar Site URL no Supabase

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em: **Authentication** → **Settings**
3. No campo **Site URL**, altere para:
   ```
   https://app-nutri-ia.vercel.app
   ```
4. Clique em **Save**

### Passo 2: Adicionar Redirect URLs

Na mesma página:

1. Na seção **Redirect URLs**, adicione:
   ```
   https://app-nutri-ia.vercel.app/**
   ```
2. Se quiser suportar preview deployments também, adicione:
   ```
   https://app-nutri-ia-*.vercel.app/**
   ```
3. Clique em **Save**

### Passo 3: Fazer Redeploy na Vercel

Após alterar as configurações no Supabase:

1. Acesse: https://vercel.com/dashboard
2. Vá em: **Deployments**
3. Clique nos **3 pontos** (⋯) do deployment mais recente
4. Selecione **Redeploy**
5. Aguarde o deploy completar

**OU** faça um commit vazio para forçar um novo deploy:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin master
```

### Passo 4: Testar

1. Acesse: https://app-nutri-ia.vercel.app
2. Abra o Console do Navegador (F12)
3. Tente fazer login
4. Verifique se o erro CORS desapareceu

---

## 🔍 Diagnóstico Adicional

### Se o Erro CORS Persistir

Execute este teste no Console do Navegador (F12):

```javascript
// Teste de conexão com Supabase
fetch('https://hflwyatppivyncocllnu.supabase.co/auth/v1/user', {
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2NsbG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMxNzUsImV4cCI6MjA3OTU1OTE3NX0.OCn9SX9eV7V5RswNQJJfRcDCjh4XqUq-CH_hEMKCuMM',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2NsbG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMxNzUsImV4cCI6MjA3OTU1OTE3NX0.OCn9SX9eV7V5RswNQJJfRcDCjh4XqUq-CH_hEMKCuMM'
  }
})
.then(response => {
  console.log('✅ Status:', response.status);
  console.log('✅ Headers:', response.headers);
  return response.json();
})
.then(data => console.log('✅ Dados:', data))
.catch(error => {
  console.error('❌ Erro:', error);
  console.error('❌ Tipo:', error.name);
  console.error('❌ Mensagem:', error.message);
});
```

**Resultado esperado:**
- Se retornar `401 Unauthorized`: Normal (não há usuário logado), mas CORS está funcionando
- Se retornar erro CORS: O problema persiste, verifique Site URL novamente

---

## ✅ Checklist Final

Antes de reportar um problema, verifique:

- [ ] **Site URL** no Supabase está configurado como `https://app-nutri-ia.vercel.app`
- [ ] **Redirect URLs** contém `https://app-nutri-ia.vercel.app/**`
- [ ] Variáveis de ambiente na Vercel estão corretas
- [ ] Redeploy foi feito após alterar configurações
- [ ] Cache do navegador foi limpo
- [ ] Testou em janela anônima/privada

---

## 📝 Notas Importantes

1. **Site URL vs Redirect URLs:**
   - **Site URL**: O domínio principal do seu app (usado para redirecionamentos)
   - **Redirect URLs**: Lista de URLs permitidas para redirecionamentos após autenticação

2. **Variáveis de Ambiente:**
   - As variáveis na Vercel estão corretas ✅
   - Certifique-se de que estão configuradas para **All Environments** (Production, Preview, Development)

3. **CORS no Supabase:**
   - O Supabase geralmente gerencia CORS automaticamente
   - O erro CORS geralmente indica problema na configuração de **Site URL** ou **Redirect URLs**

---

**Última atualização**: 2025-01-01

