
import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onAnalyze?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onAnalyze }) => {
  // Animation Stages:
  // 0: Init
  // 1: Curtains Up (Wipe)
  // 2: N Jumps In
  // 3: N Impact (Jelly)
  // 4: Text Reveal (utri.ai)
  // 5: Background Marquee Fade In
  // 6: UI Glass Card Reveal
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const s1 = setTimeout(() => setStage(1), 300);   // Curtains
    const s2 = setTimeout(() => setStage(2), 1100);  // N Enter
    const s3 = setTimeout(() => setStage(3), 1700);  // N Jelly
    const s4 = setTimeout(() => setStage(4), 2500);  // Text Expand
    const s5 = setTimeout(() => setStage(5), 3200);  // BG Fruits
    const s6 = setTimeout(() => setStage(6), 3800);  // UI Reveal

    return () => {
      clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); 
      clearTimeout(s4); clearTimeout(s5); clearTimeout(s6);
    };
  }, []);

  const marqueeString = "🍎 🍌 🍇 🍊 🍓 🥑 🥦 🥕 🌽 🥯 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥙 🥚 🥘 🍲 🥣 🥗 🍿 ";

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col relative overflow-hidden">
        <style>{`
          /* Background Marquee */
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee { animation: marquee 40s linear infinite; }
          .animate-marquee-reverse { animation: marquee 40s linear infinite reverse; }

          /* N Physics */
          @keyframes jelly {
            0% { transform: scale(1, 1); }
            30% { transform: scale(1.25, 0.75); }
            40% { transform: scale(0.75, 1.25); }
            50% { transform: scale(1.15, 0.85); }
            65% { transform: scale(0.95, 1.05); }
            75% { transform: scale(1.05, 0.95); }
            100% { transform: scale(1, 1); }
          }
          .animate-jelly { animation: jelly 0.8s both; }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 20px 40px -10px rgba(26, 77, 46, 0.15);
          }

          .text-3d {
             text-shadow: 
                1px 1px 0px #0f2e1b,
                2px 2px 0px #0f2e1b,
                3px 3px 0px #0f2e1b,
                4px 4px 0px #0f2e1b,
                6px 6px 20px rgba(0,0,0,0.2);
          }
        `}</style>

        {/* --- CURTAINS (Layered Wipe) --- */}
        <div className={`fixed inset-0 bg-[#1A4D2E] z-[60] transition-transform duration-700 ease-in-out ${stage >= 1 ? '-translate-y-full' : 'translate-y-0'}`}></div>
        <div className={`fixed inset-0 bg-[#F59E0B] z-[55] transition-transform duration-700 ease-in-out delay-100 ${stage >= 1 ? '-translate-y-full' : 'translate-y-0'}`}></div>
        <div className={`fixed inset-0 bg-[#e6e1d6] z-[50] transition-transform duration-700 ease-in-out delay-200 ${stage >= 1 ? '-translate-y-full' : 'translate-y-0'}`}></div>

        {/* --- BACKGROUND FRUITS (Top & Bottom Strips) --- */}
        <div className={`absolute inset-x-0 top-0 h-32 overflow-hidden transition-opacity duration-1000 z-0 pointer-events-none select-none ${stage >= 5 ? 'opacity-20' : 'opacity-0'}`}>
           <div className="whitespace-nowrap animate-marquee text-6xl grayscale opacity-50 pt-4">
              {marqueeString + marqueeString}
           </div>
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-48 overflow-hidden transition-opacity duration-1000 z-0 pointer-events-none select-none ${stage >= 5 ? 'opacity-20' : 'opacity-0'}`}>
           <div className="whitespace-nowrap animate-marquee-reverse text-6xl grayscale opacity-50 pb-4">
              {marqueeString + marqueeString}
           </div>
        </div>


        {/* --- MAIN STAGE --- */}
        <div className="flex-1 flex flex-col items-center justify-between py-12 relative z-10">
            
            {/* 1. LOGO SECTION (Upper Third) */}
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-xl relative -mt-20">
                
                <div className="relative h-32 flex items-baseline justify-center">
                    
                    {/* The N - Solid 3D */}
                    <div className={`
                        relative z-20 font-serif text-9xl text-[#1A4D2E] leading-none origin-bottom
                        transition-all duration-700 ease-out text-3d
                        ${stage < 2 ? 'translate-y-[100vh] opacity-0' : 'translate-y-0 opacity-100'}
                        ${stage === 3 ? 'animate-jelly' : ''}
                    `}>
                        N
                    </div>

                    {/* The Text "utri.ai" - Solid 3D */}
                    <div className={`
                        overflow-hidden flex items-baseline transition-all duration-1000 ease-in-out relative z-10
                        ${stage >= 4 ? 'w-[270px] opacity-100' : 'w-0 opacity-0'}
                    `}>
                        <span className="font-serif text-8xl text-[#1A4D2E] leading-none whitespace-nowrap ml-1 text-3d">
                            utri.ai
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. GLASS CARD UI (Bottom Third) */}
            <div className={`w-full max-w-md px-8 pb-10 transition-all duration-1000 transform ${stage >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                <div className="glass-card rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                    
                    {/* Glow effect inside card */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#1A4D2E]/10 rounded-full blur-3xl"></div>

                    <h3 className="font-serif text-2xl text-[#1A4D2E] mb-3">Bem-vindo ao Nutri.ai</h3>
                    <p className="text-[#4F6F52] font-medium leading-relaxed mb-8">
                        Sua jornada de nutrição inteligente começa aqui. Receitas, planos e acompanhamento em um toque.
                    </p>

                    <div className="space-y-4">
                        <button 
                            onClick={onGetStarted}
                            className="w-full bg-[#1A4D2E] text-[#F5F1E8] py-5 rounded-[2rem] font-serif text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:bg-[#143d24] transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <span>Começar Agora</span>
                            <Sparkles size={18} className="group-hover:rotate-180 transition-transform duration-500 text-yellow-400" />
                        </button>

                        <button 
                            onClick={onAnalyze}
                            className="w-full py-3 text-[#1A4D2E] font-bold text-sm hover:bg-[#1A4D2E]/5 rounded-[2rem] transition-colors opacity-80 hover:opacity-100"
                        >
                            Já tenho uma conta
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[#4F6F52]/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <CheckCircle2 size={10} />
                        <span>Tecnologia Gemini 2.0</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default LandingPage;
