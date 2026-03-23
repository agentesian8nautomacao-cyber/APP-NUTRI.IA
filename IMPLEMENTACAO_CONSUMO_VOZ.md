# 🎯 Implementação: Sistema de Consumo de Voz com Prioridades

## 📋 Resumo

Implementado sistema completo de consumo de tempo de voz baseado em prioridades:
1. **VIP (PREMIUM_UNLIMITED)** - Acesso ilimitado, não desconta saldo
2. **Gratuito (daily_free_minutes)** - 15 minutos diários, resetável
3. **Boost (boost_minutes_balance)** - +20 minutos, expira em 24h
4. **Reserva (reserve_bank_balance)** - +100 minutos, não expira

---

## ✅ O Que Foi Implementado

### 1. **Schema do Banco de Dados** (`supabase_voice_consumption_schema.sql`)

#### Novos Campos em `user_profiles`:
- `daily_free_minutes` (INTEGER) - Minutos gratuitos diários (padrão: 15)
- `boost_minutes_balance` (INTEGER) - Saldo de boost (padrão: 0)
- `reserve_bank_balance` (INTEGER) - Saldo de reserva (padrão: 0)
- `boost_expiry` (TIMESTAMPTZ) - Data de expiração do boost
- `subscription_expiry` (TIMESTAMPTZ) - Data de expiração do plano ilimitado
- `subscription_status` (TEXT) - Status: 'FREE' ou 'PREMIUM_UNLIMITED'

#### Funções SQL Criadas:
- `consume_voice_time(user_id, minutes)` - Consome tempo seguindo prioridades
- `reset_daily_free_minutes()` - Reset diário (chamado por cron)
- `expire_boost_minutes()` - Expira boosts após 24h (chamado por cron)
- `add_boost_minutes(user_id, minutes)` - Adiciona boost (+20 min, 24h)
- `add_reserve_minutes(user_id, minutes)` - Adiciona reserva (+100 min)
- `activate_unlimited_subscription(user_id, days)` - Ativa plano ilimitado (30 dias)

### 2. **Serviço de Limites Atualizado** (`services/supabaseService.ts`)

#### `limitsService.consumeVoiceSeconds()`
- Usa função SQL `consume_voice_time()` para consumo com prioridades
- Retorna detalhes do consumo (de onde foi consumido)
- Lança erro `LIMIT_REACHED` se não houver saldo

#### Novos Métodos:
- `getVoiceBalances(userId)` - Obtém saldos sem consumir
- `addBoostMinutes(userId, minutes)` - Adiciona boost
- `addReserveMinutes(userId, minutes)` - Adiciona reserva
- `activateUnlimitedSubscription(userId, days)` - Ativa ilimitado

### 3. **Componente LiveConversation Atualizado** (`components/LiveConversation.tsx`)

#### Mudanças Principais:
- Carrega saldos iniciais ao abrir
- Verifica limites antes de permitir conexão
- Consome tempo a cada 10 segundos durante a conversa
- Atualiza UI com saldos em tempo real
- Mostra diferentes indicadores (Gratuito, Boost, Reserva, VIP)
- Bloqueia acesso quando limite é atingido

#### UI Melhorada:
- Exibe tempo restante total
- Mostra breakdown por tipo de saldo
- Indicador VIP (infinito) para usuários premium
- Mensagem de limite atingido melhorada

### 4. **Cron Jobs** (`supabase_cron_jobs.sql`)

#### Jobs Configurados:
1. **Reset Diário** - Executa às 00:00 BRT (03:00 UTC)
   - Restaura `daily_free_minutes` para 15

2. **Expiração de Boost** - Executa a cada hora
   - Remove boosts expirados (após 24h)

---

## 🔄 Fluxo de Consumo

### Algoritmo de Prioridades:

```
1. Verificar VIP (PREMIUM_UNLIMITED ativo)
   ├─ Se SIM: Permitir acesso, não descontar nada
   └─ Se NÃO: Continuar para passo 2

2. Consumir do Gratuito (daily_free_minutes)
   ├─ Se > 0: Descontar deste saldo
   └─ Se = 0: Continuar para passo 3

3. Consumir do Boost (boost_minutes_balance)
   ├─ Se > 0 E não expirado: Descontar deste saldo
   └─ Se = 0 ou expirado: Continuar para passo 4

4. Consumir do Reserva (reserve_bank_balance)
   ├─ Se > 0: Descontar deste saldo
   └─ Se = 0: BLOQUEAR ACESSO (LIMIT_REACHED)
```

---

## 💰 Cenários de Compra

### 1. Ajuda Rápida (R$ 5,00)
```typescript
await limitsService.addBoostMinutes(userId, 20);
```
- Adiciona +20 minutos ao `boost_minutes_balance`
- Define `boost_expiry` para +24h a partir de agora
- Se já tem boost ativo, adiciona aos minutos restantes

