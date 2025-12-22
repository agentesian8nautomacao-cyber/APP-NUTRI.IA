# 🔧 Solução: Erro "Missing Supabase environment variables"

## ❌ Erro
```
Uncaught Error: Missing Supabase environment variables. Please check your .env.local file.
```

## ✅ Solução

### 1. Verificar se o arquivo `.env.local` existe e está correto

O arquivo deve estar na raiz do projeto (`E:\Nutri.IA\.env.local`) e conter:

```env
VITE_SUPABASE_URL=https://hflwyatppivyncocllnu.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 2. **IMPORTANTE: Reiniciar o servidor de desenvolvimento**

O Vite só carrega variáveis de ambiente quando o servidor é iniciado. Se você criou ou modificou o `.env.local`:

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Inicie novamente**:
   ```bash
   npm run dev
   ```

### 3. Verificar se as variáveis estão sendo carregadas

Após reiniciar, você verá no console do navegador (F12):
```
🔍 Environment Variables Check: {
  hasUrl: true,
  hasKey: true,
  ...
}
```

Se aparecer `hasUrl: false` ou `hasKey: false`, as variáveis não estão sendo carregadas.

## 🔍 Troubleshooting

### Problema: Variáveis ainda não aparecem após reiniciar

1. **Verificar nome do arquivo**: Deve ser exatamente `.env.local` (não `.env`, `.env.local.txt`, etc.)

2. **Verificar formato do arquivo**:
   - Sem espaços antes ou depois do `=`
   - Sem aspas nas variáveis (a menos que necessário)
   - Uma variável por linha

3. **Verificar se está na raiz do projeto**: O arquivo deve estar em `E:\Nutri.IA\.env.local`

4. **Limpar cache do Vite**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Problema: Variáveis aparecem como `undefined`

- Certifique-se de que as variáveis começam com `VITE_`
- No Vite, apenas variáveis que começam com `VITE_` são expostas ao cliente

## 📝 Exemplo de `.env.local` correto

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

## ⚠️ Importante

- **Nunca commite o `.env.local`** no Git (já está no `.gitignore`)
- **Reinicie o servidor** sempre que modificar o `.env.local`
- As variáveis só são carregadas quando o servidor **inicia**

---

**Solução rápida**: Pare o servidor (Ctrl+C) e execute `npm run dev` novamente.

