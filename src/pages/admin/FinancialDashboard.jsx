import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Search, Loader2, Plus, RefreshCw, TrendingUp, TrendingDown,
  Clock, AlertTriangle, BarChart3, Bike, Receipt, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { MotorcycleService } from '../../services/motorcycleService';
import { PaymentService } from '../../services/paymentService';
import { ExpenseService } from '../../services/expenseService';
import { useConfirm } from '../../context/ConfirmContext';
import { CreatePaymentModal } from '../../components/admin/CreatePaymentModal';
import { CreateExpenseModal } from '../../components/admin/CreateExpenseModal';
import { RegisterPaymentModal } from '../../components/admin/RegisterPaymentModal';
import { RegisterExpenseModal } from '../../components/admin/RegisterExpenseModal';
import { FinancialKpiCard } from '../../components/admin/financial/FinancialKpiCard';
import { CashFlowChart } from '../../components/admin/financial/CashFlowChart';
import { AgingBucketsPanel } from '../../components/admin/financial/AgingBucketsPanel';
import { FinancialAlertsPanel } from '../../components/admin/financial/FinancialAlertsPanel';
import { BreakdownPanel } from '../../components/admin/financial/BreakdownPanel';
import { HealthScoreRing } from '../../components/admin/financial/HealthScoreRing';
import { FinancialTransactionsTable } from '../../components/admin/financial/FinancialTransactionsTable';
import { MotorcyclePerformanceTable } from '../../components/admin/financial/MotorcyclePerformanceTable';
import { FinancialCompositionDonut } from '../../components/admin/financial/FinancialCompositionDonut';
import { RevenueExpenseLineChart } from '../../components/admin/financial/RevenueExpenseLineChart';
import {
  PAYMENT_TYPE_LABELS, EXPENSE_TYPE_LABELS, PAYMENT_METHOD_LABELS
} from '../../utils/financialLabels';
import { formatCurrency, isOverdue } from '../../utils/formatCurrency';
import {
  buildPayments, buildExpenses, computeFinancialMetrics, getCashFlowByMonth,
  getAgingBuckets, getPaymentMethodBreakdown, getPaymentTypeBreakdown,
  getExpenseTypeBreakdown, getMotorcyclePerformance, getFinancialHealthScore,
  getFinancialAlerts, getEffectiveStatus, filterByPeriod,
} from '../../utils/financialAnalytics';

const TABS = [
  { key: 'overview', label: 'Visão Geral', icon: Activity },
  { key: 'payments', label: 'Recebimentos', icon: TrendingUp },
  { key: 'expenses', label: 'Despesas', icon: TrendingDown },
  { key: 'fleet', label: 'Performance da Frota', icon: Bike },
];

