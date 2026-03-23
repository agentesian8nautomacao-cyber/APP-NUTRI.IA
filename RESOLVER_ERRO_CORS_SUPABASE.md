# 🔧 Resolver Erro CORS no Supabase

## 📋 Problema

Ao acessar o app no Vercel, você recebe o erro:
```
Access to fetch at 'https://hflwyatppivyncocllnu.supabase.co/auth/v1/user' 
from origin 'https://app-nutri-ia.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Causa

O Supabase está bloqueando requisições do domínio do Vercel porque o domínio não está na lista de **allowed origins** do projeto Supabase.

---

## ✅ Solução: Verificar e Configurar no Supabase

### ⚠️ Importante sobre CORS no Supabase

O Supabase **geralmente permite CORS por padrão** para a API REST e Auth API. O erro CORS geralmente indica um problema diferente. Vamos verificar:

### Passo 1: Verificar Configurações da API

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **hflwyatppivyncocllnu**
3. Vá em: **Settings** (⚙️) no menu lateral
4. Clique em: **API**

Você verá as seguintes opções:
- **Data API** - Configurações da API REST
- **API Keys** - Chaves de API (anon, service_role)
- **JWT Keys** - Chaves JWT para autenticação

### Passo 2: Verificar API Keys

1. Na seção **API Keys**, verifique se você está usando a chave correta:
   - **anon public** key - Use esta no frontend (`VITE_SUPABASE_ANON_KEY`)
   - **service_role** key - NUNCA use no frontend (apenas no backend)

2. Certifique-se de que a chave `anon public` está configurada corretamente na Vercel:
   - Vá em: **Vercel Dashboard** → **Settings** → **Environment Variables**
   - Verifique se `VITE_SUPABASE_ANON_KEY` está configurada com a chave **anon public**

### Passo 3: Verificar URL do Projeto

1. Na seção **Data API**, verifique o **Project URL**:
   - Deve ser: `https://hflwyatppivyncocllnu.supabase.co`
2. Certifique-se de que está configurada na Vercel:
   - Verifique se `VITE_SUPABASE_URL` está configurada corretamente

### Passo 4: Verificar Configuração de Autenticação

1. Vá em: **Authentication** → **Settings**
2. Verifique as seguintes configurações:
   - **Site URL**: Deve ser `https://app-nutri-ia.vercel.app` (ou seu domínio de produção)
   - **Redirect URLs**: Adicione se necessário:
     - `https://app-nutri-ia.vercel.app/**`
     - `https://app-nutri-ia-*.vercel.app/**` (para previews)
     - `http://localhost:5173/**` (para desenvolvimento)

---

## 🔍 Diagnóstico: Verificar se é Realmente CORS

O erro CORS pode ser causado por outros problemas. Vamos diagnosticar:

### Teste 1: Verificar se as Variáveis de Ambiente Estão Corretas

No console do navegador (F12), execute:

