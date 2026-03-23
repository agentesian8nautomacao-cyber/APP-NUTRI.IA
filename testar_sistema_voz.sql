-- ============================================
-- TESTE: Sistema de Consumo de Voz
-- ============================================
-- Este script testa as funções do sistema de consumo de voz

-- 1. Obter um user_id real para teste
-- (Substitua pelo ID de um usuário real ou use este exemplo)
DO $$
DECLARE
    v_user_id UUID;
    v_test_result JSON;
BEGIN
    -- Pegar o primeiro user_id disponível (ou use um específico)
    SELECT user_id INTO v_user_id
    FROM user_profiles
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Nenhum usuário encontrado. Crie um usuário primeiro.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testando com user_id: %', v_user_id;
    
    -- 2. Verificar saldos iniciais
    RAISE NOTICE '=== SALDOS INICIAIS ===';
    SELECT 
        daily_free_minutes,
        boost_minutes_balance,
        reserve_bank_balance,
        subscription_status
    INTO v_test_result
    FROM user_profiles
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Saldos: %', v_test_result;
    
    -- 3. Testar consumo de 1 minuto
    RAISE NOTICE '=== TESTE: Consumir 1 minuto ===';
    SELECT consume_voice_time(v_user_id, 1) INTO v_test_result;
    RAISE NOTICE 'Resultado: %', v_test_result;
    
    -- 4. Verificar saldos após consumo
    RAISE NOTICE '=== SALDOS APÓS CONSUMO ===';
    SELECT 
        daily_free_minutes,
        boost_minutes_balance,
        reserve_bank_balance
    INTO v_test_result
    FROM user_profiles
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Saldos: %', v_test_result;
    
    -- 5. Testar adicionar boost
    RAISE NOTICE '=== TESTE: Adicionar Boost (+20 min) ===';
    SELECT add_boost_minutes(v_user_id, 20) INTO v_test_result;
    RAISE NOTICE 'Resultado: %', v_test_result;
    
    -- 6. Verificar boost adicionado
    SELECT 
        boost_minutes_balance,
        boost_expiry
    INTO v_test_result
    FROM user_profiles
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Boost após adição: %', v_test_result;
    
    RAISE NOTICE '=== TESTES CONCLUÍDOS ===';
END $$;

-- ============================================
-- TESTE MANUAL (Execute individualmente)
-- ============================================

-- 1. Ver todos os usuários disponíveis
-- SELECT user_id, name, daily_free_minutes, boost_minutes_balance, reserve_bank_balance
-- FROM user_profiles
-- LIMIT 5;

-- 2. Testar consumo (substitua pelo UUID real)
-- SELECT consume_voice_time('UUID-AQUI'::uuid, 1);

-- 3. Testar adicionar boost
-- SELECT add_boost_minutes('UUID-AQUI'::uuid, 20);

-- 4. Testar adicionar reserva
-- SELECT add_reserve_minutes('UUID-AQUI'::uuid, 100);

-- 5. Testar ativar ilimitado
-- SELECT activate_unlimited_subscription('UUID-AQUI'::uuid, 30);

-- 6. Testar reset diário (cuidado: afeta todos os usuários!)
-- SELECT reset_daily_free_minutes();

-- 7. Testar expiração de boost
-- SELECT expire_boost_minutes();

