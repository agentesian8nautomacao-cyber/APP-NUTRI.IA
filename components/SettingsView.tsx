
import React, { useState, useRef } from 'react';
import { Bell, Droplets, Moon, Utensils, Clock, Play, Info, Settings, X, ChevronRight, Shield, LogOut, Trash2, MessageSquare, Bot, Save, AudioLines, FileText, Upload } from 'lucide-react';
import { WellnessState, UserProfile } from '../types';

interface SettingsViewProps {
    state: WellnessState;
    onUpdate: (s: WellnessState) => void;
    userProfile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, onUpdate, userProfile, onUpdateProfile }) => {
  // State for In-App Visual Notification (Fallback)
  const [fakeNotification, setFakeNotification] = useState<{title: string, body: string, icon?: any} | null>(null);
  
  // State for Custom Chat Instructions
  const [chatInstructions, setChatInstructions] = useState(userProfile.customChatInstructions || '');
  const [aiVoice, setAiVoice] = useState(userProfile.aiVoice || 'Kore');
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleNotification = async (key: keyof typeof state.notifications) => {
      const isEnabling = !state.notifications[key];
      
      onUpdate({
          ...state,
          notifications: {
              ...state.notifications,
              [key]: isEnabling
          }
      });
      
      // Request permission immediately when enabling
      if (isEnabling && "Notification" in window) {
          if (Notification.permission === 'default') {
              await Notification.requestPermission();
          }
      }
  };

  const updateTime = (key: keyof typeof state.notificationTimes, newTime: string) => {
      onUpdate({
          ...state,
          notificationTimes: {
              ...state.notificationTimes,
              [key]: newTime
          }
      });
  };

  const testNotification = async (title: string, body: string, iconType: 'water' | 'sleep' | 'food') => {
      // 1. Trigger Visual In-App Notification (Guaranteed feedback on mobile)
      setFakeNotification({ title, body, icon: iconType });
      
      // Auto-hide after 4 seconds
      setTimeout(() => setFakeNotification(null), 4000);

      // 2. Try System Notification (Best Effort)
      if (!("Notification" in window)) return;

      let permission = Notification.permission;
      if (permission === "default") {
          permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
          try {
              const options = {
                  body,
                  icon: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
                  vibrate: [200, 100, 200],
                  tag: 'test-notification',
                  renotify: true
              };

              // Try Service Worker first (Better for Android)
              if ('serviceWorker' in navigator) {
                  const reg = await navigator.serviceWorker.ready.catch(() => null) || await navigator.serviceWorker.getRegistration();
                  if (reg) {
                      await reg.showNotification(title, options);
                      return;
                  }
              }
              
              // Fallback to standard API
              new Notification(title, options as any);
          } catch (e) {
              console.warn("System notification failed, showing only in-app.", e);
          }
      }
  };

  const saveChatSettings = () => {
      onUpdateProfile({
          ...userProfile,
          customChatInstructions: chatInstructions,
          aiVoice: aiVoice
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const base64String = event.target?.result as string;
              const base64Data = base64String.split(',')[1];
              
              onUpdateProfile({
                  ...userProfile,
                  knowledgeBase: {
                      name: file.name,
                      mimeType: file.type,
                      data: base64Data
                  }
              });
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
          };
          reader.readAsDataURL(file);
      }
  };

  const removeFile = () => {
      const updated = { ...userProfile };
      delete updated.knowledgeBase;
      onUpdateProfile(updated);
  };

  const femaleVoices = [
      { id: 'Kore', label: 'Kore' },
      { id: 'Zephyr', label: 'Zephyr' },
      { id: 'Aoede', label: 'Aoede' }
  ];

  const maleVoices = [
      { id: 'Puck', label: 'Puck' },
      { id: 'Charon', label: 'Charon' },
      { id: 'Fenrir', label: 'Fenrir' }
  ];

  return (
    <div className="p-6 pb-28 min-h-screen max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-500 relative">
        
       {/* IN-APP NOTIFICATION POPUP */}
       {fakeNotification && (
           <div className="fixed top-4 left-4 right-4 z-[100] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in slide-in-from-top duration-500 flex items-start gap-4">
               <div className={`p-3 rounded-full flex-shrink-0 ${
                   fakeNotification.icon === 'water' ? 'bg-blue-100 text-blue-500' :
                   fakeNotification.icon === 'sleep' ? 'bg-indigo-100 text-indigo-500' :
                   'bg-orange-100 text-orange-500'
               }`}>
                   <Bell size={24} fill="currentColor" />
               </div>
               <div className="flex-1">
                   <h4 className="font-bold text-[#1A4D2E] text-sm flex justify-between">
                       {fakeNotification.title}
                       <span className="text-[10px] text-gray-400 font-normal">AGORA</span>
                   </h4>
                   <p className="text-gray-600 text-xs mt-1 leading-relaxed">{fakeNotification.body}</p>
               </div>
               <button onClick={() => setFakeNotification(null)} className="text-gray-400">
                   <X size={16} />
               </button>
           </div>
       )}

       <div className="mb-6">
           <h2 className="text-3xl font-serif font-bold text-[#1A4D2E] flex items-center gap-2">
               <Settings className="text-[#4F6F52]" /> Configurações
           </h2>
           <p className="text-[#4F6F52]">Preferências do aplicativo.</p>
       </div>

      {/* Chat Customization Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#1A4D2E]/5 space-y-6">
        <div>
            <h3 className="font-serif text-xl text-[#1A4D2E] mb-2 flex items-center gap-2">
                <Bot size={20} className="text-[#4F6F52]"/> Personalizar IA
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
                Configure a personalidade, voz e conhecimento da sua assistente.
            </p>
        </div>
        
        {/* System Prompt */}
        <div className="bg-[#F5F1E8] p-4 rounded-2xl border border-[#1A4D2E]/10">
            <div className="flex items-center gap-2 mb-2 text-[#4F6F52] text-xs font-bold uppercase">
                <MessageSquare size={14} /> Prompt do Sistema
            </div>
            <textarea 
                value={chatInstructions}
                onChange={(e) => setChatInstructions(e.target.value)}
                placeholder="Ex: Aja como um coach exigente que foca em ganho de massa. Use emojis de fogo. Não sugira doces."
                className="w-full h-24 bg-white rounded-xl p-3 text-[#1A4D2E] text-sm outline-none border border-transparent focus:border-[#1A4D2E]/20 resize-none transition-all mb-2"
            />
        </div>

        {/* Voice Selection */}
        <div>
            <div className="flex items-center gap-2 mb-4 text-[#4F6F52] text-xs font-bold uppercase px-1">
                <AudioLines size={14} /> Voz da Assistente
            </div>
            
            <div className="space-y-4">
                {/* Feminina */}
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-2 block tracking-wider">Feminina</span>
                    <div className="flex gap-2">
                        {femaleVoices.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setAiVoice(v.id)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border flex-1 text-center ${
                                    aiVoice === v.id 
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-md transform scale-105' 
                                    : 'bg-white text-[#4F6F52] border-gray-200 hover:border-[#1A4D2E]/50'
                                }`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Masculina */}
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-2 block tracking-wider">Masculina</span>
                    <div className="flex gap-2">
                        {maleVoices.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setAiVoice(v.id)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap border flex-1 text-center ${
                                    aiVoice === v.id 
                                    ? 'bg-[#1A4D2E] text-white border-[#1A4D2E] shadow-md transform scale-105' 
                                    : 'bg-white text-[#4F6F52] border-gray-200 hover:border-[#1A4D2E]/50'
                                }`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Knowledge Base Upload */}
        <div>
            <div className="flex items-center gap-2 mb-3 text-[#4F6F52] text-xs font-bold uppercase px-1">
                <FileText size={14} /> Base de Conhecimento (Contexto)
            </div>
            
            {userProfile.knowledgeBase ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white p-2 rounded-lg text-blue-500"><FileText size={18} /></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-[#1A4D2E] truncate">{userProfile.knowledgeBase.name}</span>
                            <span className="text-[10px] text-blue-600">Contexto Ativo</span>
                        </div>
                     </div>
                     <button onClick={removeFile} className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#1A4D2E]/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F5F1E8] transition-colors group"
                >
                    <Upload size={24} className="text-[#4F6F52] mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-[#1A4D2E]">Carregar Documento</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, TXT ou Imagem para a IA aprender</p>
                    <input ref={fileInputRef} type="file" accept=".pdf, .txt, image/*" className="hidden" onChange={handleFileUpload} />
                </div>
            )}
        </div>

        <div className="flex justify-end pt-2">
            <button 
                onClick={saveChatSettings}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all w-full justify-center ${
                    isSaved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-[#1A4D2E] text-white hover:bg-[#143d24]'
                }`}
            >
                {isSaved ? 'Configurações Salvas!' : <><Save size={16}/> Salvar Alterações</>}
            </button>
        </div>
      </div>

      {/* Notifications Settings Block */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#1A4D2E]/5">
        <h3 className="font-serif text-xl text-[#1A4D2E] mb-2 flex items-center gap-2">
            <Bell size={20} className="text-[#4F6F52]"/> Notificações
        </h3>
        <div className="mb-6 bg-blue-50 p-3 rounded-xl flex items-start gap-2">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
                Nota: Se as notificações não aparecerem na barra de status, veja o aviso no topo do app.
            </p>
        </div>
        
        <div className="space-y-2 divide-y divide-gray-100">
            {/* Water Reminder */}
            <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-500"><Droplets size={20} /></div>
                        <div>
                            <div className="font-bold text-[#1A4D2E] text-sm">Beber Água</div>
                            <div className="text-xs text-[#4F6F52]">Lembretes regulares</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleNotification('water')}
                        className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.water ? 'bg-[#1A4D2E]' : 'bg-gray-200'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.water ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                
                {state.notifications?.water && (
                    <div className="mt-4 bg-[#F5F1E8]/50 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#1A4D2E]/10 shadow-sm">
                            <Clock size={16} className="text-[#4F6F52]" />
                            <input 
                                type="time" 
                                value={state.notificationTimes?.water || "09:00"} 
                                onChange={(e) => updateTime('water', e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold text-[#1A4D2E] w-20"
                            />
                        </div>
                        <button 
                            onClick={() => testNotification("Hora de se hidratar! 💧", "Beba um copo de água agora para manter o foco.", "water")}
                            className="text-xs font-bold text-[#1A4D2E] flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                        >
                            <Play size={12} fill="currentColor" /> Testar
                        </button>
                    </div>
                )}
            </div>

            {/* Sleep Reminder */}
            <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-full text-indigo-500"><Moon size={20} /></div>
                        <div>
                            <div className="font-bold text-[#1A4D2E] text-sm">Hora de Dormir</div>
                            <div className="text-xs text-[#4F6F52]">Preparação do sono</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleNotification('sleep')}
                        className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.sleep ? 'bg-[#1A4D2E]' : 'bg-gray-200'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.sleep ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {state.notifications?.sleep && (
                    <div className="mt-4 bg-[#F5F1E8]/50 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#1A4D2E]/10 shadow-sm">
                            <Clock size={16} className="text-[#4F6F52]" />
                            <input 
                                type="time" 
                                value={state.notificationTimes?.sleep || "22:00"} 
                                onChange={(e) => updateTime('sleep', e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold text-[#1A4D2E] w-20"
                            />
                        </div>
                        <button 
                            onClick={() => testNotification("Hora do descanso 🌙", "Desligue as telas e prepare-se para dormir.", "sleep")}
                            className="text-xs font-bold text-[#1A4D2E] flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                        >
                            <Play size={12} fill="currentColor" /> Testar
                        </button>
                    </div>
                )}
            </div>

            {/* Food Reminder */}
            <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-full text-orange-500"><Utensils size={20} /></div>
                        <div>
                            <div className="font-bold text-[#1A4D2E] text-sm">Refeições</div>
                            <div className="text-xs text-[#4F6F52]">Café, Almoço, Jantar</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggleNotification('meals')}
                        className={`w-12 h-7 rounded-full p-1 transition-colors ${state.notifications?.meals ? 'bg-[#1A4D2E]' : 'bg-gray-200'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${state.notifications?.meals ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {state.notifications?.meals && (
                    <div className="mt-4 bg-[#F5F1E8]/50 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#1A4D2E]/10 shadow-sm">
                            <Clock size={16} className="text-[#4F6F52]" />
                            <input 
                                type="time" 
                                value={state.notificationTimes?.meals || "12:00"} 
                                onChange={(e) => updateTime('meals', e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold text-[#1A4D2E] w-20"
                            />
                        </div>
                        <button 
                            onClick={() => testNotification("Hora de comer! 🥗", "Nutra seu corpo com uma refeição saudável.", "food")}
                            className="text-xs font-bold text-[#1A4D2E] flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                        >
                            <Play size={12} fill="currentColor" /> Testar
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#1A4D2E]/5">
           <button className="w-full p-4 flex items-center justify-between hover:bg-[#F5F1E8] rounded-2xl transition-colors">
               <div className="flex items-center gap-3">
                   <div className="bg-[#1A4D2E]/5 p-2 rounded-full"><Shield className="text-[#1A4D2E]" size={20} /></div>
                   <span className="text-[#1A4D2E] font-bold">Privacidade & Dados</span>
               </div>
               <ChevronRight size={18} className="text-gray-400" />
           </button>
           <div className="h-[1px] bg-gray-100 mx-4"></div>
           
           <button className="w-full p-4 flex items-center justify-between hover:bg-orange-50 rounded-2xl transition-colors group">
               <div className="flex items-center gap-3">
                   <div className="bg-orange-50 p-2 rounded-full group-hover:bg-orange-100"><LogOut className="text-orange-500" size={20} /></div>
                   <span className="text-orange-500 font-bold">Sair da Conta</span>
               </div>
           </button>
           
           <div className="h-[1px] bg-gray-100 mx-4"></div>

           <button 
               onClick={() => {
                   if(confirm("Tem certeza que deseja deletar sua conta? Todos os dados serão perdidos.")) {
                       alert("Sua conta foi agendada para exclusão.");
                   }
               }}
               className="w-full p-4 flex items-center justify-between hover:bg-red-50 rounded-2xl transition-colors group"
           >
               <div className="flex items-center gap-3">
                   <div className="bg-red-50 p-2 rounded-full group-hover:bg-red-100"><Trash2 className="text-red-600" size={20} /></div>
                   <div className="flex flex-col items-start">
                       <span className="text-red-600 font-bold">Deletar Conta</span>
                       <span className="text-red-400 text-[10px] font-medium uppercase tracking-wider">Ação irreversível</span>
                   </div>
               </div>
           </button>
      </div>
    </div>
  );
};
export default SettingsView;
