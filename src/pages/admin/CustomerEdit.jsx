import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, MapPin, Save, ArrowLeft, Camera, Loader2, Search, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCpf, maskPhone, maskCep } from '../../utils/masks';
import { UserService } from '../../services/userService';
import { AddressService } from '../../services/addressService';
import { CustomerDocumentsModal } from '../../components/admin/CustomerDocumentsModal';
import { countValidDocuments } from '../../utils/userDocuments';

export function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  const [profilePic, setProfilePic] = useState(null);
  const [userDocuments, setUserDocuments] = useState({});
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm();

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      const response = await UserService.getCustomerById(id);
      const userData = response.data;

      reset({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        cpf: userData.cpf || '',
        rg: userData.rg || '',
        occupation: userData.occupation || '',
        maritalStatus: userData.maritalStatus || 'SINGLE',
        address: userData.address || {}
      });
      
      setProfilePic(userData.pictureUrl);
      setUserDocuments(userData.documents || {});
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados do locatário.');
      navigate('/admin/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = watch('address.zipCode')?.replace(/\D/g, ''); 
    if (cep?.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await AddressService.getAddressByZipCode(cep);
        const data = response.data;
        setValue('address.street', data.street || data.logradouro);
        setValue('address.neighborhood', data.neighborhood || data.bairro);
        setValue('address.city', data.city || data.localidade);
        setValue('address.state', data.state || data.uf);
        toast.success('Endereço encontrado!');
      } catch (error) {
        toast.error('CEP não encontrado. Preencha manualmente.');
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: id, name: data.name, email: data.email, phone: data.phone,
        cpf: data.cpf, rg: data.rg, occupation: data.occupation, maritalStatus: data.maritalStatus,
        address: {
          zipCode: data.address?.zipCode || null, street: data.address?.street || null,
          number: data.address?.number || null, complement: data.address?.complement || null,
          neighborhood: data.address?.neighborhood || null, city: data.address?.city || null,
          state: data.address?.state || null
        }
      };

      await UserService.updateCustomer(payload);
      toast.success('Dados atualizados com sucesso!');
      navigate('/admin/clientes');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar locatário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingPic(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await UserService.uploadPicture(id, formData);
      setProfilePic(response.data.pictureUrl);
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDocumentsUpdated = (updatedDocuments) => {
    setUserDocuments(updatedDocuments || {});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
        <p className="text-gray-400">A carregar dados do locatário...</p>
      </div>
    );
  }

  const inputClassName = "w-full bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 transition-all outline-none";

  const validDocsCount = countValidDocuments(userDocuments);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <CustomerDocumentsModal 
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        userId={id}
        existingDocs={userDocuments}
        onUpdateSuccess={handleDocumentsUpdated}
      />

      <div className="flex items-center gap-4">
        <Link to="/admin/clientes" className="p-2.5 bg-gray-darker text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-mid">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">Editar Locatário</h1>
          <p className="text-gray-400 text-sm">Atualize os dados e documentos do cliente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: PERFIL */}
        <div className="lg:col-span-1">
          <div className="bg-black-rich border border-gray-mid rounded-3xl p-6 text-center shadow-lg h-full flex flex-col">
            <div className="relative inline-block mb-5 mx-auto">
              <div className="w-32 h-32 rounded-full border-2 border-gray-mid overflow-hidden bg-gray-darker flex items-center justify-center relative group hover:border-brand-gold/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-all">
                {isUploadingPic ? (
                  <Loader2 size={32} className="animate-spin text-brand-gold" />
                ) : profilePic ? (
                  <img src={profilePic} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-gray-600" />
                )}
                
                {!isUploadingPic && (
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black-pure/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                    <Camera size={24} className="text-brand-gold mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white">Alterar</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePictureUpload}/>
            </div>
            
            <h2 className="text-xl font-bold text-white truncate">{watch('name') || 'Sem Nome'}</h2>
            <p className="text-sm text-gray-400 mb-6 truncate">{watch('email') || 'Sem e-mail'}</p>
            
            <div className="pt-6 border-t border-gray-mid mt-auto space-y-3">
              <button 
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-3.5 rounded-xl font-bold transition-colors border border-brand-gold/20"
              >
                <FileText size={18} /> 
                Gerir Documentos ({validDocsCount})
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-8 shadow-lg space-y-8 h-full">
            <section>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
                <div className="p-2 bg-brand-gold/10 rounded-lg text-brand-gold"><User size={20} /></div>
                <h3 className="text-lg font-bold text-white">Dados Pessoais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Nome Completo"><input {...register('name')} className={inputClassName} /></InputField>
                <InputField label="E-mail"><input type="email" {...register('email')} className={inputClassName} /></InputField>
                <InputField label="CPF"><input {...register('cpf')} onChange={(e) => setValue('cpf', maskCpf(e.target.value))} className={inputClassName} /></InputField>
                <InputField label="Telefone / WhatsApp"><input {...register('phone')} onChange={(e) => setValue('phone', maskPhone(e.target.value))} className={inputClassName} /></InputField>
                <InputField label="RG"><input {...register('rg')} className={inputClassName} /></InputField>
                <InputField label="Estado Civil">
                  <select {...register('maritalStatus')} className={`${inputClassName} appearance-none cursor-pointer`}>
                    <option value="SINGLE">Solteiro(a)</option>
                    <option value="MARRIED">Casado(a)</option>
                    <option value="DIVORCED">Divorciado(a)</option>
                    <option value="WIDOWED">Viúvo(a)</option>
                  </select>
                </InputField>
                <div className="md:col-span-2"><InputField label="Profissão / Ocupação"><input {...register('occupation')} className={inputClassName} /></InputField></div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><MapPin size={20} /></div>
                <h3 className="text-lg font-bold text-white">Endereço</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <InputField label="CEP">
                    <div className="relative">
                      <input {...register('address.zipCode')} onChange={(e) => setValue('address.zipCode', maskCep(e.target.value))} onBlur={handleCepBlur} className={`${inputClassName} pr-12`} />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {isLoadingCep ? <Loader2 size={18} className="animate-spin text-brand-gold"/> : <Search size={18}/>}
                      </div>
                    </div>
                  </InputField>
                </div>
                <div className="md:col-span-2"><InputField label="Rua / Logradouro"><input {...register('address.street')} className={inputClassName} /></InputField></div>
                <div className="md:col-span-1"><InputField label="Número"><input {...register('address.number')} className={inputClassName} /></InputField></div>
                <div className="md:col-span-2"><InputField label="Complemento"><input {...register('address.complement')} className={inputClassName} /></InputField></div>
                <InputField label="Bairro"><input {...register('address.neighborhood')} className={inputClassName} /></InputField>
                <InputField label="Cidade"><input {...register('address.city')} className={inputClassName} /></InputField>
                <InputField label="Estado (UF)"><input {...register('address.state')} className={`${inputClassName} uppercase`} maxLength={2} /></InputField>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-mid flex justify-end gap-3 mt-auto">
              <Link to="/admin/clientes" className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-darker transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)] disabled:opacity-70 transform hover:-translate-y-1">
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}