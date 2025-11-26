
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPlan, LogItem, MealItem, WellnessState, AppView, ScanHistoryItem } from './types';
import { generateDietPlan, generateFoodImageAI } from './services/geminiService';
import { supabase } from './services/supabaseClient';

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
import ReportsView from './components/ReportsView';
import WellnessPlan from './components/WellnessPlan';
import ChallengesView from './components/ChallengesView';
import Library from './components/Library';
import ChatAssistant from './components/ChatAssistant';
import LiveConversation from './components/LiveConversation';
import ProfileView from './components/ProfileView';

import { MessageCircle, Camera, Home, Menu, BookOpen, Phone, User } from 'lucide-react';

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

  // Teste de conexão com Supabase (remova depois de testar)
  useEffect(() => {
      const testSupabaseConnection = async () => {
          try {
              const { data, error } = await supabase
                  .from('challenges')
                  .select('*')
                  .limit(1);
              
              if (error) {
                  console.error('❌ Erro Supabase:', error);
              } else {
                  console.log('✅ Supabase conectado! Desafios encontrados:', data?.length);
              }
          } catch (err) {
              console.error('❌ Erro ao conectar com Supabase:', err);
          }
      };
      
      testSupabaseConnection();
  }, []);

  // --- Handlers ---

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setView('generating');
    setIsGenerating(true);
    try {
        const plan = await generateDietPlan(profile);
        setDietPlan(plan);
        setView('diet_plan'); // Redirect directly to Diet Plan view
    } catch (error) {
        console.error("Failed to generate plan", error);
        alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
        setView('onboarding');
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAddFood = (item: MealItem, type: string) => {
      const newItem: LogItem = {
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: type as any
      };
      
      // 1. Add immediately (Optimistic UI)
      setDailyLog(prev => [...prev, newItem]);

      // 2. Trigger AI Image Generation in background
      // Only generate if the item doesn't already have a specific base64 image (e.g. from scanner)
      const hasUserImage = item.image && item.image.startsWith('data:');
      
      if (!hasUserImage) {
          generateFoodImageAI(item.name).then((generatedImage) => {
              if (generatedImage) {
                  // 3. Update the specific item with the new image
                  setDailyLog(prevLogs => 
                      prevLogs.map(log => 
                          log.id === newItem.id 
                              ? { ...log, image: generatedImage }
                              : log
                      )
                  );
              }
          }).catch(err => console.error("Error generating food image:", err));
      }
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

      // Add to daily log
      handleAddFood(item, "Lunch"); // Default to Lunch for simplicity
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
      return <LandingPage onGetStarted={() => setView('onboarding')} onAnalyze={() => setIsScannerOpen(true)} />;
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
            {view === 'diet_plan' && dietPlan && <DietPlanView plan={dietPlan} />}
            {view === 'diary' && dietPlan && <DiaryView plan={dietPlan} dailyLog={dailyLog} onAddFood={handleAddFood} />}
            {view === 'smart_meal' && <SmartMeal />}
            {view === 'analyzer' && (
                 <PlateAnalyzer 
                    onClose={() => setView('dashboard')} // Go back if close on full view
                    onAddFood={handleScanComplete}
                    history={scanHistory}
                 />
            )}
            {view === 'progress' && <ProgressView />}
            {view === 'reports' && <ReportsView />}
            {view === 'wellness' && <WellnessPlan state={wellness} onUpdate={setWellness} />}
            {view === 'challenges' && <ChallengesView />}
            {view === 'library' && <Library />}
            {view === 'profile' && userProfile && <ProfileView user={userProfile} onUpdate={handleUpdateProfile} onBack={() => setView('dashboard')} />}
            {view === 'settings' && <div className="p-6"><h2 className="font-serif text-2xl text-[#1A4D2E]">Configurações (Em Breve)</h2></div>}
            {view === 'security' && <div className="p-6"><h2 className="font-serif text-2xl text-[#1A4D2E]">Privacidade (Em Breve)</h2></div>}
        </main>

        {/* Bottom Navigation & Floating Actions */}
        {!isScannerOpen && view !== 'analyzer' && !isChatOpen && !isLiveOpen && view !== 'profile' && (
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
