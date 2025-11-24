
import React, { useRef } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import { ArrowLeft, Camera, User, Upload } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack }) => {
  const chefInputRef = useRef<HTMLInputElement>(null);
  const userInputRef = useRef<HTMLInputElement>(null);

  const handleChefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...user, chefAvatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...user, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const InfoItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white p-4 rounded-2xl border border-[#1A4D2E]/5">
      <div className="text-xs font-bold text-[#4F6F52] uppercase mb-1">{label}</div>
      <div className="text-lg font-serif text-[#1A4D2E]">{value}</div>
    </div>
  );

  return (
    <div className="p-6 pb-28 min-h-screen bg-[#F5F1E8] animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm text-[#1A4D2E]">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-serif font-bold text-[#1A4D2E]">Meu Perfil</h2>
      </div>

      <div className="space-y-6">
        
        {/* User Avatar Section */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-[#1A4D2E]/5 relative overflow-hidden">
            <h3 className="font-serif text-xl mb-4 relative z-10 text-[#1A4D2E]">Sua Foto de Perfil</h3>
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-full border-4 border-[#F5F1E8] overflow-hidden bg-gray-100 relative group cursor-pointer shadow-lg" onClick={() => userInputRef.current?.click()}>
                    <img 
                        src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={20} />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-[#4F6F52] mb-2">Esta foto aparecerá no dashboard.</p>
                    <button 
                        onClick={() => userInputRef.current?.click()} 
                        className="px-4 py-2 bg-[#1A4D2E] text-white rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Upload size={14} /> Alterar Foto
                    </button>
                    <input 
                        ref={userInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUserImageUpload} 
                    />
                </div>
            </div>
        </div>

        {/* Chef Avatar Section */}
        <div className="bg-[#1A4D2E] text-[#F5F1E8] p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <h3 className="font-serif text-xl mb-4 relative z-10">Avatar do Chef IA</h3>
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-[#F5F1E8]/20 overflow-hidden bg-white relative group cursor-pointer" onClick={() => chefInputRef.current?.click()}>
                    <img 
                        src={user.chefAvatar || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80"} 
                        alt="Chef Avatar" 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-sm opacity-80 mb-3">Personalize a imagem do seu assistente para as chamadas.</p>
                    <button 
                        onClick={() => chefInputRef.current?.click()} 
                        className="px-4 py-2 bg-[#F5F1E8] text-[#1A4D2E] rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors"
                    >
                        <Upload size={14} /> Carregar Foto
                    </button>
                    <input 
                        ref={chefInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleChefImageUpload} 
                    />
                </div>
            </div>
            {/* Decoration */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#4F6F52] rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
            <h3 className="font-serif text-xl text-[#1A4D2E] flex items-center gap-2"><User size={20}/> Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Nome" value={user.name} />
                <InfoItem label="Idade" value={`${user.age} anos`} />
                <InfoItem label="Altura" value={`${user.height} cm`} />
                <InfoItem label="Peso" value={`${user.weight} kg`} />
                <div className="col-span-2">
                    <InfoItem label="Objetivo" value={user.goal} />
                </div>
                 <div className="col-span-2">
                    <InfoItem label="Nível de Atividade" value={user.activityLevel} />
                </div>
            </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#1A4D2E]/5">
            <h3 className="font-serif text-xl text-[#1A4D2E] mb-4">Preferências & Restrições</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-[#4F6F52] uppercase">Restrições</label>
                    <p className="text-[#1A4D2E]">{user.restrictions || "Nenhuma"}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-[#4F6F52] uppercase">Preferências</label>
                    <p className="text-[#1A4D2E]">{user.foodPreferences || "Não informado"}</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-[#4F6F52] uppercase">Histórico Médico</label>
                    <p className="text-[#1A4D2E]">{user.medicalHistory || "Não informado"}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
