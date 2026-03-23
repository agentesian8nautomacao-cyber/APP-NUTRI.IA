# Resolver Erro 403 e Email Não Confirmado

## Problemas Identificados

1. **Erro 403 ao criar perfil**: O usuário recém-criado não tem permissão para inserir na tabela `user_profiles` devido ao RLS (Row Level Security).
2. **Erro "Email not confirmed"**: O Supabase está exigindo confirmação de email antes de permitir login.

## Soluções Implementadas

### 1. Função RPC para Criar Perfil

Foi criada uma função RPC (`create_user_profile`) que bypassa o RLS usando `SECURITY DEFINER`. Esta função deve ser executada no Supabase SQL Editor.

**Arquivo**: `criar_perfil_usuario_rpc.sql`

**Como executar**:
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `criar_perfil_usuario_rpc.sql`
4. Clique em **Run**

### 2. Desativar Confirmação de Email (OBRIGATÓRIO)

**IMPORTANTE**: O sistema não exige confirmação de email. Você DEVE desativar isso no Supabase Dashboard:

1. Acesse **Authentication** → **Settings**
2. Em **Email Auth**, **DESATIVE** a opção **"Enable email confirmations"**
3. Salve as alterações

**Resultado**: Usuários poderão fazer login imediatamente após o cadastro, sem precisar confirmar o email.

**Documentação completa**: Veja `DESATIVAR_CONFIRMACAO_EMAIL.md` para instruções detalhadas.

### 3. Código Atualizado

O código em `services/supabaseService.ts` foi atualizado para:

- Usar a função RPC `create_user_profile` para criar perfis (bypass RLS)
- Ter fallback para método direto caso a RPC falhe
- Aguardar 500ms após signUp para garantir que a sessão está estabelecida

## Passos para Resolver

### Passo 1: Executar SQL no Supabase

Execute o arquivo `criar_perfil_usuario_rpc.sql` no Supabase SQL Editor.

### Passo 2: Configurar Auto-Confirmação de Email

**Opção A - Desativar Confirmação de Email (Recomendado para desenvolvimento/teste)**:
1. Supabase Dashboard → Authentication → Settings
2. Desative **"Enable email confirmations"**

**Opção B - Manter Confirmação mas Auto-Confirmar**:
Crie uma Edge Function que confirma o email automaticamente após signUp (mais complexo).

### Passo 3: Testar

1. Tente criar uma nova conta via "Testar Grátis por 3 dias"
2. Verifique se o perfil é criado sem erro 403
3. Verifique se o login funciona imediatamente após o cadastro

## Verificação

Após executar os passos, verifique:

```sql
-- Verificar se a função RPC foi criada
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';

-- Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

## Troubleshooting

### Erro: "function create_user_profile does not exist"
- Certifique-se de que executou o SQL no Supabase SQL Editor
- Verifique se há erros de sintaxe no SQL

### Erro: "permission denied for function create_user_profile"
- A função precisa ser executada com permissões adequadas
- Verifique se o usuário tem permissão para executar funções RPC

### Erro: "Email not confirmed" ainda aparece
- Verifique as configurações de email no Supabase Dashboard
- Se necessário, confirme o email manualmente via Dashboard → Authentication → Users

