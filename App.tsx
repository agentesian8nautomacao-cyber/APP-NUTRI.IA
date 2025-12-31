
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyPlan, LogItem, MealItem, WellnessState, AppView, ScanHistoryItem, Gender, ActivityLevel, Goal } from './types';
import { generateDietPlan } from './services/geminiService';
import { authService, planService, surveyService, profileService } from './services/supabaseService';

// Components
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DietPlanView from './components/DietPlanView';
import DiaryView from './components/DiaryView';
import SmartMeal from './components/SmartMeal';
import PlateAnalyzer from './components/PlateAnalyzer';
import ProgressView from './components/ProgressView';
import WellnessPlan from './components/WellnessPlan';
import ChallengesView from './components/ChallengesView';
import Library from './components/Library';
import ChatAssistant from './components/ChatAssistant';
import LiveConversation from './components/LiveConversation';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import PersonalChat from './components/PersonalChat';
import TrialExpiredModal from './components/TrialExpiredModal';
import SurveyModal from './components/SurveyModal';

import { MessageCircle, Camera, Home, Menu, BookOpen, Phone, User } from 'lucide-react';

// MOCK DATA FOR DEV SKIP
const MOCK_USER: UserProfile = {
    name: "Usuário Teste",
    age: 30,
    gender: Gender.Female,
    height: 170,
    weight: 65,
    activityLevel: ActivityLevel.Moderate,
    goal: Goal.LoseWeight,
    restrictions: "Nenhuma",
    mealsPerDay: 4,
    medicalHistory: "Nenhum",
    routineDescription: "Trabalho em escritório",
    foodPreferences: "Gosto de tudo",
    streak: 5,
    lastActiveDate: new Date().toISOString(),
    pantryItems: [
        { id: "1", name: "Aveia" },
        { id: "2", name: "Mel" },
        { id: "3", name: "Ovos" }
    ],
    customChatInstructions: "Seja um nutricionista muito rigoroso e use emojis de fogo.",
    aiVoice: 'Kore'
};

const MOCK_PLAN: DailyPlan = {
    totalCalories: 1800,
    targetMacros: { protein: 120, carbs: 180, fats: 60 },
    nutritionalAnalysis: "Este plano é focado em alta densidade nutricional com déficit calórico moderado para perda de peso sustentável.",
    meals: [
        {
            type: "Breakfast",
            items: [{
                name: "Ovos Mexidos com Espinafre",
                calories: 350,
                macros: { protein: 20, carbs: 5, fats: 25 },
                description: "Rico em proteínas e ferro para começar o dia.",
                substitutions: ["Tofu mexido", "Ovo cozido"],
                emoji: "🍳"
            }]
        },
        {
            type: "Lunch",
            items: [{
                name: "Filé de Frango Grelhado com Salada",
                calories: 500,
                macros: { protein: 45, carbs: 10, fats: 15 },
                description: "Almoço leve e proteico.",
                substitutions: ["Peixe branco", "Grão de bico"],
                emoji: "🍗"
            }]
        },
         {
            type: "Snack",
            items: [{
                name: "Iogurte Natural com Frutas",
                calories: 200,
                macros: { protein: 10, carbs: 25, fats: 5 },
                description: "Cálcio e fibras para a tarde.",
                substitutions: ["Leite de amêndoas", "Fruta inteira"],
                emoji: "🍓"
            }]
        },
        {
            type: "Dinner",
            items: [{
                name: "Sopa de Legumes",
                calories: 300,
                macros: { protein: 10, carbs: 40, fats: 5 },
                description: "Jantar de fácil digestão.",
                substitutions: ["Salada de folhas", "Wrap de vegetais"],
                emoji: "🥣"
            }]
        }
    ],
    behavioralTips: ["Beba água antes das refeições", "Mastigue devagar"],
    shoppingList: ["Ovos", "Espinafre", "Frango", "Iogurte"],
    hydrationTarget: 2500,
    notes: "Foco na consistência."
};

