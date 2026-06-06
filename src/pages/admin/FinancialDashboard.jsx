import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, Search, Loader2, ShieldAlert, Plus, CheckCircle,
  Trash2, TrendingUp, TrendingDown, Clock, DollarSign, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ContractService } from '../../services/contractService';
import { MotorcycleService } from '../../services/motorcycleService';
import { PaymentService } from '../../services/paymentService';
import { ExpenseService } from '../../services/expenseService';
import { useConfirm } from '../../context/ConfirmContext';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { CreatePaymentModal } from '../../components/admin/CreatePaymentModal';
import { CreateExpenseModal } from '../../components/admin/CreateExpenseModal';
import { RegisterPaymentModal } from '../../components/admin/RegisterPaymentModal';
import { RegisterExpenseModal } from '../../components/admin/RegisterExpenseModal';
import {
  PAYMENT_TYPE_LABELS, EXPENSE_TYPE_LABELS, PAYMENT_METHOD_LABELS
} from '../../utils/financialLabels';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';

function StatCard({ icon, label, value, color = 'gold' }) {
  const colors = {
    gold: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-brand-red bg-brand-red/10 border-brand-red/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black-rich border border-gray-mid rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [registerPayment, setRegisterPayment] = useState(null);
  const [registerExpense, setRegisterExpense] = useState(null);

  const { confirm } = useConfirm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, motorcyclesRes] = await Promise.all([
        ContractService.getAllContracts(),
        MotorcycleService.getAllMotorcycles(),
      ]);
      setContracts(contractsRes.data || []);
      setMotorcycles(motorcyclesRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  const payments = useMemo(() =>
    contracts.flatMap(c =>
      (c.payments || []).map(p => ({
        ...p,
        contract: c,
        clientName: c.user?.name,
        motorcyclePlate: c.motorcycle?.plate,
      }))
    ),
    [contracts]
  );

  const expenses = useMemo(() =>
    motorcycles.flatMap(m =>
      (m.financial?.expenses || []).map(e => ({
        ...e,
        motorcycle: m,
        motorcycleLabel: `${m.brand} ${m.model} — ${m.plate}`,
      }))
    ),
    [motorcycles]
  );

  const stats = useMemo(() => {
    const paidPayments = payments.filter(p => p.status === 'PAID');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const paidExpenses = expenses.filter(e => e.status === 'PAID');
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
    const overdueCount = payments.filter(p => isOverdue(p.dueDate, p.status)).length;

    const totalReceived = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpensesPaid = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalExpensesPending = pendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalReceived, totalPending, totalExpensesPaid, totalExpensesPending,
      netBalance: totalReceived - totalExpensesPaid, overdueCount,
    };
  }, [payments, expenses]);

  const filterByStatus = (item) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'OVERDUE') return isOverdue(item.dueDate, item.status);
    return item.status === statusFilter;
  };

  const filteredPayments = payments.filter(p =>
    filterByStatus(p) && (
      p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.motorcyclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      PAYMENT_TYPE_LABELS[p.type]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredExpenses = expenses.filter(e =>
    filterByStatus(e) && (
      e.motorcycleLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      EXPENSE_TYPE_LABELS[e.type]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDeletePayment = async (paymentId) => {
    const isConfirmed = await confirm({
      title: 'Excluir Pagamento',
      message: 'Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Excluir',
      isDanger: true,
    });
    if (!isConfirmed) return;

    try {
      await PaymentService.deletePayment(paymentId);
      toast.success('Pagamento excluído.');
      fetchData();
    } catch {
      toast.error('Erro ao excluir pagamento.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const isConfirmed = await confirm({
      title: 'Excluir Despesa',
      message: 'Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Excluir',
      isDanger: true,
    });
    if (!isConfirmed) return;

    try {
      await ExpenseService.deleteExpense(expenseId);
      toast.success('Despesa excluída.');
      fetchData();
    } catch {
      toast.error('Erro ao excluir despesa.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <CreatePaymentModal
        isOpen={showCreatePayment}
        onClose={() => setShowCreatePayment(false)}
        contracts={contracts}
        onSuccess={fetchData}
      />
      <CreateExpenseModal
        isOpen={showCreateExpense}
        onClose={() => setShowCreateExpense(false)}
        motorcycles={motorcycles}
        onSuccess={fetchData}
      />
      <RegisterPaymentModal
        isOpen={!!registerPayment}
        onClose={() => setRegisterPayment(null)}
        payment={registerPayment}
        onSuccess={fetchData}
      />
      <RegisterExpenseModal
        isOpen={!!registerExpense}
        onClose={() => setRegisterExpense(null)}
        expense={registerExpense}
        onSuccess={fetchData}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Wallet className="text-brand-gold" size={32} /> Financeiro
          </h1>
          <p className="text-gray-400">Gestão de recebimentos e despesas da frota.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateExpense(true)}
            className="flex items-center gap-2 bg-gray-dark hover:bg-gray-mid text-white px-5 py-3 rounded-xl font-bold transition-all border border-gray-mid"
          >
            <Plus size={18} /> Nova Despesa
          </button>
          <button
            onClick={() => setShowCreatePayment(true)}
            className="flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)]"
          >
            <Plus size={18} /> Novo Pagamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
          <p className="text-gray-400">Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon={<TrendingUp size={22} />} label="Recebido" value={formatCurrency(stats.totalReceived)} color="green" />
            <StatCard icon={<Clock size={22} />} label="A Receber" value={formatCurrency(stats.totalPending)} color="yellow" />
            <StatCard icon={<TrendingDown size={22} />} label="Despesas Pagas" value={formatCurrency(stats.totalExpensesPaid)} color="red" />
            <StatCard icon={<DollarSign size={22} />} label="Despesas Pendentes" value={formatCurrency(stats.totalExpensesPending)} color="yellow" />
            <StatCard icon={<Wallet size={22} />} label="Saldo Líquido" value={formatCurrency(stats.netBalance)} color="gold" />
            <StatCard icon={<ShieldAlert size={22} />} label="Em Atraso" value={stats.overdueCount} color="red" />
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-mid">
              {[
                { key: 'payments', label: 'Recebimentos', count: payments.length },
                { key: 'expenses', label: 'Despesas', count: expenses.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearchTerm(''); setStatusFilter('ALL'); }}
                  className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
                    activeTab === tab.key
                      ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                      : 'text-gray-400 hover:text-white hover:bg-gray-darker'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-xl text-white placeholder:text-gray-500 transition-all outline-none"
                  placeholder={activeTab === 'payments' ? 'Buscar por cliente, placa ou tipo...' : 'Buscar por moto, tipo ou descrição...'}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-darker border border-gray-mid focus:border-brand-gold rounded-xl text-white outline-none cursor-pointer"
              >
                <option value="ALL">Todos os status</option>
                <option value="PENDING">Pendentes</option>
                <option value="PAID">Pagos</option>
                <option value="OVERDUE">Em atraso</option>
              </select>
            </div>

            {activeTab === 'payments' ? (
              filteredPayments.length === 0 ? (
                <div className="p-12 text-center">
                  <ShieldAlert size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum pagamento encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-gray-mid text-gray-400 text-left">
                        <th className="px-6 py-3 font-semibold">Cliente / Moto</th>
                        <th className="px-6 py-3 font-semibold">Tipo</th>
                        <th className="px-6 py-3 font-semibold">Valor</th>
                        <th className="px-6 py-3 font-semibold">Vencimento</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(p => (
                        <tr key={p.paymentId} className="border-t border-gray-mid/50 hover:bg-gray-darker/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-white font-medium">{p.clientName || '—'}</p>
                            <p className="text-gray-500 text-xs">{p.motorcyclePlate}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{PAYMENT_TYPE_LABELS[p.type] || p.type}</td>
                          <td className="px-6 py-4 text-brand-gold font-bold">{formatCurrency(p.amount)}</td>
                          <td className="px-6 py-4 text-gray-300">{formatDate(p.dueDate)}</td>
                          <td className="px-6 py-4">
                            <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                            {p.status === 'PAID' && p.method && (
                              <p className="text-[10px] text-gray-500 mt-1">{PAYMENT_METHOD_LABELS[p.method]}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {p.status === 'PENDING' && (
                                <button
                                  onClick={() => setRegisterPayment(p)}
                                  className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                  title="Registrar pagamento"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <Link
                                to={`/admin/contratos/${p.contractId}`}
                                className="p-2 rounded-lg bg-gray-dark text-gray-400 hover:text-brand-gold transition-colors"
                                title="Ver contrato"
                              >
                                <ArrowUpRight size={16} />
                              </Link>
                              <button
                                onClick={() => handleDeletePayment(p.paymentId)}
                                className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              filteredExpenses.length === 0 ? (
                <div className="p-12 text-center">
                  <ShieldAlert size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma despesa encontrada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-gray-mid text-gray-400 text-left">
                        <th className="px-6 py-3 font-semibold">Moto</th>
                        <th className="px-6 py-3 font-semibold">Tipo</th>
                        <th className="px-6 py-3 font-semibold">Valor</th>
                        <th className="px-6 py-3 font-semibold">Vencimento</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(e => (
                        <tr key={e.expenseId} className="border-t border-gray-mid/50 hover:bg-gray-darker/50 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{e.motorcycleLabel}</td>
                          <td className="px-6 py-4 text-gray-300">{EXPENSE_TYPE_LABELS[e.type] || e.type}</td>
                          <td className="px-6 py-4 text-brand-red font-bold">{formatCurrency(e.amount)}</td>
                          <td className="px-6 py-4 text-gray-300">{formatDate(e.dueDate)}</td>
                          <td className="px-6 py-4">
                            <FinancialStatusBadge status={e.status} dueDate={e.dueDate} />
                            {e.status === 'PAID' && e.method && (
                              <p className="text-[10px] text-gray-500 mt-1">{PAYMENT_METHOD_LABELS[e.method]}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {e.status === 'PENDING' && (
                                <button
                                  onClick={() => setRegisterExpense(e)}
                                  className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                  title="Registrar pagamento"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteExpense(e.expenseId)}
                                className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
