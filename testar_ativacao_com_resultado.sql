-- ============================================
-- TESTE DE ATIVAÇÃO COM RESULTADO NA TABELA
-- ============================================
-- Este script retorna o resultado diretamente na query
-- Não depende de mensagens RAISE NOTICE

-- Criar tabela temporária para resultados
CREATE TEMP TABLE IF NOT EXISTS resultado_ativacao (
  etapa TEXT,
  status TEXT,
  detalhes TEXT
);

TRUNCATE TABLE resultado_ativacao;

-- Executar ativação e salvar resultados
DO $$
DECLARE
  v_user_count INTEGER;
  v_auth_user_id UUID;
  v_profile_id UUID;
  v_result JSON;
  v_result_success BOOLEAN;
BEGIN
  -- Verificar usuários
  SELECT COUNT(*) INTO v_user_count FROM auth.users;
  
  IF v_user_count = 0 THEN
    INSERT INTO resultado_ativacao VALUES 
    ('Verificação', '❌ ERRO', 'Nenhum usuário encontrado em auth.users'),
    ('Solução', '📝 AÇÃO NECESSÁRIA', 'Crie um usuário via app ou Supabase Dashboard primeiro');
    RETURN;
  END IF;
  
  INSERT INTO resultado_ativacao VALUES 
  ('Verificação', '✅ OK', 'Encontrados ' || v_user_count || ' usuário(s)');
  
  -- Buscar usuário
  SELECT id INTO v_auth_user_id FROM auth.users LIMIT 1;
  
  -- Buscar ou criar perfil
  SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = v_auth_user_id LIMIT 1;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO user_profiles (user_id, name, age, gender, height, weight, activity_level, goal)
    VALUES (v_auth_user_id, 'Usuário Teste', 30, 'Female', 170, 70, 'Moderate', 'Lose Weight')
    RETURNING id INTO v_profile_id;
    INSERT INTO resultado_ativacao VALUES ('Perfil', '✅ CRIADO', 'ID: ' || v_profile_id::TEXT);
  ELSE
    INSERT INTO resultado_ativacao VALUES ('Perfil', '✅ ENCONTRADO', 'ID: ' || v_profile_id::TEXT);
  END IF;
  
  -- Atualizar account_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'account_type'
  ) THEN
    UPDATE user_profiles SET account_type = 'USER_GYM' WHERE id = v_profile_id;
  END IF;
  
  -- Estado antes
  INSERT INTO resultado_ativacao VALUES 
  ('Estado Antes', '📊', 'Disponível: ' || (SELECT quantidade_disponivel::TEXT FROM coupons WHERE code = 'TESTE-ATIVACAO') || 
   ', Usos: ' || (SELECT current_uses::TEXT FROM coupons WHERE code = 'TESTE-ATIVACAO'));
  
  -- Executar ativação
  BEGIN
    SELECT activate_coupon_internal('TESTE-ATIVACAO', v_profile_id) INTO v_result;
    v_result_success := (v_result->>'success')::BOOLEAN;
    
    IF v_result_success THEN
      INSERT INTO resultado_ativacao VALUES 
      ('Ativação', '✅✅✅ SUCESSO ✅✅✅', v_result::TEXT),
      ('Plano', '📋', 'Plan: ' || COALESCE(v_result->>'plan_type', 'N/A')),
      ('Account Type', '👤', 'Type: ' || COALESCE(v_result->>'account_type', 'N/A'));
    ELSE
      INSERT INTO resultado_ativacao VALUES 
      ('Ativação', '❌ FALHOU', v_result::TEXT),
      ('Erro', '⚠️', 'Error: ' || COALESCE(v_result->>'error', 'Desconhecido')),
      ('Mensagem', '💬', 'Message: ' || COALESCE(v_result->>'message', 'N/A'));
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO resultado_ativacao VALUES 
    ('Ativação', '❌ ERRO SQL', SQLERRM);
  END;
  
  -- Estado depois
  INSERT INTO resultado_ativacao VALUES 
  ('Estado Depois', '📊', 'Disponível: ' || (SELECT quantidade_disponivel::TEXT FROM coupons WHERE code = 'TESTE-ATIVACAO') || 
   ', Usos: ' || (SELECT current_uses::TEXT FROM coupons WHERE code = 'TESTE-ATIVACAO'));
  
END $$;

-- Mostrar resultados
SELECT * FROM resultado_ativacao ORDER BY 
  CASE etapa
    WHEN 'Verificação' THEN 1
    WHEN 'Perfil' THEN 2
    WHEN 'Estado Antes' THEN 3
    WHEN 'Ativação' THEN 4
    WHEN 'Plano' THEN 5
    WHEN 'Account Type' THEN 6
    WHEN 'Erro' THEN 7
    WHEN 'Mensagem' THEN 8
    WHEN 'Estado Depois' THEN 9
    WHEN 'Solução' THEN 10
    ELSE 99
  END;

-- Verificar cupom
SELECT 
  'Cupom Final' as info,
  code,
  current_uses,
  quantidade_disponivel,
  CASE 
    WHEN current_uses > 0 THEN '✅ ATIVADO'
    ELSE '❌ NÃO ATIVADO'
  END as status
FROM coupons
WHERE code = 'TESTE-ATIVACAO';

