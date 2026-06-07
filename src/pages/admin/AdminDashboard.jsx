import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Bike, FileText, Wallet, Loader2,
  TrendingUp, Clock, AlertTriangle, Plus, ArrowRight, CheckCircle,
  TrendingDown, DollarSign, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { MotorcycleService } from '../../services/motorcycleService';
import { ContractService } from '../../services/contractService';
import { FinancialStatusBadge } from '../../components/admin/FinancialStatusBadge';
import { PAYMENT_TYPE_LABELS } from '../../utils/financialLabels';
import { formatCurrency, formatDate, isOverdue } from '../../utils/formatCurrency';

// --- COMPONENTES VISUAIS DO DASHBOARD ---

function StatCard({ icon: Icon, label, value, sub, color = 'gold', delay = 0, isFinancial = false }) {
  const styles = {
    gold: { bg: 'bg-brand-gold/10', border: 'border-brand-gold/20', text: 'text-brand-gold', glow: 'group-hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] group-hover:border-brand-gold/50' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500', glow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] group-hover:border-green-500/50' },
    red: { bg: 'bg-brand-red/10', border: 'border-brand-red/20', text: 'text-brand-red', glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] group-hover:border-brand-red/50' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:border-blue-500/50' },
    // CORREÇÃO: Adicionada a cor amarela que faltava
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500', glow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] group-hover:border-yellow-500/50' },
  };

  const theme = styles[color] || styles.gold; // Fallback de segurança para gold

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group relative bg-black-rich border border-gray-mid rounded-3xl p-6 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[140px] ${theme.glow}`}
    >
      {/* Ícone de fundo marca d'água */}
      <Icon className={`absolute -bottom-4 -right-4 w-32 h-32 opacity-5 ${theme.text} transform group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme.bg} ${theme.border} ${theme.text}`}>
          <Icon size={24} />
        </div>
        {isFinancial && (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${theme.bg} ${theme.border} ${theme.text}`}>
            Financeiro
          </span>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-3xl font-black ${isFinancial ? 'text-white' : 'text-white'}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1.5 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ModernProgressBar({ label, value, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-500 group-hover:text-white transition-colors" />}
          <span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white">{value}</span>
          <span className="text-xs text-gray-500 ml-1 font-medium">({pct}%)</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-darker rounded-full overflow-hidden border border-gray-dark">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color} relative overflow-hidden`}
        >
          {/* Efeito de brilho na barra */}
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
}

function QuickActionButton({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-start p-5 bg-gray-darker/50 hover:bg-gray-dark border border-gray-mid hover:border-brand-gold/50 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_25px_rgba(250,204,21,0.1)] cursor-pointer h-full"
    >
      <div className="w-10 h-10 rounded-xl bg-black-rich border border-gray-mid text-gray-400 flex items-center justify-center mb-4 group-hover:bg-brand-gold/10 group-hover:border-brand-gold/30 group-hover:text-brand-gold transition-colors">
        <Icon size={20} />
      </div>
      <p className="text-white font-bold text-sm mb-1">{label}</p>
      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{description}</p>
    </Link>
  );
}

