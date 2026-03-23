# 🔧 Configurar Variáveis de Ambiente na Vercel

## ❌ Problema

Você está vendo este erro na Vercel (produção):
```
Missing Supabase environment variables. Please check your .env.local file.
Current mode: production
Found VITE_ keys: VITE_VERCEL_* (mas não VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY)
```

## ✅ Solução: Adicionar Variáveis na Vercel

O arquivo `.env.local` **não funciona na Vercel**. Você precisa configurar as variáveis de ambiente diretamente no painel da Vercel.

### Passo a Passo:

#### 1. Acessar o Dashboard da Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione seu projeto **Nutri.IA**

#### 2. Ir para Configurações de Ambiente

1. No menu do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**

#### 3. Adicionar Variáveis do Supabase

Adicione as seguintes variáveis (uma por vez):

**Variável 1:**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://hflwyatppivyncocllnu.supabase.co`
- **Environment**: Selecione todas (Production, Preview, Development)
- Clique em **Save**

**Variável 2:**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHd5YXRwcGl2eW5jb2NsbG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODMxNzUsImV4cCI6MjA3OTU1OTE3NX0.OCn9SX9eV7V5RswNQJJfRcDCjh4XqUq-CH_hEMKCuMM`
- **Environment**: Selecione todas (Production, Preview, Development)
- Clique em **Save**

**Variável 3 (Opcional - se usar Gemini):**
- **Key**: `GEMINI_API_KEY`
- **Value**: Sua chave da API Gemini
- **Environment**: Selecione todas (Production, Preview, Development)
- Clique em **Save**

#### 4. Fazer Redeploy

Após adicionar as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos **três pontos** (⋯) do deployment mais recente
3. Selecione **Redeploy**
4. Aguarde o deploy completar

**OU** faça um novo commit e push para o GitHub (a Vercel fará deploy automaticamente)

## 📸 Visualização do Processo

```
Vercel Dashboard
  └── Seu Projeto
      └── Settings
          └── Environment Variables
              ├── Add New
              │   ├── Key: VITE_SUPABASE_URL
              │   ├── Value: https://...
              │   └── Environment: ☑ Production ☑ Preview ☑ Development
              │
              ├── Add New
              │   ├── Key: VITE_SUPABASE_ANON_KEY
              │   ├── Value: eyJhbGc...
              │   └── Environment: ☑ Production ☑ Preview ☑ Development
              │
              └── Save
```

## ⚠️ Importante

1. **Variáveis devem começar com `VITE_`**: No Vite, apenas variáveis que começam com `VITE_` são expostas ao cliente (browser)

2. **Selecionar todos os ambientes**: Marque Production, Preview e Development para que funcione em todos os ambientes

3. **Redeploy necessário**: Após adicionar variáveis, você **DEVE** fazer um redeploy para que as mudanças tenham efeito

4. **Valores sensíveis**: As variáveis são criptografadas e seguras na Vercel

## 🔍 Verificar se Funcionou

Após o redeploy, verifique:

1. Acesse sua aplicação na Vercel
2. Abra o Console do navegador (F12)
3. Você deve ver:
   ```
   🔍 Environment Variables Check: {
     hasUrl: true,
     hasKey: true,
     mode: "production",
     ...
   }
   ```

Se ainda aparecer o erro, verifique:
- ✅ Variáveis foram adicionadas corretamente
- ✅ Nomes das variáveis estão corretos (com `VITE_`)
- ✅ Redeploy foi feito após adicionar as variáveis
- ✅ Valores estão corretos (sem espaços extras)

## 🚀 Alternativa: Usar Vercel CLI

Se preferir usar a linha de comando:

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Adicionar variáveis
vercel env add VITE_SUPABASE_URL production
# Cole o valor quando solicitado

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole o valor quando solicitado

# Fazer deploy
vercel --prod
```

## 📝 Checklist

- [ ] Acessei o dashboard da Vercel
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei `VITE_SUPABASE_URL`
- [ ] Adicionei `VITE_SUPABASE_ANON_KEY`
- [ ] Marquei todos os ambientes (Production, Preview, Development)
- [ ] Fiz redeploy da aplicação
- [ ] Verifiquei no console do navegador que as variáveis estão carregadas

---

**Solução rápida**: Adicione as variáveis no painel da Vercel e faça um redeploy!

