# ⏰ Configuração de Cron Jobs - Nutri.IA

## 📋 Visão Geral

Os cron jobs são necessários para:
1. **Reset diário** de minutos gratuitos (`daily_free_minutes`) às 00:00
2. **Expiração automática** de boost minutes após 24h

---

## 🚀 Como Configurar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o script `supabase_cron_jobs.sql`
3. Verifique se os jobs foram criados com:
   ```sql
   SELECT * FROM cron.job;
   ```

### Opção 2: Via Supabase CLI

```bash
# Conectar ao projeto
supabase link --project-ref seu-project-ref

# Executar script
supabase db execute --file supabase_cron_jobs.sql
```

### Opção 3: Manual (SQL Editor)

Se a extensão `pg_cron` não estiver habilitada:

1. Execute primeiro:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. Depois execute os comandos de agendamento do arquivo `supabase_cron_jobs.sql`

---

## ⚙️ Configuração de Horários

### Reset Diário (Minutos Gratuitos)

Por padrão, o reset acontece às **00:00 BRT** (03:00 UTC).

Para alterar o horário, edite o schedule no cron job:

```sql
-- Remover job existente
SELECT cron.unschedule('reset-daily-free-minutes');

-- Criar novo com horário diferente
SELECT cron.schedule(
    'reset-daily-free-minutes',
    '0 3 * * *', -- Formato: minuto hora dia mês dia-da-semana
    $$
    SELECT reset_daily_free_minutes();
    $$
);
```

**Formato do Schedule (Cron):**
- `'0 3 * * *'` = 03:00 UTC diariamente (00:00 BRT)
- `'0 0 * * *'` = 00:00 UTC diariamente
- `'0 6 * * 0'` = 06:00 UTC todo domingo

### Expiração de Boost

O job de expiração roda **a cada hora** para garantir que boosts expirados sejam removidos rapidamente.

---

## 🔍 Verificar Status dos Jobs

```sql
-- Ver todos os jobs agendados
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🛠️ Troubleshooting

### Erro: "permission denied for extension pg_cron"

**Solução:** A extensão `pg_cron` precisa ser habilitada por um superuser. Se você não tiver acesso, entre em contato com o suporte do Supabase ou use uma Edge Function como alternativa.

### Alternativa: Edge Function + Vercel Cron

Se não conseguir usar `pg_cron`, você pode:

1. Criar uma Edge Function no Supabase que chama `reset_daily_free_minutes()`
2. Configurar um cron job no Vercel que chama essa função diariamente

**Exemplo de Edge Function:**

```typescript
// supabase/functions/reset-daily-minutes/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase.rpc('reset_daily_free_minutes');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Configurar no Vercel (`vercel.json`):**

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-minutes",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 📝 Notas Importantes

1. **Fuso Horário:** O Supabase usa UTC. Ajuste o schedule conforme necessário.
2. **Performance:** Os jobs são executados de forma assíncrona e não bloqueiam outras operações.
3. **Logs:** Verifique os logs no Supabase Dashboard se algo não funcionar como esperado.
4. **Teste:** Após configurar, teste manualmente chamando as funções:
   ```sql
   SELECT reset_daily_free_minutes();
   SELECT expire_boost_minutes();
   ```

---

## ✅ Checklist de Configuração

- [ ] Extensão `pg_cron` habilitada
- [ ] Script `supabase_cron_jobs.sql` executado
- [ ] Jobs verificados com `SELECT * FROM cron.job;`
- [ ] Teste manual das funções executado
- [ ] Horário de reset ajustado para o fuso correto
- [ ] Monitoramento configurado (opcional)

---

## 🔗 Referências

- [Supabase pg_cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Cron Expression Format](https://crontab.guru/)

