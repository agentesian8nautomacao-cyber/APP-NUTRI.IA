
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from "@google/genai";
import { X, Mic, MicOff, PhoneOff, Activity, CheckCircle2, Lock, Home, BookOpen, User, Mic as MicIcon, ArrowDown, Zap, Clock, Infinity, Check } from 'lucide-react';
import { UserProfile, DailyPlan, LogItem, MealItem } from '../types';
import { checkVoiceAccess, consumeVoiceTime } from '../services/voiceAccessService';
import { supabase } from '../services/supabaseClient';

interface LiveConversationProps {
  onClose: () => void;
  userProfile?: UserProfile | null;
  dietPlan?: DailyPlan | null;
  dailyLog?: LogItem[];
  onAddFood?: (item: MealItem, type: string) => void;
  isBlocked?: boolean;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ onClose, userProfile, dietPlan, dailyLog, onAddFood, isBlocked = false }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState("Verificando acesso...");
  const [loggedItem, setLoggedItem] = useState<string | null>(null);
  
  // Estado para saldos do backend
  const [remainingMinutes, setRemainingMinutes] = useState({
    free: 15,
    boost: 0,
    reserve: 0,
    is_vip: false,
  });
  
  // Se não estiver bloqueado (modo DEV), permitir acesso imediatamente
  const [hasAccess, setHasAccess] = useState<boolean | null>(isBlocked ? null : true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [secondsInCurrentSession, setSecondsInCurrentSession] = useState(0);
  const [isTrialUser, setIsTrialUser] = useState(false); // Detectar se é usuário trial
  
  // Calcular total de minutos disponíveis
  const totalAvailableMinutes = remainingMinutes.is_vip 
    ? Infinity 
    : remainingMinutes.free + remainingMinutes.boost + remainingMinutes.reserve;
  
  const isLimitReached = !remainingMinutes.is_vip && totalAvailableMinutes <= 0;

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Define Tool for Logging Meals
  const logMealTool: FunctionDeclaration = {
    name: "logMeal",
    description: "Registra uma refeição consumida pelo usuário no diário alimentar. Use esta função quando o usuário disser que comeu algo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        foodName: { type: Type.STRING, description: "Nome do alimento consumido" },
        calories: { type: Type.NUMBER, description: "Calorias estimadas" },
        protein: { type: Type.NUMBER, description: "Proteínas estimadas em gramas" },
        carbs: { type: Type.NUMBER, description: "Carboidratos estimados em gramas" },
        fats: { type: Type.NUMBER, description: "Gorduras estimadas em gramas" },
        mealType: { 
            type: Type.STRING, 
            enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
            description: "Tipo da refeição (Café, Almoço, Jantar, Lanche). Inferir pelo horário ou contexto."
        },
        description: { type: Type.STRING, description: "Uma descrição curta em português." }
      },
      required: ["foodName", "calories", "protein", "carbs", "fats", "mealType"]
    }
  };

  // Helper to convert Float32 to PCM16
  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);
    
    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  // Helper to decode Base64 to AudioBuffer
  const decodeAudioData = async (
    base64: string,
    ctx: AudioContext
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  // Carregar saldos iniciais do backend e verificar se é trial
  useEffect(() => {
    const loadInitialAccess = async () => {
      // Se estiver bloqueado (trial expirado), não verificar acesso
      if (isBlocked) {
        setHasAccess(false);
        setAccessError('TRIAL_EXPIRED');
        return;
      }

      // Modo DEV: permitir acesso imediatamente sem verificação
      if (!isBlocked) {
        setHasAccess(true);
        setRemainingMinutes({ free: 15, boost: 0, reserve: 0, is_vip: false });
        setAccessError(null);
        setStatus("Pronto para conectar");
        return;
      }

      // Para usuários normais, verificar acesso
      try {
        // Verificar se é usuário trial
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('subscription_status')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.subscription_status === 'trial') {
            setIsTrialUser(true);
          }
        }

        const access = await checkVoiceAccess();
        setHasAccess(access.hasAccess);
        if (access.remaining) {
          setRemainingMinutes(access.remaining);
        }
        if (access.reason && !access.hasAccess) {
          setAccessError(access.reason);
        }
      } catch (error) {
        console.error('Error loading voice access:', error);
        setAccessError('ERROR');
        setHasAccess(false);
      }
    };
    
    loadInitialAccess();
  }, [isBlocked]);

  // Consumir tempo do backend a cada minuto quando conectado
  useEffect(() => {
    let secondsInterval: any;
    
    if (isConnected && !isLimitReached && !remainingMinutes.is_vip) {
      let accumulatedSeconds = 0;
      
      // Timer local para exibição e consumo (a cada segundo)
      secondsInterval = setInterval(() => {
        setSecondsInCurrentSession(prev => prev + 1);
        accumulatedSeconds += 1;
        
        // Consumir do backend a cada minuto (60 segundos)
        if (accumulatedSeconds >= 60) {
          accumulatedSeconds = 0;
          consumeVoiceTime(60).then(result => {
            if (!result.hasAccess) {
              // Limite atingido, desconectar
              setIsConnected(false);
              setStatus('Limite atingido');
              if (result.remaining) {
                setRemainingMinutes(result.remaining);
              }
            } else if (result.remaining) {
              // Atualizar saldos
              setRemainingMinutes(result.remaining);
            }
          }).catch(error => {
            console.error('Error consuming voice time:', error);
          });
        }
      }, 1000);
    }
    
    return () => {
      if (secondsInterval) clearInterval(secondsInterval);
    };
  }, [isConnected, isLimitReached, remainingMinutes.is_vip]);

  // Init Session
  useEffect(() => {
    // Bloquear se trial expirado
    if (isBlocked) {
      setStatus('Período de teste expirado');
      setHasAccess(false);
      setAccessError('TRIAL_EXPIRED');
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      return;
    }

    // Se ainda não verificou acesso, aguardar
    if (hasAccess === null) {
      return;
    }
    
    // If limit reached, do not connect/disconnect existing (pular se estiver em modo DEV)
    if (!isBlocked && (isLimitReached || !hasAccess)) {
        // Stop audio streams if active
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setStatus(accessError === 'NO_MINUTES_AVAILABLE' ? 'Sem minutos disponíveis' : accessError === 'TRIAL_EXPIRED' ? 'Período de teste expirado' : 'Acesso negado');
        return;
    }

    const initSession = async () => {
      try {
        // Bloquear se trial expirado
        if (isBlocked) {
          setStatus('Período de teste expirado');
          setHasAccess(false);
          setAccessError('TRIAL_EXPIRED');
          return;
        }

        // Em modo DEV, pular verificação de acesso e permitir conexão
        if (!isBlocked && hasAccess === true) {
          // Modo DEV ou acesso já verificado - permitir conexão
          setStatus("Conectando...");
        } else {
          // Verificar acesso uma última vez antes de conectar (apenas se não for modo DEV)
          const accessCheck = await checkVoiceAccess();
          if (!accessCheck.hasAccess) {
            // Se não tiver acesso mas não estiver bloqueado (modo DEV), permitir mesmo assim
            if (!isBlocked) {
              setHasAccess(true);
              setRemainingMinutes({ free: 15, boost: 0, reserve: 0, is_vip: false });
              setAccessError(null);
              setStatus("Conectando...");
            } else {
              setHasAccess(false);
              setAccessError(accessCheck.reason || 'NO_ACCESS');
              setStatus('Sem acesso');
              return;
            }
          } else {
            if (accessCheck.remaining) {
              setRemainingMinutes(accessCheck.remaining);
            }
          }
        }
        
        setStatus("Conectando...");
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Sanitize function for JSON stringify
        const sanitize = (key: string, value: any) => {
            if (key === 'image') return undefined;
            return value;
        };

        // Construct Context System Instruction
        const contextData = `
          CONTEXTO DO USUÁRIO (Nutri.ai App):
          - Perfil: ${JSON.stringify(userProfile || {})}
          - Plano Alimentar do Dia: ${JSON.stringify(dietPlan || {}, sanitize)}
          - O que comeu hoje: ${JSON.stringify(dailyLog || [], sanitize)}
        `;

        let systemInstruction = `
          Você é a Nutri.ai, uma nutricionista pessoal.
          
          ${contextData}

          Instruções:
          1. Responda de forma natural e conversacional.
          2. Se o usuário disser que comeu algo, você DEVE usar a ferramenta 'logMeal'.
          3. Estime as calorias e macros para a ferramenta se o usuário não fornecer.
          4. Confirme verbalmente quando registrar.
          5. Fale sempre em Português do Brasil.
        `;

        // Inject Custom Chat Instructions if available
        if (userProfile?.customChatInstructions) {
            systemInstruction += `\n\nInstruções Personalizadas: ${userProfile.customChatInstructions}`;
        }

        // Setup Audio Contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Get Microphone
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus("Conectado");
              setIsConnected(true);
              
              if (!inputAudioContextRef.current || !streamRef.current) return;

              // Process Audio Input
              sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
              scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessorRef.current.onaudioprocess = (e) => {
                if (!isMicOn) return; // Mute logic
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Simple volume meter logic
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                setVolume(Math.sqrt(sum / inputData.length) * 100);

                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              sourceRef.current.connect(scriptProcessorRef.current);
              scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
              
              // Handle Tool Call (Logging Food)
              if (msg.toolCall) {
                const responses = [];
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'logMeal' && onAddFood) {
                        const args = fc.args as any;
                        
                        // Create Meal Item
                        const newItem: MealItem = {
                            name: args.foodName,
                            calories: args.calories,
                            macros: {
                                protein: args.protein,
                                carbs: args.carbs,
                                fats: args.fats
                            },
                            description: args.description || "Registrado via voz"
                        };

                        // Execute prop function to update App state
                        onAddFood(newItem, args.mealType);
                        
                        // Show visual feedback
                        setLoggedItem(`${args.foodName} (${args.calories} kcal)`);
                        setTimeout(() => setLoggedItem(null), 3000);

                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Success: Meal logged." }
                        });
                    }
                }
                
                // Send Response back to model
                if (responses.length > 0) {
                    sessionPromise.then(session => {
                        session.sendToolResponse({ functionResponses: responses });
                    });
                }
              }

              // Handle Audio Output
              const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                const buffer = await decodeAudioData(audioData, ctx);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                // Schedule playback
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                activeSourcesRef.current.add(source);
                source.onended = () => activeSourcesRef.current.delete(source);
              }

              // Handle interruptions
              if (msg.serverContent?.interrupted) {
                activeSourcesRef.current.forEach(s => s.stop());
                activeSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => {
              setStatus("Desconectado");
              setIsConnected(false);
            },
            onerror: (err) => {
              console.error(err);
              setStatus("Erro na conexão");
            }
          },
          config: {
             responseModalities: [Modality.AUDIO],
             tools: [{ functionDeclarations: [logMealTool] }],
             speechConfig: {
               voiceConfig: { prebuiltVoiceConfig: { voiceName: userProfile?.aiVoice || 'Kore' } }
             },
             systemInstruction: systemInstruction
          }
        });

      } catch (err) {
        console.error("Failed to connect", err);
        setStatus("Erro ao acessar microfone ou API");
      }
    };

    initSession();

    return () => {
      // Cleanup function
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (outputAudioContextRef.current) outputAudioContextRef.current.close();
      if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
    };
  }, [userProfile, dietPlan, dailyLog, isLimitReached, hasAccess, accessError]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  // --- TRIAL EXPIRED SCREEN ---
  if (isBlocked || accessError === 'TRIAL_EXPIRED') {
    return (
      <div className="fixed inset-0 bg-[#F0FDF4] z-[60] flex flex-col items-center justify-between p-6 animate-in fade-in duration-500 font-sans">
        <div className="w-full flex justify-end">
          <button onClick={onClose} className="p-2 text-[#1E3A8A]/50 hover:text-[#1E3A8A]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full">
          <h2 className="text-[#1E3A8A] text-3xl font-bold mb-8 leading-tight">
            Período de Teste Expirado
          </h2>

          <div className="relative mb-10">
            <div className="text-[140px] font-bold text-[#1E3A8A] leading-none opacity-5 select-none">3</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-6 rounded-full shadow-xl border border-[#F0FDF4]">
                <Lock size={48} className="text-[#F97316]" />
              </div>
            </div>
          </div>

          <p className="text-[#374151] text-lg font-medium leading-relaxed mb-1">
            Seu período de teste de 3 dias acabou.
          </p>
          <p className="text-[#374151]/80 text-base leading-relaxed mb-6">
            Para continuar evoluindo e aproveitando todas as funcionalidades do Nutri.ai, escolha um plano.
          </p>

          <div className="mb-6 animate-bounce text-[#F97316]">
            <ArrowDown size={32} strokeWidth={3} />
          </div>

          <button 
            onClick={() => window.open('https://nutri.ai/planos', '_blank')}
            className="w-full bg-[#F97316] text-white font-bold text-xl py-4 rounded-full shadow-lg hover:bg-[#EA580C] hover:scale-105 transition-all transform flex items-center justify-center gap-2 mb-4"
          >
            Ver Planos Disponíveis
          </button>

          <p className="text-[#1E3A8A] text-sm font-semibold opacity-60">
            Clique acima para conferir agora mesmo.
          </p>
        </div>

        <div className="w-full text-center pb-4">
          <p className="text-gray-400 text-xs">
            Cancele quando quiser.
          </p>
        </div>
      </div>
    );
  }

  // --- TIME LIMIT REACHED SCREEN (UPSELL) ---
  if (isLimitReached) {
      // Mensagem diferenciada para Trial vs Premium
      const isTrialLimit = isTrialUser;
      
      return (
        <div className="fixed inset-0 bg-[#F0FDF4] z-[60] flex flex-col items-center justify-between p-6 animate-in fade-in duration-500 font-sans">
            
            {/* Top Section */}
            <div className="w-full flex justify-end">
                <button onClick={onClose} className="p-2 text-[#1E3A8A]/50 hover:text-[#1E3A8A]">
                    <X size={24} />
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full">
                
                <h2 className="text-[#1E3A8A] text-3xl font-bold mb-8 leading-tight">
                    {isTrialLimit 
                      ? 'Gostou? Seu tempo de degustação hoje acabou.' 
                      : accessError === 'NO_MINUTES_AVAILABLE' 
                        ? 'Seus minutos acabaram...' 
                        : 'Acesso não disponível'}
                </h2>

                {/* Central Graphic */}
                <div className="relative mb-10">
                    <div className="text-[140px] font-bold text-[#1E3A8A] leading-none opacity-5 select-none">
                      {isTrialLimit ? '5' : '15'}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-full shadow-xl border border-[#F0FDF4]">
                             <Lock size={48} className="text-[#F97316]" />
                        </div>
                    </div>
                </div>

                {/* Persuasive Text - Mensagem diferenciada para Trial */}
                {isTrialLimit ? (
                  <>
                    <p className="text-[#374151] text-lg font-medium leading-relaxed mb-1">
                      Assine o Premium para ter 3x mais tempo todos os dias!
                    </p>
                    <p className="text-[#374151]/80 text-base leading-relaxed mb-6">
                      Você testou 5 minutos hoje. Com o Premium, você terá 15 minutos diários e muito mais funcionalidades.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[#374151] text-lg font-medium leading-relaxed mb-1">
                      Mas temos uma notícia boa!
                    </p>
                    <p className="text-[#374151]/80 text-base leading-relaxed mb-6">
                      Você vai se surpreender com os planos que preparamos. As condições estão incríveis.
                    </p>
                  </>
                )}

                {/* Arrow */}
                <div className="mb-6 animate-bounce text-[#F97316]">
                    <ArrowDown size={32} strokeWidth={3} />
                </div>

                {/* CTA Button */}
                <button 
                    onClick={() => window.open('https://nutri.ai/planos', '_blank')}
                    className="w-full bg-[#F97316] text-white font-bold text-xl py-4 rounded-full shadow-lg hover:bg-[#EA580C] hover:scale-105 transition-all transform flex items-center justify-center gap-2 mb-4"
                >
                    {isTrialLimit ? 'Assinar Premium Agora' : 'Ver Planos Disponíveis'}
                </button>

                <p className="text-[#1E3A8A] text-sm font-semibold opacity-60">
                    {isTrialLimit 
                      ? 'Não perca essa oportunidade!' 
                      : 'Clique abaixo para conferir agora mesmo.'}
                </p>
            </div>

            {/* Footer */}
            <div className="w-full text-center pb-4">
                <p className="text-gray-400 text-xs">
                    Cancele quando quiser.
                </p>
            </div>
        </div>
      );
  }

  // --- STANDARD LIVE INTERFACE ---
  return (
    <div className="fixed inset-0 bg-[#1A4D2E] z-50 flex flex-col animate-in fade-in duration-500">
       
       {/* Header */}
       <div className="p-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3 text-[#F5F1E8]">
             <Activity className={`animate-pulse ${isConnected ? 'text-green-400' : 'text-yellow-400'}`} />
             <span className="font-serif text-lg tracking-wider">{status}</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-[#F5F1E8]/10 rounded-full text-[#F5F1E8] hover:bg-[#F5F1E8]/20 transition-colors"
          >
             <X size={24} />
          </button>
       </div>

       {/* Toast Notification for Logged Item */}
       {loggedItem && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500">
             <div className="bg-green-100 p-1 rounded-full">
                <CheckCircle2 className="text-green-600" size={20} />
             </div>
             <span className="text-[#1A4D2E] font-bold text-sm">Registrado: {loggedItem}</span>
          </div>
       )}

       {/* Visualizer */}
       <div className="flex-1 flex flex-col items-center justify-center relative">
          
          {/* Avatar / Pulse */}
          <div className="relative">
             <div className={`absolute inset-0 bg-[#F5F1E8] rounded-full blur-2xl transition-all duration-100 ${isConnected ? 'opacity-20' : 'opacity-0'}`}
                  style={{ transform: `scale(${1 + volume/20})` }}
             ></div>
             <div className="w-40 h-40 rounded-full bg-[#F5F1E8] flex items-center justify-center shadow-2xl z-10">
                <div className="w-36 h-36 rounded-full border-4 border-[#1A4D2E] overflow-hidden">
                   <img 
                     src={userProfile?.chefAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} 
                     alt="Nutri AI" 
                     className="w-full h-full object-cover"
                   />
                </div>
             </div>
          </div>

          <h2 className="mt-8 text-3xl font-serif text-[#F5F1E8]">Nutri.ai</h2>
          <p className="text-[#F5F1E8]/60 mt-2">Assistente Pessoal</p>
          <p className="text-[#F5F1E8]/30 text-xs mt-4">
            {remainingMinutes.is_vip ? (
              <span className="flex items-center gap-1 justify-center">
                <Infinity size={14} /> Ilimitado
              </span>
            ) : (
              <>
                Tempo restante: {totalAvailableMinutes > 0 ? `${totalAvailableMinutes} min` : '0 min'}
                {remainingMinutes.boost > 0 && <span className="ml-2">⚡ {remainingMinutes.boost}</span>}
                {remainingMinutes.reserve > 0 && <span className="ml-2">💾 {remainingMinutes.reserve}</span>}
              </>
            )}
          </p>
       </div>

       {/* Controls */}
       <div className="pb-16 pt-8 px-8 flex justify-center gap-8 items-center relative z-10">
          <button 
             onClick={toggleMic}
             className={`p-6 rounded-full transition-all duration-300 ${
               isMicOn 
               ? 'bg-[#F5F1E8]/10 text-[#F5F1E8] hover:bg-[#F5F1E8]/20' 
               : 'bg-white text-[#1A4D2E]'
             }`}
          >
             {isMicOn ? <MicIcon size={32} /> : <MicOff size={32} />}
          </button>

          <button 
             onClick={onClose}
             className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all shadow-lg shadow-red-500/30"
          >
             <PhoneOff size={32} fill="currentColor" />
          </button>
       </div>
    </div>
  );
};

export default LiveConversation;
