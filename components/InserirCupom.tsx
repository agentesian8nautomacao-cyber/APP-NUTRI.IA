import React, { useState } from 'react';
import { Ticket, CheckCircle2, XCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { couponService } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

interface InserirCupomProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const InserirCupom: React.FC<InserirCupomProps> = ({ onBack, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleActivate = async () => {
    if (!code.trim()) {
      setError('Por favor, insira um código de cupom');
      return;
    }

    setIsActivating(true);
    setError(null);
    setSuccess(false);

    try {
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      // Ativar cupom
      const result = await couponService.activateCoupon(code.trim(), user.id);

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Cupom ativado com sucesso!');
        
        // Chamar callback de sucesso após 2 segundos
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            onBack();
          }
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro ao ativar cupom');
      }
    } catch (err: any) {
      if (err instanceof Error) {
        // Mapear erros conhecidos para mensagens amigáveis
        const errorMessages: Record<string, string> = {
          'CÓDIGO_VAZIO': 'Por favor, insira um código de cupom.',
          'CUPOM_INEXISTENTE': 'Cupom não encontrado ou inativo.',
          'CUPOM_ESGOTADO': 'Este cupom não possui mais ativações disponíveis.',
          'PERFIL_INCOMPATIVEL': 'Este cupom é válido apenas para perfis de Academia ou Personal Trainer.',
          'USUARIO_NAO_ENCONTRADO': 'Perfil do usuário não encontrado.',
          'ERRO_ATIVACAO': 'Erro ao processar a ativação. Tente novamente.',
          'ERRO_INTERNO': 'Erro interno. Por favor, tente novamente mais tarde.'
        };

        setError(errorMessages[err.message] || err.message || 'Erro ao ativar cupom. Tente novamente.');
      } else {
        setError('Erro ao ativar cupom. Tente novamente.');
      }
      setSuccess(false);
    } finally {
      setIsActivating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isActivating && !success) {
      handleActivate();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>

      {/* Background Fruits */}
      <div className="absolute inset-x-0 top-0 h-32 overflow-hidden opacity-10 pointer-events-none select-none">
        <div className="whitespace-nowrap animate-marquee text-6xl grayscale">
          🍎 🍌 🍇 🍊 🍓 🥑 🥦 🥕 🌽 🥯 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥙 🥚 🥘 🍲 🥣 🥗 🍿 
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1A4D2E] rounded-full mb-4 shadow-lg">
            <Ticket className="text-[#F5F1E8]" size={40} />
          </div>
          <h1 className="text-4xl font-serif text-[#1A4D2E] mb-2">Ativar Cupom</h1>
          <p className="text-[#4F6F52] leading-relaxed">
            Insira o código do cupom fornecido pela sua academia ou personal trainer
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-[#1A4D2E]/10">
          {/* Input Field */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                  setSuccess(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ex: ACADEMIA-X, PERSONAL-Y"
                disabled={isActivating || success}
                className={`w-full px-6 py-4 rounded-2xl border-2 text-lg font-bold text-center tracking-widest
                  transition-all duration-300
                  ${error 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : success
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              />
              
              {/* Status Icons */}
              {isActivating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-[#1A4D2E]" size={24} />
                </div>
              )}
              {success && !isActivating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
              )}
              {error && !isActivating && !success && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <XCircle className="text-red-500" size={24} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
                <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                  <p className="text-xs text-green-600 mt-1">Redirecionando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={isActivating || success || !code.trim()}
            className={`w-full py-5 rounded-[2rem] font-serif text-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2
              ${isActivating || success || !code.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#1A4D2E] text-[#F5F1E8] hover:shadow-2xl hover:scale-[1.02] hover:bg-[#143d24]'
              }
            `}
          >
            {isActivating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Ativando...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                <span>Ativado!</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Ativar Cupom</span>
              </>
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full mt-4 py-3 text-[#4F6F52] font-medium text-sm hover:text-[#1A4D2E] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>

          {/* Info Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[#4F6F52]/50 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Ticket size={10} />
            <span>Ativação Interna</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InserirCupom;

