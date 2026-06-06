import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Bike, ArrowLeft, Loader2, Save, Camera, PowerOff, Power, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';
import { maskYear } from '../../utils/masks';

export function MotorcycleEdit() {
  const { id } = useParams(); // id na rota é o motorcycleId
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { confirm } = useConfirm();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [motoPic, setMotoPic] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

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
      // Montamos o payload manualmente para garantir que não vai lixo (ou NaN) pro Quarkus
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

  // UPLOAD DA FOTO
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
      // Limpa o input para permitir selecionar a mesma imagem novamente se necessário
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // REMOÇÃO DA FOTO
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-gold" size={48} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/motos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-black text-white">Editar Moto</h1>
        </div>
        <button onClick={handleToggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium ${isActive ? 'bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}>
          {isActive ? <><PowerOff size={18} /> Desativar Moto</> : <><Power size={18} /> Ativar Moto</>}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* ÁREA DA FOTO */}
        <div className="flex flex-col items-center mb-8">
           <div className="relative w-40 h-40 rounded-2xl bg-gray-dark border border-gray-mid flex items-center justify-center overflow-hidden mb-4 group shadow-lg">
             {isUploadingPic ? (
               <Loader2 size={32} className="animate-spin text-brand-gold" />
             ) : motoPic ? (
               <img src={motoPic} className="w-full h-full object-cover" alt="Moto" />
             ) : (
               <Bike className="text-gray-600" size={48} />
             )}
             
             {/* Overlay de hover só aparece se NÃO estiver a carregar */}
             {!isUploadingPic && (
               <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black-pure/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Camera className="text-brand-gold" size={32} />
               </div>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePictureUpload} />
           </div>

           {/* Botões de Ação para a Foto */}
           <div className="flex items-center gap-3">
             <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPic} className="flex items-center gap-2 text-sm font-medium text-brand-gold hover:text-white transition-colors bg-brand-gold/10 hover:bg-brand-gold/20 px-4 py-2 rounded-xl">
                <Camera size={16} /> Alterar Foto
             </button>
             {motoPic && (
               <button type="button" onClick={handleDeletePicture} disabled={isUploadingPic} className="flex items-center gap-2 text-sm font-medium text-brand-red hover:text-white transition-colors bg-brand-red/10 hover:bg-brand-red/20 px-4 py-2 rounded-xl">
                  <Trash2 size={16} /> Remover
               </button>
             )}
           </div>
        </div>

        {/* CAMPOS DE DADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Marca"><input {...register('brand')} className="input-dark" /></InputField>
          <InputField label="Modelo"><input {...register('model')} className="input-dark" /></InputField>
          <InputField label="Ano (Fabrico/Modelo)"><input {...register('year')} onChange={(e) => setValue('year', maskYear(e.target.value))} className="input-dark" maxLength={9}/></InputField>
          <InputField label="Cor"><input {...register('color')} className="input-dark" /></InputField>
          <InputField label="Matrícula (Placa)"><input {...register('plate')} className="input-dark uppercase" /></InputField>
          <InputField label="Renavam"><input {...register('renavam')} className="input-dark" /></InputField>
          <InputField label="Chassi"><input {...register('chassis')} className="input-dark uppercase" /></InputField>
          <InputField label="Quilometragem (km)"><input type="number" {...register('mileage')} className="input-dark" min="0" /></InputField>
        </div>

        <div className="pt-8 border-t border-gray-mid flex justify-end gap-4">
          <Link to="/admin/motos" className="px-6 py-3 rounded-xl font-bold text-white hover:bg-gray-darker transition-colors border border-transparent">Cancelar</Link>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-8 py-3 rounded-xl font-black transition-all shadow-lg disabled:opacity-70 transform hover:-translate-y-1">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Salvar Alterações
          </button>
        </div>
      </form>
      <style>{`.input-dark { width: 100%; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 0.75rem; padding: 0.875rem 1rem; color: white; transition: all 0.2s; } .input-dark:focus { outline: none; border-color: #FACC15; box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.1); }`}</style>
    </div>
  );
}

function InputField({ label, children }) {
  return <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-300">{label}</label>{children}</div>;
}