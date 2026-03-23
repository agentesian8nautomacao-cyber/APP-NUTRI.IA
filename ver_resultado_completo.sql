-- ============================================
-- VER RESULTADO COMPLETO DA FUNÇÃO
-- ============================================

-- 1. Executar função e mostrar JSON completo
DO $$
DECLARE
  v_resultado JSONB;
BEGIN
  v_resultado := activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID);
  
  RAISE NOTICE 'Resultado completo: %', v_resultado;
  RAISE NOTICE 'Sucesso: %', v_resultado->>'success';
  RAISE NOTICE 'Erro: %', v_resultado->>'error';
  RAISE NOTICE 'Mensagem: %', v_resultado->>'message';
  RAISE NOTICE 'Plano: %', v_resultado->>'plan_type';
END $$;

-- 2. Verificar estado do cupom após tentativa
SELECT 
  'Estado do Cupom' as info,
  code,
  current_uses,
  quantidade_disponivel,
  max_uses,
  is_active
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

-- 3. Verificar perfil do usuário após tentativa
SELECT 
  'Perfil do Usuário' as info,
  id,
  plan_type,
  subscription_status,
  account_type
FROM user_profiles
WHERE id = '4186d746-5ac7-45fe-9c85-c83eaa97535e';
