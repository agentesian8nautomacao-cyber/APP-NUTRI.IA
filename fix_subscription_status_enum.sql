-- ============================================
-- CORREÇÃO: Converter subscription_status de ENUM para TEXT
-- ============================================
-- Execute este script se o script principal falhar com erro de ENUM
-- Este script converte subscription_status de ENUM para TEXT

DO $$ 
DECLARE
    v_data_type TEXT;
    v_enum_name TEXT;
    v_column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'subscription_status'
    ) INTO v_column_exists;
    
    IF v_column_exists THEN
        -- Verificar o tipo atual
        SELECT data_type, udt_name INTO v_data_type, v_enum_name
        FROM information_schema.columns
        WHERE table_name = 'user_profiles' 
        AND column_name = 'subscription_status';
        
        -- Se for ENUM (USER-DEFINED), converter para TEXT
        IF v_data_type = 'USER-DEFINED' AND v_enum_name IS NOT NULL THEN
            RAISE NOTICE 'Convertendo subscription_status de ENUM para TEXT...';
            
            -- Remover constraints existentes
            ALTER TABLE user_profiles 
            DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;
            
            -- Converter ENUM para TEXT
            ALTER TABLE user_profiles 
            ALTER COLUMN subscription_status TYPE TEXT 
            USING subscription_status::TEXT;
            
            -- Adicionar nova constraint
            ALTER TABLE user_profiles 
            ADD CONSTRAINT user_profiles_subscription_status_check 
            CHECK (subscription_status IN ('FREE', 'PREMIUM_UNLIMITED', 'active', 'inactive', 'expired'));
            
            RAISE NOTICE 'Conversão concluída com sucesso!';
        ELSE
            RAISE NOTICE 'subscription_status já é do tipo TEXT ou não é ENUM. Nenhuma ação necessária.';
        END IF;
    ELSE
        RAISE NOTICE 'Coluna subscription_status não existe. Execute o script principal primeiro.';
    END IF;
END $$;

-- Verificar resultado
SELECT 
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'subscription_status';

