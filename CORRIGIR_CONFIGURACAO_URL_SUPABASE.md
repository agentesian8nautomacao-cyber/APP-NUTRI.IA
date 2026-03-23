# 🔧 Corrigir Configuração de URL no Supabase

## ⚠️ Problema Identificado

Após configurar o **Site URL** e **Redirect URLs** no Supabase, o login pode não estar funcionando corretamente. Isso geralmente acontece porque:

1. **Falta wildcard (`/**`) nas Redirect URLs**
2. **Falta URL para desenvolvimento local**
3. **Falta URL para preview deployments do Vercel**

## ✅ Configuração Correta

### 1. Site URL

No Supabase Dashboard → **Authentication** → **Settings**:

**Site URL:**
```
https://app-nutri-ia.vercel.app
```

⚠️ **IMPORTANTE**: Não use wildcards aqui, apenas a URL base.

### 2. Redirect URLs (Allowlist)

Na mesma página, na seção **Redirect URLs**, adicione **TODAS** estas URLs (uma por linha):

```
https://app-nutri-ia.vercel.app/**
https://app-nutri-ia-*.vercel.app/**
http://localhost:3003/**
http://localhost:5173/**
```

**Explicação:**
- `https://app-nutri-ia.vercel.app/**` - Produção (com `/**` para permitir todas as rotas)
- `https://app-nutri-ia-*.vercel.app/**` - Preview deployments do Vercel (com wildcard)
- `http://localhost:3003/**` - Desenvolvimento local (porta configurada no `vite.config.ts`)
- `http://localhost:5173/**` - Desenvolvimento local (porta padrão do Vite)

### 3. Verificar Configuração Atual

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em: **Authentication** → **Settings**
3. Verifique:
   - ✅ **Site URL**: `https://app-nutri-ia.vercel.app`
   - ✅ **Redirect URLs**: Deve ter pelo menos `https://app-nutri-ia.vercel.app/**`

## 🔍 Problema Comum: Falta do `/**`

**❌ ERRADO:**
```
https://app-nutri-ia.vercel.app
```

**✅ CORRETO:**
```
https://app-nutri-ia.vercel.app/**
```

O `/**` no final permite que **todas as rotas** sejam redirecionadas corretamente após autenticação.

## 🚀 Passo a Passo para Corrigir

### Passo 1: Acessar Configurações

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em: **Authentication** → **Settings**

### Passo 2: Verificar Site URL

1. No campo **Site URL**, verifique se está:
   ```
   https://app-nutri-ia.vercel.app
   ```
2. Se estiver diferente, **altere** e clique em **Save**

### Passo 3: Adicionar/Corrigir Redirect URLs

1. Na seção **Redirect URLs**, verifique se existe:
   ```
   https://app-nutri-ia.vercel.app/**
   ```
2. Se **NÃO existir** ou estiver **sem o `/**`**:
   - Clique em **Add URL** ou **+**
   - Digite: `https://app-nutri-ia.vercel.app/**`
   - Clique em **Save**
3. **Adicione também** (opcional, mas recomendado):
   - `https://app-nutri-ia-*.vercel.app/**` (para previews)
   - `http://localhost:3003/**` (para desenvolvimento)

### Passo 4: Fazer Redeploy no Vercel

Após alterar as configurações no Supabase:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: **app-nutri-ia**
3. Vá em: **Deployments**
4. Clique nos **3 pontos** (⋯) do deployment mais recente
5. Selecione **Redeploy**
6. Aguarde o deploy completar

## 🧪 Testar Após Configuração

1. **Limpar cache do navegador:**
   - Pressione `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
   - Selecione "Cookies e dados de sites"
   - Clique em "Limpar dados"

2. **Testar login no Vercel:**
   - Acesse: https://app-nutri-ia.vercel.app
   - Tente fazer login
   - Verifique se funciona corretamente

3. **Verificar logs no console:**
   - Abra o DevTools (F12)
   - Vá em **Console**
   - Verifique se não há erros de CORS ou autenticação

## ⚠️ Problemas Comuns

### Problema 1: "Redirect URL not allowed"

**Causa**: A URL de redirect não está na lista de Redirect URLs permitidas.

**Solução**: Adicione a URL com `/**` no final na lista de Redirect URLs.

### Problema 2: Login funciona localmente mas não no Vercel

**Causa**: A URL do Vercel não está configurada no Supabase.

**Solução**: Adicione `https://app-nutri-ia.vercel.app/**` nas Redirect URLs.

### Problema 3: Sessão não persiste após login

**Causa**: Site URL incorreto ou falta de configuração.

**Solução**: Verifique se o Site URL está correto e se as Redirect URLs incluem `/**`.

## 📝 Notas Importantes

1. **Sempre use `/**` no final das Redirect URLs** - Isso permite todas as rotas
2. **Adicione URLs para desenvolvimento** - Facilita testes locais
3. **Adicione wildcards para previews** - Permite preview deployments do Vercel
4. **Após alterar, faça redeploy** - As alterações podem levar alguns minutos para propagar

## ✅ Verificação Final

Após configurar, verifique:

- ✅ Site URL está correto
- ✅ Redirect URLs incluem `/**` no final
- ✅ URLs de desenvolvimento estão incluídas (opcional)
- ✅ Redeploy foi feito no Vercel
- ✅ Login funciona no Vercel
- ✅ Login funciona localmente

