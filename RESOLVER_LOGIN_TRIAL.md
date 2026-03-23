# 🔐 Resolver Problema de Login - Usuário Trial

## Problema
Não consegue fazer login com:
- **Email:** `paulhenriquems7054@gmail.com`
- **Senha:** `123456`

## Passos para Resolver

### 1. Verificar se o usuário existe no Supabase

Execute o script SQL `verificar_usuario_trial.sql` no Supabase SQL Editor para verificar:
- Se o usuário existe em `auth.users`
- Se o email está confirmado
- Se o perfil existe em `user_profiles`
- Se há enquete respondida

### 2. Possíveis Causas e Soluções

#### A) Usuário não existe em `auth.users`
**Solução:** Criar o usuário manualmente no Supabase:

1. Acesse **Supabase Dashboard > Authentication > Users**
2. Clique em **"Add User"** ou **"Create User"**
3. Preencha:
   - **Email:** `paulhenriquems7054@gmail.com`
   - **Password:** `123456`
   - **Auto Confirm User:** ✅ (marcar esta opção)
4. Clique em **"Create User"**

#### B) Usuário existe mas não tem perfil em `user_profiles`
**Solução:** Execute este SQL no Supabase SQL Editor:

```sql
DO $$
DECLARE
    v_user_id UUID;
    v_profile_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'paulhenriquems7054@gmail.com'
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado em auth.users. Por favor, crie o usuário primeiro no Supabase Dashboard > Authentication > Users > Add User';
    END IF;

    RAISE NOTICE 'Usuário encontrado: %', v_user_id;

    -- Verificar se perfil já existe
    SELECT id INTO v_profile_id
    FROM user_profiles
    WHERE user_id = v_user_id
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        -- Criar perfil de trial
        INSERT INTO user_profiles (
            user_id,
            name,
            age,
            gender,
            height,
            weight,
            activity_level,
            goal,
            restrictions,
            meals_per_day,
            medical_history,
            routine_description,
            food_preferences,
            streak,
            last_active_date,
            plan_type,
            subscription_status,
            subscription_expiry,
            voice_daily_limit_seconds,
            daily_free_minutes,
            voice_balance_upsell,
            cakto_customer_id,
            last_payment_date,
            payment_method
        ) VALUES (
            v_user_id,
            'Usuário Trial',
            30,
            'Other',
            170.0,
            70.0,
            'Light',
            'General Health',
            '',
            3,
            '',
            '',
            '',
            0,
            NOW(),
            'free',
            'trial',
            (NOW() + INTERVAL '3 days')::TIMESTAMPTZ, -- Trial de 3 dias
            300, -- 5 minutos (300 segundos)
            5, -- 5 minutos diários
            0,
            NULL,
            NULL,
            NULL
        )
        RETURNING id INTO v_profile_id;

        RAISE NOTICE '✅ Perfil criado para paulhenriquems7054@gmail.com: %', v_profile_id;
    ELSE
        -- Atualizar perfil existente para trial
        UPDATE user_profiles
        SET
            name = COALESCE(name, 'Usuário Trial'),
            plan_type = 'free',
            subscription_status = 'trial',
            subscription_expiry = (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
            voice_daily_limit_seconds = 300,
            daily_free_minutes = 5,
            updated_at = NOW()
        WHERE id = v_profile_id;

        RAISE NOTICE '✅ Perfil atualizado para paulhenriquems7054@gmail.com: %', v_profile_id;
    END IF;
END $$;

-- Verificar resultado
SELECT
    u.email,
    u.email_confirmed_at,
    up.name,
    up.plan_type,
    up.subscription_status,
    up.subscription_expiry,
    up.voice_daily_limit_seconds,
    up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paulhenriquems7054@gmail.com';
```

#### C) Senha incorreta
**Solução:** Redefinir a senha no Supabase:

1. Acesse **Supabase Dashboard > Authentication > Users**
2. Encontre o usuário `paulhenriquems7054@gmail.com`
3. Clique em **"..." (três pontos) > Reset Password"**
4. Ou edite o usuário e defina uma nova senha: `123456`

#### D) Email não confirmado
**Solução:** Confirmar email manualmente:

1. Acesse **Supabase Dashboard > Authentication > Users**
2. Encontre o usuário `paulhenriquems7054@gmail.com`
3. Clique em **"..." (três pontos) > Confirm Email"**

**OU** desative a confirmação de email (recomendado para desenvolvimento):

1. Acesse **Supabase Dashboard > Authentication > Settings**
2. Desative **"Enable email confirmations"**
3. Salve as alterações

### 3. Verificar Logs no Console do Navegador

Após tentar fazer login, verifique o console do navegador (F12) para ver os logs de debug:
- `🔐 [DEBUG] Tentando fazer login com email: ...`
- `✅ [DEBUG] Login bem-sucedido para: ...` ou `❌ [DEBUG] Erro no login: ...`

### 4. Testar Login Novamente

Após executar as correções acima:
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página (F5)
3. Tente fazer login novamente com:
   - **Email:** `paulhenriquems7054@gmail.com`
   - **Senha:** `123456`

## Script SQL Rápido (Criar/Atualizar Usuário Trial)

Execute este script completo no Supabase SQL Editor:

```sql
-- 1. Verificar se usuário existe
SELECT 
  'Verificando usuário...' as status,
  id,
  email,
  email_confirmed_at
FROM auth.users
WHERE email = 'paulhenriquems7054@gmail.com';

-- 2. Se não existir, você precisa criar manualmente no Dashboard
-- 3. Depois execute o script de criar/atualizar perfil (ver seção B acima)
```

## Notas Importantes

- ✅ O sistema **NÃO requer confirmação de email** (já desativado)
- ✅ Usuários trial têm `subscription_status = 'trial'` e `subscription_expiry = NOW() + 3 days`
- ✅ Usuários trial têm `daily_free_minutes = 5` (5 minutos de voz por dia)
- ✅ Usuários trial têm `voice_daily_limit_seconds = 300` (300 segundos = 5 minutos)

Se o problema persistir após seguir estes passos, verifique os logs do console do navegador e compartilhe a mensagem de erro específica.

