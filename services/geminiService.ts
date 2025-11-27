
import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { UserProfile, DailyPlan, MealItem, LogItem, Recipe } from "../types";

// Helper to handle API key securely
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return key;
};

// Helper to retry functions on failure (e.g. Network Error)
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        console.warn(`API Call failed, retrying... (${retries} left)`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callWithRetry(fn, retries - 1, delay * 2);
    }
};

// Tool Definition for Logging Meals in Chat
const logMealTool: FunctionDeclaration = {
  name: "logMeal",
  description: "Registra uma refeição consumida pelo usuário no diário alimentar. Use esta ferramenta AUTOMATICAMENTE quando o usuário afirmar que comeu, bebeu ou consumiu algo, extraindo as informações.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      foodName: { type: Type.STRING, description: "Nome do alimento consumido" },
      calories: { type: Type.NUMBER, description: "Calorias estimadas (se não informado, estimar)" },
      protein: { type: Type.NUMBER, description: "Proteínas estimadas em gramas (estimar se necessário)" },
      carbs: { type: Type.NUMBER, description: "Carboidratos estimados em gramas (estimar se necessário)" },
      fats: { type: Type.NUMBER, description: "Gorduras estimadas em gramas (estimar se necessário)" },
      mealType: { 
          type: Type.STRING, 
          enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
          description: "Tipo da refeição (Café, Almoço, Jantar, Lanche). Inferir pelo horário ou contexto."
      },
      description: { type: Type.STRING, description: "Uma descrição atraente em português citando os benefícios nutricionais (ex: 'Rico em proteínas que ajudam na recuperação muscular'). OBRIGATÓRIO." }
    },
    required: ["foodName", "calories", "protein", "carbs", "fats", "mealType", "description"]
  }
};

export const generateDietPlan = async (profile: UserProfile): Promise<DailyPlan> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      totalCalories: { type: Type.NUMBER },
      targetMacros: {
        type: Type.OBJECT,
        properties: {
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
        },
        required: ["protein", "carbs", "fats"],
      },
      nutritionalAnalysis: { type: Type.STRING, description: "Análise estratégica do nutricionista explicando o cálculo e o foco." },
      meals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  substitutions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER },
                    },
                    required: ["protein", "carbs", "fats"],
                  }
                },
                required: ["name", "calories", "macros", "description", "substitutions"]
              }
            }
          },
          required: ["type", "items"]
        }
      },
      behavioralTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas de organização, fome, eventos sociais." },
      shoppingList: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de compras essencial." },
      hydrationTarget: { type: Type.NUMBER },
      notes: { type: Type.STRING }
    },
    required: ["totalCalories", "targetMacros", "meals", "notes", "nutritionalAnalysis", "behavioralTips", "shoppingList", "hydrationTarget"]
  };

  const prompt = `
    You are a World-Class Nutritionist following a strict 7-step protocol to generate the perfect diet plan.
    
    PROFILE DATA:
    - Bio: ${profile.age} years, ${profile.gender}, ${profile.height}cm, ${profile.weight}kg.
    - Activity: ${profile.activityLevel}.
    - Main Goal: ${profile.goal}.
    - Medical History: ${profile.medicalHistory || 'None stated'}.
    - Routine & Lifestyle: ${profile.routineDescription || 'Standard'}.
    - Preferences: ${profile.foodPreferences || 'None stated'}.
    - Restrictions: ${profile.restrictions || 'None'}.
    - Meal Freq: ${profile.mealsPerDay} meals/day.

    OUTPUT RULES:
    - Language: Portuguese (Brazil).
    - Tone: Professional, encouraging, and personalized.
    - 'nutritionalAnalysis': Write a paragraph explaining WHY you chose these calories/macros and how it helps their specific goal/condition.
    - 'substitutions': For every food item, provide 1-2 simple alternatives.
    
    Return ONLY JSON matching the schema.
  `;

  return callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7,
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      return JSON.parse(text) as DailyPlan;
  });
};

export const analyzeFoodImage = async (base64Image: string): Promise<MealItem | null> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      calories: { type: Type.NUMBER },
      macros: {
        type: Type.OBJECT,
        properties: {
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
        },
        required: ["protein", "carbs", "fats"],
      },
      description: { type: Type.STRING }
    },
    required: ["name", "calories", "macros", "description"]
  };

  const prompt = "Analyze this food image. Identify the food, estimate portion size, total calories, and macros. Return the description in Portuguese.";

  return callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as MealItem;
  });
};

export const searchFoodAI = async (query: string): Promise<MealItem[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                macros: {
                    type: Type.OBJECT,
                    properties: {
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fats: { type: Type.NUMBER },
                    },
                    required: ["protein", "carbs", "fats"],
                },
                description: { type: Type.STRING }
            },
            required: ["name", "calories", "macros", "description"]
        }
    };

    const prompt = `Search and generate nutritional data for 3-5 food items matching the query: "${query}". Return in Portuguese.`;

    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        return JSON.parse(response.text || "[]");
    }, 2).catch(e => {
        console.error("Search error", e);
        return [];
    });
};

