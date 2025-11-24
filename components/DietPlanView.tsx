
import React, { useState } from 'react';
import { DailyPlan } from '../types';
import { Sparkles, Clock, Info, CheckCircle2, ShoppingBasket, BrainCircuit, Droplets, ArrowRightLeft } from 'lucide-react';

interface DietPlanViewProps {
  plan: DailyPlan;
}

const DietPlanView: React.FC<DietPlanViewProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'strategy' | 'shopping' | 'tips'>('menu');
  
  const translateMealType = (type: string) => {
    const map: Record<string, string> = {
        "Breakfast": "Café da Manhã",
        "Lunch": "Almoço",
        "Dinner": "Jantar",
        "Snack": "Lanche"
    };
    return map[type] || type;
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-4 flex flex-col items-center gap-2 transition-all border-b-4 ${
        activeTab === id 
        ? 'border-[#1A4D2E] text-[#1A4D2E]' 
        : 'border-transparent text-gray-400 hover:text-[#1A4D2E]/70'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="pb-28 min-h-screen bg-[#F5F1E8] animate-in slide-in-from-bottom duration-500">
      
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="inline-block px-3 py-1 bg-[#1A4D2E]/10 rounded-full text-[#1A4D2E] text-xs font-bold uppercase tracking-wider mb-3">
           Plano de Classe Mundial
        </div>
        <h2 className="text-4xl font-serif text-[#1A4D2E] mb-2">Seu Plano Completo</h2>
      </div>

      {/* Macro Summary Banner */}
      <div className="p-6 pt-4">
        <div className="bg-[#1A4D2E] text-[#F5F1E8] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <div className="text-[#F5F1E8]/70 text-sm font-medium uppercase">Meta Diária</div>
                    <div className="text-5xl font-serif">{plan.totalCalories} <span className="text-lg">kcal</span></div>
                </div>
                <div className="text-right">
                     <div className="text-[#F5F1E8]/70 text-sm font-medium uppercase mb-1"><Droplets size={14} className="inline mr-1"/> Hidratação</div>
                     <div className="text-2xl font-serif">{plan.hydrationTarget ? (plan.hydrationTarget / 1000).toFixed(1) : '2.5'}L</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-xs uppercase opacity-70 mb-1">Proteína</div>
                    <div className="text-xl font-serif">{plan.targetMacros.protein}g</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-xs uppercase opacity-70 mb-1">Carbos</div>
                    <div className="text-xl font-serif">{plan.targetMacros.carbs}g</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm">
                    <div className="text-xs uppercase opacity-70 mb-1">Gorduras</div>
                    <div className="text-xl font-serif">{plan.targetMacros.fats}g</div>
                </div>
            </div>
            </div>
            {/* Decoration */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#4F6F52] rounded-full blur-3xl opacity-40"></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 sticky top-0 z-20 shadow-sm">
        <TabButton id="menu" label="Cardápio" icon={Clock} />
        <TabButton id="strategy" label="Estratégia" icon={BrainCircuit} />
        <TabButton id="shopping" label="Compras" icon={ShoppingBasket} />
        <TabButton id="tips" label="Dicas" icon={Sparkles} />
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-6">
        
        {/* MENU TAB */}
        {activeTab === 'menu' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                {plan.meals.map((meal, index) => (
                <div key={index} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#1A4D2E]/5">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                        <div className="w-10 h-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#1A4D2E]">
                            <Clock size={20} />
                        </div>
                        <h3 className="font-serif text-xl text-[#1A4D2E]">{translateMealType(meal.type)}</h3>
                    </div>

                    <div className="space-y-6">
                        {meal.items.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1">
                                        <CheckCircle2 size={20} className="text-[#4F6F52]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-[#1A4D2E] text-lg leading-tight">{item.name}</h4>
                                            <span className="text-xs font-bold bg-[#F5F1E8] px-2 py-1 rounded-lg text-[#1A4D2E]">
                                                {item.calories} kcal
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#4F6F52] mt-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                        
                                        {/* Macros */}
                                        <div className="flex gap-3 mt-2 text-xs text-[#4F6F52]/60 font-medium">
                                            <span>P: {item.macros.protein}g</span>
                                            <span>C: {item.macros.carbs}g</span>
                                            <span>G: {item.macros.fats}g</span>
                                        </div>

                                        {/* Substitutions */}
                                        {item.substitutions && item.substitutions.length > 0 && (
                                            <div className="mt-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                <div className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase mb-1">
                                                    <ArrowRightLeft size={12} /> Opções de Troca
                                                </div>
                                                <ul className="list-disc list-inside text-xs text-orange-800/80">
                                                    {item.substitutions.map((sub, sIdx) => (
                                                        <li key={sIdx}>{sub}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                ))}
            </div>
        )}

        {/* STRATEGY TAB */}
        {activeTab === 'strategy' && (
            <div className="animate-in slide-in-from-right duration-300 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                    <h3 className="font-serif text-2xl text-[#1A4D2E] mb-4">Análise Nutricional</h3>
                    <div className="prose prose-green text-[#4F6F52]">
                        <p className="leading-relaxed whitespace-pre-wrap">{plan.nutritionalAnalysis || "Gerando análise detalhada..."}</p>
                    </div>
                </div>
                
                {plan.notes && (
                    <div className="bg-[#FFF8E1] p-6 rounded-[2rem] border border-yellow-100 flex gap-4">
                    <Info className="text-yellow-600 flex-shrink-0" />
                    <p className="text-yellow-800 text-sm leading-relaxed italic">
                        "{plan.notes}"
                    </p>
                    </div>
                )}
            </div>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'shopping' && (
             <div className="animate-in slide-in-from-right duration-300">
                 <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                    <h3 className="font-serif text-2xl text-[#1A4D2E] mb-6 flex items-center gap-2">
                        <ShoppingBasket /> Lista de Compras
                    </h3>
                    <ul className="space-y-3">
                        {plan.shoppingList && plan.shoppingList.length > 0 ? plan.shoppingList.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 p-3 bg-[#F5F1E8] rounded-xl">
                                <div className="w-5 h-5 rounded-full border-2 border-[#1A4D2E] opacity-50"></div>
                                <span className="text-[#1A4D2E] font-medium">{item}</span>
                            </li>
                        )) : (
                            <p className="text-gray-400 italic">Lista não gerada.</p>
                        )}
                    </ul>
                 </div>
             </div>
        )}

        {/* TIPS TAB */}
        {activeTab === 'tips' && (
            <div className="animate-in slide-in-from-right duration-300 space-y-4">
                <h3 className="font-serif text-2xl text-[#1A4D2E] px-2">Dicas Comportamentais</h3>
                {plan.behavioralTips && plan.behavioralTips.length > 0 ? plan.behavioralTips.map((tip, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border-l-4 border-[#1A4D2E]">
                        <p className="text-[#4F6F52] leading-relaxed font-medium">
                            {tip}
                        </p>
                    </div>
                )) : (
                    <p className="text-gray-400 italic px-4">Sem dicas disponíveis.</p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default DietPlanView;
