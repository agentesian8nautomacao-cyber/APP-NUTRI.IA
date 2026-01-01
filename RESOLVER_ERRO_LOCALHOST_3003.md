# 🔧 Resolver Erro ERR_CONNECTION_REFUSED em localhost:3003

## 📋 Problema

Ao acessar o app localmente, você recebe o erro:
```
GET http://localhost:3003/ net::ERR_CONNECTION_REFUSED
ping @ client:736
waitForSuccessfulPing @ client:749
```

## 🔍 Causa

Este erro é causado pelo **HMR (Hot Module Replacement)** do Vite tentando conectar ao servidor de desenvolvimento na porta 3003. Isso pode acontecer quando:

1. O servidor de desenvolvimento não está rodando
2. O servidor está rodando em uma porta diferente
3. Há uma tentativa de reconexão do HMR após o servidor ter sido parado

## ✅ Solução

### Opção 1: Iniciar o Servidor de Desenvolvimento

O erro desaparece quando o servidor está rodando. Para iniciar:

```bash
npm run dev
```

ou

```bash
yarn dev
```

Isso iniciará o servidor Vite na porta 3003 e o HMR funcionará corretamente.

### Opção 2: Ignorar o Erro (se o app está funcionando)

Se o app está funcionando normalmente, você pode ignorar esses erros. Eles são apenas tentativas de reconexão do HMR e não afetam o funcionamento do app.

### Opção 3: Desabilitar HMR (não recomendado)

Se você não quiser usar HMR, pode desabilitá-lo no `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    hmr: false,
  },
});
```

**⚠️ Nota:** Isso desabilitará o hot reload, então você precisará recarregar a página manualmente após cada alteração.

### Opção 4: Ajustar Configuração do HMR

A configuração do HMR já foi ajustada no `vite.config.ts` para melhorar a conexão. Se o erro persistir:

1. **Verifique se a porta 3003 está livre:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3003
   ```

2. **Se a porta estiver em uso, mude a porta no `vite.config.ts`:**
   ```typescript
   server: {
     port: 5173, // Porta padrão do Vite
   }
   ```

3. **E atualize o `package.json`:**
   ```json
   {
     "scripts": {
       "dev": "vite --port 5173"
     }
   }
   ```

## 🔍 Diagnóstico

### Verificar se o Servidor Está Rodando

No terminal onde você executou `npm run dev`, você deve ver algo como:

```
  VITE v5.4.21  ready in 500 ms

  ➜  Local:   http://localhost:3003/
  ➜  Network: use --host to expose
```

Se não estiver rodando, inicie com `npm run dev`.

### Verificar Porta em Uso

```bash
# Windows PowerShell
netstat -ano | findstr :3003

# Se retornar algo, a porta está em uso
# Se não retornar nada, a porta está livre
```

## 📝 Notas Importantes

1. **O erro não afeta o funcionamento do app** - É apenas o HMR tentando reconectar
2. **O HMR é útil para desenvolvimento** - Permite ver alterações sem recarregar a página
3. **Em produção (Vercel)**, esse erro não aparece porque não há HMR

## ✅ Checklist

- [ ] Servidor de desenvolvimento está rodando (`npm run dev`)
- [ ] Porta 3003 está livre
- [ ] `vite.config.ts` está configurado corretamente
- [ ] App está funcionando normalmente (erro pode ser ignorado se funcionar)

---

**Última atualização**: 2025-01-01

