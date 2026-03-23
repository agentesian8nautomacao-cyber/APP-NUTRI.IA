-- ============================================
-- VER RESULTADO DA FUNÇÃO
-- ============================================

-- Executar função e mostrar resultado completo
SELECT 
  activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json;

-- Análise detalhada (usando subquery)
SELECT 
  (resultado_json->>'success')::BOOLEAN as sucesso,
  resultado_json->>'error' as erro,
  resultado_json->>'message' as mensagem,
  resultado_json->>'plan_type' as plano
FROM (
  SELECT activate_coupon_internal('TESTE-ATIVACAO', '4186d746-5ac7-45fe-9c85-c83eaa97535e'::UUID) as resultado_json
) as r;

-- Testar função auxiliar diretamente
SELECT 
  'Teste função auxiliar' as info,
  cast_to_plan_type('academy_starter') as resultado;

