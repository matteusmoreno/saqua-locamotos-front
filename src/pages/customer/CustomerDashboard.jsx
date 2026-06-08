import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Bike, Clock, AlertTriangle, CheckCircle, Loader2, ChevronRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { FinancialKpiCard } from '../../components/admin/financial/FinancialKpiCard';
import { ContractStatusBadge } from '../../components/admin/contracts/ContractStatusBadge';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';
import { RENTAL_TYPE_LABELS } from '../../utils/financialLabels';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?.userId;

  useEffect(() => {
    if (!userId) return;
    UserService.getUserContracts(userId)
      .then(r => setContracts(r.data || []))
      .catch(() => toast.error('Erro ao carregar seus contratos.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const kpis = useMemo(() => {
    const active = contracts.filter(c => c.status === 'ACTIVE');
    const payments = contracts.flatMap(c => c.payments || []);
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    const overdue = payments.filter(p => isOverdue(p.dueDate, p.status));
    const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = pending.reduce((s, p) => s + Number(p.amount), 0);
    const totalOverdue = overdue.reduce((s, p) => s + Number(p.amount), 0);
    return {
      active: active.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      totalPaid,
      totalPending,
      totalOverdue,
    };
  }, [contracts]);

  const activeContract = useMemo(
    () => contracts.find(c => c.status === 'ACTIVE') || null,
    [contracts]
  );

  const activeContractStats = useMemo(() => {
    if (!activeContract) return null;

    const payments = activeContract.payments || [];
    const paid = payments.filter(p => p.status === 'PAID');
    const pending = payments.filter(p => p.status === 'PENDING');
    const overdue = payments.filter(p => isOverdue(p.dueDate, p.status));

    const msDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.ceil((new Date(activeContract.endDate) - new Date()) / msDay));

    return {
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      weeklyAmount: formatCurrency(activeContract.weeklyAmount),
      depositAmount: formatCurrency(activeContract.depositAmount),
      pendingAmount: formatCurrency(pending.reduce((sum, p) => sum + Number(p.amount), 0)),
      daysLeft,
    };
  }, [activeContract]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1">
          Olá, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-400 text-sm">Aqui está um resumo dos seus contratos e pagamentos.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={40} className="animate-spin text-brand-gold" /></div>
      ) : (
        <>
          {/* KPI strip — mesmo padrão do admin */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <FinancialKpiCard
              icon={<FileText size={18} />}
              label="Contratos ativos"
              value={kpis.active}
              sub={`${contracts.length} no total`}
              color="gold"
              delay={0}
            />
            <FinancialKpiCard
              icon={<TrendingUp size={18} />}
              label="Total pago"
              value={formatCurrency(kpis.totalPaid)}
              sub={`${kpis.paidCount} pagamentos confirmados`}
              color="green"
              delay={0.04}
            />
            <FinancialKpiCard
              icon={<Clock size={18} />}
              label="A pagar"
              value={formatCurrency(kpis.totalPending)}
              sub={`${kpis.pendingCount} pendentes`}
              color="yellow"
              delay={0.08}
            />
            <FinancialKpiCard
              icon={<AlertTriangle size={18} />}
              label="Vencido"
              value={formatCurrency(kpis.totalOverdue)}
              sub={`${kpis.overdueCount} em atraso`}
              color="red"
              delay={0.12}
              highlight={kpis.overdueCount > 0}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(activeContract ? `/customer/contratos/${activeContract.contractId}` : '/customer/contratos')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(activeContract ? `/customer/contratos/${activeContract.contractId}` : '/customer/contratos');
                }
              }}
              className="relative overflow-hidden rounded-2xl border border-gray-mid bg-black-rich cursor-pointer transition-colors hover:border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              <FileText className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-brand-gold/5" />
              <div className="border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/8 to-transparent px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                    <CheckCircle size={15} className="text-brand-gold" /> Contrato
                  </h2>
                  {activeContract ? <ContractStatusBadge status={activeContract.status} /> : null}
                </div>
              </div>
              <div className="space-y-4 p-5">
                {activeContract ? (
                  <>
                    <div>
                      <p className="text-base font-bold text-white">
                        {activeContract.motorcycle?.brand} {activeContract.motorcycle?.model}
                      </p>
                      <p className="text-sm font-medium text-brand-gold">
                        {activeContract.motorcycle?.plate} · {RENTAL_TYPE_LABELS[activeContract.rentalType]}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(activeContract.startDate)} → {formatDate(activeContract.endDate)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Semanal</p>
                        <p className="font-bold text-brand-gold">{activeContractStats?.weeklyAmount}</p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Caucao</p>
                        <p className="font-bold text-white">{activeContractStats?.depositAmount}</p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Pagamentos</p>
                        <p className="font-bold text-white">
                          <span className="text-green-500">{activeContractStats?.paidCount}</span>
                          {' '}pagos
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Pendencias</p>
                        <p className="font-bold text-yellow-500">{activeContractStats?.pendingAmount}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-md border border-gray-mid/50 bg-gray-darker px-2 py-1 text-gray-300">
                        {activeContractStats?.daysLeft} dias restantes
                      </span>
                      <span className={`rounded-md border px-2 py-1 ${
                        (activeContractStats?.overdueCount || 0) > 0
                          ? 'border-brand-red/30 bg-brand-red/10 text-brand-red'
                          : 'border-green-500/30 bg-green-500/10 text-green-400'
                      }`}>
                        {(activeContractStats?.overdueCount || 0) > 0
                          ? `${activeContractStats?.overdueCount} em atraso`
                          : 'Sem atraso'}
                      </span>
                    </div>

                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold">
                      Ver detalhes <ChevronRight size={13} />
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">Voce nao possui contrato ativo no momento.</p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold">
                      Ir para meus contratos <ChevronRight size={13} />
                    </p>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => navigate('/customer/moto')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate('/customer/moto');
                }
              }}
              className="relative overflow-hidden rounded-2xl border border-gray-mid bg-black-rich cursor-pointer transition-colors hover:border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            >
              <Bike className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-brand-gold/5" />
              <div className="border-b border-gray-mid/50 bg-gradient-to-r from-brand-gold/8 to-transparent px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <Bike size={15} className="text-brand-gold" /> Moto
                </h2>
              </div>
              <div className="space-y-4 p-5">
                {activeContract?.motorcycle ? (
                  <>
                    <div>
                      <p className="text-base font-bold text-white">
                        {activeContract.motorcycle.brand} {activeContract.motorcycle.model}
                      </p>
                      <p className="text-sm font-medium text-brand-gold">{activeContract.motorcycle.plate}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Cor</p>
                        <p className="font-bold text-white">{activeContract.motorcycle.color || 'Nao informada'}</p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">KM</p>
                        <p className="font-bold text-white">
                          {activeContract.motorcycle.mileage
                            ? `${Number(activeContract.motorcycle.mileage).toLocaleString('pt-BR')} km`
                            : 'Nao informado'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Documento</p>
                        <p className={`font-bold ${activeContract.motorcycle.documentUrl ? 'text-green-400' : 'text-gray-400'}`}>
                          {activeContract.motorcycle.documentUrl ? 'Disponivel' : 'Indisponivel'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-mid/50 bg-gray-darker/50 p-2.5">
                        <p className="text-gray-500">Tipo</p>
                        <p className="font-bold text-white">{RENTAL_TYPE_LABELS[activeContract.rentalType]}</p>
                      </div>
                    </div>

                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold">
                      Ver detalhes da moto <ChevronRight size={13} />
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">Sem moto vinculada no momento.</p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold">
                      Ir para minha moto <ChevronRight size={13} />
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

