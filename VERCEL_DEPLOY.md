# 🚀 Deploy no Vercel - Nutri.IA

## ✅ Alterações Enviadas para GitHub

Todas as alterações foram enviadas com sucesso:
- ✅ Commit: `265b596`
- ✅ Branch: `master`
- ✅ Repositório: `https://github.com/agentesian8nautomacao-cyber/APP-NUTRI.IA.git`

## 🔧 Configuração no Vercel

### Passo 1: Conectar Repositório

1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New Project"**
3. Importe o repositório: `agentesian8nautomacao-cyber/APP-NUTRI.IA`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (raiz)
   - **Build Command:** `yarn build` ou `npm run build`
   - **Output Directory:** `dist`

### Passo 2: Configurar Variáveis de Ambiente

⚠️ **IMPORTANTE:** O arquivo `.env.local` não é enviado para o Git (está no `.gitignore`). Você **DEVE** configurar as variáveis no Vercel.

1. No projeto Vercel, vá em **Settings** > **Environment Variables**

2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL
https://hflwyatppivyncocllnu.supabase.co

VITE_SUPABASE_ANON_KEY
[sua-chave-anon-do-supabase]

GEMINI_API_KEY
[sua-chave-gemini]
```

3. Para cada variável:
   - **Key:** Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value:** Valor da variável
   - **Environment:** Selecione todas as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

### Passo 3: Obter Credenciais

#### Supabase

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Crie ou copie uma chave API
3. Cole em `GEMINI_API_KEY`

### Passo 4: Deploy

1. Após configurar as variáveis, clique em **"Deploy"**
2. Aguarde o build completar
3. O Vercel irá:
   - Instalar dependências (`yarn install`)
   - Executar build (`yarn build`)
   - Fazer deploy do diretório `dist`

### Passo 5: Verificar Deploy

Após o deploy:

1. Acesse a URL fornecida pelo Vercel (ex: `https://app-nutri-ia.vercel.app`)
2. Abra o console do navegador (F12)
3. Verifique:
   - ✅ Não há erros de variáveis de ambiente
   - ✅ As requisições para Supabase funcionam
   - ✅ O app carrega normalmente

## 🔍 Troubleshooting no Vercel

### Erro: "Missing Supabase environment variables"

**Causa:** Variáveis não foram configuradas no Vercel.

**Solução:**
1. Vá em **Settings** > **Environment Variables**
2. Adicione todas as variáveis necessárias
3. Faça um novo deploy

### Erro: "Build failed"

**Causa:** Problemas no build ou dependências.

**Solução:**
1. Verifique os logs do build no Vercel
2. Teste o build localmente: `yarn build`
3. Verifique se todas as dependências estão no `package.json`

### Erro: "ERR_NAME_NOT_RESOLVED" no deploy

**Causa:** URL do Supabase incorreto nas variáveis de ambiente.

**Solução:**
1. Verifique se o `VITE_SUPABASE_URL` está correto
2. Certifique-se de que começa com `https://`
3. Faça um novo deploy após corrigir

## 📝 Checklist de Deploy

- [ ] Repositório conectado no Vercel
- [ ] Framework configurado (Vite)
- [ ] Variável `VITE_SUPABASE_URL` configurada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Variável `GEMINI_API_KEY` configurada
- [ ] Variáveis configuradas para todos os ambientes (Production, Preview, Development)
- [ ] Build executado com sucesso
- [ ] Deploy concluído
- [ ] App testado na URL do Vercel

## 🔄 Atualizações Futuras

Após fazer push para o GitHub, o Vercel irá:

1. **Automaticamente detectar** o novo commit
2. **Criar um novo deploy** (Preview)
3. **Executar o build** com as variáveis configuradas
4. **Atualizar a URL de produção** (se configurado)

Você pode verificar os deploys em:
- **Dashboard** > Seu Projeto > **Deployments**

## 🌐 URLs

- **GitHub:** https://github.com/agentesian8nautomacao-cyber/APP-NUTRI.IA
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard/project/hflwyatppivyncocllnu

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env.local` no Git
- **SEMPRE** configure as variáveis no Vercel
- **VERIFIQUE** se as variáveis estão corretas antes de fazer deploy
- **TESTE** o app após cada deploy

