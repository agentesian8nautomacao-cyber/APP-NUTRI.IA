import React, { useState } from 'react';
import { X, Zap, Clock, Infinity, CheckCircle2, Loader2 } from 'lucide-react';

interface RechargeOption {
  id: string;
  type: 'quick_help' | 'reserve_minutes' | 'unlimited';
  name: string;
  price: number;
  minutes: number;
  validity: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface RechargeModalProps {
  onClose: () => void;
  onPurchase: (rechargeType: string) => Promise<void>;
  isLoading?: boolean;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ onClose, onPurchase, isLoading = false }) => {
  const [selectedRecharge, setSelectedRecharge] = useState<string | null>(null);

  const rechargeOptions: RechargeOption[] = [
    {
      id: 'quick_help',
      type: 'quick_help',
      name: 'Ajuda Rápida',
      price: 5.00,
      minutes: 20,
      validity: '24 horas',
      color: 'bg-orange-500',
      icon: <Zap size={24} className="text-white" />,
      description: 'Minutos extras para quando você mais precisa'
    },
    {
      id: 'reserve_minutes',
      type: 'reserve_minutes',
      name: 'Minutos de Reserva',
      price: 12.90,
      minutes: 100,
      validity: 'Não expira',
      color: 'bg-green-500',
      icon: <Clock size={24} className="text-white" />,
      description: 'Banco de minutos que você usa quando quiser'
    },
    {
      id: 'unlimited',
      type: 'unlimited',
      name: 'Conversa Ilimitada',
      price: 19.90,
      minutes: -1, // -1 significa ilimitado
      validity: '30 dias',
      color: 'bg-purple-500',
      icon: <Infinity size={24} className="text-white" />,
      description: 'Remova o limite diário por 30 dias'
    }
  ];

  const handlePurchase = async () => {
    if (!selectedRecharge) return;
    await onPurchase(selectedRecharge);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-[#1A4D2E] font-bold">
            Comprar Mais Tempo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Recharge Options */}
        <div className="space-y-4 mb-6">
          {rechargeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedRecharge(option.id)}
              disabled={isLoading}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedRecharge === option.id
                  ? 'border-[#1A4D2E] bg-[#F5F1E8]'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${option.color} p-3 rounded-xl flex-shrink-0`}>
                  {option.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#1A4D2E] text-lg">
                      {option.name}
                    </h3>
                    <span className="text-xl font-bold text-[#1A4D2E]">
                      R$ {option.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {option.minutes === -1 ? (
                      <span className="flex items-center gap-1">
                        <Infinity size={14} />
                        Ilimitado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        +{option.minutes} minutos
                      </span>
                    )}
                    <span>•</span>
                    <span>{option.validity}</span>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex-shrink-0">
                  {selectedRecharge === option.id ? (
                    <div className="w-6 h-6 rounded-full bg-[#1A4D2E] flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={!selectedRecharge || isLoading}
          className={`w-full py-4 rounded-full font-bold text-white text-lg transition-all ${
            selectedRecharge && !isLoading
              ? 'bg-[#1A4D2E] hover:bg-[#4F6F52] hover:scale-105'
              : 'bg-gray-300 cursor-not-allowed'
          } flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Comprar Agora
              <span className="text-sm opacity-90">
                {selectedRecharge &&
                  `R$ ${rechargeOptions.find((o) => o.id === selectedRecharge)?.price.toFixed(2).replace('.', ',')}`}
              </span>
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Pagamento seguro via Cakto
        </p>
      </div>
    </div>
  );
};

export default RechargeModal;

