import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, Lock, Camera, Save, ShieldCheck, Mail, Loader2, 
  Image as ImageIcon, KeyRound, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

// Importe o seu contexto de autenticação e serviço de utilizador
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService'; // ou AuthService, dependendo de onde estiver a sua API

export function AdminProfile() {
  const { user, login } = useAuth(); // Assume-se que tem uma forma de atualizar o contexto
  const fileInputRef = useRef(null);

  // Form para Dados Pessoais
  const { register: regPersonal, handleSubmit: handlePersonal, reset: resetPersonal } = useForm();
  
  // Form para Troca de Senha
  const { 
    register: regPass, 
    handleSubmit: handlePass, 
    reset: resetPass, 
    watch: watchPass, 
    formState: { errors: errorsPass } 
  } = useForm();

  // Estados
  const [isSubmittingPersonal, setIsSubmittingPersonal] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  // Preenche os dados quando o componente monta
  useEffect(() => {
    if (user) {
      resetPersonal({
        name: user.name || '',
        email: user.email || '',
      });
      setProfilePic(user.pictureUrl || null);
    }
  }, [user, resetPersonal]);

  // --- HANDLERS ---

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPic(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Substitua pelo seu endpoint real de upload de foto do admin
      const response = await UserService.uploadPicture(user.id || user.userId, formData);
      setProfilePic(response.data.pictureUrl);
      toast.success('Foto de perfil atualizada com sucesso!');
      
      // Opcional: Atualizar o contexto global de auth com a nova foto
      // login({ ...user, pictureUrl: response.data.pictureUrl });
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onPersonalSubmit = async (data) => {
    setIsSubmittingPersonal(true);
    try {
      // Substitua pelo seu endpoint real de atualização de perfil
      const payload = {
        userId: user.id || user.userId,
        name: data.name,
        email: data.email,
      };
      
      await UserService.updateAdminProfile(payload);
      toast.success('Dados pessoais atualizados com sucesso!');
      
      // Opcional: Atualizar o contexto global de auth
      // login({ ...user, name: data.name, email: data.email });
      
    } catch (error) {
      toast.error('Erro ao atualizar os dados pessoais.');
    } finally {
      setIsSubmittingPersonal(false);
    }
  };

  const onPassSubmit = async (data) => {
    setIsSubmittingPass(true);
    try {
      // Substitua pelo seu endpoint real de troca de senha
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      
      await UserService.changePassword(payload);
      toast.success('Senha alterada com sucesso! Utilize-a no próximo login.');
      resetPass(); // Limpa o formulário de senha
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar a senha. Verifique a sua senha atual.');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const inputClassName = "w-full bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 transition-all outline-none";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="text-brand-gold" size={32} />
            Meu Perfil
          </h1>
          <p className="text-gray-400 text-sm">
            Gira as suas informações pessoais, fotografia e configurações de segurança.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: PERFIL & DADOS PESSOAIS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 flex flex-col gap-6"
        >
          {/* CARD DO AVATAR */}
          <div className="bg-black-rich border border-gray-mid rounded-3xl p-8 text-center shadow-lg relative overflow-hidden group">
            {/* Efeito visual de fundo */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-gold/10 to-transparent border-b border-gray-mid/30"></div>
            
            <div className="relative inline-block mb-5 mx-auto mt-4">
              <div className="w-36 h-36 rounded-full border-4 border-black-rich overflow-hidden bg-gray-darker flex items-center justify-center relative shadow-[0_0_20px_rgba(250,204,21,0.15)] group-hover:border-brand-gold/50 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all duration-300">
                {isUploadingPic ? (
                  <Loader2 size={32} className="animate-spin text-brand-gold" />
                ) : profilePic ? (
                  <img src={profilePic} alt="Perfil Admin" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={48} className="text-gray-600" />
                )}
                
                {!isUploadingPic && (
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute inset-0 bg-black-pure/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <Camera size={28} className="text-brand-gold mb-2" />
                    <span className="text-xs uppercase font-bold tracking-wider text-white">Trocar Foto</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePictureUpload}/>
            </div>
            
            <h2 className="text-2xl font-black text-white truncate relative z-10">{user?.name || 'Administrador'}</h2>
            <div className="flex items-center justify-center gap-2 mt-3 relative z-10">
              <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg bg-brand-gold/10 text-brand-gold border border-brand-gold/20 flex items-center gap-1.5">
                <ShieldCheck size={12} /> Master Admin
              </span>
            </div>
          </div>

          {/* FORM: DADOS PESSOAIS */}
          <form onSubmit={handlePersonal(onPersonalSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 shadow-lg flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><User size={18} /></div>
              <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
            </div>

            <div className="space-y-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-400">Nome de Exibição</label>
                <input {...regPersonal('name', { required: true })} className={inputClassName} placeholder="Seu nome" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-400">E-mail de Acesso</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Mail size={18} /></div>
                  <input type="email" {...regPersonal('email', { required: true })} className={`${inputClassName} pl-11`} placeholder="admin@saqualocamotos.com" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmittingPersonal} 
              className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-mid text-white py-3.5 rounded-xl font-bold transition-all border border-gray-mid/50 disabled:opacity-50"
            >
              {isSubmittingPersonal ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
              Guardar Perfil
            </button>
          </form>
        </motion.div>

        {/* COLUNA DIREITA: SEGURANÇA */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 h-full"
        >
          <form onSubmit={handlePass(onPassSubmit)} className="bg-black-rich border border-brand-red/20 rounded-3xl p-6 sm:p-10 shadow-lg h-full flex flex-col relative overflow-hidden group">
            
            <Lock className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 text-brand-red transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-mid/50 relative z-10">
              <div className="p-3 bg-brand-red/10 rounded-xl text-brand-red border border-brand-red/20"><KeyRound size={24} /></div>
              <div>
                <h3 className="text-xl font-bold text-white">Segurança da Conta</h3>
                <p className="text-sm text-gray-400">Mantenha a sua senha atualizada para garantir a segurança do sistema.</p>
              </div>
            </div>

            <div className="space-y-6 max-w-lg relative z-10">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-400">Senha Atual</label>
                <input 
                  type="password" 
                  {...regPass('currentPassword', { required: "A senha atual é obrigatória para fazer a alteração." })} 
                  className={inputClassName} 
                  placeholder="••••••••" 
                />
                {errorsPass.currentPassword && <span className="text-xs text-brand-red font-medium mt-1">{errorsPass.currentPassword.message}</span>}
              </div>

              <div className="pt-4 border-t border-gray-mid/30"></div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-400">Nova Senha</label>
                <input 
                  type="password" 
                  {...regPass('newPassword', { 
                    required: "A nova senha é obrigatória.",
                    minLength: { value: 6, message: "A senha deve ter pelo menos 6 caracteres." }
                  })} 
                  className={inputClassName} 
                  placeholder="Mínimo 6 caracteres" 
                />
                {errorsPass.newPassword && <span className="text-xs text-brand-red font-medium mt-1">{errorsPass.newPassword.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-400">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  {...regPass('confirmPassword', { 
                    required: "Confirme a sua nova senha.",
                    validate: (val) => {
                      if (watchPass('newPassword') != val) {
                        return "As senhas não coincidem.";
                      }
                    }
                  })} 
                  className={inputClassName} 
                  placeholder="Repita a nova senha" 
                />
                {errorsPass.confirmPassword && <span className="text-xs text-brand-red font-medium mt-1 flex items-center gap-1"><ShieldAlert size={14}/> {errorsPass.confirmPassword.message}</span>}
              </div>
              
            </div>

            <div className="mt-auto pt-8 flex justify-end relative z-10">
              <button 
                type="submit" 
                disabled={isSubmittingPass} 
                className="flex items-center gap-2 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/30 hover:border-brand-red px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSubmittingPass ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />} 
                Atualizar Senha
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  );
}