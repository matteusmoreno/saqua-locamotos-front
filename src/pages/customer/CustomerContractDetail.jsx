import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Bike, User, Calendar, Wallet,
  CheckCircle, ExternalLink, Loader2, Mail, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ContractService } from '../../services/contractService';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { ContractProgressBar } from '../../components/admin/contracts/ContractProgressBar';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';
import { PAYMENT_TYPE_LABELS, PAYMENT_METHOD_LABELS, RENTAL_TYPE_LABELS } from '../../utils/financialLabels';

function Kpi({ icon, label, value, color = 'text-white' }) {
  return (
    <div className="relative overflow-hidden bg-gray-darker/50 border border-gray-mid/50 rounded-xl p-4 group">
      <div className="absolute -bottom-3 -right-3 opacity-5 text-brand-gold group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}<span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-black whitespace-nowrap ${color}`}>{value}</p>
    </div>
  );
}

export function CustomerContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    ContractService.getContractById(id)
      .then(r => setContract(r.data))
      .catch(() => toast.error('Erro ao carregar contrato.'))
      .finally(() => setLoading(false));
  }, [id]);

  const paymentStats = useMemo(() => {
    const payments = contract?.payments || [];
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    const overdue = payments.filter(p => isOverdue(p.dueDate, p.status));
    return {
      total: payments.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      pendingAmount: pending.reduce((s, p) => s + Number(p.amount), 0),
    };
  }, [contract]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" size={44} /></div>;
  if (!contract) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Contrato não encontrado.</p>
      <Link to="/customer/contratos" className="text-brand-gold font-bold hover:underline">Voltar</Link>
    </div>
  );

  const payments = contract.payments || [];
  const TABS = [
    { key: 'overview', label: 'Resumo' },
    { key: 'payments', label: `Pagamentos (${payments.length})` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-brand-gold/10 via-transparent to-transparent border-b border-gray-mid/50">
          <div className="flex items-start gap-4 justify-between">
            <Link to="/customer/contratos" className="p-2 bg-gray-darker text-gray-400 rounded-xl border border-gray-mid hover:text-white transition-colors cursor-pointer shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white truncate">
                  {contract.motorcycle?.brand} {contract.motorcycle?.model}
                </h1>
                <ContractStatusBadge status={contract.status} size="lg" />
              </div>
              <p className="text-brand-gold font-medium">{contract.motorcycle?.plate}</p>
              <p className="text-gray-500 text-sm mt-1">
                {RENTAL_TYPE_LABELS[contract.rentalType]} · {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {contract.contractUrl ? (
                <a href={contract.contractUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-colors cursor-pointer text-sm font-bold">
                  <ExternalLink size={15} /> Ver Contrato Assinado
                </a>
              ) : (
                <p className="text-xs text-gray-500">Contrato assinado ainda nao disponivel.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi icon={<Wallet size={14} />} label="Valor Semanal" value={formatCurrency(contract.weeklyAmount)} color="text-brand-gold" />
          <Kpi icon={<FileText size={14} />} label="Caução" value={formatCurrency(contract.depositAmount)} />
          <Kpi icon={<CheckCircle size={14} />} label="Total Pago" value={formatCurrency(contract.totalAmount)} color="text-green-500" />
          <Kpi icon={<Calendar size={14} />} label="Pagamentos" value={`${paymentStats.paid}/${paymentStats.total}`} />
        </div>

        {contract.status === 'ACTIVE' && (
          <div className="px-6 pb-6">
            <ContractProgressBar startDate={contract.startDate} endDate={contract.endDate} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-mid overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-darker'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-gray-darker rounded-xl p-5 border border-gray-mid space-y-3 text-sm">
                <h3 className="text-white font-bold flex items-center gap-2 mb-3"><Bike size={16} className="text-brand-gold" /> Moto</h3>
                <div className="flex justify-between"><span className="text-gray-400">Modelo</span><span className="text-white font-medium">{contract.motorcycle?.brand} {contract.motorcycle?.model}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Placa</span><span className="text-brand-gold font-bold">{contract.motorcycle?.plate}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Cor</span><span className="text-white">{contract.motorcycle?.color || '—'}</span></div>
              </div>

              <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><p className="text-gray-500 text-xs mb-1">Caução paga</p><p className={contract.depositPaid ? 'text-green-500 font-bold' : 'text-brand-red font-bold'}>{contract.depositPaid ? 'Sim' : 'Não'}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Caução devolvida</p><p className="text-white font-bold">{contract.depositRefunded ? 'Sim' : 'Não'}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Pendentes</p><p className="text-yellow-500 font-bold">{formatCurrency(paymentStats.pendingAmount)}</p></div>
                <div><p className="text-gray-500 text-xs mb-1">Em atraso</p><p className="text-brand-red font-bold">{paymentStats.overdue}</p></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-gray-400 text-sm mb-5">{paymentStats.paid} pagos · {paymentStats.pending} pendentes · {paymentStats.overdue} em atraso</p>
              {payments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Nenhum pagamento registrado.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-mid/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-darker text-gray-400 text-left">
                        <th className="px-4 py-3 font-semibold">Tipo</th>
                        <th className="px-4 py-3 font-semibold">Valor</th>
                        <th className="px-4 py-3 font-semibold">Vencimento</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.paymentId} className={`border-t border-gray-mid/30 ${isOverdue(p.dueDate, p.status) ? 'bg-brand-red/[0.03]' : ''}`}>
                          <td className="px-4 py-3 text-white">{PAYMENT_TYPE_LABELS[p.type]}</td>
                          <td className="px-4 py-3 text-brand-gold font-bold">{formatCurrency(p.amount)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatDate(p.dueDate)}</td>
                          <td className="px-4 py-3">
                            <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                            {p.method && <p className="text-[10px] text-gray-500 mt-0.5">{PAYMENT_METHOD_LABELS[p.method]}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
