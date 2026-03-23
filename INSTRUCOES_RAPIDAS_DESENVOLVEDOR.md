# ⚡ Instruções Rápidas - Criar Desenvolvedor Paulo

## 🎯 Objetivo
Criar o desenvolvedor Paulo no Supabase para que ele possa fazer login no app.

## 📝 Passo a Passo

### 1️⃣ Criar Usuário no Authentication

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Clique em **"Add User"**
5. Preencha:
   - **Email:** `paulohmorais@hotmail.com`
   - **Password:** `phm705412`
   - **Auto Confirm User:** ✅ **MARCAR** (muito importante!)
6. Clique em **"Create User"**

### 2️⃣ Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `corrigir_desenvolvedor_paulo.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"** ou pressione `Ctrl+Enter`
6. Verifique as mensagens de sucesso

### 3️⃣ Verificar Resultado

O script deve mostrar:
- ✅ Usuário encontrado
- ✅ Perfil criado/atualizado
- ✅ Configuração completa

### 4️⃣ Testar Login

1. Acesse: https://app-nutri-ia.vercel.app/
2. Clique em **"Já tenho uma conta"**
3. Digite:
   - **Email:** `paulohmorais@hotmail.com`
   - **Senha:** `phm705412`
4. Clique em **"Entrar"**

## ✅ Resultado Esperado

- Login bem-sucedido
- App reconhece automaticamente como desenvolvedor
- Acesso completo a todas as funcionalidades
- Sem bloqueios de trial ou limites

## ❌ Se Ainda Não Funcionar

1. Verifique se o usuário foi criado em **Authentication → Users**
2. Verifique se **"Auto Confirm User"** foi marcado
3. Aguarde alguns segundos e tente novamente
4. Limpe o cache do navegador

## 📋 Script SQL Simplificado

Use o arquivo: `corrigir_desenvolvedor_paulo.sql`

Este script:
- Verifica se o usuário existe
- Cria/atualiza o perfil automaticamente
- Configura acesso completo

