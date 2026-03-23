-- ============================================
-- EXECUTAR ATIVAÇÃO DIRETA
-- ============================================
-- Executa a função e mostra o resultado de forma clara

-- Profile ID: 4186d746-5ac7-45fe-9c85-c83eaa97535e
-- Cupom: TESTE-ATIVACAO

-- 1. Verificar cupom antes
SELECT 
  'ANTES' as momento,
  code,
  is_active,
  quantidade_disponivel,
  current_uses
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 2. EXECUTAR FUNÇÃO E VER RESULTADO
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado;

-- 3. Verificar cupom depois
SELECT 
  'DEPOIS' as momento,
  code,
  is_active,
  quantidade_disponivel,
  current_uses,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 4. Verificar perfil depois
SELECT 
  'Perfil DEPOIS' as info,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID;

-- 5. Análise detalhada do resultado
DO $$
DECLARE
  v_result JSON;
  v_success BOOLEAN;
  v_error TEXT;
  v_message TEXT;
BEGIN
  -- Executar função
  SELECT activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) INTO v_result;
  
  -- Extrair campos
  v_success := (v_result->>'success')::BOOLEAN;
  v_error := v_result->>'error';
  v_message := v_result->>'message';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ANÁLISE DO RESULTADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Success: %', v_success;
  RAISE NOTICE 'Error: %', v_error;
  RAISE NOTICE 'Message: %', v_message;
  RAISE NOTICE '';
  RAISE NOTICE 'JSON Completo:';
  RAISE NOTICE '%', v_result::TEXT;
  RAISE NOTICE '';
  
  IF v_success THEN
    RAISE NOTICE '✅ FUNÇÃO RETORNOU SUCESSO';
  ELSE
    RAISE NOTICE '❌ FUNÇÃO RETORNOU ERRO';
    RAISE NOTICE '';
    RAISE NOTICE 'DIAGNÓSTICO:';
    
    IF v_error = 'CUPOM_INEXISTENTE' THEN
      RAISE NOTICE '   - Cupom não existe ou is_active = false';
      RAISE NOTICE '   - Verifique: SELECT * FROM coupons WHERE code = ''TESTE-ATIVACAO'';';
    ELSIF v_error = 'CUPOM_ESGOTADO' THEN
      RAISE NOTICE '   - quantidade_disponivel = 0';
      RAISE NOTICE '   - Verifique: SELECT quantidade_disponivel FROM coupons WHERE code = ''TESTE-ATIVACAO'';';
    ELSIF v_error = 'PERFIL_INCOMPATIVEL' THEN
      RAISE NOTICE '   - account_type do usuário não é compatível';
      RAISE NOTICE '   - Verifique: SELECT account_type FROM user_profiles WHERE id = ''4186d746-5ac7-45fe-9c85-c83eaa97535e'';';
    ELSIF v_error = 'USUARIO_NAO_ENCONTRADO' THEN
      RAISE NOTICE '   - Perfil não encontrado';
      RAISE NOTICE '   - Verifique: SELECT * FROM user_profiles WHERE id = ''4186d746-5ac7-45fe-9c85-c83eaa97535e'';';
    ELSE
      RAISE NOTICE '   - Erro desconhecido: %', v_error;
    END IF;
  END IF;
  
  RAISE NOTICE '========================================';
  
END $$;

