import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Bike, FileText, Wallet, Loader2,
  TrendingUp, Clock, AlertTriangle, Plus, ArrowRight, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { ContractService } from '../../services/contractService';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { PAYMENT_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';

function StatCard({ icon, label, value, sub, color = 'gold', delay = 0 }) {
  const colors = {
    gold: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-brand-red bg-brand-red/10 border-brand-red/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-black-rich border border-gray-mid rounded-2xl p-5 hover:border-brand-gold/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value} <span className="text-gray-500">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-darker rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 bg-gray-darker hover:bg-gray-dark border border-gray-mid hover:border-brand-gold/40 rounded-xl p-4 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center border border-brand-gold/20 group-hover:bg-brand-gold group-hover:text-black-pure transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-gray-500 text-xs truncate">{description}</p>
      </div>
      <ArrowRight size={16} className="text-gray-600 group-hover:text-brand-gold transition-colors shrink-0" />
    </Link>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [customersRes, motorcyclesRes, contractsRes] = await Promise.all([
        UserService.getAllCustomers(),
        MotorcycleService.getAllMotorcycles(),
        ContractService.getAllContracts(),
      ]);
      setCustomers(customersRes.data || []);
      setMotorcycles(motorcyclesRes.data || []);
      setContracts(contractsRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
    const rentedMotorcycleIds = new Set(activeContracts.map(c => c.motorcycle?.motorcycleId));
    const availableMotorcycles = motorcycles.filter(m => m.active && m.available && !rentedMotorcycleIds.has(m.motorcycleId));
    const inactiveMotorcycles = motorcycles.filter(m => !m.active);
    const rentedMotorcycles = motorcycles.filter(m => rentedMotorcycleIds.has(m.motorcycleId));

    const payments = contracts.flatMap(c =>
      (c.payments || []).map(p => ({
        ...p,
        contract: c,
        clientName: c.user?.name,
        motorcyclePlate: c.motorcycle?.plate,
      }))
    );

    const expenses = motorcycles.flatMap(m =>
      (m.financial?.expenses || []).map(e => ({ ...e, motorcycle: m }))
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paidPayments = payments.filter(p => p.status === 'PAID');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const overduePayments = payments.filter(p => isOverdue(p.dueDate, p.status));

    const receivedThisMonth = paidPayments
      .filter(p => {
        if (!p.paidDate) return false;
        const d = new Date(p.paidDate + 'T00:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalReceived = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpensesPaid = expenses
      .filter(e => e.status === 'PAID')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const finishedContracts = contracts.filter(c => c.status === 'FINISHED').length;
    const cancelledContracts = contracts.filter(c => c.status === 'CANCELLED').length;

    const urgentPayments = [...overduePayments, ...pendingPayments.filter(p => !isOverdue(p.dueDate, p.status))]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);

    const recentActiveContracts = [...activeContracts]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .slice(0, 5);

    return {
      totalCustomers: customers.length,
      totalMotorcycles: motorcycles.length,
      availableMotorcycles: availableMotorcycles.length,
      rentedMotorcycles: rentedMotorcycles.length,
      inactiveMotorcycles: inactiveMotorcycles.length,
      activeContracts: activeContracts.length,
      finishedContracts,
      cancelledContracts,
      receivedThisMonth,
      totalReceived,
      totalPending,
      netBalance: totalReceived - totalExpensesPaid,
      overdueCount: overduePayments.length,
      urgentPayments,
      recentActiveContracts,
    };
  }, [customers, motorcycles, contracts]);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-brand-gold mb-4" />
        <p className="text-gray-400">Carregando visão geral...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-brand-gold" size={32} />
            Visão Geral
          </h1>
          <p className="text-gray-400">
            Olá, <span className="text-white font-medium">{user?.name || 'Administrador'}</span> — {today}
          </p>
        </div>
        <Link
          to="/admin/financeiro"
          className="flex items-center gap-2 text-sm text-brand-gold hover:underline font-medium"
        >
          <Wallet size={16} /> Ir para Financeiro
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Clientes" value={stats.totalCustomers} color="blue" delay={0} />
        <StatCard icon={<Bike size={20} />} label="Frota Total" value={stats.totalMotorcycles} sub={`${stats.availableMotorcycles} disponíveis`} color="gold" delay={0.05} />
        <StatCard icon={<FileText size={20} />} label="Contratos Ativos" value={stats.activeContracts} sub={`${stats.finishedContracts} finalizados`} color="green" delay={0.1} />
        <StatCard icon={<TrendingUp size={20} />} label="Recebido no Mês" value={formatCurrency(stats.receivedThisMonth)} color="green" delay={0.15} />
        <StatCard icon={<Wallet size={20} />} label="Total Recebido" value={formatCurrency(stats.totalReceived)} color="gold" delay={0.2} />
        <StatCard icon={<Clock size={20} />} label="A Receber" value={formatCurrency(stats.totalPending)} color="yellow" delay={0.25} />
        <StatCard icon={<AlertTriangle size={20} />} label="Em Atraso" value={stats.overdueCount} sub="pagamentos vencidos" color="red" delay={0.3} />
        <StatCard icon={<CheckCircle size={20} />} label="Saldo Líquido" value={formatCurrency(stats.netBalance)} color="green" delay={0.35} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5">Status da Frota</h2>
            <div className="space-y-4">
              <ProgressBar label="Disponíveis" value={stats.availableMotorcycles} total={stats.totalMotorcycles} color="bg-green-500" />
              <ProgressBar label="Em Contrato" value={stats.rentedMotorcycles} total={stats.totalMotorcycles} color="bg-brand-gold" />
              <ProgressBar label="Inativas" value={stats.inactiveMotorcycles} total={stats.totalMotorcycles} color="bg-gray-500" />
            </div>
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-mid flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Contratos Ativos</h2>
              <Link to="/admin/contratos" className="text-sm text-brand-gold hover:underline font-medium">Ver todos</Link>
            </div>
            {stats.recentActiveContracts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhum contrato ativo no momento.</div>
            ) : (
              <div className="divide-y divide-gray-mid/50">
                {stats.recentActiveContracts.map(c => (
                  <Link
                    key={c.contractId}
                    to={`/admin/contratos/${c.contractId}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-darker/50 transition-colors group"
                  >
                    <div>
                      <p className="text-white font-medium group-hover:text-brand-gold transition-colors">{c.user?.name}</p>
                      <p className="text-gray-500 text-xs">{c.motorcycle?.brand} {c.motorcycle?.model} — {c.motorcycle?.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-brand-gold font-bold text-sm">{formatCurrency(c.weeklyAmount)}/sem</p>
                      <p className="text-gray-500 text-xs">desde {formatDate(c.startDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <QuickAction to="/admin/clientes/novo" icon={<Plus size={18} />} label="Novo Cliente" description="Cadastrar locatário" />
              <QuickAction to="/admin/motos/nova" icon={<Plus size={18} />} label="Nova Moto" description="Adicionar à frota" />
              <QuickAction to="/admin/contratos/novo" icon={<Plus size={18} />} label="Novo Contrato" description="Iniciar locação" />
              <QuickAction to="/admin/financeiro" icon={<Wallet size={18} />} label="Financeiro" description="Pagamentos e despesas" />
            </div>
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5">Contratos</h2>
            <div className="space-y-4">
              <ProgressBar label="Ativos" value={stats.activeContracts} total={contracts.length} color="bg-green-500" />
              <ProgressBar label="Finalizados" value={stats.finishedContracts} total={contracts.length} color="bg-blue-500" />
              <ProgressBar label="Cancelados" value={stats.cancelledContracts} total={contracts.length} color="bg-brand-red" />
            </div>
          </div>

          <div className="bg-black-rich border border-gray-mid rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-mid flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-brand-red" />
                Pendências
              </h2>
              <Link to="/admin/financeiro" className="text-sm text-brand-gold hover:underline font-medium">Ver todas</Link>
            </div>
            {stats.urgentPayments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Nenhuma pendência financeira.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-mid/50">
                {stats.urgentPayments.map(p => (
                  <Link
                    key={p.paymentId}
                    to={`/admin/contratos/${p.contractId}`}
                    className="block px-6 py-4 hover:bg-gray-darker/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium truncate">{p.clientName}</p>
                      <p className="text-brand-gold font-bold text-sm shrink-0 ml-2">{formatCurrency(p.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-xs">{PAYMENT_TYPE_LABELS[p.type]} — {p.motorcyclePlate}</p>
                      <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
