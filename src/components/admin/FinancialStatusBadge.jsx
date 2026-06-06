import { PAYMENT_STATUS_LABELS } from '../../utils/financialLabels';
import { isOverdue } from '../../utils/formatCurrency';

const STATUS_STYLES = {
  PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  OVERDUE: 'bg-brand-red/10 text-brand-red border-brand-red/20',
};

export function FinancialStatusBadge({ status, dueDate }) {
  const effectiveStatus = isOverdue(dueDate, status) ? 'OVERDUE' : status;
  const label = PAYMENT_STATUS_LABELS[effectiveStatus] || effectiveStatus;
  const style = STATUS_STYLES[effectiveStatus] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase ${style}`}>
      {label}
    </span>
  );
}
