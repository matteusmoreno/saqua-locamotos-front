import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, UserCheck, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Logo from '../assets/saqua-locamotos-logo.png';

// Importando o contexto de autenticação que criamos
import { useAuth } from '../context/AuthContext';

// Schema de validação com Yup
const schema = yup.object().shape({
  email: yup.string().email('Digite um e-mail válido').required('O e-mail é obrigatório'),
  password: yup.string().required('A senha é obrigatória').min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      // Chama a função de login do nosso AuthContext
      const userLogged = await login({ email: data.email, password: data.password });
      
      toast.success(`Bem-vindo ao sistema!`);
      
      // Redireciona baseado no perfil (Ajuste 'ADMIN' para a role exata que seu Quarkus retorna)
      if (userLogged?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/locatario'); // Rota futura para clientes comuns
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
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#1f1f1f', color: '#fff', border: '1px solid #333' },
          success: { iconTheme: { primary: '#FACC15', secondary: '#000' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
        }}
      />
      
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
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">E-mail corporativo ou Pessoal</label>
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
                <label className="block text-sm font-semibold text-gray-300">Sua senha secreta</label>
                <a href="#" className="text-sm font-medium text-brand-gold hover:text-white transition-colors">
                  Esqueceu a senha?
                </a>
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
    </div>
  );
}