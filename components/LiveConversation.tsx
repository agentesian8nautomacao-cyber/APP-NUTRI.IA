
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from "@google/genai";
import { X, Mic, MicOff, PhoneOff, Activity, CheckCircle2, Lock, Home, BookOpen, User, Mic as MicIcon, ArrowDown, Zap, Clock, Infinity, Check, Trash2 } from 'lucide-react';
import { UserProfile, DailyPlan, LogItem, MealItem } from '../types';
import { limitsService, authService } from '../services/supabaseService';

interface LiveConversationProps {
  onClose: () => void;
  userProfile?: UserProfile | null;
  dietPlan?: DailyPlan | null;
  dailyLog?: LogItem[];
  onAddFood?: (item: MealItem, type: string) => void;
  onRemoveFood?: (id: string) => void;
}

const LiveConversation: React.FC<LiveConversationProps> = ({ onClose, userProfile, dietPlan, dailyLog, onAddFood, onRemoveFood }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState("Conectando...");
  const [loggedItem, setLoggedItem] = useState<string | null>(null);
  const [deletedItem, setDeletedItem] = useState<string | null>(null);
  
  // Nova lógica de saldos de voz
  const [voiceBalances, setVoiceBalances] = useState<{
    isVip: boolean;
    freeMinutes: number;
    boostMinutes: number;
    reserveMinutes: number;
    totalSeconds: number;
  } | null>(null);
  const [secondsActive, setSecondsActive] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  
  const userIdRef = useRef<string | null>(null);
  const consumptionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Define Tool for Deleting Meals
  const deleteFoodTool: FunctionDeclaration = {
      name: "deleteFood",
      description: "Remove um registro de alimento do diário alimentar. Use quando o usuário pedir para apagar, remover ou deletar algo que comeu.",
      parameters: {
          type: Type.OBJECT,
          properties: {
              foodName: { type: Type.STRING, description: "Nome do alimento a ser removido (ex: 'maçã', 'café')." }
          },
          required: ["foodName"]
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

  // Init Session
  useEffect(() => {
    // Se não carregou saldos ainda, aguardar
    if (!voiceBalances) {
      return;
    }
    
    // Se limite atingido e não é VIP, não conectar
    if (isLimitReached && !voiceBalances.isVip) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      return;
    }
    
    // Se não tem saldo e não é VIP, não conectar
    if (voiceBalances.totalSeconds === 0 && !voiceBalances.isVip) {
      setIsLimitReached(true);
      return;
    }

    const initSession = async () => {
      try {
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
          2. Se o usuário disser que comeu algo, use a ferramenta 'logMeal'.
          3. Se o usuário pedir para remover algo, use a ferramenta 'deleteFood'.
          4. Estime as calorias e macros para a ferramenta se o usuário não fornecer.
          5. Confirme verbalmente quando registrar ou remover.
          6. Fale sempre em Português do Brasil.
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
              
              // Handle Tool Call (Logging/Deleting Food)
              if (msg.toolCall) {
                const responses = [];
                for (const fc of msg.toolCall.functionCalls) {
                    const args = fc.args as any;

                    if (fc.name === 'logMeal' && onAddFood) {
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

                        onAddFood(newItem, args.mealType);
                        
                        setLoggedItem(`${args.foodName} (${args.calories} kcal)`);
                        setTimeout(() => setLoggedItem(null), 3000);

                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: { result: "Success: Meal logged." }
                        });
                    }
                    else if (fc.name === 'deleteFood' && onRemoveFood && dailyLog) {
                        // Logic to find the item to delete (simple exact/partial match)
                        const itemToDelete = dailyLog.find(item => 
                            item.name.toLowerCase().includes(args.foodName.toLowerCase())
                        );

                        if (itemToDelete) {
                            onRemoveFood(itemToDelete.id);
                            setDeletedItem(itemToDelete.name);
                            setTimeout(() => setDeletedItem(null), 3000);
                            responses.push({
                                id: fc.id,
                                name: fc.name,
                                response: { result: `Success: Removed ${itemToDelete.name}` }
                            });
                        } else {
                            responses.push({
                                id: fc.id,
                                name: fc.name,
                                response: { result: "Error: Item not found." }
                            });
                        }
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
             tools: [{ functionDeclarations: [logMealTool, deleteFoodTool] }],
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
      if (consumptionIntervalRef.current) {
        clearInterval(consumptionIntervalRef.current);
      }
    };
  }, [userProfile, dietPlan, dailyLog, voiceBalances, isLimitReached]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  // --- TIME LIMIT REACHED SCREEN (UPSELL) ---
  if (isLimitReached && (!voiceBalances || !voiceBalances.isVip)) {
      const totalMinutes = voiceBalances 
        ? Math.floor(voiceBalances.totalSeconds / 60)
        : 0;
      
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
                    Limite diário atingido
                </h2>

                {/* Central Graphic */}
                <div className="relative mb-10">
                    <div className="text-[140px] font-bold text-[#1E3A8A] leading-none opacity-5 select-none">
                      {totalMinutes > 0 ? totalMinutes : '0'}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-full shadow-xl border border-[#F0FDF4]">
                             <Lock size={48} className="text-[#F97316]" />
                        </div>
                    </div>
                </div>

                {/* Persuasive Text */}
                <p className="text-[#374151] text-lg font-medium leading-relaxed mb-1">
                    Mas temos uma notícia boa!
                </p>
                <p className="text-[#374151]/80 text-base leading-relaxed mb-6">
                    Você vai se surpreender com os planos que preparamos. As condições estão incríveis.
                </p>

                {/* Arrow */}
                <div className="mb-6 animate-bounce text-[#F97316]">
                    <ArrowDown size={32} strokeWidth={3} />
                </div>

                {/* CTA Button */}
                <button 
                    onClick={() => window.location.href = "https://pagina-de-vendas-nutriai.vercel.app/"}
                    className="w-full bg-[#F97316] text-white font-bold text-xl py-4 rounded-full shadow-lg hover:bg-[#EA580C] hover:scale-105 transition-all transform flex items-center justify-center gap-2 mb-4"
                >
                    Ver Planos Disponíveis
                </button>

                <p className="text-[#1E3A8A] text-sm font-semibold opacity-60">
                    Clique abaixo para conferir agora mesmo.
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
       
       {/* DEV BUTTON: Trigger Limit */}
       {process.env.NODE_ENV === 'development' && (
         <button 
           onClick={() => setIsLimitReached(true)}
           className="absolute top-24 right-6 bg-orange-500/80 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-50 transition-all border border-white/20 shadow-lg"
         >
           Testar Limite (Dev)
         </button>
       )}

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

       {/* Toast Notification for Deleted Item */}
       {deletedItem && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500">
             <div className="bg-red-100 p-1 rounded-full">
                <Trash2 className="text-red-600" size={20} />
             </div>
             <span className="text-[#1A4D2E] font-bold text-sm">Removido: {deletedItem}</span>
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
          {voiceBalances && (
            <div className="text-[#F5F1E8]/30 text-xs mt-4 space-y-1">
              {voiceBalances.isVip ? (
                <p className="flex items-center justify-center gap-1">
                  <Infinity size={14} /> Ilimitado
                </p>
              ) : (
                <>
                  <p>Tempo restante: {Math.floor(voiceBalances.totalSeconds / 60)} min</p>
                  <div className="flex items-center justify-center gap-2 text-[10px] opacity-70">
                    {voiceBalances.freeMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> Gratuito: {voiceBalances.freeMinutes}m
                      </span>
                    )}
                    {voiceBalances.boostMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Zap size={10} /> Boost: {voiceBalances.boostMinutes}m
                      </span>
                    )}
                    {voiceBalances.reserveMinutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Check size={10} /> Reserva: {voiceBalances.reserveMinutes}m
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
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