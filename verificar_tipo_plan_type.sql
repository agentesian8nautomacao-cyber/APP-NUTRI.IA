-- Verificar qual é o tipo ENUM de plan_type
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'plan_type'
ORDER BY e.enumsortorder;

