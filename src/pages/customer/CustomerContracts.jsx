import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, Loader2, ChevronRight, Bike, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { ContractProgressBar } from '../../components/admin/contracts/ContractProgressBar';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';

const STATUS_TABS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'ACTIVE', label: 'Ativos' },
  { key: 'FINISHED', label: 'Finalizados' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

export function CustomerContracts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const userId = user?.id || user?.userId;

  useEffect(() => {
    if (!userId) return;
    UserService.getUserContracts(userId)
      .then(r => setContracts(r.data || []))
      .catch(() => toast.error('Erro ao carregar contratos.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const counts = useMemo(() => ({
    ACTIVE: contracts.filter(c => c.status === 'ACTIVE').length,
    FINISHED: contracts.filter(c => c.status === 'FINISHED').length,
    CANCELLED: contracts.filter(c => c.status === 'CANCELLED').length,
  }), [contracts]);

  const filtered = contracts.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch = !search ||
      `${c.motorcycle?.brand} ${c.motorcycle?.model} ${c.motorcycle?.plate}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
          <FileText className="text-brand-gold" size={28} /> Meus Contratos
        </h1>
        <p className="text-gray-400 text-sm">Todos os contratos de locação vinculados à sua conta.</p>
      </motion.div>

      {/* Filtros */}
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
              {tab.key !== 'ALL' && counts[tab.key] > 0 && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-darker text-gray-500">{counts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por modelo ou placa..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-darker border border-gray-mid focus:border-brand-gold rounded-xl text-white placeholder:text-gray-500 outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={40} className="animate-spin text-brand-gold" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">Nenhum contrato encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((c, i) => {
            const payments = c.payments || [];
            const paid = payments.filter(p => p.status === 'PAID');
            const pending = payments.filter(p => p.status === 'PENDING');
            const overdue = payments.filter(p => isOverdue(p.dueDate, p.status));
            const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
            const totalPending = pending.reduce((s, p) => s + Number(p.amount), 0);

            return (
              <motion.div
                key={c.contractId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/customer/contratos/${c.contractId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/customer/contratos/${c.contractId}`); }}
                className="relative bg-black-rich border border-gray-mid hover:border-brand-gold/30 rounded-2xl overflow-hidden cursor-pointer group transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              >
                <FileText className="absolute -bottom-5 -right-5 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

                {/* Header do card */}
                <div className="p-5 border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/5 to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                        <Bike size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{c.motorcycle?.brand} {c.motorcycle?.model}</p>
                        <p className="text-brand-gold text-sm font-medium">{c.motorcycle?.plate}</p>
                      </div>
                    </div>
                    <ContractStatusBadge status={c.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> {formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
                    <span>{RENTAL_TYPE_LABELS[c.rentalType]}</span>
                  </div>
                </div>

                {/* Corpo — valores financeiros explícitos */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                        <CheckCircle size={11} className="text-green-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Pago</span>
                      </div>
                      <p className="text-green-500 font-black text-sm whitespace-nowrap">{formatCurrency(totalPaid)}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{paid.length} pagamento{paid.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                        <Clock size={11} className="text-yellow-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Pendente</span>
                      </div>
                      <p className="text-yellow-500 font-black text-sm whitespace-nowrap">{formatCurrency(totalPending)}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{pending.length} pendente{pending.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div className={`bg-gray-darker/60 border rounded-xl p-3 ${overdue.length > 0 ? 'border-brand-red/30' : 'border-gray-mid/50'}`}>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                        <AlertTriangle size={11} className={overdue.length > 0 ? 'text-brand-red' : 'text-gray-600'} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Vencido</span>
                      </div>
                      <p className={`font-black text-sm whitespace-nowrap ${overdue.length > 0 ? 'text-brand-red' : 'text-gray-600'}`}>{overdue.length}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">em atraso</p>
                    </div>

                    <div className="bg-gray-darker/60 border border-gray-mid/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                        <FileText size={11} className="text-brand-gold" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Semanal</span>
                      </div>
                      <p className="text-brand-gold font-black text-sm whitespace-nowrap">{formatCurrency(c.weeklyAmount)}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">por semana</p>
                    </div>
                  </div>

                  {c.status === 'ACTIVE' && <ContractProgressBar startDate={c.startDate} endDate={c.endDate} />}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>Toque para ver detalhes completos</span>
                    <span className="text-brand-gold font-semibold flex items-center gap-1">
                      Ver contrato <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

