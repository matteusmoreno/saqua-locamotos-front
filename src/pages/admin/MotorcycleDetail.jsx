import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Hash,
  Gauge,
  Fingerprint,
  Palette,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Eye,
  Pencil,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { MotorcycleService } from '../../services/motorcycleService';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';

function KpiCard({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl px-4 py-3 group">
      {Icon && <Icon size={44} className="absolute -bottom-2 -right-2 text-gray-600/20 group-hover:scale-110 transition-transform" />}
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export function MotorcycleDetail() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [motorcycle, setMotorcycle] = useState(null);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [motoRes, contractsRes] = await Promise.all([
          MotorcycleService.getMotorcycleById(id),
          MotorcycleService.getMotorcycleContracts(id),
        ]);

        setMotorcycle(motoRes.data);
        setContracts(contractsRes.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Nao foi possivel carregar os detalhes da moto.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === 'ACTIVE').length;
    const finished = contracts.filter((c) => c.status === 'FINISHED').length;
    const cancelled = contracts.filter((c) => c.status === 'CANCELLED').length;
    const totalReceived = contracts.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0);
    return { total, active, finished, cancelled, totalReceived };
  }, [contracts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
        <p className="text-gray-400">A carregar detalhes da moto...</p>
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center">
        <ShieldAlert size={56} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Moto nao encontrada</h3>
        <Link to="/admin/motos" className="text-brand-gold font-bold hover:underline">
          Voltar para frota
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/motos" className="p-2.5 bg-gray-darker text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-mid">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white">Detalhes da Moto</h1>
            <p className="text-gray-400 text-sm">Panorama tecnico e historico de contratos.</p>
          </div>
        </div>

        <Link
          to={`/admin/motos/${motorcycle.motorcycleId}/editar`}
          className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all"
        >
          <Pencil size={18} /> Editar Moto
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gray-darker border border-gray-mid overflow-hidden flex items-center justify-center">
                {motorcycle.pictureUrl ? (
                  <img src={motorcycle.pictureUrl} alt={motorcycle.model} className="w-full h-full object-cover" />
                ) : (
                  <Bike size={36} className="text-gray-600" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black text-white truncate uppercase">{motorcycle.brand}</h2>
                <p className="text-brand-gold font-medium truncate">{motorcycle.model} - {motorcycle.year}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${motorcycle.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand-red/10 text-brand-red border-brand-red/20'}`}>
                    {motorcycle.active ? <Power size={12} className="inline mr-1" /> : <PowerOff size={12} className="inline mr-1" />}
                    {motorcycle.active ? 'Ativa' : 'Inativa'}
                  </span>
                  {motorcycle.active && (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${motorcycle.available ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                      {motorcycle.available ? 'Disponivel' : 'Alugada'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-[11px] uppercase font-bold mb-1 flex items-center gap-1"><Hash size={12} /> Placa</p>
                <p className="text-white font-mono">{motorcycle.plate || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] uppercase font-bold mb-1 flex items-center gap-1"><Gauge size={12} /> Quilometragem</p>
                <p className="text-white">{Number(motorcycle.mileage || 0).toLocaleString('pt-BR')} km</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] uppercase font-bold mb-1 flex items-center gap-1"><Fingerprint size={12} /> Renavam</p>
                <p className="text-white">{motorcycle.renavam || 'Nao informado'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] uppercase font-bold mb-1 flex items-center gap-1"><Palette size={12} /> Cor</p>
                <p className="text-white">{motorcycle.color || 'Nao informada'}</p>
              </div>
            </div>
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-brand-gold" /> Documento CRLV
            </h3>
            {motorcycle.documentUrl ? (
              <a
                href={motorcycle.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-3 rounded-xl font-bold border border-brand-gold/20"
              >
                <ExternalLink size={16} /> Abrir Documento
              </a>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum documento anexado para esta moto.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard icon={FileText} label="Contratos" value={stats.total} />
            <KpiCard icon={CheckCircle} label="Ativos" value={stats.active} color="text-green-500" />
            <KpiCard icon={CheckCircle} label="Finalizados" value={stats.finished} color="text-blue-400" />
            <KpiCard icon={AlertTriangle} label="Cancelados" value={stats.cancelled} color="text-brand-red" />
            <KpiCard icon={Wallet} label="Total Recebido" value={formatCurrency(stats.totalReceived)} color="text-brand-gold" />
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-mid flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Historico de Contratos</h3>
              <span className="text-xs text-gray-500">{contracts.length} registro(s)</span>
            </div>

            {contracts.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Esta moto ainda nao possui contratos.</div>
            ) : (
              <div className="divide-y divide-gray-mid/40">
                {contracts.map((contract) => (
                  <div key={contract.contractId} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden group">
                    <FileText className="absolute -bottom-4 -right-4 w-20 h-20 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-white font-semibold truncate">{contract.user?.name || 'Cliente nao identificado'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>
                          {formatDate(contract.startDate)} a {formatDate(contract.endDate)} - {RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}
                        </span>
                      </div>
                      <p className="text-sm text-brand-gold font-bold">Recebido: {formatCurrency(contract.totalAmount)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <ContractStatusBadge status={contract.status} />
                      <Link
                        to={`/admin/contratos/${contract.contractId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 text-sm font-bold"
                      >
                        <Eye size={14} /> Ver
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
