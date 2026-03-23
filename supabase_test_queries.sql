-- ============================================
-- QUERIES ÚTEIS PARA TESTAR O BANCO DE DADOS
-- ============================================

-- ============================================
-- TESTES DE INSERÇÃO (Execute após criar um usuário)
-- ============================================

-- 1. Inserir um perfil de usuário (substitua 'USER_ID_AQUI' pelo ID real do usuário)
-- Primeiro, você precisa criar um usuário via Authentication no Supabase
-- Depois, pegue o user_id da tabela auth.users

/*
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
    food_preferences
) VALUES (
    'USER_ID_AQUI', -- Substitua pelo ID real
    'João Silva',
    30,
    'Male',
    175.0,
    75.0,
    'Moderate',
    'Lose Weight',
    'Sem glúten',
    3,
    'Nenhuma',
    'Trabalho das 9h às 18h',
    'Prefere alimentos naturais'
);
*/

-- 2. Inserir um plano diário
/*
INSERT INTO daily_plans (
    user_id,
    plan_date,
    total_calories,
    target_protein,
    target_carbs,
    target_fats,
    nutritional_analysis,
    behavioral_tips,
    shopping_list,
    hydration_target
) VALUES (
    'USER_ID_AQUI',
    CURRENT_DATE,
    2000,
    150.0,
    200.0,
    65.0,
    'Plano balanceado para perda de peso',
    ARRAY['Beba água antes das refeições', 'Mastigue devagar'],
    ARRAY['Frutas', 'Verduras', 'Proteínas magras'],
    2.5
) RETURNING *;
*/

-- 3. Inserir uma refeição no plano
/*
INSERT INTO daily_plan_meals (
    daily_plan_id,
    meal_type
) VALUES (
    'PLAN_ID_AQUI', -- ID do plano criado acima
    'Breakfast'
) RETURNING *;
*/

-- 4. Inserir itens na refeição
/*
INSERT INTO meal_items (
    daily_plan_meal_id,
    name,
    calories,
    protein,
    carbs,
    fats,
    description
) VALUES (
    'MEAL_ID_AQUI', -- ID da refeição criada acima
    'Aveia com frutas',
    350,
    12.0,
    55.0,
    8.0,
    'Aveia integral com banana e morangos'
) RETURNING *;
*/

-- 5. Inserir um registro diário (log)
/*
INSERT INTO daily_logs (
    user_id,
    name,
    calories,
    protein,
    carbs,
    fats,
    meal_type,
    description
) VALUES (
    'USER_ID_AQUI',
    'Salada de frango grelhado',
    450,
    35.0,
    30.0,
    20.0,
    'Lunch',
    'Salada verde com frango grelhado e azeite'
) RETURNING *;
*/

-- 6. Inserir rastreamento de bem-estar
/*
INSERT INTO wellness_tracking (
    user_id,
    tracking_date,
    mood,
    water_glasses,
    sleep_hours,
    sleep_quality
) VALUES (
    'USER_ID_AQUI',
    CURRENT_DATE,
    'good',
    8,
    7.5,
    85
) RETURNING *;
*/

-- ============================================
-- QUERIES DE CONSULTA ÚTEIS
-- ============================================

-- 1. Ver todos os perfis de usuários
-- SELECT * FROM user_profiles;

-- 2. Ver planos diários de um usuário
-- SELECT * FROM daily_plans WHERE user_id = 'USER_ID_AQUI' ORDER BY plan_date DESC;

-- 3. Ver registros diários de hoje
-- SELECT * FROM daily_logs 
-- WHERE user_id = 'USER_ID_AQUI' 
--   AND DATE(timestamp) = CURRENT_DATE
-- ORDER BY timestamp DESC;

-- 4. Calcular total de calorias consumidas hoje
-- SELECT 
--     SUM(calories) as total_calories,
--     SUM(protein) as total_protein,
--     SUM(carbs) as total_carbs,
--     SUM(fats) as total_fats
-- FROM daily_logs
-- WHERE user_id = 'USER_ID_AQUI'
--   AND DATE(timestamp) = CURRENT_DATE;

-- 5. Ver histórico de escaneamentos
-- SELECT * FROM scan_history 
-- WHERE user_id = 'USER_ID_AQUI' 
-- ORDER BY scan_date DESC 
-- LIMIT 10;

-- 6. Ver mensagens do chat
-- SELECT * FROM chat_messages 
-- WHERE user_id = 'USER_ID_AQUI' 
-- ORDER BY timestamp DESC 
-- LIMIT 50;

-- 7. Ver progresso de desafios do usuário
-- SELECT 
--     c.title,
--     c.description,
--     c.reward,
--     uc.status,
--     uc.progress
-- FROM user_challenges uc
-- JOIN challenges c ON c.id = uc.challenge_id
-- WHERE uc.user_id = 'USER_ID_AQUI';

-- 8. Ver artigos disponíveis
-- SELECT * FROM articles ORDER BY created_at DESC;

-- 9. Ver receitas disponíveis
-- SELECT * FROM recipes ORDER BY created_at DESC;

-- 10. Ver progresso de peso ao longo do tempo
-- SELECT 
--     entry_date,
--     weight,
--     calories_consumed
-- FROM progress_entries
-- WHERE user_id = 'USER_ID_AQUI'
-- ORDER BY entry_date DESC
-- LIMIT 30;

-- ============================================
-- QUERIES DE ATUALIZAÇÃO ÚTEIS
-- ============================================

-- 1. Atualizar streak do usuário
-- UPDATE user_profiles
-- SET streak = streak + 1,
--     last_active_date = NOW()
-- WHERE user_id = 'USER_ID_AQUI';

-- 2. Atualizar peso do usuário
-- UPDATE user_profiles
-- SET weight = 74.5
-- WHERE user_id = 'USER_ID_AQUI';

-- 3. Marcar hábito como completo
-- UPDATE wellness_habits
-- SET completed = true
-- WHERE id = 'HABIT_ID_AQUI';

-- ============================================
-- QUERIES DE LIMPEZA (CUIDADO!)
-- ============================================

-- ATENÇÃO: Use apenas em desenvolvimento/testes!

-- Limpar todos os dados de um usuário (mantém o perfil)
-- DELETE FROM daily_logs WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM scan_history WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM chat_messages WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM progress_entries WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM user_challenges WHERE user_id = 'USER_ID_AQUI';

