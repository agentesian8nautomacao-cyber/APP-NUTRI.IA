import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { authFlowService, authService } from '../services/supabaseService';

interface LoginOrRegisterProps {
  inviteCode?: string; // Código já validado (opcional - se não tiver, é login normal)
  onComplete: () => void;
  onBack: () => void;
}

const LoginOrRegister: React.FC<LoginOrRegisterProps> = ({ inviteCode, onComplete, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLoginMode) {
      // Modo Login
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔐 [DEBUG] LoginOrRegister: Tentando fazer login...');
        await authService.signIn(email.trim(), password);
        console.log('✅ [DEBUG] LoginOrRegister: Login bem-sucedido, chamando onComplete');
        onComplete();
      } catch (err: any) {
        console.error('❌ [DEBUG] LoginOrRegister: Erro no login:', err);
        // Melhorar mensagens de erro
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        if (err?.message) {
          if (err.message.includes('Invalid login credentials') || err.message.includes('Email not confirmed')) {
            errorMessage = 'Email ou senha incorretos. Verifique suas credenciais ou crie uma conta.';
          } else if (err.message.includes('Email')) {
            errorMessage = err.message;
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Modo Cadastro
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      setIsLoading(true);
      try {
        if (inviteCode) {
          await authFlowService.registerWithInvite(email.trim(), password, inviteCode);
        } else {
          // Cadastro sem cupom (free)
          await authService.signUp(email.trim(), password);
        }
        onComplete();
      } catch (err: any) {
        if (err instanceof Error) {
          if (err.message.includes('cupom') || err.message.includes('convite')) {
            setError(err.message);
          } else if (err.message.includes('já está cadastrado') || err.message.includes('already registered')) {
            // Se o erro indica que o usuário já existe, tentar fazer login automaticamente
            setError('Este e-mail já está cadastrado. Tentando fazer login...');
            setIsLoading(true);
            try {
              await authService.signIn(email.trim(), password);
              // Login bem-sucedido, continuar fluxo
              onComplete();
            } catch (loginErr: any) {
              // Se o login falhar, mostrar mensagem clara
              setError('Este e-mail já está cadastrado. Verifique sua senha ou faça login.');
              setIsLoginMode(true);
            } finally {
              setIsLoading(false);
            }
            return;
          } else if (err.message.includes('email')) {
            setError('Este e-mail já está cadastrado. Tente fazer login.');
            setIsLoginMode(true);
          } else {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
          }
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>

      {/* Background Fruits */}
      <div className="absolute inset-x-0 top-0 h-32 overflow-hidden opacity-10 pointer-events-none select-none">
        <div className="whitespace-nowrap animate-marquee text-6xl grayscale">
          🍎 🍌 🍇 🍊 🍓 🥑 🥦 🥕 🌽 🥯 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥙 🥚 🥘 🍲 🥣 🥗 🍿 
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-[#1A4D2E] mb-2">Nutri.ai</h1>
          <p className="text-[#4F6F52] font-medium">
            {isLoginMode ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-[#1A4D2E]/10">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-[#1A4D2E] mb-2">
              {isLoginMode ? 'Login' : 'Cadastro'}
            </h2>
            <p className="text-sm text-[#4F6F52]">
              {isLoginMode 
                ? 'Entre com seu e-mail e senha'
                : 'Defina seu e-mail e senha para continuar'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-[#4F6F52] uppercase mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F52]" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete={isLoginMode ? "email" : "email"}
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-[#4F6F52] uppercase mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F52]" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLoginMode ? 'Sua senha' : 'Mínimo 6 caracteres'}
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F6F52] hover:text-[#1A4D2E] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only in register mode) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-bold text-[#4F6F52] uppercase mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F52]" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-[#1A4D2E]/20 bg-white text-[#1A4D2E] focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/10 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F6F52] hover:text-[#1A4D2E] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-[2rem] font-serif text-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2
                ${isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1A4D2E] text-[#F5F1E8] hover:shadow-2xl hover:scale-[1.02] hover:bg-[#143d24]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{isLoginMode ? 'Entrando...' : 'Criando conta...'}</span>
                </>
              ) : (
                <>
                  <span>{isLoginMode ? 'Entrar' : 'Concluir Cadastro'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
              }}
              className="text-sm text-[#4F6F52] hover:text-[#1A4D2E] font-medium transition-colors"
            >
              {isLoginMode 
                ? 'Não tem conta? Criar conta' 
                : 'Já tem conta? Fazer login'
              }
            </button>
          </div>

          {/* Back Button */}
          {inviteCode && (
            <button
              onClick={onBack}
              className="w-full mt-4 py-3 text-[#4F6F52] font-medium text-sm hover:text-[#1A4D2E] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar para código de convite
            </button>
          )}
          {!inviteCode && (
            <button
              onClick={onBack}
              className="w-full mt-4 py-3 text-[#4F6F52] font-medium text-sm hover:text-[#1A4D2E] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginOrRegister;

