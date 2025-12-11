-- ============================================
-- VER RESULTADO DA FUNÇÃO DE FORMA CLARA
-- ============================================

-- Esta query mostra o JSON retornado pela função
-- COPIE E COLE O RESULTADO COMPLETO AQUI
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json;

-- Análise do resultado em formato de tabela
SELECT 
  (activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'success')::BOOLEAN as sucesso,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'error' as erro,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'message' as mensagem,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'plan_type' as plano;

