import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, UserCheck, Zap, KeyRound, ShieldCheck, X, Loader2, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../assets/saqua-locamotos-logo.png';

// Importando o contexto de autenticação que criamos
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/userService';

// Schema de validação com Yup
const schema = yup.object().shape({
  email: yup.string().email('Digite um e-mail válido').required('O e-mail é obrigatório'),
  password: yup.string().required('A senha é obrigatória').min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState('request');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  const {
    register: regRequest,
    handleSubmit: submitRequest,
    reset: resetRequestForm,
    formState: { errors: requestErrors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const {
    register: regReset,
    handleSubmit: submitReset,
    reset: resetResetForm,
    watch: watchReset,
    formState: { errors: resetErrors },
  } = useForm({
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });

  const openRecoveryModal = () => {
    setRecoveryStep('request');
    setRecoveryEmail('');
    resetRequestForm({ email: '' });
    resetResetForm({ token: '', newPassword: '', confirmPassword: '' });
    setIsRecoveryOpen(true);
  };

  const closeRecoveryModal = () => {
    setIsRecoveryOpen(false);
  };

  const handleRequestResetCode = async ({ email }) => {
    setIsRequestingCode(true);
    try {
      await UserService.sendResetPasswordEmail(email);
      setRecoveryEmail(email);
      setRecoveryStep('reset');
      toast.success('Código de recuperação enviado para o e-mail informado.');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Não foi possível enviar o código agora.');
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResetPassword = async ({ token, newPassword }) => {
    setIsResettingPassword(true);
    try {
      await UserService.resetPassword({ token, newPassword });
      toast.success('Senha redefinida com sucesso. Faça login com a nova senha.');
      closeRecoveryModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Token inválido ou expirado.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Chama a função de login do nosso AuthContext
      const userLogged = await login({ email: data.email, password: data.password });
      
      toast.dismiss();
      toast.success('Bem-vindo ao sistema!', { duration: 1800 });
      
      // Redireciona baseado no perfil (Ajuste 'ADMIN' para a role exata que seu Quarkus retorna)
      if (userLogged?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userLogged?.role === 'CUSTOMER') {
        navigate('/customer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        toast.error('E-mail ou senha incorretos.');
      } else if (error.response && error.response.status === 404) {
         toast.error('Usuário não encontrado.');
      } else {
        toast.error('Erro ao conectar com o servidor. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-black-pure text-white">
      {/* Lado Esquerdo - Formulário Dark */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative border-r border-gray-mid bg-black-rich">
        <Link 
          to="/" 
          className="absolute top-8 left-8 flex items-center gap-2.5 text-gray-400 hover:text-brand-gold transition-colors font-medium bg-gray-darker px-4 py-2 rounded-xl border border-gray-mid"
        >
          <ArrowLeft size={18} /> Voltar para o site
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-12 text-center lg:text-left flex flex-col items-center lg:items-start">
            <img src={Logo} alt="Saqua Locamotos" className="h-20 w-auto mb-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.2)] lg:hidden" />
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tighter">Acesse sua conta</h2>
            <p className="text-gray-400 text-lg font-light">Painel de controle para locatários e administradores.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            
            {/* Input E-mail */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-gold text-gray-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-12 pr-5 py-4 bg-gray-darker border ${errors.email ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'} rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure transition-all`}
                  placeholder="exemplo@saqualocamotos.com.br"
                />
              </div>
              {errors.email && <p className="mt-2.5 text-sm text-brand-red flex items-center gap-1.5"><Zap size={14} />{errors.email.message}</p>}
            </div>

            {/* Input Senha */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-sm font-semibold text-gray-300">Senha</label>
                <button
                  type="button"
                  onClick={openRecoveryModal}
                  className="text-sm font-medium text-brand-gold hover:text-white transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-gold text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`block w-full pl-12 pr-5 py-4 bg-gray-darker border ${errors.password ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'} rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure transition-all`}
                  placeholder="••••••••••••"
                />
              </div>
              {errors.password && <p className="mt-2.5 text-sm text-brand-red flex items-center gap-1.5"><Zap size={14} />{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-3 py-4.5 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-black text-black-pure bg-brand-gold hover:bg-brand-gold-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure focus:ring-brand-gold transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <div className="w-7 h-7 border-4 border-black-pure border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><UserCheck size={20}/> Entrar no Sistema</>
              )}
            </button>
          </form>
          
          <div className="mt-10 text-center text-gray-600 text-xs">
            Acesso restrito. Protegido por Saqua Locamotos LTDA.
          </div>
        </motion.div>
      </div>

      {/* Lado Direito - Branding Agressivo */}
      <div className="hidden lg:flex w-1/2 bg-gray-darker relative items-center justify-center overflow-hidden p-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1080&auto=format&fit=crop" 
            alt="Detalhe de moto escura" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black-pure via-transparent to-brand-red/20"></div>
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <motion.img 
            src={Logo} 
            alt="Saqua Locamotos" 
            className="h-32 w-auto mb-12 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="border-t border-gray-mid pt-10"
          >
            <h1 className="text-4xl font-light text-gray-300 mb-6 leading-normal tracking-wide">
              Eficiência na gestão, <br />
              <strong className="font-black text-white text-5xl tracking-tighter">potência</strong> na rodagem.
            </h1>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isRecoveryOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRecoveryModal}
              className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              className="relative w-full max-w-lg rounded-3xl border border-gray-mid bg-black-rich shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-mid/60 p-6">
                <div>
                  <h3 className="text-xl font-black text-white">Recuperar Senha</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {recoveryStep === 'request'
                      ? 'Informe seu e-mail para receber o código de recuperação.'
                      : `Cole o token enviado para ${recoveryEmail} e defina uma nova senha.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRecoveryModal}
                  className="rounded-lg border border-gray-mid p-2 text-gray-500 hover:text-white hover:bg-gray-darker transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-gray-mid bg-gray-darker/40 p-2">
                  <div className={`rounded-lg px-3 py-2 text-center text-xs font-bold uppercase tracking-wider ${recoveryStep === 'request' ? 'bg-brand-gold text-black-pure' : 'text-gray-400'}`}>
                    1. Solicitar código
                  </div>
                  <div className={`rounded-lg px-3 py-2 text-center text-xs font-bold uppercase tracking-wider ${recoveryStep === 'reset' ? 'bg-brand-gold text-black-pure' : 'text-gray-400'}`}>
                    2. Redefinir senha
                  </div>
                </div>

                {recoveryStep === 'request' && (
                  <form onSubmit={submitRequest(handleRequestResetCode)} className="space-y-4">
                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-gray-300">E-mail da conta</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-500">
                          <Mail size={20} />
                        </div>
                        <input
                          type="email"
                          {...regRequest('email', {
                            required: 'O e-mail é obrigatório.',
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: 'Informe um e-mail válido.',
                            },
                          })}
                          className={`block w-full rounded-2xl border bg-gray-darker py-4 pl-12 pr-5 text-white placeholder:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure ${requestErrors.email ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'}`}
                          placeholder="seuemail@dominio.com"
                        />
                      </div>
                      {requestErrors.email && <p className="mt-2 text-sm text-brand-red">{requestErrors.email.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isRequestingCode}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gold px-6 py-4 font-black text-black-pure transition-all hover:bg-brand-gold-hover disabled:opacity-60"
                    >
                      {isRequestingCode ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Enviar código
                    </button>
                  </form>
                )}

                {recoveryStep === 'reset' && (
                  <form onSubmit={submitReset(handleResetPassword)} className="space-y-4">
                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-gray-300">Token de recuperação</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-500">
                          <ShieldCheck size={20} />
                        </div>
                        <input
                          type="text"
                          {...regReset('token', { required: 'O token é obrigatório.' })}
                          className={`block w-full rounded-2xl border bg-gray-darker py-4 pl-12 pr-5 text-white placeholder:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure ${resetErrors.token ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'}`}
                          placeholder="Cole aqui o token"
                        />
                      </div>
                      {resetErrors.token && <p className="mt-2 text-sm text-brand-red">{resetErrors.token.message}</p>}
                    </div>

                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-gray-300">Nova senha</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-500">
                          <KeyRound size={20} />
                        </div>
                        <input
                          type="password"
                          {...regReset('newPassword', {
                            required: 'A nova senha é obrigatória.',
                            minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres.' },
                          })}
                          className={`block w-full rounded-2xl border bg-gray-darker py-4 pl-12 pr-5 text-white placeholder:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure ${resetErrors.newPassword ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'}`}
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      {resetErrors.newPassword && <p className="mt-2 text-sm text-brand-red">{resetErrors.newPassword.message}</p>}
                    </div>

                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-gray-300">Confirmar nova senha</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-500">
                          <Lock size={20} />
                        </div>
                        <input
                          type="password"
                          {...regReset('confirmPassword', {
                            required: 'Confirme a nova senha.',
                            validate: (value) => {
                              if (watchReset('newPassword') !== value) return 'As senhas não coincidem.';
                              return true;
                            },
                          })}
                          className={`block w-full rounded-2xl border bg-gray-darker py-4 pl-12 pr-5 text-white placeholder:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black-pure ${resetErrors.confirmPassword ? 'border-brand-red focus:ring-brand-red' : 'border-gray-mid focus:border-brand-gold focus:ring-brand-gold'}`}
                          placeholder="Repita a nova senha"
                        />
                      </div>
                      {resetErrors.confirmPassword && <p className="mt-2 text-sm text-brand-red">{resetErrors.confirmPassword.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep('request')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-mid bg-gray-darker px-6 py-4 font-bold text-gray-200 transition-colors hover:bg-gray-dark"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={isResettingPassword}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-4 font-black text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-60"
                      >
                        {isResettingPassword ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        Redefinir senha
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}