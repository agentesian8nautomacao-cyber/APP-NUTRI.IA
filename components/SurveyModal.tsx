import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SurveyModalProps {
  onClose: () => void;
  onSubmit: (answers: SurveyAnswers) => void;
}

interface SurveyAnswers {
  howDidYouFindUs: string;
  mainGoal: string;
  experience: string;
  feedback?: string;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    howDidYouFindUs: '',
    mainGoal: '',
    experience: '',
    feedback: ''
  });

  const handleAnswer = (field: keyof SurveyAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!answers.howDidYouFindUs;
      case 2:
        return !!answers.mainGoal;
      case 3:
        return !!answers.experience;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#1A4D2E]/10 px-6 py-4 flex items-center justify-between rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A4D2E] rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{step}/3</span>
            </div>
            <h2 className="text-xl font-serif text-[#1A4D2E]">Enquete Rápida</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#4F6F52] hover:text-[#1A4D2E] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Como você nos conheceu? */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A4D2E] mb-4">
                Como você conheceu o Nutri.ai?
              </h3>
              <div className="space-y-3">
                {[
                  { value: 'codigo_convite', label: 'Código de Convite (Academia/Personal)' },
                  { value: 'teste_gratis', label: 'Teste Grátis (3 dias)' },
                  { value: 'indicacao', label: 'Indicação de amigo/familiar' },
                  { value: 'redes_sociais', label: 'Redes Sociais' },
                  { value: 'busca_google', label: 'Busca no Google' },
                  { value: 'outro', label: 'Outro' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('howDidYouFindUs', option.value)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      answers.howDidYouFindUs === option.value
                        ? 'border-[#1A4D2E] bg-[#1A4D2E]/5'
                        : 'border-[#1A4D2E]/20 hover:border-[#1A4D2E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A4D2E] font-medium">{option.label}</span>
                      {answers.howDidYouFindUs === option.value && (
                        <Check className="text-[#1A4D2E]" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Qual seu principal objetivo? */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A4D2E] mb-4">
                Qual é seu principal objetivo?
              </h3>
              <div className="space-y-3">
                {[
                  { value: 'perder_peso', label: 'Perder Peso' },
                  { value: 'ganhar_massa', label: 'Ganhar Massa Muscular' },
                  { value: 'manter_peso', label: 'Manter o Peso' },
                  { value: 'melhorar_saude', label: 'Melhorar a Saúde Geral' },
                  { value: 'aumentar_energia', label: 'Aumentar Energia' },
                  { value: 'outro', label: 'Outro' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('mainGoal', option.value)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      answers.mainGoal === option.value
                        ? 'border-[#1A4D2E] bg-[#1A4D2E]/5'
                        : 'border-[#1A4D2E]/20 hover:border-[#1A4D2E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A4D2E] font-medium">{option.label}</span>
                      {answers.mainGoal === option.value && (
                        <Check className="text-[#1A4D2E]" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Experiência e Feedback */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1A4D2E] mb-4">
                Como você avalia sua experiência até agora?
              </h3>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'excelente', label: 'Excelente' },
                  { value: 'muito_boa', label: 'Muito Boa' },
                  { value: 'boa', label: 'Boa' },
                  { value: 'regular', label: 'Regular' },
                  { value: 'ruim', label: 'Ruim' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('experience', option.value)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      answers.experience === option.value
                        ? 'border-[#1A4D2E] bg-[#1A4D2E]/5'
                        : 'border-[#1A4D2E]/20 hover:border-[#1A4D2E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#1A4D2E] font-medium">{option.label}</span>
                      {answers.experience === option.value && (
                        <Check className="text-[#1A4D2E]" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#4F6F52] uppercase mb-2">
                  Feedback (Opcional)
                </label>
                <textarea
                  value={answers.feedback || ''}
                  onChange={(e) => handleAnswer('feedback', e.target.value)}
                  placeholder="Compartilhe sua opinião ou sugestões..."
                  className="w-full p-4 rounded-2xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-[#1A4D2E]/20 text-[#1A4D2E] font-medium hover:bg-[#1A4D2E]/5 transition-all"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-white transition-all ${
                canProceed()
                  ? 'bg-[#1A4D2E] hover:bg-[#143d24] hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 3 ? 'Enviar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;

