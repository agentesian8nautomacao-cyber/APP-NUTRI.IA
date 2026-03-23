import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { couponService } from '../services/supabaseService';

interface InviteCodeEntryProps {
  onCodeValid: (code: string) => void;
  onBack?: () => void;
}

const InviteCodeEntry: React.FC<InviteCodeEntryProps> = ({ onCodeValid, onBack }) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleValidate = async () => {
    if (!code.trim()) {
      setError('Por favor, insira um código de convite');
      return;
    }

    setIsValidating(true);
    setError(null);
    setIsValid(false);

    try {
      const coupon = await couponService.validateCoupon(code.trim());
      
      // Verificar se o cupom está vinculado a um pagamento ativo
      // (implementação será adicionada quando tivermos a estrutura de vínculo)
      
      setIsValid(true);
      setTimeout(() => {
        onCodeValid(code.trim());
      }, 500);
    } catch (err: any) {
      if (err instanceof Error) {
        if (err.message === 'CUPOM_ESGOTADO') {
          setError('Este código de convite atingiu o limite de usos.');
        } else if (err.message === 'CUPOM_INEXISTENTE') {
          setError('Código de convite inválido. Verifique e tente novamente.');
        } else {
          setError('Erro ao validar código. Tente novamente.');
        }
      } else {
        setError('Erro ao validar código. Tente novamente.');
      }
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidate();
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
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-serif text-[#1A4D2E] mb-2">Nutri.ai</h1>
          <p className="text-[#4F6F52] font-medium">Sua jornada de nutrição inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-[#1A4D2E]/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-[#1A4D2E] mb-3">Primeiro Acesso</h2>
            <p className="text-[#4F6F52] leading-relaxed">
              Insira o código de convite fornecido pela sua academia ou personal trainer
            </p>
          </div>

          {/* Input Field */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                  setIsValid(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ex: ACADEMIA-X, PERSONAL-Y"
                disabled={isValidating || isValid}
                className={`w-full px-6 py-4 rounded-2xl border-2 text-lg font-bold text-center tracking-widest
                  transition-all duration-300
                  ${error 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : isValid
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10'
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              />
              
              {/* Status Icons */}
              {isValidating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-[#1A4D2E]" size={24} />
                </div>
              )}
              {isValid && !isValidating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
              )}
              {error && !isValidating && (
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
            {isValid && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                <p className="text-sm text-green-700 font-medium">Código válido! Redirecionando...</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleValidate}
            disabled={isValidating || isValid || !code.trim()}
            className={`w-full py-5 rounded-[2rem] font-serif text-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2
              ${isValidating || isValid || !code.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#1A4D2E] text-[#F5F1E8] hover:shadow-2xl hover:scale-[1.02] hover:bg-[#143d24]'
              }
            `}
          >
            {isValidating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Validando...</span>
              </>
            ) : isValid ? (
              <>
                <CheckCircle2 size={20} />
                <span>Válido!</span>
              </>
            ) : (
              <>
                <span>Validar Código</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-4 py-3 text-[#4F6F52] font-medium text-sm hover:text-[#1A4D2E] transition-colors"
            >
              ← Voltar
            </button>
          )}

          {/* Info Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[#4F6F52]/50 text-[10px] font-bold uppercase tracking-[0.2em]">
            <CheckCircle2 size={10} />
            <span>Acesso via Convite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteCodeEntry;

