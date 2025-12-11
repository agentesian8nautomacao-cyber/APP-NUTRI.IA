# Configuração da Chave API do Gemini

## Chave API Configurada

A chave API gratuita do Gemini foi configurada:

```
AIzaSyDioFFyloeqPCZxqEUNrA3z9vPulXBVqeM
```

## Configuração Local

O arquivo `.env.local` foi criado localmente com a chave. Este arquivo:
- ✅ Está no `.gitignore` (não será commitado)
- ✅ É usado apenas localmente para desenvolvimento
- ✅ Contém: `GEMINI_API_KEY=AIzaSyDioFFyloeqPCZxqEUNrA3z9vPulXBVqeM`

## Configuração no Vercel (Produção)

⚠️ **IMPORTANTE:** Para o app funcionar em produção no Vercel, você DEVE configurar a variável de ambiente:

### Passo a Passo:

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Selecione o projeto **APP-NUTRI.IA**
3. Vá em **Settings** > **Environment Variables**
4. Adicione ou edite a variável:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyDioFFyloeqPCZxqEUNrA3z9vPulXBVqeM`
   - **Environment:** Selecione todas:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Clique em **Save**
6. Faça um novo deploy ou aguarde o próximo deploy automático

## Verificação

Após configurar:

1. **Localmente:**
   ```bash
   npm run dev
   ```
   O app deve funcionar normalmente.

2. **No Vercel:**
   - Após o deploy, teste o app
   - Verifique o console do navegador (F12)
   - As chamadas à API do Gemini devem funcionar

## Onde a Chave é Usada

A chave API é utilizada nos seguintes serviços:

- `services/geminiService.ts` - Geração de planos alimentares, análise de imagens, chat
- `components/LiveConversation.tsx` - Conversação em tempo real com voz

A chave é acessada via `process.env.API_KEY` ou `process.env.GEMINI_API_KEY`, que são definidas no `vite.config.ts` a partir da variável de ambiente `GEMINI_API_KEY`.

## Nota de Segurança

- ✅ A chave está no `.gitignore` (não será commitada)
- ✅ A chave deve ser configurada no Vercel para produção
- ⚠️ Não compartilhe a chave publicamente
- ⚠️ Se a chave for exposta, gere uma nova no Google AI Studio

