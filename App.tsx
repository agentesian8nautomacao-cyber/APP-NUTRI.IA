
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPlan, LogItem, MealItem, WellnessState, AppView, ScanHistoryItem, Gender, ActivityLevel, Goal } from './types';
import { generateDietPlan } from './services/geminiService';

// Components - Lazy load heavy components
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DietPlanView from './components/DietPlanView';
import DiaryView from './components/DiaryView';
import SmartMeal from './components/SmartMeal';
import PlateAnalyzer from './components/PlateAnalyzer';
import WellnessPlan from './components/WellnessPlan';
import ChallengesView from './components/ChallengesView';
import Library from './components/Library';
import ChatAssistant from './components/ChatAssistant';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import PersonalChat from './components/PersonalChat';

// Import components directly to avoid React 19 lazy loading issues
import ProgressView from './components/ProgressView';
import LiveConversation from './components/LiveConversation';


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

  // --- Effects ---
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
    setUserProfile(profile);
    setView('generating');
    setIsGenerating(true);
    try {
        console.log("Iniciando geração de plano para perfil:", profile.name);
        const plan = await generateDietPlan(profile);
        console.log("Plano gerado com sucesso:", plan);
        setDietPlan(plan);
        setView('diet_plan'); // Redirect directly to Diet Plan view
    } catch (error: any) {
        console.error("Failed to generate plan", error);
        const errorMessage = error?.message || "Ocorreu um erro ao gerar seu plano.";
        alert(`Erro: ${errorMessage}\n\nVerifique:\n- Se a chave API está configurada\n- Se há conexão com a internet\n- Tente novamente em alguns instantes.`);
        setView('onboarding');
    } finally {
        setIsGenerating(false);
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

  // DEV FUNCTION: Skip generation
  const handleDevSkip = () => {
      setUserProfile(MOCK_USER);
      setDietPlan(MOCK_PLAN);
      setView('dashboard');
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

  // --- View Rendering ---

  if (view === 'landing') {
      return (
        <LandingPage 
            onGetStarted={() => setView('onboarding')} 
            onAnalyze={() => setIsScannerOpen(true)}
            onDevSkip={handleDevSkip}
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
            {view === 'dashboard' && dietPlan && userProfile && (
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
            )}
            {view === 'diet_plan' && dietPlan && (
                <DietPlanView 
                    plan={dietPlan} 
                    userProfile={userProfile}
                    onRegenerate={handleRegeneratePlan}
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
            {view === 'progress' && (
                <ProgressView />
            )}
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
                onLiveCall={() => { setIsChatOpen(false); setIsLiveOpen(true); }}
                userProfile={userProfile}
                dietPlan={dietPlan}
                dailyLog={dailyLog}
                onAddFood={handleAddFood}
            />
        )}

        {isLiveOpen && (
            <LiveConversation 
                onClose={() => setIsLiveOpen(false)} 
                userProfile={userProfile}
                dietPlan={dietPlan}
                dailyLog={dailyLog}
                onAddFood={handleAddFood}
            />
        )}

    </div>
  );
};

export default App;
