// Configurações globais do app

export const APP_CONFIG = {
  // URL para gerenciamento de conta (sem preço/link de compra - compliance Google Play)
  ACCOUNT_MANAGEMENT_URL: 'https://pagina-de-vendas-nutriai.vercel.app/', // Ajuste para sua URL real
  
  // Limites de uso
  VOICE_DAILY_LIMIT_SECONDS: 900, // 15 minutos
  TEXT_DAILY_LIMIT_MESSAGES: 600,
  
  // Configurações de IA
  MAX_OUTPUT_TOKENS: 1024, // ≈ 3 parágrafos
};

