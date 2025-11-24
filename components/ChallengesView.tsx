
import React from 'react';
import { Trophy, Medal, Flame, CheckCircle2, Lock } from 'lucide-react';

const ChallengesView: React.FC = () => {
  const challenges = [
    { id: 1, title: 'Semana Sem Açúcar', desc: 'Evite açúcar processado por 7 dias', reward: '500 XP', status: 'active', progress: 60 },
    { id: 2, title: 'Mestre da Hidratação', desc: 'Beba 3L de água diariamente', reward: 'Medalha Azul', status: 'completed', progress: 100 },
    { id: 3, title: 'Proteína Pura', desc: 'Bata a meta de proteína 5x seguidas', reward: '300 XP', status: 'locked', progress: 0 },
  ];

  return (
    <div className="p-4 pb-24 max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-serif font-bold text-[#1A4D2E] flex items-center gap-2">
          <Trophy className="text-[#4F6F52]" /> Desafios
        </h2>
        <div className="bg-white px-4 py-2 rounded-full border border-[#1A4D2E]/10 flex items-center gap-2 shadow-sm">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-[#1A4D2E] font-bold">Nível 3</span>
        </div>
      </div>

      <div className="grid gap-4">
        {challenges.map((c) => (
          <div 
            key={c.id} 
            className={`relative p-6 rounded-[2rem] border transition-all ${
                c.status === 'completed' ? 'bg-[#1A4D2E]/5 border-[#1A4D2E]/20' : 
                c.status === 'locked' ? 'bg-white/50 border-gray-200 opacity-60' : 
                'bg-white border-transparent shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${
                        c.status === 'completed' ? 'bg-[#1A4D2E] text-[#F5F1E8]' : 'bg-[#F5F1E8] text-[#4F6F52]'
                    }`}>
                        {c.status === 'completed' ? <CheckCircle2 size={20} /> : c.status === 'locked' ? <Lock size={20} /> : <Medal size={20} />}
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-[#1A4D2E] text-lg">{c.title}</h3>
                        <p className="text-sm text-[#4F6F52]">{c.desc}</p>
                    </div>
                </div>
                <span className="text-xs font-bold bg-[#1A4D2E] px-3 py-1 rounded-full text-[#F5F1E8]">
                    {c.reward}
                </span>
            </div>

            {c.status !== 'locked' && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#4F6F52] mb-2 font-medium">
                        <span>Progresso</span>
                        <span>{c.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-[#F5F1E8] rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${c.status === 'completed' ? 'bg-[#1A4D2E]' : 'bg-[#4F6F52]'}`}
                            style={{ width: `${c.progress}%` }} 
                        />
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesView;
