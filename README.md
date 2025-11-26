<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11RTfWKL27T53LZGoVh6s90kgKw9d4vWR

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. Configure o banco de dados Supabase:
   - Siga as instruções em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Execute o schema SQL em `supabase_schema.sql` no SQL Editor do Supabase
   - Obtenha suas credenciais do Supabase (URL e Anon Key)

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. Run the app:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## Database Setup

Este projeto usa Supabase como banco de dados. Para configurar:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o arquivo `supabase_schema.sql` no SQL Editor
3. Configure as variáveis de ambiente conforme acima

Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instruções detalhadas.