export const generateRecipeAI = async (ingredients: string[]): Promise<Recipe> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            time: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            description: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "time", "calories", "description", "steps"]
    };

    const prompt = `Create a healthy recipe using these ingredients: ${ingredients.join(', ')}. Return in Portuguese.`;

    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        const recipe = JSON.parse(response.text || "{}");
        // Placeholders for now until image gen is applied
        recipe.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
        return recipe;
    });
};

export const generateArticleContentAI = async (title: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Write a short, engaging, and educational article about "${title}" for a nutrition app. Use Markdown. In Portuguese.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] }
        });
        return response.text || "Conteúdo indisponível.";
    } catch (e) {
        return "Erro ao carregar artigo.";
    }
};

export const generateFoodImageAI = async (foodName: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  // Prompt for "Nano Banana" (gemini-2.5-flash-image)
  const prompt = `A realistic, professional food photography shot of ${foodName}. High quality, studio lighting, delicious presentation, 4k, top-down view.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string = "audio/webm"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: "Transcreva este áudio exatamente como falado, em português." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Audio transcription error", error);
    return "";
  }
};

export const chatWithNutritionist = async (
  history: {role: string, parts: {text: string}[]}[], 
  message: string,
  context?: {
    profile?: UserProfile | null,
    plan?: DailyPlan | null,
    log?: LogItem[]
  },
  options?: {
    useThinking?: boolean,
    useSearch?: boolean
  },
  onLogMeal?: (data: MealItem, type: string) => void
) => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    let systemInstruction = `
      Você é a Nutri.ai, um assistente pessoal de nutrição de classe mundial.
      Sua personalidade: Encorajadora, experiente, prática e amigável.
      Idioma: Sempre responda em Português do Brasil.
      Use Markdown para deixar a resposta bonita.
    `;
    
    if (context) {
      // Sanitize context to remove large images from token count
      const sanitize = (key: string, value: any) => {
          if (key === 'image') return undefined;
          return value;
      };

      systemInstruction += `
        CONTEXTO DO USUÁRIO:
        - Perfil: ${JSON.stringify(context.profile)}
        - Plano Alimentar do Dia: ${JSON.stringify(context.plan, sanitize)}
        - Registro de Hoje: ${JSON.stringify(context.log, sanitize)}
      `;
    }

    if (onLogMeal) {
        systemInstruction += `
        \nSE o usuário mencionar que comeu algo, chame a função 'logMeal'.
        `;
    }

    let model = "gemini-2.5-flash"; 
    let config: any = { 
      systemInstruction,
      // Limite de tokens para economia de IA (max 1024 tokens ≈ 3 parágrafos)
      maxOutputTokens: 1024
    };

    if (options?.useThinking) {
      model = "gemini-3-pro-preview";
      config.thinkingConfig = { thinkingBudget: 32768 };
      // Mantém limite de tokens mesmo no modo thinking
      config.maxOutputTokens = 1024;
    } else if (options?.useSearch) {
      model = "gemini-2.5-flash";
      config.tools = [{ googleSearch: {} }];
      // Mantém limite de tokens mesmo no modo search
      config.maxOutputTokens = 1024;
    }

    if (onLogMeal) {
        if (!config.tools) config.tools = [];
        config.tools.push({ functionDeclarations: [logMealTool] });
    }

    return callWithRetry(async () => {
        const chat = ai.chats.create({ model, history, config });
        let result = await chat.sendMessage({ message });
        
        const toolCalls = result.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall);
        
        if (toolCalls && toolCalls.length > 0) {
            const functionResponseParts: any[] = [];
            for (const part of toolCalls) {
                const fc = part.functionCall;
                if (fc.name === 'logMeal' && onLogMeal) {
                    const args = fc.args as any;
                    onLogMeal({
                        name: args.foodName,
                        calories: args.calories,
                        macros: { protein: args.protein, carbs: args.carbs, fats: args.fats },
                        description: args.description || `Uma porção nutritiva de ${args.foodName}.`
                    }, args.mealType);

                    functionResponseParts.push({
                        functionResponse: {
                            id: fc.id, name: fc.name,
                            response: { result: `Successfully logged ${args.foodName}.` }
                        }
                    });
                }
            }
            if (functionResponseParts.length > 0) {
                result = await chat.sendMessage({ message: functionResponseParts });
            }
        }
        
        if (options?.useSearch && result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
             const chunks = result.candidates[0].groundingMetadata.groundingChunks;
             let searchSources = "\n\n## Fontes:\n";
             chunks.forEach((chunk: any) => {
               if (chunk.web?.uri) {
                 searchSources += `- [${chunk.web.title}](${chunk.web.uri})\n`;
               }
             });
             return result.text + searchSources;
        }

        return result.text;
    });
}
