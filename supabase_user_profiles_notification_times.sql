-- Horários dos lembretes (água / sono / refeição) por utilizador — executar no SQL Editor do Supabase.
-- Depois disto, o app grava e lê estes valores em qualquer dispositivo.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS notification_time_water TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS notification_time_sleep TEXT DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS notification_time_meals TEXT DEFAULT '12:00';

COMMENT ON COLUMN public.user_profiles.notification_time_water IS 'HH:mm local para lembrete de hidratação';
COMMENT ON COLUMN public.user_profiles.notification_time_sleep IS 'HH:mm local para lembrete de sono';
COMMENT ON COLUMN public.user_profiles.notification_time_meals IS 'HH:mm local para lembrete de refeição';
