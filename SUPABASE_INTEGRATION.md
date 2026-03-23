# Guia de Integração do Supabase no Nutri.IA

Este guia mostra como integrar os serviços do Supabase no seu app React.

## 📦 Serviços Disponíveis

O arquivo `services/supabaseService.ts` contém todos os serviços necessários:

- **authService**: Autenticação de usuários
- **profileService**: Gerenciamento de perfis
- **planService**: Planos diários de dieta
- **logService**: Registros diários de alimentos
- **scanService**: Histórico de escaneamentos
- **wellnessService**: Rastreamento de bem-estar
- **chatService**: Mensagens do chat
- **progressService**: Dados de progresso

## 🚀 Exemplo de Uso

### 1. Autenticação

```typescript
import { authService } from './services/supabaseService';

// Registrar novo usuário
const handleSignUp = async () => {
  try {
    const { user } = await authService.signUp('email@example.com', 'password123');
    console.log('Usuário criado:', user);
  } catch (error) {
    console.error('Erro ao registrar:', error);
  }
};

// Fazer login
const handleSignIn = async () => {
  try {
    const { user } = await authService.signIn('email@example.com', 'password123');
    console.log('Usuário logado:', user);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
  }
};

// Observar mudanças de autenticação
useEffect(() => {
  const { data: { subscription } } = authService.onAuthStateChange((user) => {
    if (user) {
      console.log('Usuário autenticado:', user);
      // Carregar dados do usuário
    } else {
      console.log('Usuário deslogado');
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### 2. Perfil de Usuário

```typescript
import { profileService } from './services/supabaseService';
import { UserProfile } from './types';

// Salvar perfil após onboarding
const handleOnboardingComplete = async (profile: UserProfile) => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const savedProfile = await profileService.saveProfile(profile, user.id);
    console.log('Perfil salvo:', savedProfile);
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
  }
};

// Carregar perfil ao iniciar o app
const loadUserProfile = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    const profile = await profileService.getProfile(user.id);
    return profile;
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    return null;
  }
};
```

### 3. Planos Diários

```typescript
import { planService } from './services/supabaseService';
import { DailyPlan } from './types';

// Salvar plano gerado
const saveDietPlan = async (plan: DailyPlan) => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    await planService.savePlan(plan, user.id);
    console.log('Plano salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar plano:', error);
  }
};

// Carregar plano do dia
const loadTodayPlan = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    const plan = await planService.getPlan(user.id);
    return plan;
  } catch (error) {
    console.error('Erro ao carregar plano:', error);
    return null;
  }
};
```

### 4. Registros Diários (Logs)

```typescript
import { logService } from './services/supabaseService';
import { LogItem } from './types';

// Adicionar item ao log
const addFoodToLog = async (item: LogItem) => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    await logService.addLogItem(user.id, item);
    console.log('Item adicionado ao log');
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
  }
};

// Carregar logs do dia
const loadDailyLogs = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return [];

    const logs = await logService.getDailyLogs(user.id);
    return logs;
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    return [];
  }
};
```

### 5. Bem-estar (Wellness)

```typescript
import { wellnessService } from './services/supabaseService';
import { WellnessState } from './types';

// Salvar estado de bem-estar
const saveWellness = async (wellness: WellnessState) => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    await wellnessService.saveWellness(user.id, wellness);
    console.log('Estado de bem-estar salvo');
  } catch (error) {
    console.error('Erro ao salvar bem-estar:', error);
  }
};

// Carregar estado de bem-estar
const loadWellness = async () => {
  try {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    const wellness = await wellnessService.getWellness(user.id);
    return wellness;
  } catch (error) {
    console.error('Erro ao carregar bem-estar:', error);
    return null;
  }
};
```

## 🔄 Integração no App.tsx

Aqui está um exemplo de como integrar no componente principal:

```typescript
import { useEffect, useState } from 'react';
import { authService, profileService, planService, logService, wellnessService } from './services/supabaseService';
import { UserProfile, DailyPlan, LogItem, WellnessState } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dietPlan, setDietPlan] = useState<DailyPlan | null>(null);
  const [dailyLog, setDailyLog] = useState<LogItem[]>([]);
  const [wellness, setWellness] = useState<WellnessState | null>(null);

  // Carregar dados ao autenticar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) return;

        setUser(currentUser);

        // Carregar perfil
        const profile = await profileService.getProfile(currentUser.id);
        if (profile) setUserProfile(profile);

        // Carregar plano do dia
        const plan = await planService.getPlan(currentUser.id);
        if (plan) setDietPlan(plan);

        // Carregar logs do dia
        const logs = await logService.getDailyLogs(currentUser.id);
        setDailyLog(logs);

        // Carregar bem-estar
        const wellnessData = await wellnessService.getWellness(currentUser.id);
        if (wellnessData) setWellness(wellnessData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadUserData();

    // Observar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        loadUserData();
      } else {
        // Limpar dados ao deslogar
        setUserProfile(null);
        setDietPlan(null);
        setDailyLog([]);
        setWellness(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Salvar perfil quando atualizado
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
      if (!user) return;
      await profileService.saveProfile(updatedProfile, user.id);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  // Adicionar item ao log e salvar
  const handleAddFood = async (item: MealItem, type: string) => {
    const newItem: LogItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: type as any,
    };

    // Adicionar localmente (otimistic update)
    setDailyLog(prev => [...prev, newItem]);

    // Salvar no banco
    try {
      if (user) {
        await logService.addLogItem(user.id, newItem);
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      // Reverter se falhar
      setDailyLog(prev => prev.filter(log => log.id !== newItem.id));
    }
  };

  // Salvar bem-estar quando atualizado
  const handleUpdateWellness = async (updatedWellness: WellnessState) => {
    setWellness(updatedWellness);
    try {
      if (user) {
        await wellnessService.saveWellness(user.id, updatedWellness);
      }
    } catch (error) {
      console.error('Erro ao salvar bem-estar:', error);
    }
  };

  // ... resto do código do componente
};
```

## 🔐 Segurança

Todos os serviços já estão configurados com Row Level Security (RLS). Isso significa que:

- Usuários só podem ver/editar seus próprios dados
- As políticas de segurança são aplicadas automaticamente
- Não é necessário verificar permissões manualmente no código

## 📝 Notas Importantes

1. **Sempre verifique autenticação**: Antes de salvar dados, verifique se o usuário está autenticado
2. **Tratamento de erros**: Sempre use try/catch ao chamar os serviços
3. **Otimistic Updates**: Adicione dados localmente primeiro, depois sincronize com o banco
4. **Loading States**: Mostre indicadores de carregamento durante operações assíncronas

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe e contém as variáveis corretas

### Erro: "permission denied"
- Verifique se o usuário está autenticado
- Verifique se as políticas RLS estão configuradas corretamente

### Erro: "relation does not exist"
- Execute o script `supabase_schema.sql` no SQL Editor do Supabase