const PERIODS = [
  { key: 'all', label: 'Tudo' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
];

const CHART_TYPE_OPTIONS = [
  { key: 'bars', label: 'Barras' },
  { key: 'lines', label: 'Linhas' },
  { key: 'composition', label: 'Pizza' },
];

const CHART_WINDOW_OPTIONS = [
  { key: 3, label: '3M' },
  { key: 6, label: '6M' },
  { key: 12, label: '12M' },
];

const CHART_WINDOW_BOUNDS = { min: 1, max: 60 };

function sortItems(items, field, dir) {
  return [...items].sort((a, b) => {
    const aVal = a[field] ?? '';
    const bVal = b[field] ?? '';
    const cmp = typeof aVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal));
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('all');
  const [chartType, setChartType] = useState('bars');
  const [chartWindowMonths, setChartWindowMonths] = useState(3);
  const [isCustomChartWindow, setIsCustomChartWindow] = useState(false);
  const [customChartWindowMonths, setCustomChartWindowMonths] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');

  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [registerPayment, setRegisterPayment] = useState(null);
  const [registerExpense, setRegisterExpense] = useState(null);

  const { confirm } = useConfirm();

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [contractsRes, motorcyclesRes] = await Promise.all([
        ContractService.getAllContracts(),
        MotorcycleService.getAllMotorcycles(),
      ]);
      setContracts(contractsRes.data || []);
      setMotorcycles(motorcyclesRes.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const payments = useMemo(() => buildPayments(contracts), [contracts]);
  const expenses = useMemo(() => buildExpenses(motorcycles), [motorcycles]);

  const periodPayments = useMemo(
    () => filterByPeriod(payments, period, 'paidDate', 'dueDate'),
    [payments, period]
  );
  const periodExpenses = useMemo(
    () => filterByPeriod(expenses, period, 'paidDate', 'dueDate'),
    [expenses, period]
  );

  const chartPayments = useMemo(
    () => (period === 'all' ? payments : periodPayments),
    [payments, periodPayments, period]
  );

  const chartExpenses = useMemo(
    () => (period === 'all' ? expenses : periodExpenses),
    [expenses, periodExpenses, period]
  );

  const effectiveChartWindowMonths = useMemo(() => {
    if (!isCustomChartWindow) return chartWindowMonths;
    const parsed = Number(customChartWindowMonths);
    if (!Number.isFinite(parsed)) return chartWindowMonths;
    return Math.max(CHART_WINDOW_BOUNDS.min, Math.min(CHART_WINDOW_BOUNDS.max, Math.round(parsed)));
  }, [isCustomChartWindow, chartWindowMonths, customChartWindowMonths]);

  const chartCashFlow = useMemo(
    () => getCashFlowByMonth(chartPayments, chartExpenses, effectiveChartWindowMonths),
    [chartPayments, chartExpenses, effectiveChartWindowMonths]
  );

  const globalMetrics = useMemo(
    () => computeFinancialMetrics(payments, expenses),
    [payments, expenses]
  );

  const metrics = useMemo(() => {
    if (period === 'all') return globalMetrics;
    return computeFinancialMetrics(periodPayments, periodExpenses);
  }, [period, globalMetrics, periodPayments, periodExpenses]);

  const analytics = useMemo(() => ({
    aging: getAgingBuckets(payments),
    methodBreakdown: getPaymentMethodBreakdown(period === 'all' ? payments : periodPayments),
    paymentTypeBreakdown: getPaymentTypeBreakdown(period === 'all' ? payments : periodPayments),
    expenseTypeBreakdown: getExpenseTypeBreakdown(period === 'all' ? expenses : periodExpenses),
    motorcyclePerformance: getMotorcyclePerformance(motorcycles),
    healthScore: getFinancialHealthScore(globalMetrics, payments),
    alerts: getFinancialAlerts(payments, expenses, globalMetrics),
  }), [payments, expenses, periodPayments, periodExpenses, period, motorcycles, globalMetrics]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filterByStatus = (item) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'OVERDUE') return isOverdue(item.dueDate, item.status);
    return getEffectiveStatus(item) === statusFilter;
  };

  const filterBySearch = (item, fields) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return fields.some(f => String(item[f] || '').toLowerCase().includes(term));
  };

  const basePayments = period === 'all' ? payments : periodPayments;
  const baseExpenses = period === 'all' ? expenses : periodExpenses;

  const filteredPayments = useMemo(() => {
    const filtered = basePayments.filter(p =>
      filterByStatus(p) &&
      filterBySearch(p, ['clientName', 'motorcyclePlate', 'type', 'description'])
    );
    return sortItems(filtered, sortField, sortDir);
  }, [basePayments, statusFilter, searchTerm, sortField, sortDir]);

  const filteredExpenses = useMemo(() => {
    const filtered = baseExpenses.filter(e =>
      filterByStatus(e) &&
      filterBySearch(e, ['motorcycleLabel', 'type', 'description'])
    );
    return sortItems(filtered, sortField, sortDir);
  }, [baseExpenses, statusFilter, searchTerm, sortField, sortDir]);

  const tabCounts = {
    payments: payments.length,
    expenses: expenses.length,
    fleet: motorcycles.length,
  };

  const handleDeletePayment = async (paymentId) => {
    const ok = await confirm({
      title: 'Excluir Pagamento',
      message: 'Tem certeza? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Excluir',
      isDanger: true,
    });
    if (!ok) return;
    try {
      await PaymentService.deletePayment(paymentId);
      toast.success('Pagamento excluído.');
      fetchData(true);
    } catch { toast.error('Erro ao excluir pagamento.'); }
  };

  const handleDeleteExpense = async (expenseId) => {
    const ok = await confirm({
      title: 'Excluir Despesa',
      message: 'Tem certeza? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Excluir',
      isDanger: true,
    });
    if (!ok) return;
    try {
      await ExpenseService.deleteExpense(expenseId);
      toast.success('Despesa excluída.');
      fetchData(true);
    } catch { toast.error('Erro ao excluir despesa.'); }
  };

  const switchTab = (key) => {
    setActiveTab(key);
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortField(key === 'expenses' ? 'dueDate' : 'dueDate');
    setSortDir('asc');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CreatePaymentModal isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} contracts={contracts} onSuccess={() => fetchData(true)} />
      <CreateExpenseModal isOpen={showCreateExpense} onClose={() => setShowCreateExpense(false)} motorcycles={motorcycles} onSuccess={() => fetchData(true)} />
      <RegisterPaymentModal isOpen={!!registerPayment} onClose={() => setRegisterPayment(null)} payment={registerPayment} onSuccess={() => fetchData(true)} />
      <RegisterExpenseModal isOpen={!!registerExpense} onClose={() => setRegisterExpense(null)} expense={registerExpense} onSuccess={() => fetchData(true)} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
            <Wallet className="text-brand-gold" size={32} />
            Centro Financeiro
          </h1>
          <p className="text-gray-400 text-sm">
            Observabilidade completa de recebimentos, despesas e performance da frota.
            {lastUpdated && (
              <span className="text-gray-600 ml-2">
                Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-darker border border-gray-mid rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  period === p.key ? 'bg-brand-gold text-black-pure' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-3 rounded-xl bg-gray-dark border border-gray-mid text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            title="Atualizar dados"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateExpense(true)}
            className="flex items-center gap-2 bg-gray-dark hover:bg-gray-mid text-white px-4 py-3 rounded-xl font-bold transition-all border border-gray-mid text-sm cursor-pointer"
          >
            <Plus size={16} /> Despesa
          </button>
          <button
            onClick={() => setShowCreatePayment(true)}
            className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-4 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)] text-sm cursor-pointer"
          >
            <Plus size={16} /> Pagamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">Carregando centro financeiro...</p>
        </div>
      ) : (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <FinancialKpiCard icon={<TrendingUp size={18} />} label="Recebido" value={formatCurrency(metrics.totalReceived)} sub={`${metrics.paidCount} confirmados${period !== 'all' ? ' · período' : ''}`} color="green" delay={0} />
            <FinancialKpiCard icon={<Clock size={18} />} label="A Receber" value={formatCurrency(metrics.totalPending)} sub={`${metrics.pendingCount} pendentes`} color="yellow" delay={0.04} />
            <FinancialKpiCard icon={<AlertTriangle size={18} />} label="Vencido" value={formatCurrency(metrics.totalOverdue)} sub={`${metrics.overdueCount} em atraso`} color="red" delay={0.08} highlight={metrics.overdueCount > 0} />
            <FinancialKpiCard icon={<TrendingDown size={18} />} label="Despesas" value={formatCurrency(metrics.totalExpensesPaid)} sub={`${formatCurrency(metrics.totalExpensesPending)} pendente`} color="red" delay={0.12} />
            <FinancialKpiCard icon={<Wallet size={18} />} label="Saldo Líquido" value={formatCurrency(metrics.netBalance)} sub={`Projetado: ${formatCurrency(metrics.projectedBalance)}`} color="gold" delay={0.16} highlight />
            <FinancialKpiCard icon={<BarChart3 size={18} />} label="Resultado do Mês" value={formatCurrency(metrics.monthResult)} sub={`Rec. ${formatCurrency(metrics.receivedThisMonth)}`} color={metrics.monthResult >= 0 ? 'green' : 'red'} delay={0.2} />
          </div>

          {/* Tabs */}
          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-mid">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const count = tab.key === 'overview' ? null : tabCounts[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => switchTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === tab.key
                        ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                        : 'text-gray-400 hover:text-white hover:bg-gray-darker'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {count !== null && count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-darker text-gray-400">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                    <BarChart3 className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 relative z-10">
                      <div>
                        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                          <BarChart3 size={18} className="text-brand-gold" /> Evolução Financeira
                        </h3>
                        <p className="text-gray-500 text-xs">Selecione o tipo de gráfico e janela de tempo para analisar a evolução</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex bg-gray-darker border border-gray-mid rounded-lg p-1">
                          {CHART_TYPE_OPTIONS.map(option => (
                            <button
                              key={option.key}
                              onClick={() => setChartType(option.key)}
                              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                                chartType === option.key ? 'bg-brand-gold text-black-pure' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex bg-gray-darker border border-gray-mid rounded-lg p-1">
                          {CHART_WINDOW_OPTIONS.map(option => (
                            <button
                              key={option.key}
                              onClick={() => {
                                setIsCustomChartWindow(false);
                                setChartWindowMonths(option.key);
                              }}
                              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                                !isCustomChartWindow && chartWindowMonths === option.key ? 'bg-brand-gold text-black-pure' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setIsCustomChartWindow(true)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                              isCustomChartWindow ? 'bg-brand-gold text-black-pure' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                        {isCustomChartWindow && (
                          <div className="flex items-center gap-2 bg-gray-darker border border-gray-mid rounded-lg px-2 py-1.5">
                            <input
                              type="number"
                              min={CHART_WINDOW_BOUNDS.min}
                              max={CHART_WINDOW_BOUNDS.max}
                              value={customChartWindowMonths}
                              onChange={(e) => setCustomChartWindowMonths(e.target.value)}
                              className="w-16 bg-transparent text-white text-xs font-bold outline-none"
                            />
                            <span className="text-[10px] uppercase tracking-wider text-gray-500">meses</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {chartType === 'bars' && <CashFlowChart data={chartCashFlow} />}
                    {chartType === 'lines' && <RevenueExpenseLineChart data={chartCashFlow} />}
                    {chartType === 'composition' && (
                      <FinancialCompositionDonut
                        received={metrics.totalReceived}
                        paidExpenses={metrics.totalExpensesPaid}
                        pending={metrics.totalPending}
                      />
                    )}
                  </div>

                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                    <Wallet className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <h3 className="text-white font-bold mb-4">Saúde Financeira</h3>
                    <HealthScoreRing score={analytics.healthScore} metrics={metrics} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                    <Clock className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <h3 className="text-white font-bold mb-1">Envelhecimento de Recebíveis</h3>
                    <p className="text-gray-500 text-xs mb-4">Distribuição dos valores pendentes por faixa de atraso</p>
                    <AgingBucketsPanel buckets={analytics.aging} />
                  </div>

                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                    <AlertTriangle className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-red/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-brand-red" /> Alertas
                    </h3>
                    <FinancialAlertsPanel alerts={analytics.alerts} />
                  </div>

                  <div className="space-y-4">
                    <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                      <Receipt className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                      <BreakdownPanel title="Por método de pagamento" items={analytics.methodBreakdown} labelMap={PAYMENT_METHOD_LABELS} />
                    </div>
                    <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                      <TrendingUp className="absolute -bottom-6 -right-6 w-28 h-28 text-green-500/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                      <BreakdownPanel title="Por tipo de recebimento" items={analytics.paymentTypeBreakdown} labelMap={PAYMENT_TYPE_LABELS} />
                    </div>
                  </div>
                </div>

                {period !== 'all' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl px-4 py-3 text-sm text-brand-gold">
                    Período: {PERIODS.find(p => p.key === period)?.label} — KPIs e breakdowns filtrados. Alertas e saúde financeira usam visão global.
                  </motion.div>
                )}
              </div>
            )}

            {/* Payments / Expenses Tabs */}
            {(activeTab === 'payments' || activeTab === 'expenses') && (
              <>
                <div className="px-6 py-4 border-b border-gray-mid/50 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-darker border border-gray-mid focus:border-brand-gold rounded-xl text-white text-sm placeholder:text-gray-500 outline-none transition-all"
                      placeholder={activeTab === 'payments' ? 'Buscar cliente, placa, tipo...' : 'Buscar moto, tipo, descrição...'}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-darker border border-gray-mid rounded-xl text-white text-sm outline-none cursor-pointer"
                  >
                    <option value="ALL">Todos os status</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="PAID">Pagos</option>
                    <option value="OVERDUE">Em atraso</option>
                  </select>
                </div>

                <div className="px-6 py-3 bg-gray-darker/20 border-b border-gray-mid/30 flex flex-wrap gap-4 text-xs">
                  {activeTab === 'payments' ? (
                    <>
                      <span className="text-gray-400">Exibindo <strong className="text-white">{filteredPayments.length}</strong> de {basePayments.length}</span>
                      <span className="text-green-500">Pagos: {formatCurrency(basePayments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0))}</span>
                      <span className="text-yellow-500">Pendentes: {formatCurrency(metrics.totalPending)}</span>
                      <span className="text-brand-red">Vencidos: {formatCurrency(metrics.totalOverdue)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400">Exibindo <strong className="text-white">{filteredExpenses.length}</strong> de {baseExpenses.length}</span>
                      <span className="text-brand-red">Pagas: {formatCurrency(metrics.totalExpensesPaid)}</span>
                      <span className="text-yellow-500">Pendentes: {formatCurrency(metrics.totalExpensesPending)}</span>
                    </>
                  )}
                </div>

                {activeTab === 'payments' ? (
                  <FinancialTransactionsTable
                    type="payments"
                    items={filteredPayments}
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onRegister={setRegisterPayment}
                    onDelete={handleDeletePayment}
                  />
                ) : (
                  <FinancialTransactionsTable
                    type="expenses"
                    items={filteredExpenses}
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onRegister={setRegisterExpense}
                    onDelete={handleDeleteExpense}
                  />
                )}
              </>
            )}

            {/* Fleet Tab */}
            {activeTab === 'fleet' && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-xl p-4 text-center">
                    <Bike className="absolute -bottom-5 -right-5 w-20 h-20 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <p className="text-xs text-gray-400 uppercase mb-1">Melhor Performance</p>
                    <p className="text-white font-bold">{analytics.motorcyclePerformance[0]?.label || '—'}</p>
                    <p className="text-brand-gold text-sm font-black">{formatCurrency(analytics.motorcyclePerformance[0]?.total || 0)}</p>
                  </div>
                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-xl p-4 text-center">
                    <TrendingUp className="absolute -bottom-5 -right-5 w-20 h-20 text-green-500/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <p className="text-xs text-gray-400 uppercase mb-1">Motos Rentáveis</p>
                    <p className="text-2xl font-black text-green-500">
                      {analytics.motorcyclePerformance.filter(m => m.total > 0).length}
                    </p>
                    <p className="text-gray-500 text-xs">de {motorcycles.length} motos</p>
                  </div>
                  <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-xl p-4 text-center">
                    <TrendingDown className="absolute -bottom-5 -right-5 w-20 h-20 text-brand-red/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <p className="text-xs text-gray-400 uppercase mb-1">Com Saldo Negativo</p>
                    <p className="text-2xl font-black text-brand-red">
                      {analytics.motorcyclePerformance.filter(m => m.total < 0).length}
                    </p>
                    <p className="text-gray-500 text-xs">requerem atenção</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <Receipt size={18} className="text-brand-gold" /> Rentabilidade por Moto
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">Receitas, despesas e margem individual de cada veículo</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden group bg-gray-darker/20 border border-gray-mid/50 rounded-2xl">
                    <Receipt className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-gold/5 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    <MotorcyclePerformanceTable data={analytics.motorcyclePerformance} />
                  </div>
                </div>

                <div className="relative overflow-hidden group bg-gray-darker/30 border border-gray-mid/50 rounded-2xl p-6">
                  <TrendingDown className="absolute -bottom-6 -right-6 w-28 h-28 text-brand-red/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                  <BreakdownPanel
                    title="Despesas por categoria"
                    items={analytics.expenseTypeBreakdown}
                    labelMap={EXPENSE_TYPE_LABELS}
                    valueColor="text-brand-red"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
