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
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/60 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black">
          <X size={24} />
        </button>

        <div className="mt-4">
          {/* Step 1: Como você nos conheceu? */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">
                Como você conheceu o Nutri.ai?
              </h3>
              <div className="space-y-4">
                {[
                  { value: 'Mídias Sociais', label: 'Mídias Sociais' },
                  { value: 'Indicação de Amigo', label: 'Indicação de Amigo' },
                  { value: 'Pesquisa Online', label: 'Pesquisa Online' },
                  { value: 'Outro', label: 'Outro' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('howDidYouFindUs', option.value)}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-between ${
                      answers.howDidYouFindUs === option.value
                        ? 'bg-[#1A4D2E] text-white shadow-md'
                        : 'bg-[#F5F1E8] text-[#1A4D2E] hover:bg-[#E0D8C7]'
                    }`}
                  >
                    {option.label}
                    {answers.howDidYouFindUs === option.value && <Check size={20} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Qual seu principal objetivo? */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">
                Qual é seu principal objetivo?
              </h3>
              <div className="space-y-4">
                {[
                  { value: 'Perder Peso', label: 'Perder Peso' },
                  { value: 'Ganhar Massa Muscular', label: 'Ganhar Massa Muscular' },
                  { value: 'Saúde Geral', label: 'Saúde Geral' },
                  { value: 'Outro', label: 'Outro' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('mainGoal', option.value)}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-between ${
                      answers.mainGoal === option.value
                        ? 'bg-[#1A4D2E] text-white shadow-md'
                        : 'bg-[#F5F1E8] text-[#1A4D2E] hover:bg-[#E0D8C7]'
                    }`}
                  >
                    {option.label}
                    {answers.mainGoal === option.value && <Check size={20} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Experiência e Feedback */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">
                Como você avalia sua experiência até agora?
              </h3>
              <div className="space-y-4 mb-6">
                {[
                  { value: 'Excelente', label: 'Excelente' },
                  { value: 'Boa', label: 'Boa' },
                  { value: 'Neutra', label: 'Neutra' },
                  { value: 'Ruim', label: 'Ruim' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('experience', option.value)}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-between ${
                      answers.experience === option.value
                        ? 'bg-[#1A4D2E] text-white shadow-md'
                        : 'bg-[#F5F1E8] text-[#1A4D2E] hover:bg-[#E0D8C7]'
                    }`}
                  >
                    {option.label}
                    {answers.experience === option.value && <Check size={20} />}
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#4F6F52] uppercase mb-2">
                  Feedback (opcional)
                </label>
                <textarea
                  value={answers.feedback || ''}
                  onChange={(e) => handleAnswer('feedback', e.target.value)}
                  placeholder="Compartilhe sua opinião..."
                  className="w-full p-4 rounded-xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-4 rounded-xl text-[#1A4D2E] font-bold text-lg border-2 border-[#1A4D2E]/20 hover:bg-[#F5F1E8] transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                canProceed()
                  ? 'bg-[#1A4D2E] text-white hover:bg-[#143d24] shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step < 3 ? 'Próximo' : 'Concluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;

