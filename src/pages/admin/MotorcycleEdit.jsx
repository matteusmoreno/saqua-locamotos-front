import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Bike, ArrowLeft, Loader2, Save, Camera, PowerOff, Power, Trash2, Settings, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';
import { maskYear } from '../../utils/masks';

export function MotorcycleEdit() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { confirm } = useConfirm();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [motoPic, setMotoPic] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchMotoData();
  }, [id]);

  const fetchMotoData = async () => {
    try {
      const response = await MotorcycleService.getMotorcycleById(id);
      const data = response.data;
      
      reset({
        brand: data.brand || '',
        model: data.model || '',
        plate: data.plate || '',
        color: data.color || '',
        year: data.year || '',
        renavam: data.renavam || '',
        chassis: data.chassis || '',
        mileage: data.mileage || 0
      });
      
      setMotoPic(data.pictureUrl);
      setIsActive(data.active);
    } catch (error) {
      toast.error('Erro ao carregar dados da moto.');
      navigate('/admin/motos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        motorcycleId: id,
        brand: data.brand || null,
        model: data.model || null,
        plate: data.plate || null,
        color: data.color || null,
        year: data.year || null,
        renavam: data.renavam || null,
        chassis: data.chassis || null,
        mileage: data.mileage ? parseInt(data.mileage, 10) : null
      };

      await MotorcycleService.updateMotorcycle(payload);
      toast.success('Moto atualizada com sucesso!');
      navigate('/admin/motos');
    } catch (error) {
      toast.error('Erro ao atualizar moto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const isActivating = !isActive;
    const isConfirmed = await confirm({
      title: isActivating ? 'Ativar Moto' : 'Desativar Moto',
      message: isActivating 
        ? 'Tem a certeza que deseja colocar esta moto disponível novamente?' 
        : 'Tem a certeza que deseja desativar esta moto?',
      confirmText: isActivating ? 'Sim, Ativar' : 'Sim, Desativar',
      isDanger: !isActivating
    });

    if (isConfirmed) {
      try {
        if (isActive) {
          await MotorcycleService.disableMotorcycle(id);
          toast.success('Moto desativada com sucesso!');
        } else {
          await MotorcycleService.enableMotorcycle(id);
          toast.success('Moto ativada com sucesso!');
        }
        setIsActive(isActivating);
      } catch (error) {
        toast.error('Erro ao alterar status.');
      }
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPic(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await MotorcycleService.uploadPicture(id, formData);
      setMotoPic(res.data.pictureUrl);
      toast.success('Imagem atualizada com sucesso!');
    } catch (err) { 
      toast.error('Falha no upload da imagem.'); 
    } finally {
      setIsUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePicture = async () => {
    const isConfirmed = await confirm({
      title: 'Remover Imagem',
      message: 'Tem a certeza que deseja eliminar a foto desta moto?',
      confirmText: 'Sim, Remover',
      isDanger: true
    });

    if (isConfirmed) {
      try {
        await MotorcycleService.deletePicture(id);
        setMotoPic(null);
        toast.success('Imagem removida com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover a imagem.');
      }
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center p-20"><Loader2 className="animate-spin text-brand-gold mb-4" size={48} /><p className="text-gray-400">A carregar dados...</p></div>;

  const inputClassName = "w-full bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 transition-all outline-none";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/motos" className="p-2.5 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Editar Moto</h1>
            <p className="text-sm text-gray-400">Atualize os dados e a fotografia do veículo.</p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={handleToggleStatus} 
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border ${
            isActive 
              ? 'bg-brand-red/10 text-brand-red border-brand-red/20 hover:bg-brand-red hover:text-white hover:border-brand-red' 
              : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white hover:border-green-500'
          }`}
        >
          {isActive ? <><PowerOff size={18} /> Desativar Moto</> : <><Power size={18} /> Ativar Moto</>}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
        
        {/* ÁREA DA FOTO */}
        <section className="flex flex-col items-center p-6 bg-gray-darker/30 rounded-2xl border border-gray-mid/30">
           <div className="relative w-40 h-40 rounded-2xl bg-gray-darker border-2 border-gray-mid flex items-center justify-center overflow-hidden mb-5 group hover:border-brand-gold/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] transition-all">
             {isUploadingPic ? (
               <Loader2 size={32} className="animate-spin text-brand-gold" />
             ) : motoPic ? (
               <img src={motoPic} className="w-full h-full object-cover" alt="Moto" />
             ) : (
               <ImageIcon className="text-gray-600" size={48} />
             )}
             
             {!isUploadingPic && (
               <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black-pure/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                 <Camera className="text-brand-gold mb-2" size={28} />
                 <span className="text-xs font-bold text-white">Trocar Foto</span>
               </div>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePictureUpload} />
           </div>

           <div className="flex items-center gap-3">
             <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPic} className="flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-white transition-colors bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 px-5 py-2.5 rounded-xl">
                <Camera size={16} /> {motoPic ? 'Alterar Foto' : 'Adicionar Foto'}
             </button>
             {motoPic && (
               <button type="button" onClick={handleDeletePicture} disabled={isUploadingPic} className="flex items-center gap-2 text-sm font-bold text-brand-red hover:text-white transition-colors bg-brand-red/10 hover:bg-brand-red/20 border border-brand-red/20 px-5 py-2.5 rounded-xl">
                  <Trash2 size={16} /> Remover
               </button>
             )}
           </div>
        </section>

        {/* CAMPOS DE DADOS */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-mid/50">
            <div className="p-2 bg-brand-gold/10 rounded-lg text-brand-gold"><Settings size={20} /></div>
            <h3 className="text-lg font-bold text-white">Dados Técnicos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Marca"><input {...register('brand')} className={inputClassName} /></InputField>
            <InputField label="Modelo"><input {...register('model')} className={inputClassName} /></InputField>
            <InputField label="Ano (Fabrico/Modelo)"><input {...register('year')} onChange={(e) => setValue('year', maskYear(e.target.value))} className={inputClassName} maxLength={9}/></InputField>
            <InputField label="Cor"><input {...register('color')} className={inputClassName} /></InputField>
            <InputField label="Placa"><input {...register('plate')} className={`${inputClassName} uppercase`} /></InputField>
            <InputField label="Renavam"><input {...register('renavam')} className={inputClassName} /></InputField>
            <InputField label="Chassi"><input {...register('chassis')} className={`${inputClassName} uppercase`} /></InputField>
            <InputField label="Quilometragem Atual (km)"><input type="number" {...register('mileage')} className={inputClassName} min="0" /></InputField>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-mid flex justify-end gap-3">
          <Link to="/admin/motos" className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-darker transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)] disabled:opacity-70 transform hover:-translate-y-1 cursor-pointer">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
            Salvar Alterações
          </button>
        </div>
      </form>
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