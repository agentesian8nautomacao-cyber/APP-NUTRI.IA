# 🛠️ Como Adicionar Desenvolvedores no Supabase

Este guia explica como criar os desenvolvedores diretamente no Supabase para que o app reconheça automaticamente e conceda acesso completo.

## 📋 Desenvolvedores

1. **Desenvolvedor 1:**
   - Email: `19brenobernardes@gmail.com`
   - Senha: `Centuryfox21!`

2. **Desenvolvedor 2:**
   - Email: `paulohmorais@hotmail.com`
   - Senha: `phm705412`

---

## 🚀 Método 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Criar Usuários no Authentication

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Clique em **"Add User"** ou **"Create User"**

#### Para o Desenvolvedor 1:
- **Email:** `19brenobernardes@gmail.com`
- **Password:** `Centuryfox21!`
- **Auto Confirm User:** ✅ (marcar esta opção)
- Clique em **"Create User"**

#### Para o Desenvolvedor 2:
- **Email:** `paulohmorais@hotmail.com`
- **Password:** `phm705412`
- **Auto Confirm User:** ✅ (marcar esta opção)
- Clique em **"Create User"**

### Passo 2: Criar Perfis dos Desenvolvedores

Após criar os usuários, você precisa criar os perfis na tabela `user_profiles`. Execute o script SQL abaixo no **SQL Editor** do Supabase:

```sql
-- ============================================
-- CRIAR PERFIS DOS DESENVOLVEDORES
-- ============================================

-- Desenvolvedor 1: 19brenobernardes@gmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = '19brenobernardes@gmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário 19brenobernardes@gmail.com não encontrado! Crie o usuário primeiro no Authentication.';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;

  -- Verificar se perfil já existe
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_user_id 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    -- Criar perfil
    INSERT INTO user_profiles (
      user_id,
      name,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      meals_per_day,
      restrictions,
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
      'Breno Bernardes',
      30,
      'Other',
      175,
      75,
      'Moderate',
      'General Health',
      3,
      '',
      '',
      '',
      '',
      0,
      NOW(),
      'monthly',
      'active',
      (NOW() + INTERVAL '1 year')::TIMESTAMPTZ, -- Assinatura válida por 1 ano
      900, -- 15 minutos de voz (monthly)
      15,  -- 15 minutos diários
      0,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_profile_id;

    RAISE NOTICE '✅ Perfil criado para 19brenobernardes@gmail.com: %', v_profile_id;
  ELSE
    -- Atualizar perfil existente para garantir acesso completo
    UPDATE user_profiles
    SET 
      plan_type = 'monthly',
      subscription_status = 'active',
      subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      voice_daily_limit_seconds = 900,
      daily_free_minutes = 15
    WHERE id = v_profile_id;

    RAISE NOTICE '✅ Perfil atualizado para 19brenobernardes@gmail.com: %', v_profile_id;
  END IF;
END $$;

-- Desenvolvedor 2: paulohmorais@hotmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'paulohmorais@hotmail.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário paulohmorais@hotmail.com não encontrado! Crie o usuário primeiro no Authentication.';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Usuário encontrado: %', v_user_id;

  -- Verificar se perfil já existe
  SELECT id INTO v_profile_id 
  FROM user_profiles 
  WHERE user_id = v_user_id 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    -- Criar perfil
    INSERT INTO user_profiles (
      user_id,
      name,
      age,
      gender,
      height,
      weight,
      activity_level,
      goal,
      meals_per_day,
      restrictions,
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
      'Paulo Henrique',
      30,
      'Other',
      175,
      75,
      'Moderate',
      'General Health',
      3,
      '',
      '',
      '',
      '',
      0,
      NOW(),
      'monthly',
      'active',
      (NOW() + INTERVAL '1 year')::TIMESTAMPTZ, -- Assinatura válida por 1 ano
      900, -- 15 minutos de voz (monthly)
      15,  -- 15 minutos diários
      0,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_profile_id;

    RAISE NOTICE '✅ Perfil criado para paulohmorais@hotmail.com: %', v_profile_id;
  ELSE
    -- Atualizar perfil existente para garantir acesso completo
    UPDATE user_profiles
    SET 
      plan_type = 'monthly',
      subscription_status = 'active',
      subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
      voice_daily_limit_seconds = 900,
      daily_free_minutes = 15
    WHERE id = v_profile_id;

    RAISE NOTICE '✅ Perfil atualizado para paulohmorais@hotmail.com: %', v_profile_id;
  END IF;
END $$;

-- Verificar resultado
SELECT 
  u.email,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email IN ('19brenobernardes@gmail.com', 'paulohmorais@hotmail.com')
ORDER BY u.email;
```

