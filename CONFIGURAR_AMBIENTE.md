# ⚙️ Configuração do Ambiente - Nutri.IA

## 🚨 Problema Atual: `ERR_NAME_NOT_RESOLVED`

O erro ocorre porque as variáveis de ambiente do Supabase não estão configuradas.

## ✅ Solução Rápida

### Passo 1: Criar arquivo `.env.local`

Crie um arquivo chamado `.env.local` na raiz do projeto (`E:\Nutri.IA\.env.local`)

**No Windows PowerShell:**
```powershell
New-Item -Path ".env.local" -ItemType File -Force
```

**Ou crie manualmente:**
- Abra o Bloco de Notas
- Salve como `.env.local` (com o ponto no início)
- Certifique-se de que não está salvo como `.env.local.txt`

### Passo 2: Adicionar Variáveis de Ambiente

Cole este conteúdo no arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://hflwyatppivyncocllnu.supabase.co
VITE_SUPABASE_ANON_KEY=COLE_SUA_CHAVE_AQUI
GEMINI_API_KEY=COLE_SUA_CHAVE_AQUI
```

### Passo 3: Obter Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
2. Vá em **Settings** (⚙️) no menu lateral
3. Clique em **API**
4. Copie:
   - **Project URL** → Cole em `VITE_SUPABASE_URL`
   - **anon public** key → Cole em `VITE_SUPABASE_ANON_KEY`

### Passo 4: Obter Chave do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Crie uma nova chave ou copie uma existente
3. Cole em `GEMINI_API_KEY`

### Passo 5: Verificar Formato

O arquivo `.env.local` deve ficar assim (sem aspas, sem espaços extras):

```env
VITE_SUPABASE_URL=https://hflwyatppivyncocllnu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2xsbnUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.exemplo
GEMINI_API_KEY=AIzaSyAOUAEzu4bx6tbY4cuKOxjTvW53q8WFAaY
```

### Passo 6: Reiniciar o Servidor

1. Pare o servidor atual (Ctrl+C no terminal)
2. Inicie novamente:

```bash
yarn dev
```

ou

```bash
npm run dev
```

## 🔍 Verificar se Funcionou

Após reiniciar, abra o console do navegador (F12) e verifique:

1. ✅ Não deve aparecer mais `ERR_NAME_NOT_RESOLVED`
2. ✅ As requisições para Supabase devem retornar status 200 ou 401 (não 404)
3. ✅ O app deve carregar normalmente

## ⚠️ Problemas Comuns

### Erro: "Missing Supabase environment variables"

**Causa:** O arquivo `.env.local` não existe ou as variáveis estão incorretas.

**Solução:**
- Verifique se o arquivo está na raiz do projeto
- Verifique se não há espaços antes/ depois do `=`
- Verifique se não há aspas nas variáveis
- Reinicie o servidor

### Erro: "ERR_NAME_NOT_RESOLVED"

**Causa:** URL do Supabase incorreto ou variável não está sendo lida.

**Solução:**
- Verifique se o URL começa com `https://`
- Verifique se não há espaços ou caracteres especiais
- Reinicie o servidor após criar/editar `.env.local`

### Aviso: Tailwind CSS via CDN

Este é apenas um aviso. O CDN funciona para desenvolvimento. Para produção, instale o Tailwind CSS localmente (veja `TROUBLESHOOTING.md`).

### Erro 404: favicon.ico

Este erro não afeta a funcionalidade. Você pode ignorá-lo ou adicionar um favicon na pasta `public/`.

## 📝 Estrutura do Arquivo

```
E:\Nutri.IA\
├── .env.local          ← CRIE ESTE ARQUIVO
├── .env.example        ← Template (opcional)
├── App.tsx
├── components/
└── ...
```

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo `.env.local` no Git
- ✅ O arquivo já está no `.gitignore`
- ✅ Use `.env.example` como template público

## 📞 Ainda com Problemas?

1. Verifique o console do navegador (F12) para mais detalhes
2. Verifique a aba Network para ver as requisições
3. Confirme que o projeto Supabase está ativo
4. Verifique se há bloqueadores de rede/firewall

