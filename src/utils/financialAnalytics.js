import { isOverdue } from './formatCurrency';

const MS_PER_DAY = 86400000;

export function buildPayments(contracts = []) {
  return contracts.flatMap(c =>
    (c.payments || []).map(p => ({
      ...p,
      contract: c,
      clientName: c.user?.name,
      motorcyclePlate: c.motorcycle?.plate,
      motorcycleId: c.motorcycle?.motorcycleId,
    }))
  );
}

export function buildExpenses(motorcycles = []) {
  return motorcycles.flatMap(m =>
    (m.financial?.expenses || []).map(e => ({
      ...e,
      motorcycle: m,
      motorcycleLabel: `${m.brand} ${m.model} — ${m.plate}`,
    }))
  );
}

export function getDaysOverdue(dueDate) {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = Math.floor((today - due) / MS_PER_DAY);
  return Math.max(0, diff);
}

export function getEffectiveStatus(item) {
  if (item.status === 'PENDING' && isOverdue(item.dueDate, item.status)) return 'OVERDUE';
  return item.status;
}

export function filterByPeriod(items, period, primaryField = 'paidDate', fallbackField = 'dueDate') {
  if (period === 'all') return items;

  const days = { '7d': 7, '30d': 30, '90d': 90 }[period] ?? 30;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);

  return items.filter(item => {
    const dateStr = item[primaryField] || item[fallbackField];
    if (!dateStr) return false;
    const date = new Date(dateStr + 'T00:00:00');
    return date >= cutoff;
  });
}

