
import React, { useState } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Flame, Utensils } from 'lucide-react';
import { generateRecipeAI } from '../services/geminiService';
import { Recipe } from '../types';

const SmartMeal: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const handleAddIngredient = () => {
    if (currentInput.trim()) {
      setIngredients([...ingredients, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    try {
      const recipe = await generateRecipeAI(ingredients);
      setGeneratedRecipe(recipe);
    } catch (e) {
      alert("Erro ao gerar receita.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 pb-28 min-h-screen animate-in slide-in-from-bottom duration-500 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#1A4D2E] flex items-center gap-2"><ChefHat className="text-[#4F6F52]" /> Refeição Inteligente</h2>
        <p className="text-[#4F6F52] mt-2">O que você tem na geladeira? Diga-nos os ingredientes e criaremos uma receita perfeita.</p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#1A4D2E]/5 mb-6">
        <div className="flex gap-2 mb-4">
          <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} placeholder="Ex: Frango, Batata Doce..." className="flex-1 bg-[#F5F1E8] rounded-xl px-4 py-3 outline-none text-[#1A4D2E]" />
          <button onClick={handleAddIngredient} className="bg-[#1A4D2E] text-[#F5F1E8] p-3 rounded-xl hover:bg-[#4F6F52] transition-colors"><Plus size={24} /></button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[3rem]">
          {ingredients.map((ing, idx) => (
            <span key={idx} className="bg-[#E8F5E9] text-[#1A4D2E] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-in zoom-in">{ing}<button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}><X size={14} /></button></span>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={ingredients.length === 0 || isGenerating} className={`w-full py-4 rounded-[2rem] font-serif text-xl flex items-center justify-center gap-2 transition-all shadow-lg ${ingredients.length > 0 ? 'bg-[#1A4D2E] text-[#F5F1E8]' : 'bg-gray-200 text-gray-400'}`}>
        {isGenerating ? <Sparkles className="animate-spin" /> : <><Sparkles size={20} /> Criar Receita Mágica</>}
      </button>

      {generatedRecipe && (
        <div className="mt-8 bg-white rounded-[2.5rem] overflow-hidden shadow-xl animate-in slide-in-from-bottom duration-700">
          <div className="h-48 overflow-hidden relative">
            <img src={generatedRecipe.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><h3 className="text-white font-serif text-2xl">{generatedRecipe.title}</h3></div>
          </div>
          <div className="p-6">
             <div className="flex justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-[#4F6F52]"><Clock size={18} /> <span>{generatedRecipe.time}</span></div>
                <div className="flex items-center gap-2 text-[#4F6F52]"><Flame size={18} /> <span>{generatedRecipe.calories} kcal</span></div>
                <div className="flex items-center gap-2 text-[#4F6F52]"><Utensils size={18} /> <span>Fácil</span></div>
             </div>
             <p className="text-[#1A4D2E] mb-6 leading-relaxed">{generatedRecipe.description}</p>
             <h4 className="font-serif text-xl text-[#1A4D2E] mb-4">Modo de Preparo</h4>
             <ul className="space-y-3">{generatedRecipe.steps.map((step, idx) => <li key={idx} className="flex gap-3 text-[#4F6F52]"><span className="w-6 h-6 rounded-full bg-[#1A4D2E]/10 text-[#1A4D2E] flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span><span className="flex-1">{step}</span></li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
};
export default SmartMeal;
