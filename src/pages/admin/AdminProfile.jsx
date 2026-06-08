import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  ShieldX,
  Upload,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { UserService } from '../../services/userService';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function Modal({ isOpen, title, subtitle, onClose, children, footer }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[990] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          className="relative w-full max-w-xl rounded-3xl border border-gray-mid bg-black-rich shadow-2xl overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-mid/60 p-6">
            <div>
              <h3 className="text-xl font-black text-white">{title}</h3>
              {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-mid p-2 text-gray-400 hover:text-white hover:bg-gray-darker transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6">{children}</div>
          {footer && <div className="p-6 pt-0">{footer}</div>}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatusBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-400">
        <CheckCircle2 size={14} /> Verificado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-red">
      <ShieldX size={14} /> Nao verificado
    </span>
  );
}

export function AdminProfile() {
  const { user, updateUser } = useAuth();
  const { confirm } = useConfirm();

  const userId = user?.id || user?.userId;
  const photoInputRef = useRef(null);

  const {
    register: registerProfile,
    handleSubmit: submitProfile,
    reset: resetProfile,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: submitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [token, setToken] = useState('');

  const [activeTab, setActiveTab] = useState('profile');

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const emailVerified = Boolean(profile?.emailVerified);

  const inputClass =
    'w-full rounded-xl border border-gray-mid bg-gray-darker px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50';

  const canSubmitProfile = useMemo(
    () => !!userId && !savingProfile && !refreshing,
    [userId, savingProfile, refreshing]
  );

  const canSubmitPassword = useMemo(
    () => !!userId && !savingPassword && !refreshing,
    [userId, savingPassword, refreshing]
  );

  const loadProfile = async (showToast = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (showToast) setRefreshing(true);
      const response = await UserService.getUserById(userId);
      const data = response.data || {};

      setProfile(data);
      setProfilePic(data.pictureUrl || '');

      resetProfile({
        name: data.name || user?.name || '',
        email: data.email || user?.email || '',
      });

      updateUser?.((current) => ({
        ...current,
        name: data.name || current?.name,
        email: data.email || current?.email,
        pictureUrl: data.pictureUrl ?? current?.pictureUrl,
        emailVerified: data.emailVerified ?? current?.emailVerified,
      }));

      if (showToast) toast.success('Perfil atualizado.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile(false);
  }, [userId]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const openPhotoModal = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview('');
    setPhotoModalOpen(true);
  };

  const onSelectPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!photoFile || !userId) return;

    const ok = await confirm({
      title: 'Confirmar nova foto',
      message: 'Deseja aplicar esta nova foto de perfil?',
      confirmText: 'Aplicar foto',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      const response = await UserService.uploadPicture(userId, formData);

      const nextPicture = response.data?.pictureUrl || '';
      setProfilePic(nextPicture);
      setProfile((prev) => ({ ...(prev || {}), pictureUrl: nextPicture }));
      updateUser?.({ pictureUrl: nextPicture });

      setPhotoModalOpen(false);
      toast.success('Foto atualizada com sucesso.');
    } catch (error) {
      console.error(error);
      await confirm({
        title: 'Erro no upload',
        message: error.response?.data?.message || 'Nao foi possivel enviar a foto agora.',
        confirmText: 'Fechar',
        cancelText: 'Ok',
        isDanger: true,
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (data) => {
    if (!userId) return;

    const ok = await confirm({
      title: 'Salvar dados do perfil?',
      message: 'As informacoes serao atualizadas imediatamente.',
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    setSavingProfile(true);
    try {
      const response = await UserService.updateProfile({
        userId,
        name: data.name,
        email: data.email,
      });

      const updated = response.data || {};
      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      updateUser?.({
        name: updated.name || data.name,
        email: updated.email || data.email,
        emailVerified: updated.emailVerified ?? profile?.emailVerified,
      });

      toast.success('Dados pessoais salvos.');
    } catch (error) {
      console.error(error);
      await confirm({
        title: 'Erro ao salvar perfil',
        message: error.response?.data?.message || 'Falha ao salvar dados pessoais.',
        confirmText: 'Fechar',
        cancelText: 'Ok',
        isDanger: true,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (data) => {
    if (!userId) return;

    const ok = await confirm({
      title: 'Confirmar alteracao de senha',
      message: 'Deseja atualizar a senha desta conta agora?',
      confirmText: 'Atualizar senha',
      cancelText: 'Cancelar',
      isDanger: true,
    });

    if (!ok) return;

    setSavingPassword(true);
    try {
      await UserService.updatePassword({
        userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      resetPassword();
      toast.success('Senha atualizada com sucesso.');
    } catch (error) {
      console.error(error);
      await confirm({
        title: 'Erro ao atualizar senha',
        message: error.response?.data?.message || 'Nao foi possivel alterar a senha.',
        confirmText: 'Fechar',
        cancelText: 'Ok',
        isDanger: true,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    if (!userId) return;

    const ok = await confirm({
      title: 'Enviar verificacao de e-mail',
      message: 'Um novo codigo sera enviado para o e-mail cadastrado.',
      confirmText: 'Enviar codigo',
      cancelText: 'Cancelar',
    });

    if (!ok) return;

    setSendingVerification(true);
    try {
      await UserService.sendVerificationEmail(userId);
      toast.success('Codigo enviado por e-mail.');
      setActiveTab('verification');
    } catch (error) {
      console.error(error);
      await confirm({
        title: 'Erro ao enviar verificacao',
        message: error.response?.data?.message || 'Nao foi possivel enviar o codigo agora.',
        confirmText: 'Fechar',
        cancelText: 'Ok',
        isDanger: true,
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleValidateToken = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      await confirm({
        title: 'Token obrigatorio',
        message: 'Informe o token recebido por e-mail para validar a conta.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        isDanger: true,
      });
      return;
    }

    setVerifyingToken(true);
    try {
      await UserService.verifyEmailToken(cleanToken);
      setToken('');
      await loadProfile(false);
      toast.success('E-mail validado com sucesso.');
    } catch (error) {
      console.error(error);
      await confirm({
        title: 'Token invalido',
        message: error.response?.data?.message || 'Token invalido ou expirado.',
        confirmText: 'Fechar',
        cancelText: 'Ok',
        isDanger: true,
      });
    } finally {
      setVerifyingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 size={46} className="mb-4 animate-spin text-brand-gold" />
        <p className="text-gray-400">A carregar perfil do administrador...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-8 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-black text-white">
              <ShieldCheck size={30} className="text-brand-gold" />
              Central de Perfil
            </h1>
            <p className="text-sm text-gray-400">
              Gestão profissional de conta, segurança e verificação de identidade.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-mid bg-gray-darker px-4 py-2.5 font-semibold text-gray-200 transition-colors hover:bg-gray-dark disabled:opacity-60"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Atualizar dados
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-4"
          >
            <div className="overflow-hidden rounded-3xl border border-gray-mid bg-black-rich shadow-lg">
              <div className="h-28 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/25 via-brand-gold/8 to-transparent" />

              <div className="px-6 pb-6 -mt-12">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-black-rich bg-gray-darker shadow-[0_0_16px_rgba(250,204,21,0.18)]">
                    {profilePic ? (
                      <img src={profilePic} alt="Perfil" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={34} className="text-gray-600" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openPhotoModal}
                    className="mt-11 inline-flex items-center gap-2 rounded-lg border border-gray-mid bg-gray-darker px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 transition-colors hover:bg-gray-dark"
                  >
                    <Upload size={13} /> Trocar foto
                  </button>
                </div>

                <div className="mt-4">
                  <h2 className="truncate text-2xl font-black text-white">
                    {watchProfile('name') || user?.name || 'Administrador'}
                  </h2>
                  <p className="mt-1 truncate text-sm text-gray-400">
                    {watchProfile('email') || user?.email || 'Sem e-mail'}
                  </p>
                </div>

                <div className="mt-3">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-400">
                      <CheckCircle2 size={14} /> Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-red">
                      <ShieldX size={14} /> Não verificado
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl border border-gray-mid/60 bg-gray-darker/50 px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">Criado em</span>
                    <span className="font-semibold text-gray-200">{formatDate(profile?.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-mid/60 bg-gray-darker/50 px-3 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500">Atualizado em</span>
                    <span className="font-semibold text-gray-200">{formatDate(profile?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-8 space-y-6"
          >
            <div className="rounded-2xl border border-gray-mid bg-black-rich p-2 shadow-lg">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-brand-gold text-black-pure'
                      : 'bg-gray-darker text-gray-300 hover:bg-gray-dark'
                  }`}
                >
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    activeTab === 'security'
                      ? 'bg-brand-gold text-black-pure'
                      : 'bg-gray-darker text-gray-300 hover:bg-gray-dark'
                  }`}
                >
                  Segurança
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    activeTab === 'verification'
                      ? 'bg-brand-gold text-black-pure'
                      : 'bg-gray-darker text-gray-300 hover:bg-gray-dark'
                  }`}
                >
                  Verificação
                </button>
              </div>
            </div>

            {activeTab === 'profile' && (
              <form onSubmit={submitProfile(handleSaveProfile)} className="rounded-3xl border border-gray-mid bg-black-rich p-6 sm:p-8 shadow-lg">
                <div className="mb-6 border-b border-gray-mid/50 pb-3">
                  <h3 className="text-lg font-bold text-white">Informações pessoais</h3>
                  <p className="text-sm text-gray-400">Atualize nome e e-mail de acesso da conta administrativa.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-400">Nome de exibição</label>
                    <input
                      {...registerProfile('name', {
                        required: 'O nome é obrigatório.',
                        minLength: { value: 3, message: 'Use no mínimo 3 caracteres.' },
                      })}
                      className={inputClass}
                      placeholder="Seu nome"
                    />
                    {profileErrors.name && (
                      <span className="mt-1 text-xs font-medium text-brand-red">{profileErrors.name.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-400">E-mail de acesso</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        {...registerProfile('email', {
                          required: 'O e-mail é obrigatório.',
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Informe um e-mail válido.',
                          },
                        })}
                        className={`${inputClass} pl-11`}
                        placeholder="admin@saqualocamotos.com"
                      />
                    </div>
                    {profileErrors.email && (
                      <span className="mt-1 text-xs font-medium text-brand-red">{profileErrors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end border-t border-gray-mid/50 pt-6">
                  <button
                    type="submit"
                    disabled={!canSubmitProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-7 py-3 font-black text-black-pure transition-all hover:bg-brand-gold-hover disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar perfil
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={submitPassword(handleSavePassword)} className="relative overflow-hidden rounded-3xl border border-brand-red/20 bg-black-rich p-6 sm:p-8 shadow-lg">
                <Lock className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-brand-red opacity-5" />

                <div className="relative z-10 mb-6 border-b border-gray-mid/50 pb-3">
                  <h3 className="text-lg font-bold text-white">Segurança da conta</h3>
                  <p className="text-sm text-gray-400">Atualize a senha com confirmação de ação crítica.</p>
                </div>

                <div className="relative z-10 space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-400">Senha atual</label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: 'A senha atual é obrigatória.' })}
                      className={inputClass}
                      placeholder="••••••••"
                    />
                    {passwordErrors.currentPassword && (
                      <span className="mt-1 text-xs font-medium text-brand-red">{passwordErrors.currentPassword.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-400">Nova senha</label>
                      <input
                        type="password"
                        {...registerPassword('newPassword', {
                          required: 'A nova senha é obrigatória.',
                          minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres.' },
                        })}
                        className={inputClass}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {passwordErrors.newPassword && (
                        <span className="mt-1 text-xs font-medium text-brand-red">{passwordErrors.newPassword.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-gray-400">Confirmar nova senha</label>
                      <input
                        type="password"
                        {...registerPassword('confirmPassword', {
                          required: 'Confirme a nova senha.',
                          validate: (value) => {
                            if (watchPassword('newPassword') !== value) {
                              return 'As senhas não coincidem.';
                            }
                            return true;
                          },
                        })}
                        className={inputClass}
                        placeholder="Repita a nova senha"
                      />
                      {passwordErrors.confirmPassword && (
                        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-red">
                          <ShieldAlert size={14} /> {passwordErrors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex justify-end border-t border-gray-mid/50 pt-6">
                  <button
                    type="submit"
                    disabled={!canSubmitPassword}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-red/30 bg-brand-red/10 px-8 py-3 font-bold text-brand-red transition-all hover:border-brand-red hover:bg-brand-red hover:text-white disabled:opacity-50"
                  >
                    {savingPassword ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
                    Atualizar senha
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'verification' && (
              <section className="rounded-3xl border border-gray-mid bg-black-rich p-6 sm:p-8 shadow-lg">
                <div className="mb-6 border-b border-gray-mid/50 pb-3">
                  <h3 className="text-lg font-bold text-white">Verificação de e-mail</h3>
                  <p className="text-sm text-gray-400">Envie um novo código e valide o token recebido.</p>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-mid/70 bg-gray-darker/40 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Status atual</p>
                    <StatusBadge verified={emailVerified} />
                    <p className="mt-3 text-sm text-gray-400">
                      {emailVerified
                        ? 'Conta já verificada. Nenhuma ação pendente.'
                        : 'Conta ainda não verificada. Solicite um novo código e valide abaixo.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={emailVerified || sendingVerification || verifyingToken}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 font-bold text-brand-gold transition-all hover:bg-brand-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingVerification ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Enviar novo código
                    </button>

                    <button
                      type="button"
                      onClick={handleValidateToken}
                      disabled={emailVerified || verifyingToken || sendingVerification}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 font-bold text-green-400 transition-all hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {verifyingToken ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Validar token
                    </button>
                  </div>

                  {!emailVerified && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Token de verificação</label>
                      <input
                        type="text"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        className={inputClass}
                        placeholder="Cole o token recebido por e-mail"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </motion.section>
        </div>
      </div>

      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Trocar foto de perfil"
        subtitle="Selecione uma imagem e confirme a alteração."
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPhotoModalOpen(false)}
              className="rounded-xl px-5 py-2.5 font-bold text-gray-300 transition-colors hover:bg-gray-darker hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUploadPhoto}
              disabled={!photoFile || uploadingPhoto}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-5 py-2.5 font-bold text-brand-gold transition-colors hover:bg-brand-gold/20 disabled:opacity-50"
            >
              {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Confirmar upload
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-gray-mid bg-gray-darker/60 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-gray-mid bg-black-pure">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : profilePic ? (
                  <img src={profilePic} alt="Atual" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={26} className="text-gray-600" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-300">Imagem de perfil</p>
                <p className="mt-1 text-xs text-gray-500">Formatos sugeridos: JPG ou PNG.</p>
              </div>

              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="rounded-lg border border-gray-mid bg-black-pure px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 transition-colors hover:bg-gray-dark"
              >
                Escolher
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onSelectPhoto}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