export function computeFinancialMetrics(payments, expenses) {
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const overduePayments = payments.filter(p => isOverdue(p.dueDate, p.status));

  const paidExpenses = expenses.filter(e => e.status === 'PAID');
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const overdueExpenses = expenses.filter(e => isOverdue(e.dueDate, e.status));

  const totalReceived = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = pendingPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = overduePayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalExpensesPaid = paidExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalExpensesPending = pendingExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const now = new Date();
  const receivedThisMonth = paidPayments
    .filter(p => {
      if (!p.paidDate) return false;
      const d = new Date(p.paidDate + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + Number(p.amount), 0);

  const expensesThisMonth = paidExpenses
    .filter(e => {
      if (!e.paidDate) return false;
      const d = new Date(e.paidDate + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + Number(e.amount), 0);

  const collectionRate = (totalReceived + totalPending) > 0
    ? Math.round((totalReceived / (totalReceived + totalPending)) * 100)
    : 100;

  return {
    totalReceived,
    totalPending,
    totalOverdue,
    totalExpensesPaid,
    totalExpensesPending,
    netBalance: totalReceived - totalExpensesPaid,
    projectedBalance: totalReceived + totalPending - totalExpensesPaid - totalExpensesPending,
    receivedThisMonth,
    expensesThisMonth,
    monthResult: receivedThisMonth - expensesThisMonth,
    overdueCount: overduePayments.length,
    overdueExpenseCount: overdueExpenses.length,
    pendingCount: pendingPayments.length,
    pendingExpenseCount: pendingExpenses.length,
    paidCount: paidPayments.length,
    collectionRate,
    totalTransactions: payments.length + expenses.length,
  };
}

export function getCashFlowByMonth(payments, expenses, monthCount = 6) {
  const months = [];
  const now = new Date();

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      year: date.getFullYear(),
      month: date.getMonth(),
      income: 0,
      expenses: 0,
    });
  }

  payments.filter(p => p.status === 'PAID' && p.paidDate).forEach(p => {
    const d = new Date(p.paidDate + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find(m => m.key === key);
    if (bucket) bucket.income += Number(p.amount);
  });

  expenses.filter(e => e.status === 'PAID' && e.paidDate).forEach(e => {
    const d = new Date(e.paidDate + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = months.find(m => m.key === key);
    if (bucket) bucket.expenses += Number(e.amount);
  });

  return months.map(m => ({ ...m, net: m.income - m.expenses }));
}

export function getAgingBuckets(payments) {
  const pending = payments.filter(p => p.status === 'PENDING');

  const buckets = [
    { key: 'onTime', label: 'Em dia', range: 'Vence hoje ou depois', count: 0, amount: 0, color: 'bg-green-500' },
    { key: '1-7', label: '1–7 dias', range: 'Atraso leve', count: 0, amount: 0, color: 'bg-yellow-500' },
    { key: '8-15', label: '8–15 dias', range: 'Atenção', count: 0, amount: 0, color: 'bg-orange-500' },
    { key: '16-30', label: '16–30 dias', range: 'Crítico', count: 0, amount: 0, color: 'bg-brand-red' },
    { key: '30+', label: '30+ dias', range: 'Urgente', count: 0, amount: 0, color: 'bg-red-700' },
  ];

  pending.forEach(p => {
    const days = getDaysOverdue(p.dueDate);
    const amount = Number(p.amount);
    let bucket;

    if (days === 0) bucket = buckets[0];
    else if (days <= 7) bucket = buckets[1];
    else if (days <= 15) bucket = buckets[2];
    else if (days <= 30) bucket = buckets[3];
    else bucket = buckets[4];

    bucket.count += 1;
    bucket.amount += amount;
  });

  const totalAmount = buckets.reduce((s, b) => s + b.amount, 0);
  return buckets.map(b => ({
    ...b,
    pct: totalAmount > 0 ? Math.round((b.amount / totalAmount) * 100) : 0,
  }));
}

export function getPaymentMethodBreakdown(payments) {
  const paid = payments.filter(p => p.status === 'PAID' && p.method);
  const totals = {};
  paid.forEach(p => {
    totals[p.method] = (totals[p.method] || 0) + Number(p.amount);
  });
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  return Object.entries(totals)
    .map(([method, amount]) => ({
      method,
      amount,
      pct: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getPaymentTypeBreakdown(payments) {
  const totals = {};
  payments.forEach(p => {
    totals[p.type] = (totals[p.type] || 0) + Number(p.amount);
  });
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  return Object.entries(totals)
    .map(([type, amount]) => ({
      type,
      amount,
      pct: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getExpenseTypeBreakdown(expenses) {
  const totals = {};
  expenses.forEach(e => {
    totals[e.type] = (totals[e.type] || 0) + Number(e.amount);
  });
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  return Object.entries(totals)
    .map(([type, amount]) => ({
      type,
      amount,
      pct: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMotorcyclePerformance(motorcycles) {
  return motorcycles
    .map(m => {
      const earnings = m.financial?.earnings || [];
      const expenses = m.financial?.expenses || [];
      const paidEarnings = earnings.filter(e => e.status === 'PAID').reduce((s, e) => s + Number(e.amount), 0);
      const paidExpenses = expenses.filter(e => e.status === 'PAID').reduce((s, e) => s + Number(e.amount), 0);
      const pendingEarnings = earnings.filter(e => e.status === 'PENDING').reduce((s, e) => s + Number(e.amount), 0);
      const pendingExpenses = expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + Number(e.amount), 0);

      return {
        motorcycleId: m.motorcycleId,
        label: `${m.brand} ${m.model}`,
        plate: m.plate,
        active: m.active,
        available: m.available,
        total: Number(m.financial?.total) || paidEarnings - paidExpenses,
        paidEarnings,
        paidExpenses,
        pendingEarnings,
        pendingExpenses,
        netMargin: paidEarnings > 0 ? Math.round(((paidEarnings - paidExpenses) / paidEarnings) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getFinancialHealthScore(metrics, payments) {
  let score = 100;

  const overdueRatio = metrics.totalPending > 0
    ? metrics.totalOverdue / metrics.totalPending
    : 0;
  score -= overdueRatio * 40;

  if (metrics.netBalance < 0) score -= 20;
  if (metrics.collectionRate < 70) score -= 15;
  if (metrics.overdueCount > 3) score -= 10;
  if (payments.length === 0) score = 50;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getFinancialAlerts(payments, expenses, metrics) {
  const alerts = [];

  if (metrics.overdueCount > 0) {
    alerts.push({
      level: 'critical',
      title: `${metrics.overdueCount} pagamento(s) em atraso`,
      message: `Total de ${metrics.totalOverdue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} vencido(s).`,
    });
  }

  if (metrics.overdueExpenseCount > 0) {
    alerts.push({
      level: 'warning',
      title: `${metrics.overdueExpenseCount} despesa(s) vencida(s)`,
      message: 'Despesas pendentes passaram do vencimento.',
    });
  }

  if (metrics.netBalance < 0) {
    alerts.push({
      level: 'critical',
      title: 'Saldo líquido negativo',
      message: 'Despesas pagas superam os recebimentos confirmados.',
    });
  }

  if (metrics.monthResult < 0) {
    alerts.push({
      level: 'warning',
      title: 'Mês com resultado negativo',
      message: 'Despesas do mês superaram os recebimentos.',
    });
  }

  if (metrics.collectionRate < 70 && payments.length > 0) {
    alerts.push({
      level: 'info',
      title: `Taxa de recebimento: ${metrics.collectionRate}%`,
      message: 'Muitos valores ainda pendentes de confirmação.',
    });
  }

  const topOverdue = payments
    .filter(p => isOverdue(p.dueDate, p.status))
    .sort((a, b) => getDaysOverdue(b.dueDate) - getDaysOverdue(a.dueDate))[0];

  if (topOverdue) {
    alerts.push({
      level: 'critical',
      title: `Maior atraso: ${topOverdue.clientName}`,
      message: `${getDaysOverdue(topOverdue.dueDate)} dias — ${topOverdue.motorcyclePlate}`,
      paymentId: topOverdue.paymentId,
      contractId: topOverdue.contractId,
    });
  }

  return alerts;
}
