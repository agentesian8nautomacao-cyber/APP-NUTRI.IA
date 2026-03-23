# 🔧 Troubleshooting - Problemas Comuns

## ❌ Erro: `ERR_NAME_NOT_RESOLVED` ao acessar Supabase

### Problema
```
hflwyatppivynocllnu.supabase.co/rest/v1/coupons?... Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

### Causa
As variáveis de ambiente do Supabase não estão configuradas ou estão incorretas.

### Solução

1. **Crie o arquivo `.env.local` na raiz do projeto:**

```bash
# No Windows PowerShell:
New-Item -Path ".env.local" -ItemType File
```

2. **Adicione as variáveis de ambiente:**

```env
VITE_SUPABASE_URL=https://hflwyatppivyncocllnu.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
GEMINI_API_KEY=sua-chave-gemini-aqui
```

3. **Para obter as credenciais do Supabase:**

   - Acesse: https://supabase.com/dashboard/project/hflwyatppivyncocllnu
   - Vá em **Settings** > **API**
   - Copie:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`

4. **Reinicie o servidor de desenvolvimento:**

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
yarn dev
# ou
npm run dev
```

### ⚠️ Importante

- O arquivo `.env.local` está no `.gitignore` (não será commitado)
- **NUNCA** commite suas chaves de API
- Use `.env.example` como template

---

## ⚠️ Aviso: Tailwind CSS via CDN em Produção

### Problema
```
cdn.tailwindcss.com should not be used in production
```

### Solução Temporária (Desenvolvimento)
O CDN do Tailwind está sendo usado apenas para desenvolvimento. Isso é aceitável para testes locais.

### Solução para Produção

1. **Instale o Tailwind CSS:**

```bash
yarn add -D tailwindcss postcss autoprefixer
# ou
npm install -D tailwindcss postcss autoprefixer
```

2. **Inicialize o Tailwind:**

```bash
npx tailwindcss init -p
```

3. **Configure o `tailwind.config.js`:**

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. **Crie/Atualize `index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. **Remova o CDN do `index.html`:**

```html
<!-- Remova esta linha: -->
<!-- <script src="https://cdn.tailwindcss.com"></script> -->
```

6. **Importe o CSS no `index.tsx`:**

```tsx
import './index.css';
```

---

## ❌ Erro 404: favicon.ico

### Problema
```
:3004/favicon.ico:1 Failed to load resource: the server responded with a status of 404
```

### Solução

**Opção 1: Adicionar favicon**

1. Coloque um arquivo `favicon.ico` na pasta `public/`
2. Adicione no `index.html`:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
```

**Opção 2: Remover referência (temporário)**

Se não tiver favicon, o erro não afeta a funcionalidade. Você pode ignorá-lo por enquanto.

---

## ❌ Erro: "Missing Supabase environment variables"

### Problema
```
Error: Missing Supabase environment variables. Please check your .env.local file.
```

### Solução

1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se as variáveis estão corretas:
   - `VITE_SUPABASE_URL` (deve começar com `https://`)
   - `VITE_SUPABASE_ANON_KEY` (não deve estar vazio)
3. Reinicie o servidor de desenvolvimento
4. Verifique se não há espaços extras ou aspas nas variáveis

**Formato correto:**
```env
VITE_SUPABASE_URL=https://hflwyatppivyncocllnu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Formato incorreto:**
```env
VITE_SUPABASE_URL="https://hflwyatppivyncocllnu.supabase.co"  # ❌ Com aspas
VITE_SUPABASE_URL = https://hflwyatppivyncocllnu.supabase.co  # ❌ Com espaços
```

---

## 🔍 Verificar Configuração

Execute este comando para verificar se as variáveis estão sendo lidas:

```bash
# No terminal, dentro da pasta do projeto
node -e "console.log('URL:', process.env.VITE_SUPABASE_URL)"
```

**Nota:** No Vite, as variáveis só são acessíveis no código do cliente se começarem com `VITE_`.

---

## 📞 Ainda com Problemas?

1. Verifique o console do navegador (F12) para mais detalhes
2. Verifique a aba Network para ver as requisições falhando
3. Confirme que o projeto Supabase está ativo
4. Verifique se há bloqueadores de rede/firewall

