import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, ArrowRight, Loader2, CheckCircle,
  Users, Bike, Calendar, ClipboardCheck, Search, Mail, Phone,
  AlertTriangle, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { CurrencyInput } from '../../components/CurrencyInput';
import { WizardStepper } from '../../components/admin/contracts/WizardStepper';
import { SelectableCard } from '../../components/admin/contracts/SelectableCard';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

const STEPS = [
  { num: 1, label: 'Cliente', icon: Users },
  { num: 2, label: 'Moto', icon: Bike },
  { num: 3, label: 'Termos', icon: Calendar },
  { num: 4, label: 'Revisão', icon: ClipboardCheck },
];

const INPUT_STYLES = `
  .input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; transition: all 0.2s; }
  .input-dark.flex { padding: 0; }
  .input-dark:focus, .input-dark:focus-within { outline: none; border-color: #FACC15; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.1); }
  input[type="date"].input-dark { cursor: pointer; color-scheme: dark; }
`;

export function ContractRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [motoSearch, setMotoSearch] = useState('');

  // Estados locais para verificação de documentos (Obrigatório para avançar)
  const [docsVerified, setDocsVerified] = useState({
    cnh: false,
    residencia: false,
    antecedentes: false
  });

  const { register, handleSubmit, setValue, watch, trigger } = useForm({
    defaultValues: {
      userId: '',
      motorcycleId: '',
      rentalType: 'MONTHLY', // Fixado conforme regra de negócio
      startDate: '',
      depositAmount: 600, // Regra: A partir de R$ 600,00
      weeklyAmount: 300,  // Regra: R$ 300,00 semanal
    },
  });

  const form = watch();

  useEffect(() => {
    register('userId', { required: true });
    register('motorcycleId', { required: true });
    register('rentalType', { required: true });
    register('startDate', { required: true });
    register('depositAmount', { required: true, min: 600 }); // Validação rigorosa
    register('weeklyAmount', { required: true, min: 1 });
    fetchFormData();
  }, [register]);

  const fetchFormData = async () => {
    try {
      setIsLoadingData(true);
      const [customersRes, motorcyclesRes] = await Promise.all([
        UserService.getAllCustomers(),
        MotorcycleService.getAvailableMotorcycles(),
      ]);
      setCustomers(customersRes.data || []);
      setMotorcycles(motorcyclesRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar clientes ou motos.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const selectedCustomer = useMemo(
    () => customers.find(c => c.customerId === form.userId),
    [customers, form.userId]
  );

  const selectedMotorcycle = useMemo(
    () => motorcycles.find(m => m.motorcycleId === form.motorcycleId),
    [motorcycles, form.motorcycleId]
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.cpf?.includes(customerSearch) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredMotorcycles = motorcycles.filter(m =>
    m.plate?.toLowerCase().includes(motoSearch.toLowerCase()) ||
    m.model?.toLowerCase().includes(motoSearch.toLowerCase()) ||
    m.brand?.toLowerCase().includes(motoSearch.toLowerCase())
  );

  const nextStep = async () => {
    if (step === 1) {
      if (!form.userId) {
        return toast.error('Selecione um cliente.');
      }
      if (!docsVerified.cnh || !docsVerified.residencia || !docsVerified.antecedentes) {
        return toast.error('Você precisa confirmar todos os documentos antes de prosseguir.');
      }
    }

    const fieldsByStep = {
      1: ['userId'],
      2: ['motorcycleId'],
      3: ['rentalType', 'startDate', 'depositAmount', 'weeklyAmount'],
    };
    
    const isValid = await trigger(fieldsByStep[step]);
    
    if (!isValid) {
      if (step === 3 && form.depositAmount < 600) {
        toast.error('A caução mínima exigida é de R$ 600,00.');
      } else {
        toast.error('Preencha todos os campos obrigatórios corretamente.');
      }
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await ContractService.createContract({
        userId: data.userId,
        motorcycleId: data.motorcycleId,
        rentalType: data.rentalType,
        startDate: data.startDate,
        depositAmount: Number(data.depositAmount),
        weeklyAmount: Number(data.weeklyAmount),
      });
      toast.success('Contrato criado com sucesso!');
      setStep(5);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao criar o contrato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <style>{INPUT_STYLES}</style>

      <div className="mb-8 flex items-center gap-4">
        <Link to="/admin/contratos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FileText className="text-brand-gold" size={32} /> Novo Contrato Mensal
          </h1>
          <p className="text-gray-400 text-sm mt-1">Abertura de locação com plano padronizado.</p>
        </div>
      </div>

      {step < 5 && <WizardStepper steps={STEPS} currentStep={step} />}

      <div className="bg-black-rich border border-gray-mid rounded-3xl shadow-2xl overflow-hidden">
        {step === 5 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-6">
            <div className="w-24 h-24 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Contrato Ativo!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              A locação mensal de <span className="text-white font-medium">{selectedCustomer?.name}</span> foi registrada com sucesso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/admin/contratos')} className="bg-brand-gold text-black-pure px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors cursor-pointer">
                Ver Contratos
              </button>
              <button onClick={() => window.location.reload()} className="bg-gray-dark text-white px-8 py-3 rounded-xl font-bold border border-gray-mid hover:bg-gray-mid transition-colors cursor-pointer">
                Nova Locação
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* ETAPA 1: Cliente e Documentos */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Selecione o Cliente</h2>
                    <p className="text-gray-500 text-sm">Busque o locatário aprovado na plataforma.</p>
                  </div>
                  
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Buscar por nome, CPF ou e-mail..."
                      className="input-dark pl-11"
                    />
                  </div>
                  
                  <div className="grid gap-3 max-h-60 overflow-y-auto pr-1">
                    {filteredCustomers.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhum cliente encontrado.</p>
                    ) : filteredCustomers.map(c => (
                      <SelectableCard
                        key={c.customerId}
                        selected={form.userId === c.customerId}
                        onClick={() => setValue('userId', c.customerId, { shouldValidate: true })}
                        title={c.name}
                        subtitle={c.cpf}
                        meta={c.email}
                        icon={<span className="font-black text-sm">{c.name?.charAt(0)}</span>}
                      />
                    ))}
                  </div>

                  {/* Checklist de Documentos - Regra de Negócio */}
                  <div className={`mt-6 p-5 rounded-2xl border transition-colors ${form.userId ? 'border-brand-gold/30 bg-brand-gold/5' : 'border-gray-dark bg-gray-darker opacity-50 pointer-events-none'}`}>
                    <div className="flex items-center gap-3 mb-4 text-brand-gold">
                      <AlertTriangle size={20} />
                      <h3 className="font-bold text-sm uppercase tracking-wide">Validação Documental Obrigatória</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 'cnh', label: 'CNH Digital Categoria A válida' },
                        { id: 'residencia', label: 'Comprovante de Residência atualizado' },
                        { id: 'antecedentes', label: 'Atestado de Antecedentes Criminais limpo' }
                      ].map(doc => (
                        <label key={doc.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${docsVerified[doc.id] ? 'bg-brand-gold border-brand-gold text-black-pure' : 'border-gray-500 text-transparent group-hover:border-brand-gold'}`}>
                            <CheckSquare size={14} className={docsVerified[doc.id] ? 'block' : 'hidden'} />
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={docsVerified[doc.id]} 
                            onChange={(e) => setDocsVerified({...docsVerified, [doc.id]: e.target.checked})} 
                          />
                          <span className={docsVerified[doc.id] ? 'text-white' : 'text-gray-400'}>{doc.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ETAPA 2: MOTO */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Selecione a Moto</h2>
                    <p className="text-gray-500 text-sm">Apenas motos liberadas para locação.</p>
                  </div>
                  {selectedCustomer && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-darker border border-gray-dark text-sm">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-gray-400">Cliente atual:</span>
                      <span className="text-white font-medium">{selectedCustomer.name}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={motoSearch} onChange={(e) => setMotoSearch(e.target.value)} placeholder="Buscar por placa ou modelo..." className="input-dark pl-11" />
                  </div>
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-1">
                    {filteredMotorcycles.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhuma moto disponível.</p>
                    ) : filteredMotorcycles.map(m => (
                      <SelectableCard
                        key={m.motorcycleId}
                        selected={form.motorcycleId === m.motorcycleId}
                        onClick={() => setValue('motorcycleId', m.motorcycleId, { shouldValidate: true })}
                        title={`${m.brand} ${m.model}`}
                        subtitle={`Placa: ${m.plate}`}
                        meta={`${m.color || '—'} · ${m.year || '—'}`}
                        icon={<Bike size={18} />}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ETAPA 3: TERMOS FINANCEIROS */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Termos e Valores</h2>
                    <p className="text-gray-500 text-sm">A regra padrão já foi aplicada automaticamente.</p>
                  </div>

                  {/* Card do Plano Mensal Fixo */}
                  <div className="bg-gray-darker border border-gray-mid rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-gold/20 p-3 rounded-lg text-brand-gold">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Plano Mensal</h4>
                        <p className="text-xs text-gray-400">Renovação a cada 30 dias com pagamentos semanais.</p>
                      </div>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} /> Padrão Ativo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Data de Retirada *</label>
                      <input type="date" {...register('startDate')} className="input-dark" />
                    </div>
                    
                    <div className="hidden sm:block"></div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Caução Exigida (Mín: R$ 600) *</label>
                      <CurrencyInput 
                        variant="dark" 
                        value={form.depositAmount} 
                        onChange={(val) => setValue('depositAmount', val, { shouldValidate: true })} 
                      />
                      {form.depositAmount < 600 && (
                        <span className="text-xs text-brand-red mt-1">A caução não pode ser inferior a R$ 600,00</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Valor Semanal *</label>
                      <CurrencyInput 
                        variant="dark" 
                        value={form.weeklyAmount} 
                        onChange={(val) => setValue('weeklyAmount', val, { shouldValidate: true })} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ETAPA 4: REVISÃO FINAL */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Revisão Final</h2>
                    <p className="text-gray-500 text-sm">Confirme os dados antes de gerar o contrato oficial.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Locatário Aprovado</p>
                      <p className="text-white font-bold">{selectedCustomer?.name}</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <p className="flex items-center gap-2"><Mail size={12} /> {selectedCustomer?.email}</p>
                        <p className="flex items-center gap-2"><Phone size={12} /> {selectedCustomer?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Veículo Alocado</p>
                      <p className="text-white font-bold">{selectedMotorcycle?.brand} {selectedMotorcycle?.model}</p>
                      <p className="text-brand-gold font-bold text-sm bg-black-pure px-3 py-1 rounded inline-block mt-1">{selectedMotorcycle?.plate}</p>
                    </div>
                  </div>

                  <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-6 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-2">Acordo Financeiro - Plano Mensal</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Início da Locação</p>
                        <p className="text-white font-medium text-lg">{formatDate(form.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Caução Retida</p>
                        <p className="text-white font-bold text-lg">{formatCurrency(form.depositAmount)}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-brand-gold/20 pt-4 sm:pt-0 sm:pl-6">
                        <p className="text-brand-gold text-xs font-bold mb-1 uppercase">A Pagar / Semana</p>
                        <p className="text-white font-black text-2xl">{formatCurrency(form.weeklyAmount)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-6 sm:px-10 py-6 border-t border-gray-mid flex justify-between items-center bg-black-pure rounded-b-3xl">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 font-medium transition-colors cursor-pointer">
                  <ArrowLeft size={20} /> Voltar
                </button>
              ) : <div />}
              
              {step < 4 ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-gray-dark hover:bg-gray-mid text-white border border-gray-mid px-8 py-3 rounded-xl font-bold transition-all cursor-pointer">
                  Próxima Etapa <ArrowRight size={20} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-yellow-400 text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Efetivar Contrato</>}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}