```javascript
// Verificar se as variáveis estão disponíveis
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Teste 2: Testar Requisição Direta

No console do navegador, execute (substitua `SUA_ANON_KEY` pela sua chave):

```javascript
fetch('https://hflwyatppivyncocllnu.supabase.co/auth/v1/user', {
  method: 'GET',
  headers: {
    'apikey': 'SUA_ANON_KEY',
    'Authorization': 'Bearer SUA_ANON_KEY'
  }
})
.then(response => {
  console.log('✅ Status:', response.status);
  return response.json();
})
.then(data => console.log('✅ Dados:', data))
.catch(error => console.error('❌ Erro:', error));
```

**Se funcionar**: O problema não é CORS, mas sim a configuração do cliente Supabase.

**Se não funcionar**: Pode ser realmente CORS ou problema de autenticação.

---

## 🛠️ Soluções Alternativas

### Solução 1: Verificar se o Problema é de Rede/Conexão

O erro CORS pode ser um falso positivo. Tente:

1. **Limpar cache do navegador** (Ctrl+Shift+Delete)
2. **Testar em janela anônima/privada**
3. **Verificar se há bloqueadores de anúncio** que possam interferir
4. **Testar em outro navegador**

### Solução 2: Verificar Configuração do Cliente

O cliente Supabase já está configurado corretamente com:
- `detectSessionInUrl: true`
- `flowType: 'pkce'` (melhor segurança)

Certifique-se de que as variáveis de ambiente estão corretas na Vercel.

### Solução 3: Verificar se o Problema é de Autenticação

O erro pode não ser CORS, mas sim um problema de autenticação. Verifique:

1. Se o usuário está logado corretamente
2. Se a sessão não expirou
3. Se o token JWT é válido

---

## 🔍 Verificar se Funcionou

1. **Aguarde alguns minutos** após adicionar o domínio (pode levar tempo para propagar)
2. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
3. **Recarregue a página** do app no Vercel
4. **Abra o Console do Navegador** (F12)
5. Verifique se o erro CORS desapareceu

### Teste de CORS

Você pode testar se o CORS está funcionando executando este comando no Console do Navegador:

```javascript
fetch('https://hflwyatppivyncocllnu.supabase.co/auth/v1/user', {
  method: 'GET',
  headers: {
    'apikey': 'SUA_ANON_KEY_AQUI',
    'Authorization': 'Bearer SUA_ANON_KEY_AQUI'
  }
})
.then(response => console.log('✅ CORS OK:', response))
.catch(error => console.error('❌ CORS Error:', error));
```

---

## 📝 Domínios Comuns para Adicionar

### Produção
- `https://app-nutri-ia.vercel.app`
- `https://nutri-ia.vercel.app` (se tiver domínio customizado)

### Preview/Staging
- `https://app-nutri-ia-*.vercel.app` (wildcard para todos os previews)
- Ou domínios específicos de preview

### Desenvolvimento Local
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (alternativo)
- `http://127.0.0.1:5173`

---

## 🆘 Se o Problema Persistir

### 1. Verificar Site URL no Supabase

1. Acesse: **Authentication** → **Settings**
2. Verifique o campo **Site URL**:
   - Deve ser: `https://app-nutri-ia.vercel.app`
   - Se estiver diferente, atualize e salve

### 2. Verificar Redirect URLs

1. Na mesma página (**Authentication** → **Settings**)
2. Verifique a seção **Redirect URLs**
3. Adicione se não existir:
   - `https://app-nutri-ia.vercel.app/**`
   - `https://app-nutri-ia-*.vercel.app/**`

### 3. Verificar Variáveis de Ambiente na Vercel

1. Acesse: **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Verifique:
   - `VITE_SUPABASE_URL` = `https://hflwyatppivyncocllnu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon public)
3. **IMPORTANTE**: Após alterar, faça um **Redeploy**

### 4. Verificar se Está Usando HTTPS

- O Supabase requer HTTPS em produção
- Certifique-se de que o domínio do Vercel está usando HTTPS
- O Vercel usa HTTPS por padrão

### 5. Limpar Cache e Cookies

- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Limpe os cookies do site
- Tente em uma janela anônima/privada

### 6. Verificar Logs do Supabase

- Acesse: **Logs** → **API Logs** no Supabase Dashboard
- Veja se há erros relacionados a requisições
- Verifique se as requisições estão chegando ao Supabase

### 7. Verificar Console do Navegador

- Abra o Console (F12)
- Veja se há outros erros além de CORS
- Erros de rede podem aparecer como CORS

### 8. Contatar Suporte

Se nada funcionar:
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- Mencione que está tendo problemas de CORS entre Vercel e Supabase

---

## 📚 Referências

- [Supabase CORS Documentation](https://supabase.com/docs/guides/api/cors)
- [Vercel CORS Configuration](https://vercel.com/docs/concepts/functions/serverless-functions/cors)

---

## ✅ Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Domínio do Vercel adicionado na lista de Allowed Origins no Supabase
- [ ] Aguardou alguns minutos após adicionar o domínio
- [ ] Limpou o cache do navegador
- [ ] Testou em uma janela anônima/privada
- [ ] Variáveis de ambiente configuradas corretamente na Vercel
- [ ] URL do Supabase está correto (`https://hflwyatppivyncocllnu.supabase.co`)
- [ ] Anon Key está correto

---

**Última atualização**: 2025-01-01

