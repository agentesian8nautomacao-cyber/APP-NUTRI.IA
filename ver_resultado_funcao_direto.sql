-- ============================================
-- VER RESULTADO DA FUNÇÃO DE FORMA DIRETA
-- ============================================

-- Esta query mostra o JSON retornado pela função
-- COMPARTILHE ESTE RESULTADO COMPLETO
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado;

-- Análise do resultado em campos separados
WITH resultado AS (
  SELECT activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as json_result
)
SELECT 
  (json_result->>'success')::BOOLEAN as sucesso,
  json_result->>'error' as erro,
  json_result->>'message' as mensagem,
  json_result->>'plan_type' as plano,
  json_result->>'account_type' as account_type,
  json_result->>'warning' as aviso
FROM resultado;

