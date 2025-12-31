import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Gender, ActivityLevel, Goal } from '../types';

interface SurveyModalProps {
  onClose: () => void;
  onSubmit: (answers: SurveyAnswers) => void;
}

interface SurveyAnswers {
  name: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  howDidYouFindUs: string;
  mainGoal: string;
  experience: string;
  feedback?: string;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    name: '',
    age: 30,
    gender: Gender.Other,
    height: 170,
    weight: 70,
    activityLevel: ActivityLevel.Light,
    goal: Goal.GeneralHealth,
    howDidYouFindUs: '',
    mainGoal: '',
    experience: '',
    feedback: ''
  });

  const handleAnswer = (field: keyof SurveyAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!answers.name;
      case 2:
        return answers.age > 0 && answers.age < 150;
      case 3:
        return answers.gender !== undefined;
      case 4:
        return answers.height > 0;
      case 5:
        return answers.weight > 0;
      case 6:
        return !!answers.howDidYouFindUs;
      case 7:
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
          {/* Step 1: Nome */}
          {step === 1 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Qual seu nome?</h3>
              <input
                type="text"
                value={answers.name}
                onChange={(e) => handleAnswer('name', e.target.value)}
                placeholder="Digite seu nome..."
                className="w-full p-4 rounded-xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all text-lg"
                autoFocus
              />
            </>
          )}

          {/* Step 2: Idade */}
          {step === 2 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Sua Idade</h3>
              <div className="text-center">
                <input
                  type="number"
                  value={answers.age}
                  onChange={(e) => handleAnswer('age', parseInt(e.target.value) || 0)}
                  className="w-full p-4 rounded-xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all text-5xl font-serif text-center"
                  min="1"
                  max="150"
                />
                <p className="text-[#4F6F52] mt-2">anos</p>
              </div>
            </>
          )}

          {/* Step 3: Gênero */}
          {step === 3 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Sexo Biológico</h3>
              <div className="space-y-4">
                {[
                  { label: 'Masculino', value: Gender.Male },
                  { label: 'Feminino', value: Gender.Female },
                  { label: 'Outro', value: Gender.Other }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('gender', option.value)}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-between ${
                      answers.gender === option.value
                        ? 'bg-[#1A4D2E] text-white shadow-md'
                        : 'bg-[#F5F1E8] text-[#1A4D2E] hover:bg-[#E0D8C7]'
                    }`}
                  >
                    {option.label}
                    {answers.gender === option.value && <Check size={20} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 4: Altura */}
          {step === 4 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Altura</h3>
              <div className="text-center mb-4">
                <span className="text-5xl font-serif text-[#1A4D2E]">{answers.height}</span>
                <span className="text-[#4F6F52] text-xl ml-2">cm</span>
              </div>
              <input
                type="range"
                min="120"
                max="220"
                value={answers.height}
                onChange={(e) => handleAnswer('height', parseInt(e.target.value))}
                className="w-full h-3 bg-[#F5F1E8] rounded-full appearance-none cursor-pointer accent-[#1A4D2E]"
              />
            </>
          )}

          {/* Step 5: Peso */}
          {step === 5 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Peso</h3>
              <div className="text-center mb-4">
                <span className="text-5xl font-serif text-[#1A4D2E]">{answers.weight}</span>
                <span className="text-[#4F6F52] text-xl ml-2">kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={answers.weight}
                onChange={(e) => handleAnswer('weight', parseInt(e.target.value))}
                className="w-full h-3 bg-[#F5F1E8] rounded-full appearance-none cursor-pointer accent-[#1A4D2E]"
              />
            </>
          )}

          {/* Step 6: Como conheceu */}
          {step === 6 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Como você conheceu o Nutri.ai?</h3>
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
            </>
          )}

          {/* Step 7: Experiência */}
          {step === 7 && (
            <>
              <h3 className="text-2xl font-serif text-[#1A4D2E] mb-6 text-center">Como você avalia sua experiência até agora?</h3>
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
                  value={answers.feedback}
                  onChange={(e) => handleAnswer('feedback', e.target.value)}
                  placeholder="Compartilhe sua opinião..."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all"
                ></textarea>
              </div>
            </>
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
              {step < 7 ? 'Próximo' : 'Concluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyModal;
