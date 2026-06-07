import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MapPin, CheckCircle, ArrowRight, ArrowLeft, Loader2, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { maskCpf, maskPhone, maskCep } from '../../utils/masks';
import { UserService } from '../../services/userService';
import { AddressService } from '../../services/addressService';

export function CustomerRegistration() {
  const [step, setStep] = useState(1);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, trigger } = useForm({
    defaultValues: { maritalStatus: 'SINGLE' }
  });

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
        toast.success('Endereço encontrado!', { id: 'cep-toast' });
      } catch (error) {
        toast.error('CEP não encontrado. Por favor, preencha manualmente.', { id: 'cep-toast', duration: 4000 });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['name', 'email', 'cpf', 'phone', 'rg'] 
      : ['address.zipCode', 'address.street', 'address.number', 'address.neighborhood', 'address.city', 'address.state'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name, email: data.email, phone: data.phone, cpf: data.cpf, rg: data.rg,
        occupation: data.occupation, maritalStatus: data.maritalStatus,
        address: {
          zipCode: data.address.zipCode, street: data.address.street, number: data.address.number,
          complement: data.address.complement, neighborhood: data.address.neighborhood,
          city: data.address.city, state: data.address.state
        }
      };
      
      await UserService.createCustomer(payload);
      toast.success('Cliente cadastrado com sucesso!');
      setStep(4);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar cliente. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = "w-full bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 transition-all outline-none";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <UserPlus className="text-brand-gold" size={32} /> Novo Locatário
        </h1>
        <p className="text-gray-400 text-sm">Cadastre um novo cliente no sistema Saqua Locamotos.</p>
      </div>

      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-darker z-0 rounded-full"></div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-gold z-0 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        {[
          { num: 1, label: 'Dados Pessoais', icon: <User size={18}/> },
          { num: 2, label: 'Endereço', icon: <MapPin size={18}/> },
          { num: 3, label: 'Confirmação', icon: <CheckCircle size={18}/> }
        ].map((item) => (
          <div key={item.num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 ${step >= item.num ? 'bg-brand-gold border-black-pure text-black-pure' : 'bg-gray-dark border-gray-darker text-gray-500'}`}>
              {step > item.num ? <CheckCircle size={24} /> : item.icon}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${step >= item.num ? 'text-brand-gold' : 'text-gray-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-black-rich border border-gray-mid rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {step === 4 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-24 h-24 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
            <h2 className="text-3xl font-bold text-white mb-4">Cadastro Concluído!</h2>
            <p className="text-gray-400 mb-8">O cliente foi registrado com sucesso na base de dados.</p>
            <button onClick={() => window.location.reload()} className="bg-brand-gold text-black-pure px-8 py-3 rounded-xl font-bold hover:bg-brand-gold-hover transition-colors shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              Cadastrar Novo Cliente
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
                    <div className="p-2 bg-brand-gold/10 rounded-lg text-brand-gold"><User size={20} /></div>
                    <h3 className="text-lg font-bold text-white">Informações do Locatário</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nome Completo *" error={errors.name}><input {...register('name', { required: 'Nome é obrigatório' })} className={inputClassName} placeholder="Ex: João da Silva" /></InputField>
                    <InputField label="E-mail *" error={errors.email}><input type="email" {...register('email', { required: 'E-mail é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'E-mail inválido' } })} className={inputClassName} placeholder="joao@email.com" /></InputField>
                    <InputField label="CPF *" error={errors.cpf}><input {...register('cpf', { required: 'CPF é obrigatório', pattern: { value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, message: 'Formato inválido' } })} onChange={(e) => setValue('cpf', maskCpf(e.target.value))} className={inputClassName} placeholder="000.000.000-00" /></InputField>
                    <InputField label="Telefone / WhatsApp *" error={errors.phone}><input {...register('phone', { required: 'Telefone é obrigatório', pattern: { value: /^\(\d{2}\)\d{5}-\d{4}$/, message: 'Formato inválido' } })} onChange={(e) => setValue('phone', maskPhone(e.target.value))} className={inputClassName} placeholder="(00)00000-0000" /></InputField>
                    <InputField label="Registro Geral (RG) *" error={errors.rg}><input {...register('rg', { required: 'RG é obrigatório' })} className={inputClassName} placeholder="Apenas números e letras" /></InputField>
                    <InputField label="Estado Civil"><select {...register('maritalStatus')} className={`${inputClassName} appearance-none cursor-pointer`}><option value="SINGLE">Solteiro(a)</option><option value="MARRIED">Casado(a)</option><option value="DIVORCED">Divorciado(a)</option><option value="WIDOWED">Viúvo(a)</option></select></InputField>
                    <div className="md:col-span-2"><InputField label="Profissão / Ocupação Atual"><input {...register('occupation')} className={inputClassName} placeholder="Ex: Entregador de Aplicativo" /></InputField></div>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><MapPin size={20} /></div>
                    <h3 className="text-lg font-bold text-white">Localização</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1"><InputField label="CEP *" error={errors.address?.zipCode}><div className="relative"><input {...register('address.zipCode', { required: 'CEP é obrigatório' })} onChange={(e) => setValue('address.zipCode', maskCep(e.target.value))} onBlur={handleCepBlur} className={`${inputClassName} pr-12`} placeholder="00000-000" /><div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">{isLoadingCep ? <Loader2 size={18} className="animate-spin text-brand-gold"/> : <Search size={18}/>}</div></div></InputField></div>
                    <div className="md:col-span-2"><InputField label="Logradouro / Rua *" error={errors.address?.street}><input {...register('address.street', { required: 'Rua é obrigatória' })} className={inputClassName} placeholder="Av. Saquarema" /></InputField></div>
                    <div className="md:col-span-1"><InputField label="Número *" error={errors.address?.number}><input {...register('address.number', { required: 'Número obrigatório' })} className={inputClassName} placeholder="123" /></InputField></div>
                    <div className="md:col-span-2"><InputField label="Complemento"><input {...register('address.complement')} className={inputClassName} placeholder="Apto, Bloco, Casa (Opcional)" /></InputField></div>
                    <InputField label="Bairro *" error={errors.address?.neighborhood}><input {...register('address.neighborhood', { required: 'Bairro obrigatório' })} className={inputClassName} placeholder="Bacaxá" /></InputField>
                    <InputField label="Cidade *" error={errors.address?.city}><input {...register('address.city', { required: 'Cidade obrigatória' })} className={inputClassName} placeholder="Saquarema" /></InputField>
                    <InputField label="Estado (UF) *" error={errors.address?.state}><input {...register('address.state', { required: 'UF obrigatória', maxLength: 2 })} className={`${inputClassName} uppercase`} placeholder="RJ" maxLength={2} /></InputField>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={20} /></div>
                    <h3 className="text-lg font-bold text-white">Revisão de Dados</h3>
                  </div>

                  <div className="bg-gray-darker/50 rounded-2xl p-6 border border-gray-mid/50 space-y-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Dados Pessoais</h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div><span className="text-gray-500 block text-xs">Nome</span> <span className="text-white font-medium">{watch('name')}</span></div>
                        <div><span className="text-gray-500 block text-xs">CPF</span> <span className="text-white font-medium">{watch('cpf')}</span></div>
                        <div><span className="text-gray-500 block text-xs">E-mail</span> <span className="text-white font-medium">{watch('email')}</span></div>
                        <div><span className="text-gray-500 block text-xs">Telefone</span> <span className="text-white font-medium">{watch('phone')}</span></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-mid/50">
                      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Endereço</h3>
                      <div className="text-sm text-gray-300 font-medium leading-relaxed">
                        {watch('address.street')}, {watch('address.number')} {watch('address.complement') && `- ${watch('address.complement')}`} <br />
                        {watch('address.neighborhood')} - {watch('address.city')}/{watch('address.state')} <br />
                        CEP: {watch('address.zipCode')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-gray-mid flex justify-between items-center gap-4">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2.5 font-bold transition-colors">
                  <ArrowLeft size={18} /> Voltar
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-gray-dark hover:bg-gray-mid text-white border border-gray-mid px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
                  Próxima Etapa <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)] transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Confirmar Cadastro</>}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InputField({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-400">{label}</label>
      {children}
      {error && <span className="text-xs text-brand-red font-medium">{error.message}</span>}
    </div>
  );
}