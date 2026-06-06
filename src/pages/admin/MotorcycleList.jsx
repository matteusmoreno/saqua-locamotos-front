import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Plus, Search, Gauge, Hash, Fingerprint, ShieldAlert, Loader2, MoreVertical, Edit, FileText, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';
import { MotorcycleDocumentModal } from '../../components/admin/MotorcycleDocumentModal';

export function MotorcycleList() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [docModalMoto, setDocModalMoto] = useState(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  const fetchMotorcycles = async () => {
    try {
      const response = await MotorcycleService.getAllMotorcycles();
      setMotorcycles(response.data);
    } catch (error) {
      console.error("Erro ao buscar motos:", error);
      toast.error('Não foi possível carregar a frota de motos.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMotorcycleStatus = async (motorcycle) => {
    const isActivating = !motorcycle.active;
    
    const isConfirmed = await confirm({
      title: isActivating ? 'Ativar Motocicleta' : 'Desativar Motocicleta',
      message: isActivating 
        ? `Tem a certeza que deseja colocar a moto ${motorcycle.plate} disponível novamente?`
        : `Tem a certeza que deseja desativar a moto ${motorcycle.plate}? O seu registo será mantido, mas não poderá ser alugada.`,
      confirmText: isActivating ? 'Sim, Ativar' : 'Sim, Desativar',
      isDanger: !isActivating
    });

    if (!isConfirmed) return;

    try {
      if (motorcycle.active) {
        await MotorcycleService.disableMotorcycle(motorcycle.motorcycleId);
        toast.success('Moto desativada com sucesso!');
      } else {
        await MotorcycleService.enableMotorcycle(motorcycle.motorcycleId);
        toast.success('Moto ativada com sucesso!');
      }
      fetchMotorcycles();
    } catch (error) {
      toast.error('Erro ao alterar status da moto.');
    }
  };

  const handleDocumentUpdated = (newUrl) => {
    setMotorcycles(prev => prev.map(m => 
      m.motorcycleId === docModalMoto.motorcycleId ? { ...m, documentUrl: newUrl } : m
    ));
  };

  const filteredMotorcycles = motorcycles.filter(moto => 
    moto.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moto.plate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <MotorcycleDocumentModal 
        isOpen={!!docModalMoto}
        onClose={() => setDocModalMoto(null)}
        motorcycleId={docModalMoto?.motorcycleId}
        documentUrl={docModalMoto?.documentUrl}
        onUpdateSuccess={handleDocumentUpdated}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3"><Bike className="text-brand-gold" size={32} /> Frota de Motos</h1>
          <p className="text-gray-400">Faça a gestão dos veículos disponíveis para locação.</p>
        </div>
        
        <Link to="/admin/motos/nova" className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] transform hover:-translate-y-1">
          <Plus size={20} /> Nova Moto
        </Link>
      </div>

      <div className="bg-black-rich border border-gray-mid p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Search size={20} /></div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-xl text-white placeholder:text-gray-500 transition-all outline-none" placeholder="Buscar por marca, modelo ou matrícula (placa)..."/>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 size={48} className="animate-spin text-brand-gold mb-4" /><p className="text-gray-400">A carregar frota...</p></div>
      ) : filteredMotorcycles.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center flex flex-col items-center">
          <ShieldAlert size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma moto encontrada</h3>
          {!searchTerm && <Link to="/admin/motos/nova" className="text-brand-gold font-bold hover:underline">Registar minha primeira moto</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMotorcycles.map((moto) => (
            <motion.div key={moto.motorcycleId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-black-rich border hover:border-brand-gold/50 rounded-2xl p-6 transition-all hover:shadow-[0_10px_30px_rgba(250,204,21,0.05)] group relative ${moto.active ? 'border-gray-mid' : 'border-brand-red/30 opacity-75'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-darker border-2 border-gray-mid flex items-center justify-center overflow-hidden">
                    {moto.pictureUrl ? <img src={moto.pictureUrl} alt={moto.model} className="w-full h-full object-cover" /> : <Bike size={32} className="text-gray-500" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">{moto.brand}</h3>
                    <p className="text-brand-gold font-medium">{moto.model} - {moto.year}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {moto.active ? <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Ativa</span> : <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase">Inativa</span>}
                  {moto.available && moto.active ? <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">Disponível</span> : !moto.available && moto.active ? <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">Alugada</span> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400"><Hash size={16} className="text-gray-500" /><span className="text-white font-mono bg-gray-darker px-2 py-0.5 rounded">{moto.plate}</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-400"><Gauge size={16} className="text-gray-500" /><span className="text-white">{moto.mileage} km</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-400 col-span-2"><Fingerprint size={16} className="text-gray-500" /><span className="text-gray-300">Renavam: {moto.renavam}</span></div>
              </div>

              <div className="pt-4 border-t border-gray-mid flex justify-between gap-3">
                <button onClick={() => toggleMotorcycleStatus(moto)} className={`flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-colors ${moto.active ? 'bg-gray-dark hover:bg-brand-red/20 text-brand-red' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'}`} title={moto.active ? "Desativar Moto" : "Ativar Moto"}>
                  {moto.active ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <Link to={`/admin/motos/${moto.motorcycleId}/editar`} className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-mid text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  <Edit size={16} /> Editar
                </Link>
                <button onClick={() => setDocModalMoto(moto)} className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-brand-gold/10 text-brand-gold py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-brand-gold/30 relative">
                  <FileText size={16} /> CRLV
                  {moto.documentUrl && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-brand-gold rounded-full shadow-lg border border-black-pure"></span>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}