---

## 🚀 Método 2: Script SQL Completo (Automático)

Execute este script no **SQL Editor** do Supabase. Ele cria os usuários e perfis automaticamente:

```sql
-- ============================================
-- SCRIPT COMPLETO: CRIAR DESENVOLVEDORES
-- ============================================
-- Este script cria os usuários e perfis automaticamente

-- Desenvolvedor 1
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  -- Criar usuário (se não existir)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token
  )
  SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    '19brenobernardes@gmail.com',
    crypt('Centuryfox21!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = '19brenobernardes@gmail.com'
  )
  RETURNING id INTO v_user_id;

  -- Se usuário já existe, buscar ID
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = '19brenobernardes@gmail.com';
  END IF;

  -- Criar perfil
  INSERT INTO user_profiles (
    user_id, name, age, gender, height, weight, activity_level, goal,
    meals_per_day, plan_type, subscription_status, subscription_expiry,
    voice_daily_limit_seconds, daily_free_minutes
  )
  VALUES (
    v_user_id,
    'Breno Bernardes',
    30, 'Other', 175, 75, 'Moderate', 'General Health',
    3, 'monthly', 'active', (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
    900, 15
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'monthly',
    subscription_status = 'active',
    subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
    voice_daily_limit_seconds = 900,
    daily_free_minutes = 15;

  RAISE NOTICE '✅ Desenvolvedor 1 configurado: 19brenobernardes@gmail.com';
END $$;

-- Desenvolvedor 2
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  )
  SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'paulohmorais@hotmail.com',
    crypt('phm705412', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'paulohmorais@hotmail.com'
  )
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'paulohmorais@hotmail.com';
  END IF;

  INSERT INTO user_profiles (
    user_id, name, age, gender, height, weight, activity_level, goal,
    meals_per_day, plan_type, subscription_status, subscription_expiry,
    voice_daily_limit_seconds, daily_free_minutes
  )
  VALUES (
    v_user_id,
    'Paulo Henrique',
    30, 'Other', 175, 75, 'Moderate', 'General Health',
    3, 'monthly', 'active', (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
    900, 15
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'monthly',
    subscription_status = 'active',
    subscription_expiry = (NOW() + INTERVAL '1 year')::TIMESTAMPTZ,
    voice_daily_limit_seconds = 900,
    daily_free_minutes = 15;

  RAISE NOTICE '✅ Desenvolvedor 2 configurado: paulohmorais@hotmail.com';
END $$;
```

**⚠️ NOTA:** O Método 2 pode não funcionar se você não tiver permissões para inserir diretamente em `auth.users`. Use o **Método 1** (Dashboard) que é mais seguro e recomendado.

---

## ✅ Verificação

Após criar os desenvolvedores, verifique se está tudo correto:

```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  up.name,
  up.plan_type,
  up.subscription_status,
  up.voice_daily_limit_seconds,
  up.daily_free_minutes
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email IN ('19brenobernardes@gmail.com', 'paulohmorais@hotmail.com')
ORDER BY u.email;
```

**Resultado esperado:**
- ✅ Ambos os emails devem aparecer
- ✅ `email_confirmed_at` deve ter uma data (usuário confirmado)
- ✅ `plan_type` = `monthly`
- ✅ `subscription_status` = `active`
- ✅ `voice_daily_limit_seconds` = `900` (15 minutos)
- ✅ `daily_free_minutes` = `15`

---

## 🎯 Como o App Reconhece os Desenvolvedores

O app já está configurado para reconhecer automaticamente os desenvolvedores. O código em `App.tsx` verifica se o email do usuário está na lista:

```typescript
const DEVELOPER_EMAILS = [
  '19brenobernardes@gmail.com',
  'paulohmorais@hotmail.com'
];
```

Quando um desenvolvedor faz login:
1. ✅ O app verifica se o email está na lista
2. ✅ Se for desenvolvedor, ativa `isDeveloper = true`
3. ✅ Desativa todos os bloqueios (trial, limites, etc.)
4. ✅ Concede acesso completo a todas as funcionalidades

---

## 🚀 Testando

1. Acesse o app no Vercel
2. Faça login com um dos emails de desenvolvedor
3. O app deve reconhecer automaticamente e conceder acesso completo
4. Não deve haver bloqueios de trial ou limites

---

## 📝 Notas Importantes

- ✅ Os desenvolvedores são reconhecidos **automaticamente** pelo email
- ✅ Não é necessário código de convite para desenvolvedores
- ✅ Acesso completo é concedido automaticamente após login
- ✅ Funciona tanto no ambiente local quanto no Vercel
- ✅ As credenciais são as mesmas definidas acima

