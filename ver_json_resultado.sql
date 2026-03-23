-- ============================================
-- VER JSON RESULTADO DA FUNÇÃO
-- ============================================

-- Query 1: Resultado JSON completo
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)::TEXT as resultado_json;

-- Query 2: Campos individuais do JSON
SELECT 
  (activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'success')::BOOLEAN as sucesso,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'error' as erro,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'message' as mensagem,
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID)->>'plan_type' as plano;

