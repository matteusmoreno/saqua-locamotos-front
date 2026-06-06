import { Link } from 'react-router-dom';
import { CheckCircle, Trash2, ArrowUpRight, ArrowUp, ArrowDown } from 'lucide-react';
import { FinancialStatusBadge } from '../FinancialStatusBadge';
import { PAYMENT_TYPE_LABELS, EXPENSE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../../../utils/financialLabels';
import { formatCurrency, formatDate, isOverdue } from '../../../utils/formatCurrency';
import { getDaysOverdue } from '../../../utils/financialAnalytics';

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-semibold hover:text-white transition-colors"
    >
      {label}
      {active && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );
}

export function FinancialTransactionsTable({
  type = 'payments',
  items = [],
  sortField,
  sortDir,
  onSort,
  onRegister,
  onDelete,
}) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400 text-sm">
        Nenhum lançamento encontrado com os filtros atuais.
      </div>
    );
  }

  if (type === 'payments') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-mid text-gray-400 text-left">
              <th className="px-6 py-3"><SortHeader label="Cliente / Moto" field="clientName" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3"><SortHeader label="Tipo" field="type" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3"><SortHeader label="Valor" field="amount" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3"><SortHeader label="Vencimento" field="dueDate" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => {
              const overdue = isOverdue(p.dueDate, p.status);
              const days = overdue ? getDaysOverdue(p.dueDate) : 0;

              return (
                <tr
                  key={p.paymentId}
                  className={`border-t border-gray-mid/50 transition-colors ${
                    overdue ? 'bg-brand-red/[0.03] hover:bg-brand-red/[0.06]' : 'hover:bg-gray-darker/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{p.clientName || '—'}</p>
                    <p className="text-gray-500 text-xs">{p.motorcyclePlate}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{PAYMENT_TYPE_LABELS[p.type] || p.type}</td>
                  <td className="px-6 py-4 text-brand-gold font-bold">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{formatDate(p.dueDate)}</p>
                    {overdue && <p className="text-brand-red text-[10px] font-bold">{days}d em atraso</p>}
                  </td>
                  <td className="px-6 py-4">
                    <FinancialStatusBadge status={p.status} dueDate={p.dueDate} />
                    {p.status === 'PAID' && p.method && (
                      <p className="text-[10px] text-gray-500 mt-1">{PAYMENT_METHOD_LABELS[p.method]}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'PENDING' && (
                        <button onClick={() => onRegister(p)} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" title="Registrar">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <Link to={`/admin/contratos/${p.contractId}`} className="p-2 rounded-lg bg-gray-dark text-gray-400 hover:text-brand-gold transition-colors" title="Ver contrato">
                        <ArrowUpRight size={16} />
                      </Link>
                      <button onClick={() => onDelete(p.paymentId)} className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors" title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-gray-mid text-gray-400 text-left">
            <th className="px-6 py-3"><SortHeader label="Moto" field="motorcycleLabel" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
            <th className="px-6 py-3"><SortHeader label="Tipo" field="type" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
            <th className="px-6 py-3"><SortHeader label="Valor" field="amount" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
            <th className="px-6 py-3"><SortHeader label="Vencimento" field="dueDate" sortField={sortField} sortDir={sortDir} onSort={onSort} /></th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(e => {
            const overdue = isOverdue(e.dueDate, e.status);
            const days = overdue ? getDaysOverdue(e.dueDate) : 0;

            return (
              <tr
                key={e.expenseId}
                className={`border-t border-gray-mid/50 transition-colors ${
                  overdue ? 'bg-brand-red/[0.03] hover:bg-brand-red/[0.06]' : 'hover:bg-gray-darker/50'
                }`}
              >
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{e.motorcycleLabel}</p>
                  {e.description && <p className="text-gray-500 text-xs truncate max-w-[200px]">{e.description}</p>}
                </td>
                <td className="px-6 py-4 text-gray-300">{EXPENSE_TYPE_LABELS[e.type] || e.type}</td>
                <td className="px-6 py-4 text-brand-red font-bold">{formatCurrency(e.amount)}</td>
                <td className="px-6 py-4">
                  <p className="text-gray-300">{formatDate(e.dueDate)}</p>
                  {overdue && <p className="text-brand-red text-[10px] font-bold">{days}d em atraso</p>}
                </td>
                <td className="px-6 py-4">
                  <FinancialStatusBadge status={e.status} dueDate={e.dueDate} />
                  {e.status === 'PAID' && e.method && (
                    <p className="text-[10px] text-gray-500 mt-1">{PAYMENT_METHOD_LABELS[e.method]}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {e.status === 'PENDING' && (
                      <button onClick={() => onRegister(e)} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors" title="Registrar">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => onDelete(e.expenseId)} className="p-2 rounded-lg bg-brand-red/10 text-brand-red hover:bg-brand-red/20 transition-colors" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
