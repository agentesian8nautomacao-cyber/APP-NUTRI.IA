import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TrialExpiredModalProps {
  onClose: () => void;
  onViewPlans: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ onClose, onViewPlans }) => {
  const handleViewPlans = () => {
    // Abrir link para página de planos (ajustar URL conforme necessário)
    window.open('https://nutri.ai/planos', '_blank');
    onViewPlans();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏱️</span>
          </div>

          <h2 className="font-serif text-3xl mb-4 text-[#1A4D2E]">
            Período de Teste Expirado
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Seu período de teste de 3 dias acabou. Para continuar evoluindo e aproveitando todas as funcionalidades do Nutri.ai, escolha um plano.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleViewPlans}
              className="w-full bg-[#1A4D2E] text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
            >
              Ver Planos
              <ExternalLink size={20} />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;

