import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, ShieldAlert, Loader2, Download,
  XCircle, ArrowRight, User, Bike, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { useConfirm } from '../../context/ConfirmContext';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { ContractProgressBar } from '../../components/admin/contracts/ContractProgressBar';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

function StatPill({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl px-4 py-3 text-center min-w-[100px] group">
      {Icon && <Icon size={42} className="absolute -bottom-2 -right-2 text-gray-600/20 group-hover:scale-110 transition-transform" />}
      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { confirm } = useConfirm();

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      const response = await ContractService.getAllContracts();
      setContracts(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar os contratos.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    finished: contracts.filter(c => c.status === 'FINISHED').length,
    cancelled: contracts.filter(c => c.status === 'CANCELLED').length,
  }), [contracts]);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch =
      c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motorcycle?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motorcycle?.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelContract = async (contractId) => {
    const ok = await confirm({
      title: 'Cancelar Contrato',
      message: 'Tem certeza? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Cancelar',
      isDanger: true,
    });
    if (!ok) return;
    try {
      await ContractService.cancelContract(contractId);
      toast.success('Contrato cancelado!');
      fetchContracts();
    } catch {
      toast.error('Erro ao cancelar o contrato.');
    }
  };

  const handleDownloadPdf = async (contractId) => {
    try {
      const response = await ContractService.generatePdf(contractId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch {
      toast.error('Erro ao gerar PDF.');
    }
  };

  const STATUS_TABS = [
    { key: 'ALL', label: 'Todos' },
    { key: 'ACTIVE', label: 'Ativos' },
    { key: 'FINISHED', label: 'Finalizados' },
    { key: 'CANCELLED', label: 'Cancelados' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <FileText className="text-brand-gold" size={32} /> Contratos
          </h1>
          <p className="text-gray-400 text-sm">Gestão completa dos contratos de locação.</p>
        </div>
        <Link
          to="/admin/contratos/novo"
          className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] cursor-pointer"
        >
          <Plus size={20} /> Novo Contrato
        </Link>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3">
          <StatPill icon={FileText} label="Total" value={stats.total} />
          <StatPill icon={CheckCircle} label="Ativos" value={stats.active} color="text-green-500" />
          <StatPill icon={CheckCircle} label="Finalizados" value={stats.finished} color="text-blue-400" />
          <StatPill icon={AlertTriangle} label="Cancelados" value={stats.cancelled} color="text-brand-red" />
        </div>
      )}

      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-mid">
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
              {tab.key === 'ACTIVE' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.active}</span>}
              {tab.key === 'FINISHED' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.finished}</span>}
              {tab.key === 'CANCELLED' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{stats.cancelled}</span>}
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
              placeholder="Buscar por cliente, placa ou modelo..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">Carregando contratos...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-black-rich border border-gray-mid rounded-3xl p-12 text-center">
          <ShieldAlert size={56} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum contrato encontrado</h3>
          {!searchTerm && statusFilter === 'ALL' && (
            <Link to="/admin/contratos/novo" className="text-brand-gold font-bold hover:underline cursor-pointer">
              Criar primeiro contrato
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredContracts.map((contract, index) => {
            const payments = contract.payments || [];
            const paidCount = payments.filter(p => p.status === 'PAID').length;

            return (
              <motion.div
                key={contract.contractId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative bg-black-rich border border-gray-mid hover:border-brand-gold/30 rounded-2xl overflow-hidden transition-all group"
              >
                <FileText className="absolute -bottom-5 -right-5 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                <div className="p-5 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/5 to-transparent">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-black shrink-0">
                        {contract.user?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{contract.user?.name || 'Cliente'}</h3>
                        <p className="text-brand-gold text-sm font-medium">{contract.motorcycle?.brand} {contract.motorcycle?.model}</p>
                      </div>
                    </div>
                    <ContractStatusBadge status={contract.status} />
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><Bike size={12} /> {contract.motorcycle?.plate}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}</span>
                    <span className="flex items-center gap-1.5"><User size={12} /> {formatDate(contract.startDate)}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-darker rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Semanal</p>
                      <p className="text-brand-gold font-black text-sm">{formatCurrency(contract.weeklyAmount)}</p>
                    </div>
                    <div className="bg-gray-darker rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Caução</p>
                      <p className="text-white font-bold text-sm">{formatCurrency(contract.depositAmount)}</p>
                    </div>
                    <div className="bg-gray-darker rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Recebido</p>
                      <p className="text-green-500 font-bold text-sm">{formatCurrency(contract.totalAmount)}</p>
                    </div>
                  </div>

                  {contract.status === 'ACTIVE' && (
                    <ContractProgressBar startDate={contract.startDate} endDate={contract.endDate} />
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{paidCount}/{payments.length} pagamentos confirmados</span>
                    <span className={contract.depositPaid ? 'text-green-500' : 'text-brand-red'}>
                      Caução {contract.depositPaid ? 'paga' : 'pendente'}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-mid/50 flex gap-2 bg-gray-darker/20">
                  {contract.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelContract(contract.contractId)}
                      className="p-2.5 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors cursor-pointer"
                      title="Cancelar"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadPdf(contract.contractId)}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg bg-gray-dark hover:bg-gray-mid text-white text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Download size={16} /> PDF
                  </button>
                  <Link
                    to={`/admin/contratos/${contract.contractId}`}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold text-sm font-bold transition-colors border border-brand-gold/20 cursor-pointer"
                  >
                    Detalhes <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
