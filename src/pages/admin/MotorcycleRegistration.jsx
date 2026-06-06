import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Bike, ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { maskYear } from '../../utils/masks';

export function MotorcycleRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { available: true, mileage: 0 }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        renavam: data.renavam, brand: data.brand, model: data.model, plate: data.plate,
        year: data.year, color: data.color, chassis: data.chassis,
        mileage: parseInt(data.mileage, 10),
        available: String(data.available) === 'true'
      };

      await MotorcycleService.createMotorcycle(payload);
      toast.success('Moto registada com sucesso na frota!');
      navigate('/admin/motos');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registar moto. Verifique os dados fornecidos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/motos" className="p-2 bg-gray-darker text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-mid"><ArrowLeft size={24} /></Link>
        <div><h1 className="text-3xl font-black text-white flex items-center gap-3">Registar Nova Moto</h1><p className="text-gray-400">Adicione um novo veículo à frota da Saqua Locamotos.</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        <section>
          <h3 className="text-lg font-bold text-brand-gold mb-6 flex items-center gap-2"><Bike size={20} /> Detalhes do Veículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Marca *" error={errors.brand}><input {...register('brand', { required: 'Marca é obrigatória' })} className="input-dark" placeholder="Ex: Honda, Yamaha" /></InputField>
            <InputField label="Modelo *" error={errors.model}><input {...register('model', { required: 'Modelo é obrigatório' })} className="input-dark" placeholder="Ex: CG 160 Titan" /></InputField>
            <InputField label="Ano (Fabrico/Modelo) *" error={errors.year}><input {...register('year', { required: 'Ano é obrigatório', pattern: { value: /^[0-9]{4}\/[0-9]{4}$/, message: 'Formato inválido (ex: 2021/2022)' } })} onChange={(e) => setValue('year', maskYear(e.target.value))} className="input-dark" placeholder="Ex: 2021/2022" maxLength={9} /></InputField>
            <InputField label="Cor *" error={errors.color}><input {...register('color', { required: 'Cor é obrigatória' })} className="input-dark" placeholder="Ex: Vermelha" /></InputField>
          </div>
        </section>

        <section className="pt-6 border-t border-gray-mid">
          <h3 className="text-lg font-bold text-brand-gold mb-6 flex items-center gap-2">Identificação Legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Matrícula (Placa) *" error={errors.plate}><input {...register('plate', { required: 'Placa é obrigatória' })} className="input-dark uppercase" placeholder="ABC-1234 ou ABC1D23" /></InputField>
            <InputField label="Renavam *" error={errors.renavam}><input {...register('renavam', { required: 'Renavam é obrigatório' })} className="input-dark" placeholder="Número do Renavam" /></InputField>
            <InputField label="Chassi *" error={errors.chassis}><input {...register('chassis', { required: 'Chassi é obrigatório' })} className="input-dark uppercase" placeholder="Número do Chassi" /></InputField>
            <InputField label="Quilometragem (km) *" error={errors.mileage}><input type="number" {...register('mileage', { required: 'Km obrigatória', min: { value: 0, message: 'Não pode ser negativo' } })} className="input-dark" placeholder="Ex: 0" min="0" /></InputField>
            <div className="md:col-span-2"><InputField label="Disponibilidade Inicial"><select {...register('available')} className="input-dark appearance-none"><option value="true">Disponível para Locação Imediata</option><option value="false">Em Manutenção / Indisponível</option></select></InputField></div>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-mid flex justify-end gap-4">
          <Link to="/admin/motos" className="px-6 py-3 rounded-xl font-bold text-white hover:bg-gray-darker transition-colors border border-transparent">Cancelar</Link>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-lg disabled:opacity-70 transform hover:-translate-y-1">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Registar Moto
          </button>
        </div>
      </form>
      <style>{`.input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; transition: all 0.2s; } .input-dark:focus { outline: none; border-color: #FACC15; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.1); } .input-dark::placeholder { color: #52525b; }`}</style>
    </div>
  );
}

function InputField({ label, children, error }) {
  return <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-300">{label}</label>{children}{error && <span className="text-xs text-brand-red mt-1 font-medium">{error.message}</span>}</div>;
}