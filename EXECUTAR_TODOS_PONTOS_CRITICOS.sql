-- ============================================
-- SCRIPT ÚNICO: IMPLEMENTAR TODOS OS PONTOS CRÍTICOS
-- ============================================
-- Execute este script completo no editor SQL do Supabase
-- Copie e cole todo o conteúdo e execute

-- ============================================
-- PARTE 1: FUNÇÃO DE RENOVAÇÃO AUTOMÁTICA
-- ============================================

CREATE OR REPLACE FUNCTION auto_renew_subscriptions()
RETURNS TABLE(
  renewed_count INTEGER,
  expired_count INTEGER,
  details JSONB
) AS $$
DECLARE
  v_renewed INTEGER := 0;
  v_expired INTEGER := 0;
  v_details JSONB := '[]'::JSONB;
  v_user RECORD;
  v_plan_duration INTEGER;
  v_new_expiry TIMESTAMPTZ;
BEGIN
  -- Buscar usuários com planos expirados ou próximos de expirar (3 dias)
  FOR v_user IN
    SELECT 
      up.id,
      up.user_id,
      up.plan_type,
      up.subscription_status,
      up.expiry_date,
      up.cakto_customer_id,
      up.last_payment_date,
      -- Verificar se há pagamento recente (últimos 30 dias) indicando renovação
      (SELECT COUNT(*) > 0 
       FROM payment_history ph
       WHERE ph.user_id = up.user_id
         AND ph.status = 'completed'
         AND ph.created_at > NOW() - INTERVAL '30 days'
      ) as has_recent_payment
    FROM user_profiles up
    WHERE up.plan_type IN ('monthly', 'annual', 'academy_starter', 'academy_growth', 'academy_pro', 'personal_team')
      AND up.subscription_status = 'active'
      AND up.expiry_date IS NOT NULL
      AND up.expiry_date <= NOW() + INTERVAL '3 days' -- Próximos 3 dias ou já expirado
      AND up.cakto_customer_id IS NOT NULL -- Tem vínculo com Cakto
  LOOP
    -- Verificar se há pagamento recente (indicando renovação automática via Cakto)
    IF v_user.has_recent_payment THEN
      -- Calcular nova data de expiração baseada no tipo de plano
      CASE v_user.plan_type
        WHEN 'monthly' THEN v_plan_duration := 30;
        WHEN 'annual' THEN v_plan_duration := 365;
        WHEN 'academy_starter' THEN v_plan_duration := 365;
        WHEN 'academy_growth' THEN v_plan_duration := 365;
        WHEN 'academy_pro' THEN v_plan_duration := 365;
        WHEN 'personal_team' THEN v_plan_duration := 365;
        ELSE v_plan_duration := 30;
      END CASE;
      
      v_new_expiry := NOW() + (v_plan_duration || ' days')::INTERVAL;
      
      -- Renovar plano
      UPDATE user_profiles
      SET 
        expiry_date = v_new_expiry,
        subscription_status = 'active',
        last_payment_date = NOW(),
        updated_at = NOW()
      WHERE id = v_user.id;
      
      v_renewed := v_renewed + 1;
      
      -- Adicionar ao detalhes
      v_details := v_details || jsonb_build_object(
        'action', 'renewed',
        'user_id', v_user.user_id,
        'plan_type', v_user.plan_type,
        'new_expiry', v_new_expiry
      );
    ELSE
      -- Plano expirado sem renovação - marcar como expirado
      UPDATE user_profiles
      SET 
        subscription_status = 'expired',
        plan_type = 'free',
        updated_at = NOW()
      WHERE id = v_user.id;
      
      v_expired := v_expired + 1;
      
      -- Adicionar ao detalhes
      v_details := v_details || jsonb_build_object(
        'action', 'expired',
        'user_id', v_user.user_id,
        'plan_type', v_user.plan_type,
        'old_expiry', v_user.expiry_date
      );
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_renewed, v_expired, v_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION auto_renew_subscriptions() IS 
'Verifica planos expirados ou próximos de expirar e renova automaticamente se houver pagamento recente via Cakto. Marca como expirado se não houver renovação.';

-- ============================================
-- PARTE 2: CRON JOB PARA RENOVAÇÃO AUTOMÁTICA
-- ============================================

-- Verificar se a extensão pg_cron está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover cron job existente se houver (para evitar duplicatas)
SELECT cron.unschedule('auto-renew-subscriptions') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-renew-subscriptions'
);

-- Agendar renovação automática (executa diariamente às 02:00 UTC / 23:00 BRT do dia anterior)
SELECT cron.schedule(
    'auto-renew-subscriptions',
    '0 2 * * *', -- 02:00 UTC (23:00 BRT do dia anterior)
    $$
    SELECT auto_renew_subscriptions();
    $$
);

-- ============================================
-- PARTE 3: FUNÇÃO DE VALIDAÇÃO B2B
-- ============================================

CREATE OR REPLACE FUNCTION validate_b2b_coupon_availability(
  p_coupon_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_coupon RECORD;
  v_active_licenses INTEGER;
  v_available_licenses INTEGER;
  v_result JSON;
BEGIN
  -- Buscar cupom
  SELECT * INTO v_coupon
  FROM coupons
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_coupon_code))
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'CUPOM_INEXISTENTE',
      'message', 'Cupom não encontrado ou inativo.'
    );
  END IF;
  
  -- Contar licenças ativas (usuários vinculados a este cupom)
  SELECT COUNT(*) INTO v_active_licenses
  FROM user_coupon_links
  WHERE coupon_id = v_coupon.id;
  
  -- Calcular licenças disponíveis
  v_available_licenses := COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0) - v_active_licenses;
  
  -- Verificar se há licenças disponíveis
  IF v_available_licenses <= 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'CUPOM_ESGOTADO',
      'message', 'Este código de ativação não possui mais licenças disponíveis.',
      'total_licenses', COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0),
      'active_licenses', v_active_licenses,
      'available_licenses', 0
    );
  END IF;
  
  -- Cupom válido e com licenças disponíveis
  RETURN json_build_object(
    'valid', true,
    'message', 'Cupom válido e com licenças disponíveis.',
    'total_licenses', COALESCE(v_coupon.max_linked_accounts, v_coupon.max_uses, 0),
    'active_licenses', v_active_licenses,
    'available_licenses', v_available_licenses,
    'plan_type', v_coupon.plan_linked
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION validate_b2b_coupon_availability(TEXT) IS 
'Valida se um cupom B2B tem licenças disponíveis antes de permitir ativação. Retorna informações detalhadas sobre disponibilidade.';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as funções foram criadas
SELECT 
  'Funções criadas' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('auto_renew_subscriptions', 'validate_b2b_coupon_availability')
ORDER BY routine_name;

-- Verificar se o cron job foi agendado
SELECT 
  'Cron jobs agendados' as status,
  jobid,
  jobname,
  schedule,
  command
FROM cron.job 
WHERE jobname = 'auto-renew-subscriptions';

-- ============================================
-- SUCESSO!
-- ============================================
-- Se você vê as funções e o cron job acima, tudo foi criado com sucesso!

