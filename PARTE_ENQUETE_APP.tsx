// ============================================
// PARTE DA ENQUETE NO App.tsx
// ============================================
// Este arquivo contém apenas a parte relacionada à enquete do App.tsx

// 1. IMPORT
import SurveyModal from './components/SurveyModal';

// 2. STATE
const [showSurvey, setShowSurvey] = useState(false); // Flag para mostrar enquete

// 3. LÓGICA PARA MOSTRAR ENQUETE NO PRIMEIRO ACESSO (onGetStarted)
// Localização: dentro da função onGetStarted no LandingPage

console.log('✅ [DEBUG] Verificando se deve mostrar enquete...');

// Verificar se deve mostrar enquete (para novos usuários que ainda não responderam)
// A enquete coleta dados básicos e gera o plano, então deve aparecer se não foi respondida
try {
  const hasCompleted = await surveyService.hasCompletedSurvey(user.id);
  if (!hasCompleted && !isDeveloper) {
    console.log('📋 [DEBUG] Mostrando enquete para novo usuário (primeiro acesso)');
    // Mostrar enquete antes de ir para dashboard
    // A enquete vai coletar dados básicos e gerar o plano
    setShowSurvey(true);
  } else {
    // Se já respondeu enquete, verificar se tem plano
    if (!dietPlan) {
      // Se não tem plano mas tem perfil, gerar plano
      if (profile && profile.name && profile.age && profile.height && profile.weight) {
        console.log('🔄 [DEBUG] Usuário tem perfil mas não tem plano, gerando...');
        setView('generating');
        setIsGenerating(true);
        try {
          const newPlan = await generateDietPlan(profile);
          setDietPlan(newPlan);
          await planService.savePlan(newPlan, user.id);
          setView('diet_plan');
        } catch (error) {
          console.error('❌ [DEBUG] Erro ao gerar plano:', error);
          setView('dashboard');
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.log('✅ [DEBUG] Enquete já respondida, indo para dashboard');
        setView('dashboard');
      }
    } else {
      console.log('✅ [DEBUG] Enquete já respondida e tem plano, indo para dashboard');
      setView('dashboard');
    }
  }
} catch (error) {
  console.error('❌ [DEBUG] Erro ao verificar enquete:', error);
  setView('dashboard');
}

// 4. RENDERIZAÇÃO DO MODAL DE ENQUETE
// Localização: no final do componente, antes do fechamento

{/* Survey Modal */}
{showSurvey && (
    <SurveyModal
        onClose={async () => {
            setShowSurvey(false);
            // Se estava no onboarding, continuar gerando plano
            if (isNewUser && userProfile) {
                setView('generating');
                setIsGenerating(true);
                try {
                    const plan = await generateDietPlan(userProfile);
                    setDietPlan(plan);
                    setView('diet_plan');
                } catch (error) {
                    console.error("Failed to generate plan", error);
                    alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                    setView('onboarding');
                } finally {
                    setIsGenerating(false);
                }
            } else if (view === 'landing') {
                // Se estava na landing, ir para dashboard
                setView('dashboard');
            }
        }}
        onSubmit={async (answers) => {
            try {
                const user = await authService.getCurrentUser();
                if (user) {
                    // Salvar enquete
                    await surveyService.saveSurvey(user.id, {
                        howDidYouFindUs: answers.howDidYouFindUs,
                        mainGoal: answers.mainGoal || '',
                        experience: answers.experience,
                        feedback: answers.feedback
                    });
                    console.log('✅ Enquete salva com sucesso');
                    
                    // Se a enquete tem dados básicos (nome, idade, etc), criar/atualizar perfil
                    if (answers.name && answers.age && answers.height && answers.weight) {
                        const profile: UserProfile = {
                            name: answers.name,
                            age: answers.age,
                            gender: answers.gender,
                            height: answers.height,
                            weight: answers.weight,
                            activityLevel: answers.activityLevel,
                            goal: answers.goal,
                            restrictions: '',
                            mealsPerDay: 3,
                            medicalHistory: '',
                            routineDescription: '',
                            foodPreferences: '',
                            streak: 0,
                            lastActiveDate: new Date().toISOString(),
                            pantryItems: [],
                            aiVoice: 'Kore'
                        };
                        
                        // Salvar perfil
                        await profileService.saveProfile(profile, user.id);
                        setUserProfile(profile);
                        setIsNewUser(true);
                        console.log('✅ Perfil criado a partir da enquete');
                        
                        // Sempre gerar plano após enquete (primeiro acesso)
                        setView('generating');
                        setIsGenerating(true);
                        try {
                            const newPlan = await generateDietPlan(profile);
                            setDietPlan(newPlan);
                            await planService.savePlan(newPlan, user.id);
                            console.log('✅ Plano gerado após enquete');
                            setView('diet_plan');
                        } catch (error) {
                            console.error("Failed to generate plan", error);
                            alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                            setView('dashboard');
                        } finally {
                            setIsGenerating(false);
                        }
                    } else {
                        // Se não tem dados básicos, apenas fechar enquete e ir para dashboard
                        setView('dashboard');
                    }
                }
            } catch (error) {
                console.error('Erro ao salvar enquete:', error);
            }
            
            setShowSurvey(false);
            
            // Se estava no onboarding, continuar gerando plano
            if (isNewUser && userProfile && !answers.name) {
                setView('generating');
                setIsGenerating(true);
                try {
                    const plan = await generateDietPlan(userProfile);
                    setDietPlan(plan);
                    setView('diet_plan');
                } catch (error) {
                    console.error("Failed to generate plan", error);
                    alert("Ocorreu um erro ao gerar seu plano. Tente novamente.");
                    setView('onboarding');
                } finally {
                    setIsGenerating(false);
                }
            } else if (view === 'landing' && !answers.name) {
                // Se estava na landing e não criou perfil, ir para dashboard
                setView('dashboard');
            }
        }}
    />
)}

