
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Loader2, Phone, ChefHat, Sparkles } from 'lucide-react';
import { ChatMessage, UserProfile, DailyPlan, LogItem, MealItem } from '../types';
import { chatWithNutritionist } from '../services/geminiService';

interface ChatAssistantProps {
  onClose: () => void;
  onLiveCall?: () => void;
  userProfile?: UserProfile | null;
  dietPlan?: DailyPlan | null;
  dailyLog?: LogItem[];
  onAddFood?: (item: MealItem, type: string) => void;
  isBlocked?: boolean;
}

// Helper to format text (Bold)
const formatText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#1A4D2E]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
       <div className="flex justify-end animate-in slide-in-from-right fade-in duration-300">
          <div className="max-w-[85%] bg-[#1A4D2E] text-[#F5F1E8] p-5 rounded-[2rem] rounded-tr-none shadow-lg">
             <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{message.text}</p>
          </div>
       </div>
    );
  }

  // Parsing logic for AI response to make it PRETTY
  const lines = message.text.split('\n');
  const blocks: any[] = [];
  let currentList: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Header detection (## Title)
    if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
        if (currentList.length) {
            blocks.push({ type: 'list', items: [...currentList] });
            currentList = [];
        }
        blocks.push({ type: 'header', content: trimmed.replace(/^#+\s*/, '') });
    }
    // List detection (- item or 1. item)
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[-*]|\d+\.\s*/, '').trim();
        currentList.push(content);
    } 
    // Standard text
    else {
        if (currentList.length) {
            blocks.push({ type: 'list', items: [...currentList] });
            currentList = [];
        }
        if (trimmed) blocks.push({ type: 'paragraph', content: trimmed });
    }
  });
  if (currentList.length) blocks.push({ type: 'list', items: [...currentList] });

  // If no blocks detected (plain text), just render paragraph
  if (blocks.length === 0 && message.text) {
      blocks.push({ type: 'paragraph', content: message.text });
  }

  return (
    <div className="flex justify-start animate-in slide-in-from-left fade-in duration-300">
       <div className="max-w-[95%] md:max-w-[85%] bg-white text-[#1A4D2E] rounded-[2rem] rounded-tl-none shadow-sm overflow-hidden border border-[#1A4D2E]/5">
          {blocks.map((block, i) => {
             if (block.type === 'header') {
                return (
                    <div key={i} className="px-6 pt-5 pb-2 bg-[#F5F1E8]/30 border-b border-[#1A4D2E]/5 mb-2 mt-1">
                        <h3 className="font-serif text-xl font-bold text-[#1A4D2E] flex items-center gap-2">
                           <ChefHat size={18} className="text-[#4F6F52]" /> {block.content}
                        </h3>
                    </div>
                );
             }
             if (block.type === 'list') {
                return (
                    <div key={i} className="px-6 py-2 space-y-3 mb-2">
                        {block.items.map((item: string, j: number) => (
                            <div key={j} className="flex gap-3 items-start p-3 bg-[#F5F1E8] rounded-2xl shadow-sm">
                                <div className="mt-1 min-w-[20px] h-[20px] rounded-full bg-[#1A4D2E] flex items-center justify-center text-[#F5F1E8] text-[10px] font-bold shadow-sm">
                                   {j + 1}
                                </div>
                                <span className="text-sm text-[#1A4D2E] leading-relaxed">{formatText(item)}</span>
                            </div>
                        ))}
                    </div>
                );
             }
             return (
                 <div key={i} className="px-6 py-2">
                    <p className="text-sm leading-7 text-[#1A4D2E]/80 font-medium">{formatText(block.content)}</p>
                 </div>
             );
          })}
       </div>
    </div>
  );
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose, onLiveCall, userProfile, dietPlan, dailyLog, onAddFood, isBlocked = false }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        id: '1', 
        role: 'model', 
        text: '## Olá! 👨‍🍳\nSou seu chef e nutricionista pessoal.\n\n- Posso criar receitas com o que você tem\n- Tirar dúvidas sobre sua dieta\n- Analisar o que você comeu hoje\n\nComo posso ajudar?', 
        timestamp: Date.now() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isBlocked) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithNutritionist(
        history, 
        userMsg.text,
        { profile: userProfile, plan: dietPlan, log: dailyLog }, // Context
        {}, // Options removed
        (data, type) => { // onLogMeal callback
             if(onAddFood) {
                 onAddFood(data, type);
                 const confirmationMsg: ChatMessage = {
                    id: Date.now().toString() + "_sys",
                    role: 'model',
                    text: `✅ **Registrado:** ${data.name} (${data.calories} kcal)`,
                    timestamp: Date.now()
                 };
                 setMessages(prev => [...prev, confirmationMsg]);
             }
        }
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, estou tendo dificuldades para processar isso agora.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F1E8] z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-white p-6 flex justify-between items-center shadow-sm rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1A4D2E] rounded-full flex items-center justify-center text-[#F5F1E8] shadow-md border-2 border-[#F5F1E8]">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-[#1A4D2E]">Chef IA</h3>
            <span className="text-xs text-[#4F6F52] font-medium flex items-center gap-1 bg-[#F5F1E8] px-2 py-0.5 rounded-full w-fit">
              <span className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></span> 
              Online
            </span>
          </div>
        </div>
        <div className="flex gap-2">
            {onLiveCall && (
                <button 
                    onClick={onLiveCall} 
                    className="p-3 bg-[#1A4D2E] rounded-full text-white hover:bg-[#4F6F52] transition-all shadow-md animate-pulse"
                    title="Iniciar chamada de voz"
                >
                    <Phone size={20} fill="currentColor" />
                </button>
            )}
            <button onClick={onClose} className="p-3 bg-[#F5F1E8] rounded-full text-[#1A4D2E] hover:bg-[#1A4D2E] hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F5F1E8]">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[2rem] rounded-tl-none shadow-sm">
               <div className="flex space-x-2 items-center text-[#1A4D2E]">
                  <Sparkles className="animate-spin mr-2 text-yellow-500" size={16} />
                  <span className="text-sm font-serif text-[#4F6F52]">
                    Escrevendo...
                  </span>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#F5F1E8]">
        <div className="flex items-center gap-2 bg-white rounded-[2.5rem] px-2 py-2 shadow-xl border border-[#1A4D2E]/5">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isBlocked && handleSend()}
            placeholder={isBlocked ? "Período de teste expirado" : "Digite algo..."}
            disabled={isBlocked}
            className={`flex-1 bg-transparent outline-none text-[#1A4D2E] placeholder:text-[#1A4D2E]/30 px-6 font-medium text-lg ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isBlocked}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              input.trim() && !isBlocked
              ? 'bg-[#1A4D2E] text-[#F5F1E8] hover:scale-110 shadow-lg' 
              : 'bg-[#F5F1E8] text-[#1A4D2E]/20'
            } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
