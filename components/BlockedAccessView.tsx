import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface BlockedAccessViewProps {
  message: string;
  reason?: string;
  onBack?: () => void;
}

const BlockedAccessView: React.FC<BlockedAccessViewProps> = ({ 
  message, 
  reason,
  onBack 
}) => {
  return (
    <div className="fixed inset-0 bg-[#F5F1E8] z-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="text-red-600" size={48} />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif text-[#1A4D2E] mb-4">
          Acesso Bloqueado
        </h2>
        
        <p className="text-[#374151] mb-6 leading-relaxed">
          {message}
        </p>
        
        {reason && (
          <p className="text-sm text-[#6B7280] mb-6">
            Motivo: {reason}
          </p>
        )}
        
        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-[#1A4D2E] text-white font-bold py-4 rounded-full hover:bg-[#153d25] transition-colors flex items-center justify-center gap-2"
          >
            <X size={20} />
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default BlockedAccessView;

