import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FileText, ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { CurrencyInput } from '../../components/CurrencyInput';

export function ContractRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: { depositAmount: 0, weeklyAmount: 0 },
  });

  useEffect(() => {
    register('depositAmount', { required: true, min: 0.01 });
    register('weeklyAmount', { required: true, min: 0.01 });
    fetchFormData();
  }, [register]);

  const fetchFormData = async () => {
    try {
      setIsLoadingData(true);
      const [customersRes, motorcyclesRes] = await Promise.all([
        UserService.getAllCustomers(),
        MotorcycleService.getAvailableMotorcycles()
      ]);
      
      setCustomers(customersRes.data || []);
      setMotorcycles(motorcyclesRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error('Erro ao carregar clientes ou motos.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // O payload deve conter apenas os IDs
      const payload = {
        userId: data.userId, 
        motorcycleId: data.motorcycleId,
        rentalType: data.rentalType,
        startDate: data.startDate,
        depositAmount: Number(data.depositAmount),
        weeklyAmount: Number(data.weeklyAmount),
      };

      await ContractService.createContract(payload);
      toast.success('Contrato criado com sucesso!');
      navigate('/admin/contratos');
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/contratos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-black text-white">Novo Contrato</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-300">Cliente *</label>
            <select {...register('userId', { required: true })} className="input-dark cursor-pointer">
              <option value="">Selecione um cliente...</option>
              {customers.map(c => (
                <option key={c.customerId} value={c.customerId}>
                  {c.name} - CPF: {c.cpf}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-300">Moto *</label>
            <select {...register('motorcycleId', { required: true })} className="input-dark cursor-pointer">
              <option value="">Selecione uma moto...</option>
              {motorcycles.map(m => (
                <option key={m.motorcycleId} value={m.motorcycleId}>
                  {m.brand} {m.model} - Placa: {m.plate}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-300">Tipo de Aluguer *</label>
            <select {...register('rentalType', { required: true })} className="input-dark cursor-pointer">
              <option value="MONTHLY">Mensal</option>
              <option value="FIFTEEN_DAYS">15 Dias</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-300">Data de Início *</label>
            <input type="date" {...register('startDate', { required: true })} className="input-dark" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-300">Caução *</label>
            <CurrencyInput
              variant="dark"
              value={watch('depositAmount')}
              onChange={(val) => setValue('depositAmount', val, { shouldValidate: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-300">Valor Semanal *</label>
            <CurrencyInput
              variant="dark"
              value={watch('weeklyAmount')}
              onChange={(val) => setValue('weeklyAmount', val, { shouldValidate: true })}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-mid flex justify-end gap-4">
          <button type="submit" disabled={isSubmitting} className="bg-brand-gold text-black-pure px-8 py-3 rounded-xl font-black">
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Criar Contrato"}
          </button>
        </div>
      </form>
      
      <style>{`
        .input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; }
        .input-dark.flex { padding: 0; }
        .input-dark:focus, .input-dark:focus-within { outline: none; border-color: #FACC15; }
      `}</style>
    </div>
  );
}