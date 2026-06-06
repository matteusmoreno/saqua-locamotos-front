import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, ArrowRight, Loader2, CheckCircle,
  Users, Bike, Calendar, ClipboardCheck, Search, Mail, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { CurrencyInput } from '../../components/CurrencyInput';
import { WizardStepper } from '../../components/admin/contracts/WizardStepper';
import { SelectableCard } from '../../components/admin/contracts/SelectableCard';
import { TypeOptionGrid } from '../../components/admin/financial/TypeOptionGrid';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

const STEPS = [
  { num: 1, label: 'Cliente', icon: Users },
  { num: 2, label: 'Moto', icon: Bike },
  { num: 3, label: 'Termos', icon: Calendar },
  { num: 4, label: 'Revisão', icon: ClipboardCheck },
];

const RENTAL_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensal', hint: 'Pagamentos semanais', icon: Calendar },
  { value: 'FIFTEEN_DAYS', label: '15 Dias', hint: 'Pagamento integral', icon: FileText },
];

const INPUT_STYLES = `
  .input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; transition: all 0.2s; }
  .input-dark.flex { padding: 0; }
  .input-dark:focus, .input-dark:focus-within { outline: none; border-color: #FACC15; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.1); }
  input[type="date"].input-dark { cursor: pointer; }
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

  const { register, handleSubmit, setValue, watch, trigger } = useForm({
    defaultValues: {
      userId: '',
      motorcycleId: '',
      rentalType: 'MONTHLY',
      startDate: '',
      depositAmount: 0,
      weeklyAmount: 0,
    },
  });

  const form = watch();

  useEffect(() => {
    register('userId', { required: true });
    register('motorcycleId', { required: true });
    register('rentalType', { required: true });
    register('startDate', { required: true });
    register('depositAmount', { required: true, min: 0.01 });
    register('weeklyAmount', { required: true, min: 0.01 });
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
    const fieldsByStep = {
      1: ['userId'],
      2: ['motorcycleId'],
      3: ['rentalType', 'startDate', 'depositAmount', 'weeklyAmount'],
    };
    const isValid = await trigger(fieldsByStep[step]);
    if (!isValid) {
      toast.error('Preencha os campos obrigatórios antes de continuar.');
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
            <FileText className="text-brand-gold" size={32} /> Novo Contrato
          </h1>
          <p className="text-gray-400 text-sm mt-1">Cadastro progressivo em 4 etapas.</p>
        </div>
      </div>

      {step < 5 && <WizardStepper steps={STEPS} currentStep={step} />}

      <div className="bg-black-rich border border-gray-mid rounded-3xl shadow-2xl overflow-hidden">
        {step === 5 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-6">
            <div className="w-24 h-24 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Contrato Criado!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              O contrato de <span className="text-white font-medium">{selectedCustomer?.name}</span> foi registrado com sucesso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/admin/contratos')} className="bg-brand-gold text-black-pure px-8 py-3 rounded-xl font-bold hover:bg-brand-gold-hover transition-colors cursor-pointer">
                Ver Contratos
              </button>
              <button onClick={() => { setStep(1); setValue('userId', ''); setValue('motorcycleId', ''); }} className="bg-gray-dark text-white px-8 py-3 rounded-xl font-bold border border-gray-mid hover:bg-gray-mid transition-colors cursor-pointer">
                Criar Outro
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Selecione o Cliente</h2>
                    <p className="text-gray-500 text-sm">Escolha o locatário para este contrato de locação.</p>
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
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-1">
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
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Selecione a Moto</h2>
                    <p className="text-gray-500 text-sm">Apenas motos disponíveis para locação.</p>
                  </div>
                  {selectedCustomer && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/20 text-sm">
                      <Users size={14} className="text-brand-gold" />
                      <span className="text-gray-400">Cliente:</span>
                      <span className="text-white font-medium">{selectedCustomer.name}</span>
                    </div>
                  )}
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={motoSearch} onChange={(e) => setMotoSearch(e.target.value)} placeholder="Buscar por placa, modelo ou marca..." className="input-dark pl-11" />
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

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Termos e Valores</h2>
                    <p className="text-gray-500 text-sm">Defina o tipo de locação, datas e valores financeiros.</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-3 block">Tipo de Locação *</label>
                    <TypeOptionGrid
                      options={RENTAL_OPTIONS}
                      value={form.rentalType}
                      onChange={(val) => setValue('rentalType', val, { shouldValidate: true })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Data de Início *</label>
                      <input type="date" {...register('startDate')} className="input-dark" />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-1">
                      <label className="text-sm font-semibold text-gray-300">Duração estimada</label>
                      <div className="input-dark flex items-center text-gray-400 text-sm">
                        {form.rentalType === 'MONTHLY' ? '30 dias (mensal)' : '15 dias'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Caução *</label>
                      <CurrencyInput variant="dark" value={form.depositAmount} onChange={(val) => setValue('depositAmount', val, { shouldValidate: true })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-300">Valor Semanal *</label>
                      <CurrencyInput variant="dark" value={form.weeklyAmount} onChange={(val) => setValue('weeklyAmount', val, { shouldValidate: true })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-10 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Revisão Final</h2>
                    <p className="text-gray-500 text-sm">Confira todos os dados antes de criar o contrato.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Cliente</p>
                      <p className="text-white font-bold">{selectedCustomer?.name}</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <p className="flex items-center gap-2"><Mail size={12} /> {selectedCustomer?.email}</p>
                        <p className="flex items-center gap-2"><Phone size={12} /> {selectedCustomer?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Moto</p>
                      <p className="text-white font-bold">{selectedMotorcycle?.brand} {selectedMotorcycle?.model}</p>
                      <p className="text-brand-gold font-bold text-sm">{selectedMotorcycle?.plate}</p>
                    </div>
                  </div>

                  <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-5 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">Resumo Financeiro</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-gray-500 text-xs mb-1">Tipo</p><p className="text-white font-medium">{RENTAL_TYPE_LABELS[form.rentalType]}</p></div>
                      <div><p className="text-gray-500 text-xs mb-1">Início</p><p className="text-white font-medium">{formatDate(form.startDate)}</p></div>
                      <div><p className="text-gray-500 text-xs mb-1">Caução</p><p className="text-white font-bold">{formatCurrency(form.depositAmount)}</p></div>
                      <div><p className="text-gray-500 text-xs mb-1">Semanal</p><p className="text-brand-gold font-black">{formatCurrency(form.weeklyAmount)}</p></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-6 sm:px-10 py-6 border-t border-gray-mid flex justify-between items-center bg-gray-darker/30">
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
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Criar Contrato</>}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