// --- DASHBOARD PRINCIPAL ---

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
        clientPic: c.user?.pictureUrl,
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
    weekday: 'long', day: 'numeric', month: 'long'
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-gray-darker rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand-gold rounded-full border-t-transparent animate-spin"></div>
          <LayoutDashboard className="text-brand-gold animate-pulse" size={28} />
        </div>
        <p className="text-gray-400 font-medium">A preparar o seu painel de controlo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HERO SECTION / BOAS VINDAS */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-black-rich border border-gray-mid rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 via-brand-gold/5 to-transparent opacity-50"></div>
        <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-brand-gold font-bold text-sm tracking-widest uppercase mb-2 capitalize-first">{today}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Bem-vindo de volta, {user?.name ? user.name.split(' ')[0] : 'Admin'}! 👋
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl">
              Aqui está o resumo da sua operação hoje. Acompanhe a saúde financeira, o status da frota e os contratos ativos em tempo real.
            </p>
          </div>
          <Link
            to="/admin/financeiro"
            className="shrink-0 flex items-center gap-2 bg-brand-gold hover:bg-brand-gold-hover text-black-pure px-6 py-3.5 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] transform hover:-translate-y-1"
          >
            <Wallet size={18} /> Balanço Financeiro
          </Link>
        </div>
      </motion.div>

      {/* KPIs FINANCEIROS (Linha de Destaque) */}
      <div>
        <div className="flex items-center gap-3 mb-4 px-2">
          <DollarSign className="text-brand-gold" size={20} />
          <h2 className="text-lg font-bold text-white">Desempenho Financeiro</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={TrendingUp} label="Recebido no Mês" value={formatCurrency(stats.receivedThisMonth)} color="green" delay={0.05} isFinancial />
          <StatCard icon={Clock} label="A Receber (Pendentes)" value={formatCurrency(stats.totalPending)} color="yellow" delay={0.1} isFinancial />
          <StatCard icon={AlertTriangle} label="Pagamentos em Atraso" value={stats.overdueCount} sub="Faturas vencidas" color="red" delay={0.15} isFinancial />
          <StatCard icon={CheckCircle} label="Saldo Líquido (Geral)" value={formatCurrency(stats.netBalance)} color="gold" delay={0.2} isFinancial />
        </div>
      </div>

      {/* KPIs OPERACIONAIS */}
      <div>
        <div className="flex items-center gap-3 mb-4 px-2">
          <Activity className="text-brand-gold" size={20} />
          <h2 className="text-lg font-bold text-white">Métricas Operacionais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={Users} label="Locatários Registados" value={stats.totalCustomers} color="blue" delay={0.25} />
          <StatCard icon={Bike} label="Tamanho da Frota" value={stats.totalMotorcycles} sub={`${stats.availableMotorcycles} motos prontas para alugar`} color="gold" delay={0.3} />
          <StatCard icon={FileText} label="Contratos Ativos" value={stats.activeContracts} sub={`${stats.finishedContracts} finalizados no histórico`} color="green" delay={0.35} />
        </div>
      </div>

      {/* GRID INFERIOR: AÇÕES, FROTA E LISTAS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        
        {/* COLUNA ESQUERDA (Ocupa 2/3) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* AÇÕES RÁPIDAS */}
          <div className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickActionButton to="/admin/contratos/novo" icon={FileText} label="Novo Contrato" description="Iniciar locação" />
              <QuickActionButton to="/admin/motos/nova" icon={Bike} label="Nova Moto" description="Adicionar à frota" />
              <QuickActionButton to="/admin/clientes/novo" icon={Users} label="Novo Cliente" description="Registar locatário" />
              <QuickActionButton to="/admin/financeiro" icon={TrendingDown} label="Nova Despesa" description="Registar custos" />
            </div>
          </div>

          {/* ÚLTIMOS CONTRATOS ATIVOS */}
          <div className="bg-black-rich border border-gray-mid rounded-3xl overflow-hidden flex flex-col h-[400px]">
            <div className="p-6 border-b border-gray-mid/50 flex items-center justify-between shrink-0 bg-gradient-to-r from-gray-darker/50 to-transparent">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-brand-gold" /> Contratos Recentes
              </h2>
              <Link to="/admin/contratos" className="text-sm font-bold text-brand-gold hover:text-white transition-colors bg-brand-gold/10 px-4 py-2 rounded-lg">Ver Todos</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {stats.recentActiveContracts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <FileText size={40} className="text-gray-600 mb-3" />
                  <p className="text-gray-400 font-medium">Nenhum contrato ativo no momento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentActiveContracts.map(c => (
                    <Link
                      key={c.contractId}
                      to={`/admin/contratos/${c.contractId}`}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-darker/80 border border-transparent hover:border-gray-mid transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-darker border border-gray-mid flex items-center justify-center font-bold text-brand-gold shrink-0 overflow-hidden">
                          {c.user?.pictureUrl ? <img src={c.user.pictureUrl} alt={c.user.name} className="w-full h-full object-cover"/> : c.user?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm group-hover:text-brand-gold transition-colors">{c.user?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-gray-dark text-gray-400 border border-gray-mid font-mono">{c.motorcycle?.plate}</span>
                            <span>{c.motorcycle?.model}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-gold font-black text-sm">{formatCurrency(c.weeklyAmount)} <span className="text-[10px] font-medium text-gray-500 uppercase">/sem</span></p>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">Início: {formatDate(c.startDate)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (Ocupa 1/3) */}
        <div className="space-y-6">
          
          {/* DISTRIBUIÇÃO DA FROTA */}
          <div className="bg-black-rich border border-gray-mid rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Bike size={20} className="text-brand-gold" /> Distribuição da Frota
            </h2>
            <div className="space-y-6">
              <ModernProgressBar label="Disponíveis para Aluguer" value={stats.availableMotorcycles} total={stats.totalMotorcycles} color="bg-green-500" icon={CheckCircle} />
              <ModernProgressBar label="Em Contrato Ativo" value={stats.rentedMotorcycles} total={stats.totalMotorcycles} color="bg-brand-gold" icon={FileText} />
              <ModernProgressBar label="Inativas / Manutenção" value={stats.inactiveMotorcycles} total={stats.totalMotorcycles} color="bg-gray-500" icon={AlertTriangle} />
            </div>
          </div>

          {/* PENDÊNCIAS FINANCEIRAS */}
          <div className="bg-black-rich border border-brand-red/20 rounded-3xl overflow-hidden flex flex-col h-[400px] shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <div className="p-6 border-b border-brand-red/20 flex items-center justify-between shrink-0 bg-gradient-to-r from-brand-red/10 to-transparent">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-brand-red" />
                Atenção Necessária
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {stats.urgentPayments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-white font-bold mb-1">Tudo em dia!</h3>
                  <p className="text-gray-400 text-sm">Não há faturas urgentes ou em atraso no momento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.urgentPayments.map(p => (
                    <Link
                      key={p.paymentId}
                      to={`/admin/contratos/${p.contractId}`}
                      className="block p-4 rounded-2xl bg-gray-darker/30 hover:bg-brand-red/5 border border-transparent hover:border-brand-red/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <p className="text-white text-sm font-bold truncate group-hover:text-brand-red transition-colors">{p.clientName}</p>
                        <p className="text-brand-red font-black text-sm shrink-0 bg-brand-red/10 px-2 py-0.5 rounded border border-brand-red/20">
                          {formatCurrency(p.amount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-medium text-gray-300">{PAYMENT_TYPE_LABELS[p.type]}</span>
                          <span>•</span>
                          <span className="font-mono">{p.motorcyclePlate}</span>
                        </div>
                        <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {stats.urgentPayments.length > 0 && (
              <div className="p-4 bg-gray-darker/80 border-t border-brand-red/20 shrink-0">
                <Link to="/admin/financeiro" className="w-full block text-center text-sm font-bold text-brand-red hover:text-white transition-colors">
                  Gerir Todas as Faturas
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Estilos locais para animações */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        .capitalize-first::first-letter {
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}