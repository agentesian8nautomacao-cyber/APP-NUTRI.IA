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

  // Images for the border layout (Cutout style ingredients)
  const images = {
    topRight: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80", // Potatoes/Veg
    topLeft: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80", // Chili
    middleRight: "https://images.unsplash.com/photo-1620917670397-a36b97954518?auto=format&fit=crop&w=300&q=80", // Leaf
    bottomLeft: "https://images.unsplash.com/photo-1615485499978-fca011bc9052?auto=format&fit=crop&w=400&q=80", // Onions/Garlic
    bottomCenter: "https://images.unsplash.com/photo-1596450523092-224440c94541?auto=format&fit=crop&w=300&q=80", // Lemon
  };

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
      
      // Calculate new position relative to the track start
      // 40 is half the knob width (approx)
      let newPos = clientX - rect.left - 40; 
      
      const trackWidth = rect.width;
      const knobWidth = 80; // Width of the Chef Hat button
      const maxPos = trackWidth - knobWidth - 8; // 8px padding

      if (newPos < 0) newPos = 0;
      if (newPos > maxPos) newPos = maxPos;

      setSliderPosition(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const knobWidth = 80;
      const maxPos = trackWidth - knobWidth - 8;
      
      // Threshold to trigger (e.g., 85% of the way)
      if (sliderPosition > maxPos * 0.85) {
          // Success!
          setSliderPosition(maxPos);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => {
              setScreen('login');
              setSliderPosition(0); // Reset for next time
          }, 200);
      } else {
          // Snap back
          setSliderPosition(0);
      }
  };

  // Calculate opacity for text based on slider position
  const textOpacity = Math.max(0, 1 - (sliderPosition / 150));

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans relative overflow-hidden flex flex-col">
        
        {/* --- DECORATIVE INGREDIENTS (Absolute Positioned) --- */}
        {screen === 'home' && (
            <>
                {/* Top Right Bunch */}
                <img src={images.topRight} className="absolute -top-10 -right-20 w-64 h-64 object-contain rotate-12 opacity-90 pointer-events-none drop-shadow-xl" />
                
                {/* Top Left Chili */}
                <img src={images.topLeft} className="absolute top-10 -left-10 w-32 h-32 object-contain -rotate-45 opacity-90 pointer-events-none drop-shadow-lg" />
                
                {/* Middle Right Leaf */}
                <img src={images.middleRight} className="absolute top-1/3 -right-10 w-40 h-40 object-contain rotate-90 opacity-80 pointer-events-none" />

                {/* Bottom Left Garlic/Onion */}
                <img src={images.bottomLeft} className="absolute bottom-24 -left-16 w-64 h-64 object-contain rotate-12 opacity-90 pointer-events-none drop-shadow-xl" />
                
                {/* Bottom Right Lemon/Veg */}
                <img src={images.bottomCenter} className="absolute bottom-32 -right-6 w-40 h-40 object-contain -rotate-12 opacity-90 pointer-events-none drop-shadow-lg" />
            
                {/* Floating Tags (Calorie Pills) */}
                <div className="absolute top-1/4 left-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 text-xs font-bold text-gray-600 animate-in fade-in zoom-in duration-700 delay-100">
                    🔥 504 Kcal
                    <div className="absolute w-2 h-2 bg-white rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
                <div className="absolute top-1/2 right-12 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 text-xs font-bold text-gray-600 animate-in fade-in zoom-in duration-700 delay-300">
                    🥑 132 Kcal
                    <div className="absolute w-2 h-2 bg-white rotate-45 -top-1 left-1/2 -translate-x-1/2"></div>
                </div>
            </>
        )}

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 flex flex-col justify-between p-6 relative z-10">
            
            {/* Header / Brand */}
            <div className="pt-8">
                 <div className="flex items-center gap-2 mb-6">
                     <span className="text-2xl">🥗</span>
                     <span className="font-serif text-2xl font-bold text-[#1A4D2E]">Nutri.ai</span>
                 </div>
            </div>

            {/* HOME SCREEN */}
            {screen === 'home' && (
                <div className="flex flex-col h-full justify-center pb-20">
                    <div className="max-w-xs animate-in slide-in-from-bottom duration-700">
                         <h1 className="font-serif text-6xl font-medium tracking-tight mb-6 text-[#1A1A1A] leading-[1.1]">
                             Seu Guia <br/>
                             Diário para <br/>
                             <span className="text-[#1A4D2E]">Comer Bem.</span>
                         </h1>
                         <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
                             Nutrição personalizada, análise de pratos e receitas inteligentes em um só lugar.
                         </p>
                    </div>
                </div>
            )}

            {/* LOGIN SCREEN */}
            {screen === 'login' && (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 relative">
                        <button onClick={() => setScreen('home')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8">
                            <h2 className="font-serif text-4xl mb-2 text-[#1A4D2E]">Bem-vindo</h2>
                            <p className="text-gray-500 mb-8">Digite suas credenciais para acessar.</p>
                            
                            <form onSubmit={(e) => { e.preventDefault(); onGetStarted(); }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input type="email" placeholder="seu@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E] transition-colors" />
                                </div>
                                
                                <button type="submit" className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg mt-6 hover:scale-[1.02] transition-transform shadow-lg shadow-[#1A4D2E]/20">
                                    Entrar
                                </button>
                            </form>

                            {/* DEV SKIP BUTTON */}
                            {onDevSkip && (
                                <div className="mt-8 text-center">
                                    <button 
                                        onClick={onDevSkip}
                                        className="text-xs font-bold text-red-400 hover:text-red-600 underline"
                                    >
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
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 relative">
                        <button onClick={() => setScreen('home')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8 text-center">
                            <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#1A4D2E]">
                                <Ticket size={32} />
                            </div>
                            <h2 className="font-serif text-3xl mb-3 text-[#1A4D2E]">Possui um convite?</h2>
                            <p className="text-gray-500 text-sm mb-8 px-4">Insira seu código de acesso exclusivo para desbloquear o cadastro.</p>
                            
                            <form onSubmit={handleCouponSubmit} className="space-y-4">
                                <input 
                                    type="text" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="CÓDIGO" 
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E] text-center font-bold text-xl tracking-widest uppercase transition-colors" 
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
                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 relative">
                        <button onClick={() => setScreen('coupon')} className="absolute top-8 left-8 text-gray-400 hover:text-black"><ArrowLeft /></button>
                        <div className="mt-8">
                            <h2 className="font-serif text-3xl mb-6 text-[#1A4D2E]">Criar Conta</h2>
                            
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Nome</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-[#1A4D2E]" required />
                                </div>
                                
                                <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg mt-4 hover:scale-[1.02] transition-transform">
                                    Cadastrar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BOTTOM INTERACTION BAR (Slider Style) --- */}
            {screen === 'home' && (
                <div className="w-full fixed bottom-8 left-0 px-6 z-50 animate-in slide-in-from-bottom duration-700 delay-300">
                    <div 
                        ref={trackRef}
                        className="relative bg-[#1A4D2E] rounded-[3rem] h-20 shadow-2xl shadow-[#1A4D2E]/20 max-w-sm mx-auto overflow-hidden touch-none border border-[#1A4D2E]/50"
                    >
                         {/* Background Text (Catchphrase) */}
                         <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                            style={{ opacity: textOpacity, paddingLeft: '60px' }}
                         >
                             <span className="text-[#F5F1E8] font-serif text-lg tracking-wide opacity-90 animate-pulse whitespace-nowrap">
                                 Acessar Nutri.ai
                             </span>
                             <div className="absolute right-6 opacity-60 animate-bounce">
                                 <ChevronRight size={20} className="text-[#F5F1E8]" />
                             </div>
                         </div>

                         {/* Draggable Handle (Chef Hat) */}
                         <div 
                            className="absolute top-2 left-2 h-16 w-20 bg-[#F5F1E8] rounded-[2.5rem] flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-20 group transition-all"
                            style={{ transform: `translateX(${sliderPosition}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                         >
                             <div className="text-[#1A4D2E] group-active:scale-110 transition-transform">
                                 <ChefHat size={32} />
                             </div>
                             
                             {/* Ripple/Glow Effect */}
                             <div className="absolute inset-0 rounded-[2.5rem] border-2 border-[#1A4D2E]/20 animate-ping opacity-20"></div>
                         </div>

                         {/* Shine Effect on Track */}
                         <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]"></div>
                    </div>
                    
                    <div className="text-center mt-4">
                         <button 
                            onClick={() => setScreen('coupon')}
                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#1A4D2E] transition-colors"
                         >
                             Já possui um convite?
                         </button>
                    </div>

                    {/* CSS for Shimmer */}
                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-150%); }
                            100% { transform: translateX(200%); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    </div>
  );
};

export default LandingPage;