
import React, { useState, useRef } from 'react';
import { ArrowLeft, Ticket, ChevronRight, ChefHat } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onAnalyze?: () => void;
  onDevSkip?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onAnalyze, onDevSkip }) => {
  const [screen, setScreen] = useState<'home' | 'login' | 'coupon' | 'register'>('home');
  const [couponCode, setCouponCode] = useState('');
  
  // Slider State
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleCouponSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (couponCode.trim()) {
          setScreen('register');
      }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      setScreen('login');
  };

  // --- SLIDER LOGIC ---
  const handlePointerDown = (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      let newPos = clientX - rect.left - 40; 
      const trackWidth = rect.width;
      const knobWidth = 80;
      const maxPos = trackWidth - knobWidth - 8;
      if (newPos < 0) newPos = 0;
      if (newPos > maxPos) newPos = maxPos;
      setSliderPosition(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const maxPos = rect.width - 80 - 8;
      if (sliderPosition > maxPos * 0.85) {
          setSliderPosition(maxPos);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => {
              setScreen('login');
              setSliderPosition(0);
          }, 200);
      } else {
          setSliderPosition(0);
      }
  };

  const textOpacity = Math.max(0, 1 - (sliderPosition / 150));

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#1A1A1A] font-sans relative overflow-hidden flex flex-col">
        
        {/* --- BACKGROUND IMAGE (HEALTHY MEAL) --- */}
        {screen === 'home' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Background Image - Healthy Salad Bowl - Sharp and clear */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('/Image 2025-12-10 at 19.43.07.jpeg')`,
                        filter: 'blur(0px)',
                        opacity: 0.95,
                        transform: 'scale(1.1)'
                    }}
                />
                {/* Overlay for better text contrast */}
                <div className="absolute inset-0 bg-white/15" />
            </div>
        )}

        {/* --- TOPOGRAPHIC BACKGROUND LINES (DESIGN ELEMENT) --- */}
        {screen === 'home' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
                <svg 
                    className="w-full h-full opacity-[0.04]" 
                    viewBox="0 0 1440 900" 
                    xmlns="http://www.w3.org/2000/svg" 
                    preserveAspectRatio="none"
                >
                    <g stroke="black" strokeWidth="1.2" fill="none" className="animate-[breathe_12s_ease-in-out_infinite]">
                        {/* Organic Curves */}
                        <path d="M-200 600 C 200 500, 600 800, 1600 400" />
                        <path d="M-200 650 C 250 550, 650 850, 1600 450" />
                        <path d="M-200 700 C 300 600, 700 900, 1600 500" />
                        
                        <path d="M-200 200 C 500 100, 900 400, 1600 100" />
                        <path d="M-200 250 C 550 150, 950 450, 1600 150" />
                        
                        <path d="M1440 0 C 1000 300, 600 100, -100 350" />
                    </g>
                </svg>
            </div>
        )}

        {/* --- MAIN CONTENT LAYER --- */}
        <div className="flex-1 flex flex-col justify-between p-6 relative z-30 h-full">
            
            {/* Header */}
            <div className="pt-6 flex justify-between items-center z-40">
                 <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-[#1A4D2E] rounded-full flex items-center justify-center text-[#F5F1E8] shadow-lg">
                        <span className="text-2xl">🥗</span>
                     </div>
                     <span className="font-serif text-4xl font-bold text-[#1A4D2E] drop-shadow-lg">Nutri.ai</span>
                 </div>
                 {screen === 'home' && (
                     <button onClick={() => setScreen('login')} className="text-base font-bold text-[#1A4D2E] underline decoration-2 underline-offset-4 hover:text-[#4F6F52] transition-colors drop-shadow-sm">
                         Entrar
                     </button>
                 )}
            </div>

            {/* HOME HERO - OPTICALLY CENTERED */}
            {screen === 'home' && (
                <div className="flex-grow flex flex-col justify-center items-center relative -mt-16 pb-40">
                    {/* The -mt-16 helps optical centering by pulling it up slightly against the bottom slider */}
                    {/* pb-40 adds more bottom padding to prevent slider overlap with badges */}
                    
                    <div className="max-w-lg w-full animate-in zoom-in duration-1000 relative z-30 text-center">
                        <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight mb-8 text-[#1A4D2E] leading-[1.05] drop-shadow-2xl">
                            Nutrição <br/>
                            <span className="text-[#1A4D2E] italic font-serif">Consciente.</span>
                        </h1>
                        <p className="text-[#1A4D2E] font-semibold text-xl md:text-2xl leading-relaxed mb-10 max-w-md mx-auto drop-shadow-lg">
                            Planos alimentares personalizados e chefs IA para sua melhor versão.
                        </p>
                    </div>
                </div>
            )}

            {/* LOGIN SCREEN */}
            {screen === 'login' && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500 max-w-md mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/60 relative">
                        <button onClick={() => setScreen('home')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8">
                            <h2 className="font-serif text-4xl mb-2 text-[#1A4D2E]">Bem-vindo</h2>
                            <p className="text-gray-500 mb-8">Digite suas credenciais para acessar.</p>
                            
                            <form onSubmit={(e) => { e.preventDefault(); onGetStarted(); }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input type="email" placeholder="seu@email.com" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors text-[#1A4D2E]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors text-[#1A4D2E]" />
                                </div>
                                
                                <button type="submit" className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg mt-6 hover:scale-[1.02] transition-transform shadow-lg shadow-[#1A4D2E]/20">
                                    Entrar
                                </button>
                            </form>

                            {onDevSkip && (
                                <div className="mt-8 text-center">
                                    <button onClick={onDevSkip} className="text-xs font-bold text-red-400 hover:text-red-600 underline">
                                        [DEV] Pular Onboarding
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* COUPON SCREEN */}
            {screen === 'coupon' && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500 max-w-md mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/60 relative">
                        <button onClick={() => setScreen('home')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8 text-center">
                            <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#1A4D2E]">
                                <Ticket size={32} />
                            </div>
                            <h2 className="font-serif text-3xl mb-3 text-[#1A4D2E]">Código de Acesso</h2>
                            <p className="text-gray-500 text-sm mb-8 px-4">Insira seu convite exclusivo para desbloquear o cadastro.</p>
                            
                            <form onSubmit={handleCouponSubmit} className="space-y-4">
                                <input 
                                    type="text" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="CÓDIGO" 
                                    className="w-full bg-[#F5F1E8] border-2 border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-center font-bold text-xl tracking-widest uppercase transition-colors text-[#1A4D2E]" 
                                    required
                                />
                                <button type="submit" className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
                                    Validar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* REGISTER SCREEN */}
            {screen === 'register' && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500 max-w-md mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/60 relative">
                        <button onClick={() => setScreen('coupon')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8">
                            <h2 className="font-serif text-3xl mb-6 text-[#1A4D2E]">Criar Conta</h2>
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Nome</label>
                                    <input type="text" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input type="email" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <input type="password" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" required />
                                </div>
                                <button type="submit" className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg mt-4 hover:scale-[1.02] transition-transform">
                                    Cadastrar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SLIDER INTERACTION (REFINED) --- */}
            {screen === 'home' && (
                <div className="w-full fixed bottom-8 left-0 px-6 z-50 animate-in slide-in-from-bottom duration-700 delay-300">
                    <div 
                        ref={trackRef}
                        className="relative bg-[#1A4D2E]/90 backdrop-blur-sm rounded-[3rem] h-20 shadow-2xl shadow-[#1A4D2E]/20 max-w-sm mx-auto overflow-hidden touch-none border border-white/10"
                    >
                         {/* Background Text */}
                         <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                            style={{ opacity: textOpacity, paddingLeft: '60px' }}
                         >
                             <span className="text-[#F5F1E8] font-semibold text-base tracking-[0.2em] opacity-95 whitespace-nowrap animate-pulse drop-shadow-lg">
                                 DESLIZE PARA ENTRAR
                             </span>
                             <div className="absolute right-6 opacity-80">
                                 <ChevronRight size={24} className="text-[#F5F1E8] drop-shadow-lg" />
                             </div>
                         </div>

                         {/* Draggable Knob - Jewel/Glassy look */}
                         <div 
                            className="absolute top-2 left-2 h-16 w-20 bg-[#F5F1E8] rounded-[2.5rem] flex items-center justify-center shadow-[0_0_15px_rgba(245,241,232,0.4)] cursor-grab active:cursor-grabbing z-20 group transition-all"
                            style={{ transform: `translateX(${sliderPosition}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                         >
                             <div className="text-[#1A4D2E] group-active:scale-110 transition-transform drop-shadow-sm">
                                 <ChefHat size={28} />
                             </div>
                         </div>

                         {/* Shine Effect */}
                         <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]"></div>
                    </div>
                    
                    <div className="text-center mt-6">
                         <button 
                            onClick={() => setScreen('coupon')}
                            className="text-xs font-bold text-[#1A4D2E] uppercase tracking-widest hover:text-[#4F6F52] transition-colors border-b-2 border-transparent hover:border-[#1A4D2E] drop-shadow-sm"
                         >
                             Tenho um convite
                         </button>
                    </div>
                    
                    {/* Breathing & Shimmer Animation Style */}
                    <style>{`
                        @keyframes shimmer { 0% { transform: translateX(-150%); } 100% { transform: translateX(200%); } }
                        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.02); opacity: 0.6; } }
                    `}</style>
                </div>
            )}
        </div>
    </div>
  );
};

export default LandingPage;
