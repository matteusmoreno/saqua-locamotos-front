import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Plus, Search, Gauge, Hash, Fingerprint, ShieldAlert, Loader2, Edit, FileText, Power, PowerOff, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotorcycleService } from '../../services/motorcycleService';
import { useConfirm } from '../../context/ConfirmContext';
import { MotorcycleDocumentModal } from '../../components/admin/MotorcycleDocumentModal';

function StatPill({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-gray-darker/50 border border-gray-mid/50 rounded-xl px-4 py-3 text-center min-w-[100px] flex-1 sm:flex-none">
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export function MotorcycleList() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
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

  const stats = useMemo(() => ({
    total: motorcycles.length,
    active: motorcycles.filter(m => m.active).length,
    inactive: motorcycles.filter(m => !m.active).length,
    available: motorcycles.filter(m => m.active && m.available).length,
    rented: motorcycles.filter(m => m.active && !m.available).length,
  }), [motorcycles]);

  const filteredMotorcycles = motorcycles.filter(moto => {
    const matchesSearch = 
      moto.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.plate?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && moto.active) ||
      (statusFilter === 'INACTIVE' && !moto.active) ||
      (statusFilter === 'AVAILABLE' && moto.active && moto.available) ||
      (statusFilter === 'RENTED' && moto.active && !moto.available);

    return matchesSearch && matchesStatus;
  });

  const STATUS_TABS = [
    { key: 'ALL', label: 'Todas as Motos' },
    { key: 'AVAILABLE', label: 'Disponíveis' },
    { key: 'RENTED', label: 'Alugadas' },
    { key: 'ACTIVE', label: 'Ativas' },
    { key: 'INACTIVE', label: 'Inativas' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <MotorcycleDocumentModal 
        isOpen={!!docModalMoto}
        onClose={() => setDocModalMoto(null)}
        motorcycleId={docModalMoto?.motorcycleId}
        documentUrl={docModalMoto?.documentUrl}
        onUpdateSuccess={handleDocumentUpdated}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <Bike className="text-brand-gold" size={32} /> Frota de Motos
          </h1>
          <p className="text-gray-400 text-sm">Gestão completa dos veículos da locadora.</p>
        </div>
        
        <Link to="/admin/motos/nova" className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] transform hover:-translate-y-1">
          <Plus size={20} /> Nova Moto
        </Link>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3">
          <StatPill label="Total Frota" value={stats.total} />
          <StatPill label="Disponíveis" value={stats.available} color="text-blue-400" />
          <StatPill label="Alugadas" value={stats.rented} color="text-orange-400" />
          <StatPill label="Ativas" value={stats.active} color="text-green-500" />
          <StatPill label="Inativas" value={stats.inactive} color="text-brand-red" />
        </div>
      )}

      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-mid scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-darker'
              }`}
            >
              {tab.label}
              {tab.key === 'AVAILABLE' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.available}</span>}
              {tab.key === 'RENTED' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.rented}</span>}
              {tab.key === 'INACTIVE' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.inactive}</span>}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold rounded-xl text-white placeholder:text-gray-500 outline-none transition-all text-sm" 
              placeholder="Buscar por marca, modelo ou matrícula (placa)..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">A carregar frota...</p>
        </div>
      ) : filteredMotorcycles.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center flex flex-col items-center">
          <ShieldAlert size={56} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma moto encontrada</h3>
          {!searchTerm && statusFilter === 'ALL' && (
            <Link to="/admin/motos/nova" className="text-brand-gold font-bold hover:underline">
              Registar primeira moto
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMotorcycles.map((moto, index) => (
            <motion.div 
              key={moto.motorcycleId} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.04 }}
              className={`bg-black-rich border hover:border-brand-gold/50 rounded-2xl overflow-hidden transition-all group relative flex flex-col ${moto.active ? 'border-gray-mid' : 'border-brand-red/30 opacity-75 grayscale-[0.3]'}`}
            >
              <div className="p-5 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/5 to-transparent flex items-start justify-between">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gray-darker border border-gray-mid flex items-center justify-center overflow-hidden shrink-0">
                    {moto.pictureUrl ? <img src={moto.pictureUrl} alt={moto.model} className="w-full h-full object-cover" /> : <Bike size={24} className="text-gray-500" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white uppercase truncate">{moto.brand}</h3>
                    <p className="text-brand-gold text-sm font-medium truncate">{moto.model} - {moto.year}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {moto.active ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Ativa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider">
                      <AlertCircle size={12} /> Inativa
                    </span>
                  )}
                  {moto.active && (
                    moto.available ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        Disponível
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                        Alugada
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="p-5 flex-1">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Hash size={12}/> Matrícula</span>
                    <span className="text-white font-mono bg-gray-darker px-2 py-1 rounded inline-block w-max text-sm border border-gray-mid">{moto.plate}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Gauge size={12}/> Quilometragem</span>
                    <span className="text-gray-300 text-sm font-medium">{moto.mileage?.toLocaleString('pt-BR')} km</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Fingerprint size={12}/> Renavam</span>
                    <span className="text-gray-300 text-sm">{moto.renavam}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-mid/50 flex gap-2 bg-gray-darker/20 mt-auto">
                <button 
                  onClick={() => toggleMotorcycleStatus(moto)} 
                  className={`p-2.5 rounded-lg transition-colors ${moto.active ? 'bg-gray-dark hover:bg-brand-red/20 text-brand-red' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'}`} 
                  title={moto.active ? "Desativar Moto" : "Ativar Moto"}
                >
                  {moto.active ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
                <Link 
                  to={`/admin/motos/${moto.motorcycleId}/editar`} 
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-dark hover:bg-gray-mid text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit size={16} /> Editar
                </Link>
                <button 
                  onClick={() => setDocModalMoto(moto)} 
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-2.5 rounded-lg text-sm font-bold transition-colors border border-brand-gold/20 relative"
                >
                  <FileText size={16} /> CRLV
                  {moto.documentUrl && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-brand-gold rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)] border border-black-pure"></span>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}