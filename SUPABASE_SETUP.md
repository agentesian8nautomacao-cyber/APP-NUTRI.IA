# Configuração do Supabase para Nutri.IA

Este documento contém instruções para configurar o banco de dados Supabase para o aplicativo Nutri.IA.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## 🚀 Passo a Passo

### 1. Criar o Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto:
   - **Name**: Nutri.IA
   - **Database Password**: (anote esta senha, você precisará dela)
   - **Region**: Escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Executar o Schema SQL

1. No dashboard do Supabase, vá para **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase_schema.sql` deste repositório
4. Copie todo o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a execução completa (deve mostrar "Success. No rows returned")

### 3. Configurar Autenticação

1. No dashboard do Supabase, vá para **Authentication** > **Providers**
2. Configure os provedores de autenticação desejados:
   - **Email**: Habilitado por padrão
   - **Google**: (opcional) Configure se quiser login com Google
   - **GitHub**: (opcional) Configure se quiser login com GitHub
   - Outros provedores conforme necessário

### 4. Obter as Credenciais da API

1. No dashboard do Supabase, vá para **Settings** > **API**
2. Anote as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: (chave pública)
   - **service_role key**: (chave privada - mantenha segura!)

### 5. Instalar o Cliente Supabase no Projeto

```bash
npm install @supabase/supabase-js
# ou
yarn add @supabase/supabase-js
```

### 6. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (se ainda não existir):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
```

**⚠️ IMPORTANTE**: 
- Não commite o arquivo `.env.local` no Git
- Certifique-se de que `.env.local` está no `.gitignore`

### 7. Criar o Cliente Supabase

Crie um arquivo `services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 8. Verificar a Instalação

No SQL Editor do Supabase, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Você deve ver todas as tabelas criadas:
- user_profiles
- daily_plans
- daily_plan_meals
- meal_items
- daily_logs
- scan_history
- chat_messages
- wellness_tracking
- wellness_habits
- challenges
- user_challenges
- articles
- recipes
- progress_entries

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **user_profiles**: Perfis de usuários
- **daily_plans**: Planos diários de dieta
- **daily_logs**: Registros de alimentos consumidos
- **wellness_tracking**: Rastreamento de bem-estar
- **progress_entries**: Dados históricos de progresso

### Relacionamentos

- Cada usuário tem um perfil (`user_profiles`)
- Cada usuário pode ter múltiplos planos diários (`daily_plans`)
- Cada plano tem múltiplas refeições (`daily_plan_meals`)
- Cada refeição tem múltiplos itens (`meal_items`)
- Cada usuário tem registros diários (`daily_logs`)
- Cada usuário tem rastreamento de bem-estar (`wellness_tracking`)

## 🔒 Segurança (RLS)

O schema inclui **Row Level Security (RLS)** configurado. Isso significa que:

- Usuários só podem ver/editar seus próprios dados
- Dados públicos (artigos, receitas, desafios) são visíveis para todos
- Todas as políticas de segurança estão configuradas automaticamente

## 🧪 Testando a Conexão

Crie um arquivo de teste `test-supabase.ts`:

```typescript
import { supabase } from './services/supabaseClient';

async function testConnection() {
  // Testar autenticação
  const { data: { user }, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (error) {
    console.error('Auth error:', error);
    return;
  }
  
  console.log('User created:', user);
  
  // Testar inserção de perfil
  if (user) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        name: 'Test User',
        age: 30,
        gender: 'Other',
        height: 170,
        weight: 70,
        activity_level: 'Moderate',
        goal: 'Maintain Weight',
        meals_per_day: 3
      });
    
    if (error) {
      console.error('Insert error:', error);
    } else {
      console.log('Profile created:', data);
    }
  }
}

testConnection();
```

## 📝 Próximos Passos

1. Integrar o Supabase no código do app
2. Substituir o estado local por chamadas ao Supabase
3. Implementar autenticação de usuários
4. Sincronizar dados entre dispositivos

## 🆘 Troubleshooting

### Erro: "relation does not exist"
- Certifique-se de que executou o schema SQL completo
- Verifique se está usando o schema correto (`public`)

### Erro: "permission denied"
- Verifique se o RLS está configurado corretamente
- Certifique-se de que o usuário está autenticado

### Erro: "invalid input syntax"
- Verifique os tipos de dados (enums, números, etc.)
- Certifique-se de que os valores estão no formato correto

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

