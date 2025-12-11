-- ============================================
-- FUNÇÃO DE RENOVAÇÃO AUTOMÁTICA DE PLANOS
-- ============================================
-- Esta função verifica planos expirados e renova automaticamente
-- se o usuário tiver um pagamento recorrente ativo na Cakto

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

-- Adicionar ao cron job
-- NOTA: Execute o script supabase_cron_jobs_auto_renewal.sql para adicionar ao cron