### 2. Minutos de Reserva (R$ 12,90)
```typescript
await limitsService.addReserveMinutes(userId, 100);
```
- Adiciona +100 minutos ao `reserve_bank_balance`
- **Acumulativo**: Se já tem 10, vira 110
- **Não expira**: Permanece até ser consumido

### 3. Conversa Ilimitada (R$ 19,90)
```typescript
await limitsService.activateUnlimitedSubscription(userId, 30);
```
- Define `subscription_status = 'PREMIUM_UNLIMITED'`
- Define `subscription_expiry = Agora + 30 dias`
- Durante o período: acesso ilimitado, não desconta saldos

---

## 🧪 Como Testar

### 1. Testar Consumo Básico
```sql
-- Ver saldos atuais
SELECT 
  daily_free_minutes,
  boost_minutes_balance,
  reserve_bank_balance,
  subscription_status
FROM user_profiles
WHERE user_id = 'seu-user-id';

-- Testar consumo (via função SQL)
SELECT consume_voice_time('seu-user-id', 5); -- Consome 5 minutos
```

### 2. Testar Reset Diário
```sql
-- Executar manualmente
SELECT reset_daily_free_minutes();

-- Verificar resultado
SELECT daily_free_minutes FROM user_profiles;
```

### 3. Testar Expiração de Boost
```sql
-- Criar boost que expira em 1 minuto (para teste)
UPDATE user_profiles
SET 
  boost_minutes_balance = 20,
  boost_expiry = NOW() + INTERVAL '1 minute'
WHERE user_id = 'seu-user-id';

-- Aguardar 1 minuto e executar
SELECT expire_boost_minutes();

-- Verificar se foi zerado
SELECT boost_minutes_balance FROM user_profiles;
```

### 4. Testar no Frontend
1. Abrir app e iniciar conversa de voz
2. Verificar que saldos são carregados
3. Conversar por alguns segundos
4. Verificar que saldos diminuem
5. Testar limite atingido (zerar saldos manualmente)

---

## 📊 Exemplo de Retorno da API

### `getVoiceBalances()`
```json
{
  "isVip": false,
  "freeMinutes": 12,
  "boostMinutes": 0,
  "reserveMinutes": 50,
  "totalMinutes": 62,
  "totalSeconds": 3720,
  "boostExpiry": null,
  "subscriptionExpiry": null
}
```

### `consumeVoiceSeconds()`
```json
{
  "isVip": false,
  "consumedFromFree": 60,
  "consumedFromBoost": 0,
  "consumedFromReserve": 0,
  "remainingFreeSeconds": 660,
  "remainingBoostSeconds": 0,
  "remainingReserveSeconds": 3000,
  "totalRemainingSeconds": 3660
}
```

---

## 🚀 Próximos Passos

### 1. Configurar Cron Jobs
- Execute `supabase_cron_jobs.sql` no Supabase
- Verifique se os jobs estão rodando: `SELECT * FROM cron.job;`

### 2. Integrar com Sistema de Pagamento
- Quando houver compra de "Ajuda Rápida", chamar `addBoostMinutes()`
- Quando houver compra de "Minutos de Reserva", chamar `addReserveMinutes()`
- Quando houver compra de "Conversa Ilimitada", chamar `activateUnlimitedSubscription()`

### 3. Adicionar UI de Compras
- Criar tela de compras com os 3 produtos
- Integrar com gateway de pagamento (Cakto, Stripe, etc.)
- Após pagamento confirmado, atualizar saldos

### 4. Monitoramento
- Adicionar logs de consumo
- Criar dashboard de métricas
- Alertas para saldos baixos

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos:
- `supabase_voice_consumption_schema.sql` - Schema completo
- `supabase_cron_jobs.sql` - Configuração de cron jobs
- `CONFIGURACAO_CRON_JOBS.md` - Guia de configuração
- `IMPLEMENTACAO_CONSUMO_VOZ.md` - Este documento

### Arquivos Modificados:
- `services/supabaseService.ts` - Atualizado `limitsService`
- `components/LiveConversation.tsx` - Nova lógica de consumo

---

## ⚠️ Observações Importantes

1. **Conversão Segundos/Minutos**: A função SQL trabalha com minutos, mas o frontend usa segundos. A conversão é feita automaticamente.

2. **Reset Diário**: O reset acontece às 00:00 BRT. Se o usuário estiver usando à meia-noite, o reset pode acontecer durante o uso.

3. **Expiração de Boost**: Boost expira exatamente 24h após a compra. O cron job verifica a cada hora, então pode haver um delay de até 1h.

4. **VIP Ilimitado**: Usuários VIP não consomem nenhum saldo. Todos os saldos permanecem intactos durante o período VIP.

5. **Performance**: O consumo é feito a cada 10 segundos durante a conversa. Isso garante precisão sem sobrecarregar o banco.

---

## 🔗 Referências

- [Documentação Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Cron Expression Format](https://crontab.guru/)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)

