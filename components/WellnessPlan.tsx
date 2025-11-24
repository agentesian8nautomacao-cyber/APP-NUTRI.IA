
import React from 'react';
import { Heart, Droplets, Moon, Sun, Smile, Meh, Frown, Bell } from 'lucide-react';
import { WellnessState } from '../types';

interface WellnessPlanProps {
    state: WellnessState;
    onUpdate: (s: WellnessState) => void;
}

const WellnessPlan: React.FC<WellnessPlanProps> = ({ state, onUpdate }) => {
  const toggleHabit = (id: number) => {
    onUpdate({
        ...state,
        habits: state.habits.map(h => h.id === id ? {...h, completed: !h.completed} : h)
    });
  };

  const toggleNotification = (key: keyof typeof state.notifications) => {
      onUpdate({
          ...state,
          notifications: {
              ...state.notifications,
              [key]: !state.notifications[key]
          }
      });
  };

  return (
    <div className="p-6 pb-28 min-h-screen max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
       <div className="mb-6"><h2 className="text-3xl font-serif font-bold text-[#1A4D2E] flex items-center gap-2"><Heart className="text-[#4F6F52]" /> Bem-Estar</h2><p className="text-[#4F6F52]">Equilíbrio mente, corpo e espírito.</p></div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm text-center">
         <h3 className="font-serif text-xl text-[#1A4D2E] mb-4">Como você se sente hoje?</h3>
         <div className="flex justify-center gap-6">
            {[{ icon: Smile, val: 'good', label: 'Bem', color: 'text-green-500', bg: 'bg-green-100' }, { icon: Meh, val: 'neutral', label: 'Normal', color: 'text-yellow-500', bg: 'bg-yellow-100' }, { icon: Frown, val: 'bad', label: 'Mal', color: 'text-red-500', bg: 'bg-red-100' }].map((m) => {
               const Icon = m.icon;
               const isSelected = state.mood === m.val;
               return (
                  <button key={m.val} onClick={() => onUpdate({...state, mood: m.val as any})} className={`flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSelected ? m.bg : 'bg-gray-100'} transition-colors`}><Icon size={32} className={isSelected ? m.color : 'text-gray-400'} /></div><span className="text-sm font-medium text-[#1A4D2E]">{m.label}</span>
                  </button>
               );
            })}
         </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between">
         <div><h3 className="font-serif text-xl text-[#1A4D2E] flex items-center gap-2 mb-1"><Droplets className="text-blue-500" /> Hidratação</h3><p className="text-blue-800/60 text-sm">Meta: 8 copos</p></div>
         <div className="flex items-center gap-4">
            <button onClick={() => onUpdate({...state, waterGlasses: Math.max(0, state.waterGlasses - 1)})} className="w-10 h-10 bg-white rounded-full text-blue-500 shadow-sm flex items-center justify-center font-bold text-xl">-</button>
            <span className="text-3xl font-serif text-blue-900">{state.waterGlasses}</span>
            <button onClick={() => onUpdate({...state, waterGlasses: state.waterGlasses + 1})} className="w-10 h-10 bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center font-bold text-xl">+</button>
         </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm">
         <h3 className="font-serif text-xl text-[#1A4D2E] mb-4 flex items-center gap-2"><Sun className="text-orange-400" size={20} /> Hábitos Diários</h3>
         <div className="space-y-3">
            {state.habits.map((habit) => (
               <div key={habit.id} onClick={() => toggleHabit(habit.id)} className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all ${habit.completed ? 'bg-[#1A4D2E]/10' : 'bg-[#F5F1E8]'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${habit.completed ? 'bg-[#1A4D2E] border-[#1A4D2E]' : 'border-gray-300 bg-white'}`}>{habit.completed && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                  <span className={`font-medium text-lg ${habit.completed ? 'text-[#1A4D2E] line-through opacity-70' : 'text-[#4F6F52]'}`}>{habit.text}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="bg-[#1A1C2E] text-white p-6 rounded-[2.5rem] shadow-xl flex justify-between items-center">
         <div><h3 className="font-serif text-xl mb-1 flex items-center gap-2"><Moon className="text-indigo-300" /> Sono</h3><p className="text-indigo-200 text-sm">Última noite</p></div>
         <div className="text-right"><div className="text-4xl font-serif">{state.sleepHours}h</div><div className="text-green-400 text-sm">Qualidade: {state.sleepQuality}%</div></div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#1A4D2E]/5">
        <h3 className="font-serif text-xl text-[#1A4D2E] mb-6 flex items-center gap-2"><Bell size={20} className="text-[#4F6F52]"/> Lembretes Inteligentes</h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Droplets size={18} /></div>
                    <div>
                        <div className="font-medium text-[#1A4D2E]">Beber Água</div>
                        <div className="text-xs text-[#4F6F52]">A cada 2 horas</div>
                    </div>
                </div>
                <button 
                    onClick={() => toggleNotification('water')}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.water ? 'bg-[#1A4D2E]' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.water ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600"><Moon size={18} /></div>
                    <div>
                        <div className="font-medium text-[#1A4D2E]">Hora de Dormir</div>
                        <div className="text-xs text-[#4F6F52]">22:30h</div>
                    </div>
                </div>
                <button 
                    onClick={() => toggleNotification('sleep')}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.sleep ? 'bg-[#1A4D2E]' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.sleep ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600"><Sun size={18} /></div>
                    <div>
                        <div className="font-medium text-[#1A4D2E]">Registro de Refeições</div>
                        <div className="text-xs text-[#4F6F52]">Lembretes nos horários</div>
                    </div>
                </div>
                <button 
                    onClick={() => toggleNotification('meals')}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.meals ? 'bg-[#1A4D2E]' : 'bg-gray-300'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.meals ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default WellnessPlan;
