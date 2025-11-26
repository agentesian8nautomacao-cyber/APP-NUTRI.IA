-- ============================================
-- NUTRI.IA - Supabase Database Schema
-- ============================================
-- Este arquivo contém o schema completo do banco de dados
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE activity_level AS ENUM ('Sedentary', 'Light', 'Moderate', 'Active', 'Very Active');
CREATE TYPE goal_type AS ENUM ('Lose Weight', 'Maintain Weight', 'Gain Muscle', 'General Health');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE meal_type AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other');
CREATE TYPE mood_type AS ENUM ('good', 'neutral', 'bad');
CREATE TYPE challenge_status AS ENUM ('active', 'completed', 'locked');
CREATE TYPE article_category AS ENUM ('Nutrição', 'Receitas', 'Ciência', 'Dicas');

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de Perfis de Usuário
-- Armazena informações detalhadas do perfil do usuário
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    gender gender_type NOT NULL,
    height DECIMAL(5,2) NOT NULL CHECK (height > 0), -- em cm
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0), -- em kg
    activity_level activity_level NOT NULL,
    goal goal_type NOT NULL,
    restrictions TEXT,
    meals_per_day INTEGER NOT NULL DEFAULT 3 CHECK (meals_per_day > 0 AND meals_per_day <= 6),
    medical_history TEXT,
    routine_description TEXT,
    food_preferences TEXT,
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    last_active_date TIMESTAMPTZ DEFAULT NOW(),
    avatar TEXT, -- URL ou base64 da foto do usuário
    chef_avatar TEXT, -- Avatar personalizado do Chef IA
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de Planos Diários
-- Armazena os planos de dieta gerados para cada dia
CREATE TABLE daily_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_calories INTEGER NOT NULL CHECK (total_calories > 0),
    target_protein DECIMAL(6,2) NOT NULL CHECK (target_protein >= 0),
    target_carbs DECIMAL(6,2) NOT NULL CHECK (target_carbs >= 0),
    target_fats DECIMAL(6,2) NOT NULL CHECK (target_fats >= 0),
    nutritional_analysis TEXT,
    behavioral_tips TEXT[], -- Array de dicas comportamentais
    shopping_list TEXT[], -- Array de itens da lista de compras
    hydration_target DECIMAL(5,2) DEFAULT 2.0 CHECK (hydration_target > 0), -- em litros
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plan_date)
);

-- Tabela de Refeições do Plano Diário
-- Armazena as refeições dentro de cada plano diário
CREATE TABLE daily_plan_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens de Refeição
-- Armazena os itens individuais de cada refeição
CREATE TABLE meal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_plan_meal_id UUID REFERENCES daily_plan_meals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (protein >= 0),
    carbs DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (carbs >= 0),
    fats DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (fats >= 0),
    description TEXT,
    substitutions TEXT[], -- Array de substituições possíveis
    image TEXT, -- URL ou base64 da imagem
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Registros Diários (Diary Log)
-- Armazena os alimentos consumidos pelo usuário
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_item_id UUID REFERENCES meal_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL CHECK (calories >= 0),
    protein DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (protein >= 0),
    carbs DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (carbs >= 0),
    fats DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (fats >= 0),
    description TEXT,
    meal_type meal_type NOT NULL,
    image TEXT, -- URL ou base64 da imagem
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Histórico de Escaneamentos
-- Armazena o histórico de pratos escaneados
CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image TEXT NOT NULL, -- base64 ou URL da imagem escaneada
    result_name TEXT,
    scan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mensagens do Chat
-- Armazena as conversas com o assistente IA
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    text TEXT NOT NULL,
    image TEXT, -- URL ou base64 da imagem (se houver)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Rastreamento de Bem-estar
-- Armazena dados diários de bem-estar do usuário
CREATE TABLE wellness_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mood mood_type,
    water_glasses INTEGER DEFAULT 0 CHECK (water_glasses >= 0),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 0 AND sleep_quality <= 100), -- Percentual
    notification_water BOOLEAN DEFAULT true,
    notification_sleep BOOLEAN DEFAULT true,
    notification_meals BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tracking_date)
);

-- Tabela de Hábitos de Bem-estar
-- Armazena os hábitos diários do usuário
CREATE TABLE wellness_habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wellness_tracking_id UUID NOT NULL REFERENCES wellness_tracking(id) ON DELETE CASCADE,
    habit_text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Desafios
-- Armazena os desafios disponíveis no sistema
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward TEXT NOT NULL, -- Ex: "500 XP", "Medalha Azul"
    status challenge_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Progresso do Usuário nos Desafios
-- Armazena o progresso de cada usuário em cada desafio
CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status challenge_status DEFAULT 'active',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), -- Percentual
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Tabela de Artigos
-- Armazena os artigos da biblioteca
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category article_category NOT NULL,
    title TEXT NOT NULL,
    read_time TEXT NOT NULL, -- Ex: "5 min"
    image TEXT, -- URL da imagem
    content TEXT, -- Conteúdo do artigo (pode ser gerado via IA)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Receitas
