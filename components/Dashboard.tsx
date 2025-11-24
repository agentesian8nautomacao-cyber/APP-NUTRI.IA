
import React, { useState, useMemo, useEffect } from 'react';
import { DailyPlan, UserProfile, LogItem, MealItem, WellnessState, AppView } from '../types';
import { Search, Plus, ArrowRight, Heart, Utensils, Coffee, Sun, Moon, Apple, Check, Clock, Sparkles, Droplets, Flame, X, Loader2, Menu, Bell } from 'lucide-react';
import { searchFoodAI } from '../services/geminiService';

interface DashboardProps {
  plan: DailyPlan;
  user: UserProfile;
  dailyLog: LogItem[];
  wellness: WellnessState;
  setWellness: (state: WellnessState) => void;
  onAddFood: (food: MealItem, type: any) => void;
  onAnalyze: () => void;
  onChat: () => void;
  onNavigate: (view: AppView) => void;
  onMenuClick: () => void;
}

const getFoodImage = (item: MealItem) => {
    if (item.image) return item.image;
    const lower = item.name.toLowerCase();
    if (lower.includes('ovo')) return "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=500&q=80";
    if (lower.includes('salada')) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80";
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
};

const Dashboard: React.FC<DashboardProps> = ({ plan, user, dailyLog, wellness, setWellness, onAddFood, onNavigate, onMenuClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tipIndex, setTipIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MealItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Calendar Modal State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Item Details Modal State
  const [selectedItem, setSelectedItem] = useState<LogItem | null>(null);

  const allPlanMeals = useMemo(() => plan.meals.flatMap(m => m.items.map(i => ({ ...i, type: m.type }))), [plan]);
  useEffect(() => {
    if (allPlanMeals.length === 0) return;
    const interval = setInterval(() => setTipIndex(p => (p + 1) % allPlanMeals.length), 5000);
    return () => clearInterval(interval);
  }, [allPlanMeals.length]);

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      const results = await searchFoodAI(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
  };

  const handleAddFromSearch = (item: MealItem) => {
      onAddFood(item, "Snack"); 
      setIsSearchOpen(false);
      showToast(`Adicionado: ${item.name}`);
  };

  const totalConsumed = dailyLog.reduce((acc, i) => acc + i.calories, 0);
  const totalProtein = dailyLog.reduce((acc, i) => acc + i.macros.protein, 0);
  const totalCarbs = dailyLog.reduce((acc, i) => acc + i.macros.carbs, 0);
  const totalFats = dailyLog.reduce((acc, i) => acc + i.macros.fats, 0);

  const displayedItems = activeCategory === 'all' ? [...dailyLog].reverse() : [...dailyLog].reverse().filter(i => i.type === activeCategory);
  
  const currentTip = allPlanMeals[tipIndex];
  const strokeDashoffset = (50 - 10 * 2) * 2 * Math.PI * (1 - Math.min(1, totalConsumed / plan.totalCalories));

  return (
    <div className="pb-28 animate-in fade-in duration-500 min-h-screen bg-[#F5F1E8] text-[#1A4D2E]">
      
      {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#1A4D2E] text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 animate-in slide-in-from-top">
              <Check size={18} /> {toast}
          </div>
      )}

      {/* Streak Calendar Modal */}
      {isCalendarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCalendarOpen(false)}>
              <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl text-[#1A4D2E] flex items-center gap-2"><Flame className="text-orange-500 fill-orange-500" /> Sua Ofensiva</h3>
                      <button onClick={() => setIsCalendarOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <p className="text-center text-[#4F6F52] mb-4">Você está em uma sequência de <strong className="text-[#1A4D2E] text-xl">{user.streak || 1} dias</strong>!</p>
                  
                  <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                          <div key={d} className="text-center text-xs font-bold text-[#4F6F52] uppercase">{d}</div>
                      ))}
                      {/* Mock Calendar Grid for current month */}
                      {Array.from({length: 30}).map((_, i) => {
                          const day = i + 1;
                          const isStreak = day > 25 || day < 5; // Mock streak logic
                          return (
                              <div key={i} className={`h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isStreak ? 'bg-[#1A4D2E] text-white shadow-sm' : 'bg-[#F5F1E8] text-[#4F6F52]'
                              }`}>
                                  {day}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button 
                onClick={onMenuClick}
                className="p-2 bg-white rounded-full text-[#1A4D2E] shadow-sm border border-[#1A4D2E]/10 hover:bg-[#1A4D2E] hover:text-white transition-colors"
            >
                <Menu size={24} />
            </button>
            <div>
                <span className="text-xs font-bold tracking-widest text-[#4F6F52] uppercase block">Bem-vindo(a)</span>
                <h1 className="font-serif text-2xl leading-none">{user.name}</h1>
            </div>
        </div>
        <div className="flex gap-3 items-center">
            <button 
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-orange-100 rounded-full text-orange-600 font-bold text-sm shadow-sm hover:bg-orange-200 transition-colors cursor-pointer" 
                title="Ver Ofensiva"
            >
                <Flame size={18} fill="currentColor" /> <span>{user.streak || 1}</span>
            </button>

            <button className="p-3 bg-white rounded-full text-[#1A4D2E] shadow-sm hover:bg-[#1A4D2E]/5 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button onClick={() => onNavigate('profile')} className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:opacity-90">
                <img src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"} alt="Profile" className="w-full h-full object-cover" />
            </button>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
          <div className="fixed inset-0 bg-[#1A4D2E]/50 z-50 backdrop-blur-sm flex justify-center items-start pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
              <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif text-xl">Buscar Alimento</h3>
                      <button onClick={() => setIsSearchOpen(false)}><X /></button>
                  </div>
                  <div className="flex gap-2 mb-4">
                      <input 
                        autoFocus
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="flex-1 bg-[#F5F1E8] rounded-xl px-4 py-3 outline-none"
                        placeholder="Ex: Banana, Arroz com feijão..."
                      />
                      <button onClick={handleSearch} className="bg-[#1A4D2E] text-white p-3 rounded-xl">
                          {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                      </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                      {searchResults.map((item, idx) => (
                          <button key={idx} onClick={() => handleAddFromSearch(item)} className="w-full flex justify-between items-center p-3 hover:bg-[#F5F1E8] rounded-xl text-left">
                              <div>
                                  <div className="font-bold">{item.name}</div>
                                  <div className="text-xs text-gray-500">{item.calories} kcal</div>
                              </div>
                              <Plus size={18} className="text-[#1A4D2E]" />
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setSelectedItem(null)}>
              <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end"><button onClick={() => setSelectedItem(null)}><X /></button></div>
                  <div className="text-center">
                      <img src={getFoodImage(selectedItem)} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg" />
                      <h3 className="font-serif text-2xl text-[#1A4D2E] mb-1">{selectedItem.name}</h3>
                      <div className="text-[#4F6F52] font-medium mb-6">{selectedItem.calories} kcal</div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                          {Object.entries(selectedItem.macros).map(([key, val]) => (
                              <div key={key} className="bg-[#F5F1E8] p-3 rounded-2xl">
                                  <div className="text-xs uppercase font-bold text-[#4F6F52]">{key}</div>
                                  <div className="text-xl font-serif">{val}g</div>
                              </div>
                          ))}
                      </div>
                      <p className="text-sm text-gray-500 mb-6">{selectedItem.description}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Summary Card */}
      <div className="px-4 mt-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-[#1A4D2E]/5 text-center">
            <h2 className="font-serif text-xl text-[#1A4D2E] mb-4">Resumo Diário</h2>
            <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                <svg height="100%" width="100%" className="rotate-[-90deg]">
                     <circle stroke="#F5F1E8" strokeWidth="10" r="30" cx="50%" cy="50%" fill="transparent" />
                     <circle stroke="#1A4D2E" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 30} style={{ strokeDashoffset }} r="30" cx="50%" cy="50%" fill="transparent" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col">
                    <span className="text-4xl font-serif font-bold text-[#1A4D2E]">{Math.max(0, plan.totalCalories - totalConsumed)}</span>
                    <span className="text-xs text-[#4F6F52] uppercase font-bold">Kcal Restantes</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[ { l: 'Prot', v: totalProtein, t: plan.targetMacros.protein, c: 'bg-blue-50' }, { l: 'Carb', v: totalCarbs, t: plan.targetMacros.carbs, c: 'bg-orange-50' }, { l: 'Gord', v: totalFats, t: plan.targetMacros.fats, c: 'bg-yellow-50' } ].map(m => (
                    <div key={m.l} className={`p-3 rounded-3xl ${m.c}`}>
                        <span className="text-xl font-serif">{m.v}g</span>
                        <span className="text-[10px] uppercase font-bold block opacity-60">{m.l}</span>
                        <div className="w-full bg-black/5 h-1 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#1A4D2E]" style={{ width: `${Math.min(100, (m.v / m.t) * 100)}%` }}></div></div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="px-4 mt-6">
          <div className="bg-blue-50 rounded-[2.5rem] p-6 flex justify-between items-center shadow-sm">
              <div>
                  <div className="flex items-center gap-2 text-blue-900 font-serif text-xl mb-1"><Droplets className="text-blue-500" /> {wellness.waterGlasses * 250} ml</div>
                  <span className="text-xs text-blue-700/60 font-bold uppercase">Meta: 2000ml</span>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => setWellness({...wellness, waterGlasses: wellness.waterGlasses + 1})} className="px-3 py-2 bg-white rounded-2xl text-blue-600 text-xs font-bold shadow-sm hover:scale-105">+250ml</button>
                  <button onClick={() => setWellness({...wellness, waterGlasses: wellness.waterGlasses + 2})} className="px-3 py-2 bg-blue-500 rounded-2xl text-white text-xs font-bold shadow-md hover:scale-105">+500ml</button>
              </div>
          </div>
      </div>

      {/* Chef Tip */}
      {currentTip && (
        <div className="px-4 mt-6">
            <div className="relative bg-[#1A4D2E] rounded-[2.5rem] p-6 text-[#F5F1E8] overflow-hidden shadow-xl cursor-pointer" onClick={() => { onAddFood(currentTip, currentTip.type); showToast("Adicionado!"); }}>
                <div className="relative z-10 w-2/3">
                    <span className="inline-block px-3 py-1 bg-[#4F6F52]/30 rounded-full text-xs font-medium mb-2">Dica do Chef</span>
                    <h2 className="font-serif text-2xl leading-tight mb-2 line-clamp-2">{currentTip.name}</h2>
                    <div className="flex items-center gap-3"><button className="px-4 py-2 rounded-full bg-[#F5F1E8] text-[#1A4D2E] flex items-center gap-2 text-xs font-bold"><Plus size={14} /> Adicionar</button><span className="text-xs font-medium opacity-80">{currentTip.calories} kcal</span></div>
                </div>
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[6px] border-[#F5F1E8]/10"><img src={getFoodImage(currentTip)} className="w-full h-full object-cover rounded-full" /></div>
            </div>
        </div>
      )}

      {/* Diary List */}
      <div className="px-6 mt-8">
         <h3 className="font-serif text-2xl text-[#1A4D2E] mb-4">Diário de Sabores</h3>
         <div className="grid grid-cols-2 gap-4">
             {displayedItems.map((item, idx) => (
                <div key={idx} onClick={() => setSelectedItem(item)} className="bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative border border-[#1A4D2E]/5 cursor-pointer">
                    <div className="absolute top-3 right-3 text-[#4F6F52]/40"><Check size={16} /></div>
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-[#F5F1E8] mb-3 -mt-8"><img src={getFoodImage(item)} className="w-full h-full object-cover" /></div>
                    <div className="text-[10px] font-bold text-[#4F6F52] uppercase bg-[#F5F1E8] px-2 py-0.5 rounded-full mb-2">{item.type}</div>
                    <h4 className="font-serif text-lg leading-tight text-[#1A4D2E] mb-2 line-clamp-2 h-10">{item.name}</h4>
                    <div className="bg-[#1A4D2E]/5 px-3 py-1 rounded-full font-serif text-md text-[#1A4D2E]">{item.calories} <span className="text-xs font-sans text-[#4F6F52]">kcal</span></div>
                </div>
             ))}
         </div>
         {displayedItems.length === 0 && <div className="text-center py-10 opacity-50">Seu diário está vazio hoje.</div>}
      </div>
    </div>
  );
};
export default Dashboard;