const App: React.FC = () => {
  // --- State Management ---
  const [view, setView] = useState<AppView>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false); // Flag para evitar geração duplicada
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const minSwipeDistance = 50;

  // Loading Animation State
  const [loadingEmoji, setLoadingEmoji] = useState('🍎');

  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dietPlan, setDietPlan] = useState<DailyPlan | null>(null);
  const [dailyLog, setDailyLog] = useState<LogItem[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isNewUser, setIsNewUser] = useState(false); // Rastreia se é novo usuário
  
  const [wellness, setWellness] = useState<WellnessState>({
    mood: null,
    waterGlasses: 0,
    habits: [
      { id: 1, text: 'Ler 10 min', completed: false },
      { id: 2, text: 'Meditar', completed: false },
      { id: 3, text: 'Sem eletrônicos antes de dormir', completed: false }
    ],
    sleepHours: 7.5,
    sleepQuality: 85,
    notifications: {
        water: true,
        sleep: true,
        meals: false
    },
    notificationTimes: {
        water: "09:00",
        sleep: "22:00",
        meals: "12:00"
    }
  });

  // Overlays
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false); // Flag para modo DEV
  const [isDeveloper, setIsDeveloper] = useState(false); // Flag para desenvolvedor
  const [showSurvey, setShowSurvey] = useState(false); // Flag para mostrar enquete

  // --- Effects ---
  
  // Lista de desenvolvedores com acesso completo
  const DEVELOPER_EMAILS = [
    '19brenobernardes@gmail.com',
    'paulohmorais@hotmail.com'
  ];

  // Verificar se é desenvolvedor (função memoizada)
  const checkIsDeveloper = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.email) {
        const isDev = DEVELOPER_EMAILS.includes(user.email.toLowerCase());
        setIsDeveloper(isDev);
        // Se for desenvolvedor, desativar todos os bloqueios
        // MAS manter acesso a todas as funcionalidades, incluindo enquetes
        if (isDev) {
          setIsTrialExpired(false);
          setShowTrialExpiredModal(false);
          // NÃO ativar isDevMode para desenvolvedores - eles devem ver tudo, incluindo enquetes
          // isDevMode pode ocultar algumas funcionalidades como enquetes
        }
        return isDev;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar desenvolvedor:', error);
      return false;
    }
  }, []);

  // Verificar autenticação ao carregar o app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
        
        if (user) {
          // Verificar se é desenvolvedor
          await checkIsDeveloper();
          
          // NÃO redirecionar automaticamente - deixar usuário escolher
          // Se quiser ir direto, pode clicar em "Já tenho uma conta"
        }
      } catch (error: any) {
        // "Auth session missing" é esperado quando não há sessão - não é um erro crítico
        if (error?.message?.includes('Auth session missing') || error?.message?.includes('session')) {
          setIsAuthenticated(false);
        } else {
          console.error('Erro ao verificar autenticação:', error);
          setIsAuthenticated(false);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    // Observar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        await checkIsDeveloper();
        // Não redirecionar automaticamente quando detectar sessão
      } else {
        setIsDeveloper(false);
        if (view !== 'landing') {
          setView('landing');
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Verificar status do trial ao carregar o app
  useEffect(() => {
    // Não verificar trial se estiver em modo DEV ou for desenvolvedor
    if (isDevMode || isDeveloper) {
      setIsTrialExpired(false);
      setShowTrialExpiredModal(false);
      return;
    }

    const checkTrialStatus = async () => {
      try {
        const trialStatus = await authService.checkTrialStatus();
        if (trialStatus.isTrial && trialStatus.isExpired) {
          setIsTrialExpired(true);
          setShowTrialExpiredModal(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status do trial:', error);
      }
    };

    // Verificar apenas se não estiver na landing page
    if (view !== 'landing' && view !== 'onboarding') {
      checkTrialStatus();
    }
  }, [view, isDevMode, isDeveloper]);

  // Carregar dados do usuário quando view mudar para dashboard
  useEffect(() => {
    const loadUserData = async () => {
      if (view === 'dashboard' && isAuthenticated && (!userProfile || !dietPlan)) {
        console.log('🔄 [DEBUG] Iniciando carregamento de dados...', { 
          view, 
          isAuthenticated, 
          hasProfile: !!userProfile, 
          hasPlan: !!dietPlan 
        });
        
        try {
          const user = await authService.getCurrentUser();
          if (!user) {
            console.log('❌ [DEBUG] Usuário não encontrado');
            // Usar dados mock se não encontrar usuário (modo dev)
            if (isDeveloper || isDevMode) {
              console.log('🔧 [DEBUG] Modo DEV: usando dados mock');
              setUserProfile(MOCK_USER);
              setDietPlan(MOCK_PLAN);
            }
            return;
          }
          
          console.log('✅ [DEBUG] Usuário encontrado:', user.id);
          
          // Carregar perfil se não tiver
          if (!userProfile) {
            console.log('📋 [DEBUG] Carregando perfil...');
            try {
              const profile = await authService.getCurrentUserProfile();
              if (profile) {
                console.log('✅ [DEBUG] Perfil carregado:', profile.name);
                setUserProfile(profile);
              } else {
                console.log('⚠️ [DEBUG] Perfil não encontrado, usando mock');
                // Se for desenvolvedor, usar mock
                if (isDeveloper || isDevMode) {
                  setUserProfile(MOCK_USER);
                }
              }
            } catch (profileError) {
              console.error('❌ [DEBUG] Erro ao carregar perfil:', profileError);
              // Em caso de erro, usar mock se for desenvolvedor
              if (isDeveloper || isDevMode) {
                setUserProfile(MOCK_USER);
              }
            }
          }
          
          // Carregar plano se não tiver
          if (!dietPlan) {
            console.log('📅 [DEBUG] Carregando plano...');
            try {
              const plan = await planService.getPlan(user.id);
              if (plan) {
                console.log('✅ [DEBUG] Plano carregado do banco');
                setDietPlan(plan);
              } else {
                console.log('⚠️ [DEBUG] Plano não encontrado no banco');
                // Se for desenvolvedor, usar mock ao invés de gerar
                if (isDeveloper || isDevMode) {
                  console.log('🔧 [DEBUG] Modo DEV: usando plano mock');
                  setDietPlan(MOCK_PLAN);
                } else if (userProfile) {
                  console.log('🔄 [DEBUG] Gerando novo plano...');
                  // Se não tem plano, gerar um novo (pode demorar)
                  try {
                    const newPlan = await generateDietPlan(userProfile);
                    console.log('✅ [DEBUG] Novo plano gerado');
                    setDietPlan(newPlan);
                  } catch (genError) {
                    console.error('❌ [DEBUG] Erro ao gerar plano:', genError);
                    // Em caso de erro na geração, usar mock
                    setDietPlan(MOCK_PLAN);
                  }
                } else {
                  // Se não tem perfil nem plano, usar mock
                  console.log('🔧 [DEBUG] Sem perfil, usando plano mock');
                  setDietPlan(MOCK_PLAN);
                }
              }
            } catch (planError) {
              console.error('❌ [DEBUG] Erro ao carregar plano:', planError);
              // Em caso de erro, usar mock
              setDietPlan(MOCK_PLAN);
            }
          }
        } catch (error) {
          console.error('❌ [DEBUG] Erro geral ao carregar dados:', error);
          // Em caso de erro crítico, usar dados mock para não travar
          if (isDeveloper || isDevMode) {
            console.log('🔧 [DEBUG] Modo DEV: usando dados mock após erro');
            if (!userProfile) setUserProfile(MOCK_USER);
            if (!dietPlan) setDietPlan(MOCK_PLAN);
          }
        }
      }
    };
    
    loadUserData();
  }, [view, isAuthenticated, isDeveloper, isDevMode]);

  useEffect(() => {
      if (isGenerating) {
          const fruits = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥑', '🥦', '🥕'];
          let i = 0;
          const interval = setInterval(() => {
              i = (i + 1) % fruits.length;
              setLoadingEmoji(fruits[i]);
          }, 800); // Slower animation (800ms)
          return () => clearInterval(interval);
      }
  }, [isGenerating]);

  // --- Handlers ---

  const handleOnboardingComplete = async (profile: UserProfile) => {
    console.log('🚀 [DEBUG] handleOnboardingComplete chamado com perfil:', profile);
    setUserProfile(profile);
    setIsNewUser(true); // Marca como novo usuário após onboarding
    
    // Salvar perfil no Supabase primeiro
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        console.log('💾 [DEBUG] Salvando perfil no Supabase para usuário:', user.id);
        await profileService.saveProfile(profile, user.id);
        console.log('✅ [DEBUG] Perfil salvo com sucesso no Supabase');
      } else {
        console.warn('⚠️ [DEBUG] Usuário não encontrado, não foi possível salvar perfil');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao salvar perfil:', error);
      // Continuar mesmo se houver erro ao salvar perfil
    }
    
    // Verificar se deve mostrar enquete (após onboarding completo)
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const hasCompleted = await surveyService.hasCompletedSurvey(user.id);
        if (!hasCompleted && !isDeveloper) {
          console.log('📋 [DEBUG] Mostrando enquete após onboarding');
          // Mostrar enquete antes de gerar o plano
          setShowSurvey(true);
          return; // Não gerar plano ainda, aguardar enquete
        } else {
          console.log('✅ [DEBUG] Enquete já completada ou é desenvolvedor, gerando plano diretamente');
        }
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao verificar enquete:', error);
      // Continuar mesmo se houver erro na verificação da enquete
    }
    
    // Se já respondeu enquete ou é desenvolvedor, continuar normalmente
    // Evitar geração duplicada
    if (isGeneratingPlan) {
      console.log('⏸️ [DEBUG] Geração de plano já em andamento, aguardando...');
      return;
    }
    
    console.log('🔄 [DEBUG] Iniciando geração do plano...');
    setView('generating');
    setIsGenerating(true);
    setIsGeneratingPlan(true);
    try {
        console.log('🤖 [DEBUG] Chamando generateDietPlan com perfil:', profile);
        const plan = await generateDietPlan(profile);
        console.log('✅ [DEBUG] Plano gerado com sucesso:', plan);
        setDietPlan(plan);
        
        // Salvar plano no banco após gerar
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            await planService.savePlan(plan, user.id);
            console.log('✅ [DEBUG] Plano salvo no banco');
          }
        } catch (saveError) {
          console.error('❌ [DEBUG] Erro ao salvar plano:', saveError);
        }
        
        setView('diet_plan'); // Redirect directly to Diet Plan view
    } catch (error) {
        console.error("❌ [DEBUG] Failed to generate plan:", error);
        alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
        setView('onboarding');
    } finally {
        setIsGenerating(false);
        setIsGeneratingPlan(false);
    }
  };

  const handleRegeneratePlan = async (instructions: string, attachment?: { data: string, mimeType: string }, usePantry: boolean = true) => {
      if (!userProfile) return;
      try {
          const newPlan = await generateDietPlan(userProfile, instructions, attachment, usePantry);
          setDietPlan(newPlan);
      } catch (error) {
          console.error("Error regenerating plan", error);
          alert("Erro ao regenerar plano. Tente novamente.");
      }
  };

  const handleAddFood = (item: MealItem, type: string) => {
      const newItem: LogItem = {
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: type as any,
          // Use provided emoji, or default to a generic one based on type
          emoji: item.emoji || (type === "Breakfast" ? "🍳" : type === "Lunch" ? "🍗" : type === "Dinner" ? "🥗" : "🍎")
      };
      
      // 1. Add immediately (Optimistic UI) - Removed Image Generation
      setDailyLog(prev => [...prev, newItem]);
  };

  const handleScanComplete = (item: MealItem, scannedImage: string) => {
      // Add to history
      const historyItem: ScanHistoryItem = {
          id: Date.now().toString(),
          image: scannedImage,
          date: Date.now(),
          resultName: item.name
      };
      setScanHistory(prev => [historyItem, ...prev]);

      // Add to daily log (Use image from scan)
      const newItem: LogItem = {
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: "Lunch", // Default
          image: scannedImage, // KEEP SCANNED IMAGE
          emoji: item.emoji || "📸"
      };
      
      setDailyLog(prev => [...prev, newItem]);
      setIsScannerOpen(false);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
  };

  // --- Swipe Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance; // Swiping Right to Left (Closing)
    const isRightSwipe = distanceX < -minSwipeDistance; // Swiping Left to Right (Opening)
    
    // Check if horizontal swipe is dominant (more horizontal than vertical movement)
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
        if (isRightSwipe) {
            setIsSidebarOpen(true);
        }
        if (isLeftSwipe) {
            setIsSidebarOpen(false);
        }
    }
  };

  // Redirecionar para landing se não estiver autenticado (exceto landing e onboarding)
  useEffect(() => {
    if (!isCheckingAuth && view !== 'landing' && view !== 'onboarding' && !isAuthenticated && !isDevMode) {
      setView('landing');
    }
  }, [isCheckingAuth, isAuthenticated, view, isDevMode]);

  // --- View Rendering ---
  
  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E] mx-auto mb-4"></div>
          <p className="text-[#1A4D2E] font-medium">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
      return (
        <LandingPage 
            onGetStarted={async () => {
              // Verificar se está autenticado antes de continuar
              console.log('🚀 [DEBUG] onGetStarted chamado');
              try {
                const user = await authService.getCurrentUser();
                console.log('👤 [DEBUG] Usuário:', user ? user.id : 'não encontrado');
                
                if (user) {
                  // Verificar se é desenvolvedor antes de carregar dados
                  await checkIsDeveloper();
                  
                  // Verificar se tem perfil
                  const profile = await authService.getCurrentUserProfile();
                  console.log('📋 [DEBUG] Perfil:', profile ? profile.name : 'não encontrado');
                  
                  if (profile) {
                    setUserProfile(profile);
                    
                    // Carregar plano do dia
                    try {
                      const plan = await planService.getPlan(user.id);
                      if (plan) {
                        console.log('✅ [DEBUG] Plano carregado do banco');
                        setDietPlan(plan);
                      } else {
                        // Se não tem plano, usar mock para desenvolvedores (não gerar para não travar)
                        if (isDeveloper || isDevMode) {
                          console.log('🔧 [DEBUG] Desenvolvedor: usando plano mock');
                          setDietPlan(MOCK_PLAN);
                        } else {
                          // Para usuários normais, gerar plano (pode demorar)
                          // Evitar geração duplicada
                          if (!isGeneratingPlan) {
                            setIsGeneratingPlan(true);
                            console.log('🔄 [DEBUG] Gerando novo plano...');
                            try {
                              const newPlan = await generateDietPlan(profile);
                              console.log('✅ [DEBUG] Novo plano gerado');
                              setDietPlan(newPlan);
                              // Salvar plano no banco após gerar
                              try {
                                await planService.savePlan(newPlan, user.id);
                                console.log('✅ [DEBUG] Plano salvo no banco');
                              } catch (saveError) {
                                console.error('❌ [DEBUG] Erro ao salvar plano:', saveError);
                              }
                            } catch (genError) {
                              console.error('❌ [DEBUG] Erro ao gerar plano:', genError);
                              // Em caso de erro, usar mock para não travar
                              setDietPlan(MOCK_PLAN);
                            } finally {
                              setIsGeneratingPlan(false);
                            }
                          } else {
                            console.log('⏸️ [DEBUG] Geração de plano já em andamento, aguardando...');
                          }
                        }
                      }
                    } catch (planError) {
                      console.error('❌ [DEBUG] Erro ao carregar plano:', planError);
                      // Em caso de erro, usar mock para não travar
                      setDietPlan(MOCK_PLAN);
                    }
                    
                    console.log('✅ [DEBUG] Verificando se deve mostrar enquete...');
                    
                    // Verificar se deve mostrar enquete (novos usuários)
                    try {
                      const hasCompleted = await surveyService.hasCompletedSurvey(user.id);
                      if (!hasCompleted && !isDeveloper) {
                        console.log('📋 [DEBUG] Mostrando enquete para novo usuário');
                        // Mostrar enquete antes de ir para dashboard
                        setShowSurvey(true);
                      } else {
                        console.log('✅ [DEBUG] Enquete já respondida ou desenvolvedor, indo para dashboard');
                        setView('dashboard');
                      }
                    } catch (error) {
                      console.error('❌ [DEBUG] Erro ao verificar enquete:', error);
                      setView('dashboard');
                    }
                  } else {
                    console.log('⚠️ [DEBUG] Sem perfil, redirecionando para onboarding');
                    setView('onboarding');
                  }
                } else {
                  console.log('⚠️ [DEBUG] Sem usuário, redirecionando para onboarding');
                  setView('onboarding');
                }
              } catch (error) {
                console.error('❌ [DEBUG] Erro ao verificar usuário:', error);
                // Em caso de erro, redirecionar para onboarding
                setView('onboarding');
              }
            }} 
            onAnalyze={() => setIsScannerOpen(true)}
            onLogout={async () => {
              try {
                await authService.signOut();
                setIsAuthenticated(false);
                setIsDeveloper(false);
                setUserProfile(null);
                setDietPlan(null);
                setView('landing');
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
              }
            }}
            isAuthenticated={isAuthenticated}
        />
      );
  }

  if (view === 'onboarding') {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === 'generating') {
      const marqueeString = "🍎 🍌 🍇 🍊 🍓 🥑 🥦 🥕 🌽 🥯 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥙 🥚 🥘 🍲 🥣 🥗 🍿 🧂 🥫 ";
      return (
          <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center text-[#1A4D2E] relative overflow-hidden">
              {/* Styles for Marquee */}
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                  animation: marquee 30s linear infinite;
                }
                .animate-marquee-reverse {
                  animation: marquee 30s linear infinite reverse;
                }
              `}</style>

              {/* Background Marquee Strips - Gray and Subtle */}
              <div className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none opacity-20 text-gray-400 overflow-hidden select-none">
                  <div className="whitespace-nowrap animate-marquee text-6xl font-serif grayscale">
                     {marqueeString + marqueeString}
                  </div>
                  <div className="whitespace-nowrap animate-marquee-reverse text-6xl font-serif grayscale">
                     {marqueeString + marqueeString}
                  </div>
                  <div className="whitespace-nowrap animate-marquee text-6xl font-serif grayscale">
                     {marqueeString + marqueeString}
                  </div>
              </div>

              {/* Central Element */}
              <div className="relative z-10 flex flex-col items-center max-w-lg text-center px-6">
                  
                  {/* Bouncing Fruit - No Glow Box behind it */}
                  <div className="text-9xl mb-8 animate-bounce relative z-20 drop-shadow-sm">
                    {loadingEmoji}
                  </div>

                  <h2 className="text-4xl font-serif mb-4 relative z-20 text-[#1A4D2E] leading-tight">
                      Criando seu Plano Personalizado...
                  </h2>
                  <p className="text-[#4F6F52] relative z-20 font-medium text-lg leading-relaxed">
                      Seu plano personalizado está sendo criado com base nas suas preferências. Aguarde enquanto preparamos tudo para você.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div 
        className="min-h-screen bg-[#F5F1E8]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
        {/* Global Styles for Custom Animations */}
        <style>{`
          @keyframes gentle-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: gentle-float 3s ease-in-out infinite;
          }
        `}</style>

        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            currentView={view} 
            onNavigate={setView}
        />

        {/* Main Content Area */}
        <main className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-50 scale-95 origin-right' : ''}`}>
            {view === 'dashboard' && (
                <>
                    {userProfile && dietPlan ? (
                        <Dashboard 
                            plan={dietPlan} 
                            user={userProfile} 
                            dailyLog={dailyLog}
                            wellness={wellness}
                            setWellness={setWellness}
                            onAddFood={handleAddFood}
                            onAnalyze={() => setIsScannerOpen(true)}
                            onChat={() => setIsChatOpen(true)}
                            onNavigate={setView}
                            onMenuClick={() => setIsSidebarOpen(true)}
                        />
                    ) : (
                        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E] mx-auto mb-4"></div>
                                <p className="text-[#1A4D2E] font-medium">Carregando seus dados...</p>
                            </div>
                        </div>
                    )}
                </>
            )}
            {view === 'diet_plan' && dietPlan && (
                <DietPlanView 
                    plan={dietPlan} 
                    userProfile={userProfile}
                    onRegenerate={handleRegeneratePlan}
                    isNewUser={isNewUser}
                />
            )}
            {view === 'diary' && dietPlan && <DiaryView plan={dietPlan} dailyLog={dailyLog} onAddFood={handleAddFood} />}
            {view === 'smart_meal' && (
                <SmartMeal 
                    userProfile={userProfile}
                    onUpdateProfile={handleUpdateProfile}
                />
            )}
            {view === 'analyzer' && (
                 <PlateAnalyzer 
                    onClose={() => setView('dashboard')} // Go back if close on full view
                    onAddFood={handleScanComplete}
                    history={scanHistory}
                 />
            )}
            {view === 'personal_chat' && (
                <PersonalChat 
                    userProfile={userProfile} 
                    dailyLog={dailyLog}
                    wellness={wellness}
                    onBack={() => setView('dashboard')}
                />
            )}
            {view === 'progress' && <ProgressView />}
            {view === 'wellness' && <WellnessPlan state={wellness} onUpdate={setWellness} />}
            {view === 'challenges' && <ChallengesView />}
            {view === 'library' && <Library />}
            {view === 'profile' && userProfile && <ProfileView user={userProfile} onUpdate={handleUpdateProfile} onBack={() => setView('dashboard')} />}
            {view === 'settings' && userProfile && (
                <SettingsView 
                    state={wellness} 
                    onUpdate={setWellness} 
                    userProfile={userProfile} 
                    onUpdateProfile={handleUpdateProfile} 
                />
            )}
            {view === 'security' && <div className="p-6"><h2 className="font-serif text-2xl text-[#1A4D2E]">Privacidade (Em Breve)</h2></div>}
        </main>

        {/* Bottom Navigation & Floating Actions */}
        {!isScannerOpen && view !== 'analyzer' && !isChatOpen && !isLiveOpen && view !== 'profile' && view !== 'personal_chat' && (
            <>
                {/* Call Chef Button (Floating above menu) */}
                <button 
                    onClick={() => setIsLiveOpen(true)}
                    className="fixed bottom-32 right-6 w-16 h-16 bg-[#F59E0B] text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform animate-float border-4 border-[#F5F1E8]"
                >
                    <Phone size={28} fill="currentColor" />
                </button>

                {/* Navigation Bar */}
                <div className="fixed bottom-6 left-6 right-6 bg-[#1A4D2E] rounded-full px-8 py-4 flex justify-between items-center z-30 shadow-2xl animate-in slide-in-from-bottom duration-500 border border-[#F5F1E8]/10">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className={`p-2 transition-all duration-300 ${view === 'dashboard' ? 'text-white scale-110' : 'text-[#F5F1E8]/60 hover:text-white'}`}
                    >
                        <Home size={26} />
                    </button>

                    <button 
                        onClick={() => setView('diary')} 
                        className={`p-2 transition-all duration-300 ${view === 'diary' ? 'text-white scale-110' : 'text-[#F5F1E8]/60 hover:text-white'}`}
                    >
                        <BookOpen size={26} />
                    </button>
                    
                    <button 
                        onClick={() => setIsScannerOpen(true)} 
                        className="relative -top-10 w-20 h-20 rounded-full bg-white text-[#1A4D2E] border-[8px] border-[#F5F1E8] flex items-center justify-center shadow-xl transition-transform hover:scale-105"
                    >
                        <Camera size={32} />
                    </button>

                    <button 
                        onClick={() => setIsChatOpen(true)} 
                        className="p-2 text-[#F5F1E8]/60 hover:text-white transition-all hover:scale-110"
                    >
                        <MessageCircle size={26} />
                    </button>
                    
                    <button 
                        onClick={() => setView('profile')} 
                        className={`p-2 transition-all duration-300 ${view === 'profile' ? 'text-white scale-110' : 'text-[#F5F1E8]/60 hover:text-white'}`}
                    >
                        <User size={26} />
                    </button>
                </div>
            </>
        )}

        {/* Overlays */}
        {isScannerOpen && (
            <PlateAnalyzer 
                onClose={() => setIsScannerOpen(false)} 
                onAddFood={handleScanComplete}
                history={scanHistory}
            />
        )}

        {isChatOpen && (
            <ChatAssistant 
                onClose={() => setIsChatOpen(false)} 
                onLiveCall={() => { 
                    // Não bloquear se estiver em modo DEV ou for desenvolvedor
                    if (!isDevMode && !isDeveloper && isTrialExpired) {
                        setShowTrialExpiredModal(true);
                        return;
                    }
                    setIsChatOpen(false); 
                    setIsLiveOpen(true); 
                }}
                userProfile={userProfile}
                dietPlan={dietPlan}
                dailyLog={dailyLog}
                onAddFood={handleAddFood}
                isBlocked={!isDevMode && !isDeveloper && isTrialExpired}
            />
        )}

        {isLiveOpen && (
            <LiveConversation 
                onClose={() => setIsLiveOpen(false)} 
                userProfile={userProfile}
                dietPlan={dietPlan}
                dailyLog={dailyLog}
                onAddFood={handleAddFood}
                isBlocked={!isDevMode && !isDeveloper && isTrialExpired}
            />
        )}

        {/* Modal de Trial Expirado */}
        {showTrialExpiredModal && (
            <TrialExpiredModal
                onClose={() => setShowTrialExpiredModal(false)}
                onViewPlans={() => setShowTrialExpiredModal(false)}
            />
        )}

        {/* Survey Modal */}
        {showSurvey && (
            <SurveyModal
                onClose={async () => {
                    setShowSurvey(false);
                    // Se estava no onboarding, continuar gerando plano
                    if (isNewUser && userProfile) {
                        setView('generating');
                        setIsGenerating(true);
                        try {
                            const plan = await generateDietPlan(userProfile);
                            setDietPlan(plan);
                            setView('diet_plan');
                        } catch (error) {
                            console.error("Failed to generate plan", error);
                            alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                            setView('onboarding');
                        } finally {
                            setIsGenerating(false);
                        }
                    } else if (view === 'landing') {
                        // Se estava na landing, ir para dashboard
                        setView('dashboard');
                    }
                }}
                onSubmit={async (answers) => {
                    try {
                        const user = await authService.getCurrentUser();
                        if (user) {
                            // Salvar enquete
                            await surveyService.saveSurvey(user.id, {
                                howDidYouFindUs: answers.howDidYouFindUs,
                                mainGoal: answers.mainGoal || '',
                                experience: answers.experience,
                                feedback: answers.feedback
                            });
                            console.log('✅ Enquete salva com sucesso');
                            
                            // Se a enquete tem dados básicos (nome, idade, etc), criar/atualizar perfil
                            if (answers.name && answers.age && answers.height && answers.weight) {
                                const profile: UserProfile = {
                                    name: answers.name,
                                    age: answers.age,
                                    gender: answers.gender,
                                    height: answers.height,
                                    weight: answers.weight,
                                    activityLevel: answers.activityLevel,
                                    goal: answers.goal,
                                    restrictions: '',
                                    mealsPerDay: 3,
                                    medicalHistory: '',
                                    routineDescription: '',
                                    foodPreferences: '',
                                    streak: 0,
                                    lastActiveDate: new Date().toISOString(),
                                    pantryItems: [],
                                    aiVoice: 'Kore'
                                };
                                
                                // Salvar perfil
                                await profileService.saveProfile(profile, user.id);
                                setUserProfile(profile);
                                console.log('✅ Perfil criado a partir da enquete');
                                
                                // Se não tem plano, gerar
                                const plan = await planService.getPlan(user.id);
                                if (!plan) {
                                    setView('generating');
                                    setIsGenerating(true);
                                    try {
                                        const newPlan = await generateDietPlan(profile);
                                        setDietPlan(newPlan);
                                        await planService.savePlan(newPlan, user.id);
                                        setView('diet_plan');
                                    } catch (error) {
                                        console.error("Failed to generate plan", error);
                                        alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                                        setView('onboarding');
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                } else {
                                    setDietPlan(plan);
                                    setView('diet_plan');
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao salvar enquete:', error);
                    }
                    
                    setShowSurvey(false);
                    
                    // Se estava no onboarding, continuar gerando plano
                    if (isNewUser && userProfile && !answers.name) {
                        setView('generating');
                        setIsGenerating(true);
                        try {
                            const plan = await generateDietPlan(userProfile);
                            setDietPlan(plan);
                            setView('diet_plan');
                        } catch (error) {
                            console.error("Failed to generate plan", error);
                            alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                            setView('onboarding');
                        } finally {
                            setIsGenerating(false);
                        }
                    } else if (view === 'landing' && !answers.name) {
                        // Se estava na landing e não criou perfil, ir para dashboard
                        setView('dashboard');
                    }
                }}
            />
        )}

        {/* Bloqueio de funcionalidades se trial expirado (não aplicar em modo DEV ou desenvolvedor) */}
        {!isDevMode && !isDeveloper && isTrialExpired && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 pointer-events-none" />
        )}

    </div>
  );
};

export default App;