-- Armazena receitas disponíveis
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    time TEXT NOT NULL, -- Ex: "30 min"
    calories INTEGER NOT NULL CHECK (calories >= 0),
    description TEXT,
    steps TEXT[] NOT NULL, -- Array de passos da receita
    image TEXT, -- URL da imagem
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Entradas de Progresso
-- Armazena dados históricos de peso, calorias, etc.
CREATE TABLE progress_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2) CHECK (weight > 0), -- em kg
    calories_consumed INTEGER CHECK (calories_consumed >= 0),
    steps INTEGER CHECK (steps >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- ============================================
-- ÍNDICES
-- ============================================
-- Índices para melhorar performance das queries

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX idx_daily_plan_meals_plan_id ON daily_plan_meals(daily_plan_id);
CREATE INDEX idx_meal_items_meal_id ON meal_items(daily_plan_meal_id);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_timestamp ON daily_logs(timestamp);
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_date ON scan_history(scan_date);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_wellness_tracking_user_id ON wellness_tracking(user_id);
CREATE INDEX idx_wellness_tracking_date ON wellness_tracking(tracking_date);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX idx_progress_entries_date ON progress_entries(entry_date);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_plans_updated_at BEFORE UPDATE ON daily_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_tracking_updated_at BEFORE UPDATE ON wellness_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar last_active_date no perfil
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET last_active_date = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar last_active_date quando houver atividade
CREATE TRIGGER update_last_active_on_log AFTER INSERT ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários só podem ver/editar seus próprios dados

-- user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- daily_plans
CREATE POLICY "Users can view own plans" ON daily_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON daily_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON daily_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON daily_plans
    FOR DELETE USING (auth.uid() = user_id);

-- daily_plan_meals
CREATE POLICY "Users can view own plan meals" ON daily_plan_meals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM daily_plans 
            WHERE daily_plans.id = daily_plan_meals.daily_plan_id 
            AND daily_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own plan meals" ON daily_plan_meals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM daily_plans 
            WHERE daily_plans.id = daily_plan_meals.daily_plan_id 
            AND daily_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own plan meals" ON daily_plan_meals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM daily_plans 
            WHERE daily_plans.id = daily_plan_meals.daily_plan_id 
            AND daily_plans.user_id = auth.uid()
        )
    );

-- meal_items
CREATE POLICY "Users can view own meal items" ON meal_items
    FOR SELECT USING (
        daily_plan_meal_id IS NULL OR
        EXISTS (
            SELECT 1 FROM daily_plan_meals dpm
            JOIN daily_plans dp ON dp.id = dpm.daily_plan_id
            WHERE dpm.id = meal_items.daily_plan_meal_id 
            AND dp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal items" ON meal_items
    FOR INSERT WITH CHECK (
        daily_plan_meal_id IS NULL OR
        EXISTS (
            SELECT 1 FROM daily_plan_meals dpm
            JOIN daily_plans dp ON dp.id = dpm.daily_plan_id
            WHERE dpm.id = meal_items.daily_plan_meal_id 
            AND dp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meal items" ON meal_items
    FOR UPDATE USING (
        daily_plan_meal_id IS NULL OR
        EXISTS (
            SELECT 1 FROM daily_plan_meals dpm
            JOIN daily_plans dp ON dp.id = dpm.daily_plan_id
            WHERE dpm.id = meal_items.daily_plan_meal_id 
            AND dp.user_id = auth.uid()
        )
    );

-- daily_logs
CREATE POLICY "Users can view own logs" ON daily_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON daily_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON daily_logs
    FOR DELETE USING (auth.uid() = user_id);

-- scan_history
CREATE POLICY "Users can view own scan history" ON scan_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history" ON scan_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history" ON scan_history
    FOR DELETE USING (auth.uid() = user_id);

-- chat_messages
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- wellness_tracking
CREATE POLICY "Users can view own wellness" ON wellness_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness" ON wellness_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness" ON wellness_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- wellness_habits
CREATE POLICY "Users can view own habits" ON wellness_habits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wellness_tracking 
            WHERE wellness_tracking.id = wellness_habits.wellness_tracking_id 
            AND wellness_tracking.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own habits" ON wellness_habits
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM wellness_tracking 
            WHERE wellness_tracking.id = wellness_habits.wellness_tracking_id 
            AND wellness_tracking.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own habits" ON wellness_habits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM wellness_tracking 
            WHERE wellness_tracking.id = wellness_habits.wellness_tracking_id 
            AND wellness_tracking.user_id = auth.uid()
        )
    );

-- challenges (público - todos podem ver)
CREATE POLICY "Anyone can view challenges" ON challenges
    FOR SELECT USING (true);

-- user_challenges
CREATE POLICY "Users can view own challenges" ON user_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- articles (público - todos podem ver)
CREATE POLICY "Anyone can view articles" ON articles
    FOR SELECT USING (true);

-- recipes (público - todos podem ver)
CREATE POLICY "Anyone can view recipes" ON recipes
    FOR SELECT USING (true);

-- progress_entries
CREATE POLICY "Users can view own progress" ON progress_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- DADOS INICIAIS (SEED DATA)
-- ============================================

-- Inserir desafios padrão
INSERT INTO challenges (title, description, reward, status) VALUES
    ('Semana Sem Açúcar', 'Evite açúcar processado por 7 dias', '500 XP', 'active'),
    ('Mestre da Hidratação', 'Beba 3L de água diariamente', 'Medalha Azul', 'active'),
    ('Proteína Pura', 'Bata a meta de proteína 5x seguidas', '300 XP', 'active');

-- Inserir artigos padrão
INSERT INTO articles (category, title, read_time, image) VALUES
    ('Nutrição', 'Os benefícios do Jejum Intermitente', '5 min', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80'),
    ('Receitas', '5 Smoothies Detox para começar o dia', '3 min', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=80'),
    ('Ciência', 'Como o açúcar afeta seu cérebro', '8 min', 'https://images.unsplash.com/photo-1621939514649-28b12e816751?auto=format&fit=crop&w=400&q=80'),
    ('Dicas', 'Guia prático para ler rótulos', '6 min', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80');

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
-- Este schema está completo e pronto para uso no Supabase
-- Certifique-se de:
-- 1. Executar este script no SQL Editor do Supabase
-- 2. Configurar as variáveis de ambiente no seu app
-- 3. Instalar o cliente Supabase: npm install @supabase/supabase-js
-- 4. Configurar autenticação no Supabase Dashboard

