
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Ticket, ChevronRight, ChefHat, Check, Star, Eye, EyeOff } from 'lucide-react';
import { couponService, authFlowService, authService } from '../services/supabaseService';

interface LandingPageProps {
  onGetStarted: () => void;
  onAnalyze?: () => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  onShowSurvey?: () => void; // Callback para mostrar enquete após cadastro
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onAnalyze, onLogout, isAuthenticated = false, onShowSurvey }) => {
  const [screen, setScreen] = useState<'home' | 'login' | 'coupon' | 'register'>('home');
  const [couponCode, setCouponCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Slider State
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Buscar código automaticamente quando há email ou código na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const code = urlParams.get('code');

    // Se já tem código na URL, usar diretamente
    if (code) {
      setCouponCode(code);
      setScreen('coupon');
      return;
    }

    // Se tem email, buscar código no banco
    if (email) {
      setIsLoadingCode(true);
      couponService.getCouponByEmail(email)
        .then((coupon) => {
          if (coupon) {
            setCouponCode(coupon.code);
            setScreen('coupon');
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar código:', error);
        })
        .finally(() => {
          setIsLoadingCode(false);
        });
    }
  }, []);

  const handleCouponSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (couponCode.trim()) {
          setScreen('register');
      }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!name || !email || !password) {
          alert("Por favor, preencha todos os campos.");
          return;
      }

      if (password.length < 6) {
          alert("A senha deve ter pelo menos 6 caracteres.");
          return;
      }

      try {
          // Se tem cupom, usa o fluxo com cupom, senão cria trial
          if (couponCode.trim()) {
              await authFlowService.registerWithInvite(email, password, couponCode.trim());
          } else {
              // Criar conta com trial (sem cupom)
              await authFlowService.registerWithInvite(email, password, undefined);
          }
          
          // Após cadastro bem-sucedido, verificar se deve mostrar enquete
          // A enquete será mostrada no App.tsx após login
          alert("Cadastro realizado com sucesso! Faça login para continuar.");
          setScreen('login');
      } catch (error: any) {
          console.error('Erro ao cadastrar:', error);
          alert(error.message || "Erro ao criar conta. Tente novamente.");
      }
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
        
        {/* --- TOPOGRAPHIC BACKGROUND LINES (DESIGN ELEMENT) --- */}
        {screen === 'home' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <svg 
                    className="w-full h-full opacity-[0.06]" 
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
                 <div className="flex items-center gap-2">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                        <img src="/icon-192.png" alt="Nutri.ai" className="w-full h-full object-cover" />
                     </div>
                     <span className="font-serif text-2xl font-bold text-[#1A4D2E]">Nutri.ai</span>
                 </div>
                 {screen === 'home' && (
                     <div className="flex items-center gap-4">
                         {isAuthenticated && onLogout && (
                             <button 
                                 onClick={async () => {
                                     if (onLogout) {
                                         await onLogout();
                                     }
                                 }}
                                 className="text-sm font-bold text-red-600 hover:text-red-700 underline decoration-2 underline-offset-4"
                             >
                                 Sair
                             </button>
                         )}
                         {!isAuthenticated && (
                             <button onClick={() => setScreen('login')} className="text-sm font-bold text-[#1A4D2E] underline decoration-2 underline-offset-4">
                                 Entrar
                             </button>
                         )}
                     </div>
                 )}
            </div>

            {/* HOME HERO - OPTICALLY CENTERED */}
            {screen === 'home' && (
                <div className="flex-grow flex flex-col justify-center items-center relative -mt-16">
                    {/* The -mt-16 helps optical centering by pulling it up slightly against the bottom slider */}
                    
                    <div className="max-w-lg w-full animate-in zoom-in duration-1000 relative">
                        {/* Glassmorphism Card */}
                         <div className="bg-white/20 backdrop-blur-md p-10 md:p-12 rounded-[3.5rem] border border-white/40 shadow-2xl ring-1 ring-white/30 relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:bg-white/25">
                             
                             {/* Subtle inner highlight */}
                             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

                             <div className="relative z-10 text-center">
                                <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight mb-6 text-[#1A1A1A] leading-[1.05]">
                                    Nutrição <br/>
                                    <span className="text-[#1A4D2E] italic font-serif">Consciente.</span>
                                </h1>
                                <p className="text-[#4F6F52] font-medium text-lg leading-relaxed mb-8 max-w-xs mx-auto">
                                    Planos alimentares personalizados e chefs IA para sua melhor versão.
                                </p>

                                {/* Trust Badges */}
                                <div className="flex justify-center gap-4">
                                    <div className="flex items-center gap-1 bg-[#1A4D2E]/10 px-4 py-2 rounded-full backdrop-blur-md border border-[#1A4D2E]/5">
                                        <Check size={14} className="text-[#1A4D2E]"/>
                                        <span className="text-[10px] font-bold text-[#1A4D2E] uppercase">Saudável</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[#1A4D2E]/10 px-4 py-2 rounded-full backdrop-blur-md border border-[#1A4D2E]/5">
                                        <Star size={14} className="text-[#1A4D2E] fill-[#1A4D2E]"/>
                                        <span className="text-[10px] font-bold text-[#1A4D2E] uppercase">Premium</span>
                                    </div>
                                </div>
                             </div>
                        </div>
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
                            
                            <form onSubmit={async (e) => { 
                                e.preventDefault(); 
                                setLoginError(null);
                                
                                if (!loginEmail.trim() || !loginPassword.trim()) {
                                    setLoginError('Por favor, preencha todos os campos');
                                    return;
                                }
                                
                                setIsLoggingIn(true);
                                try {
                                    console.log('🔐 [DEBUG] LandingPage: Iniciando login...');
                                    const loginResult = await authService.signIn(loginEmail.trim(), loginPassword);
                                    console.log('✅ [DEBUG] LandingPage: Login bem-sucedido', loginResult);
                                    
                                    // Aguardar um pouco para garantir que a sessão está estabelecida
                                    // e o estado de autenticação foi atualizado pelo onAuthStateChange
                                    await new Promise(resolve => setTimeout(resolve, 100));
                                    
                                    // Verificar se a sessão está realmente disponível
                                    const { authService: auth } = await import('../services/supabaseService');
                                    let user = await auth.getCurrentUser();
                                    
                                    // Se não encontrou, tentar mais uma vez
                                    if (!user) {
                                        console.warn('⚠️ [DEBUG] LandingPage: Usuário não encontrado na primeira tentativa, aguardando...');
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        user = await auth.getCurrentUser();
                                    }
                                    
                                    if (!user) {
                                        console.error('❌ [DEBUG] LandingPage: Sessão não estabelecida após múltiplas tentativas');
                                        throw new Error('Sessão não estabelecida. Tente fazer login novamente.');
                                    }
                                    
                                    console.log('✅ [DEBUG] LandingPage: Sessão confirmada, usuário:', user.id);
                                    console.log('✅ [DEBUG] LandingPage: Chamando onGetStarted');
                                    // Login bem-sucedido - chamar onGetStarted para continuar
                                    onGetStarted();
                                } catch (error: any) {
                                    console.error('Erro ao fazer login:', error);
                                    // Mensagens de erro mais amigáveis
                                    let errorMessage = 'Email ou senha incorretos. Tente novamente.';
                                    if (error?.message?.includes('Invalid login credentials') || error?.message?.includes('Invalid')) {
                                        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais ou crie uma conta.';
                                    } else if (error?.message?.includes('Email not confirmed')) {
                                        errorMessage = 'Por favor, confirme seu email antes de fazer login.';
                                    } else if (error?.message) {
                                        errorMessage = error.message;
                                    }
                                    setLoginError(errorMessage);
                                } finally {
                                    setIsLoggingIn(false);
                                }
                            }} className="space-y-4">
                                {loginError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 animate-in slide-in-from-top duration-300">
                                        {loginError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="seu@email.com" 
                                        autoComplete="email" 
                                        disabled={isLoggingIn}
                                        className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors text-[#1A4D2E] disabled:opacity-50" 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            autoComplete="current-password"
                                            disabled={isLoggingIn}
                                            className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 pr-12 outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors text-[#1A4D2E] disabled:opacity-50" 
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoggingIn}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A4D2E]/60 hover:text-[#1A4D2E] transition-colors disabled:opacity-50"
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isLoggingIn || !loginEmail.trim() || !loginPassword.trim()}
                                    className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg mt-6 hover:scale-[1.02] transition-transform shadow-lg shadow-[#1A4D2E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoggingIn ? 'Entrando...' : 'Entrar'}
                                </button>
                            </form>
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
                            <p className="text-gray-500 text-sm mb-8 px-4">
                                {isLoadingCode 
                                    ? 'Buscando seu código...' 
                                    : 'Insira seu convite exclusivo para desbloquear o cadastro.'}
                            </p>
                            
                            {isLoadingCode ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4D2E]"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleCouponSubmit} className="space-y-4">
                                    <input 
                                        type="text" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="CÓDIGO" 
                                        className="w-full bg-[#F5F1E8] border-2 border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-center font-bold text-xl tracking-widest uppercase transition-colors text-[#1A4D2E]" 
                                        required
                                    />
                                    {couponCode && (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                                            ✅ Código encontrado! Clique em "Validar" para continuar.
                                        </div>
                                    )}
                                    <button type="submit" className="w-full bg-[#1A4D2E] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg">
                                        Validar
                                    </button>
                                </form>
                            )}
                            
                            {/* Botão de Trial Grátis */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setScreen('register')}
                                    className="text-sm text-[#1A4D2E] hover:text-[#4F6F52] underline decoration-2 underline-offset-4 transition-colors font-medium"
                                >
                                    Não tenho código? Testar Grátis por 3 dias
                                </button>
                            </div>
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
                                    <input type="text" name="name" autoComplete="name" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Email</label>
                                    <input type="email" name="email" autoComplete="email" className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 pl-2">Senha</label>
                                    <div className="relative">
                                        <input 
                                            type={showRegisterPassword ? "text" : "password"} 
                                            name="password"
                                            autoComplete="new-password"
                                            className="w-full bg-[#F5F1E8] border border-transparent rounded-2xl p-4 pr-12 outline-none focus:border-[#1A4D2E] focus:bg-white text-[#1A4D2E]" 
                                            required 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A4D2E]/60 hover:text-[#1A4D2E] transition-colors"
                                            aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                {!couponCode && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                                        ⏱️ Você está criando uma conta com período de teste de 3 dias grátis.
                                    </div>
                                )}
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
                <div className="w-full fixed bottom-10 left-0 px-6 z-50 animate-in slide-in-from-bottom duration-700 delay-300">
                    <div 
                        ref={trackRef}
                        className="relative bg-[#1A4D2E]/90 backdrop-blur-sm rounded-[3rem] h-20 shadow-2xl shadow-[#1A4D2E]/20 max-w-sm mx-auto overflow-hidden touch-none border border-white/10"
                    >
                         {/* Background Text */}
                         <div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                            style={{ opacity: textOpacity, paddingLeft: '60px' }}
                         >
                             <span className="text-[#F5F1E8] font-light text-sm tracking-[0.2em] opacity-80 whitespace-nowrap animate-pulse">
                                 DESLIZE PARA ENTRAR
                             </span>
                             <div className="absolute right-6 opacity-60">
                                 <ChevronRight size={20} className="text-[#F5F1E8]" />
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
                            className="text-[10px] font-bold text-[#4F6F52] uppercase tracking-widest hover:text-[#1A4D2E] transition-colors border-b border-transparent hover:border-[#1A4D2E]"
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
