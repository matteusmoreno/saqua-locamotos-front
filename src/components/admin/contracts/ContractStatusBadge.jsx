import { CONTRACT_STATUS_LABELS } from '../../../utils/financialLabels';

const STYLES = {
  ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
  FINISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CANCELLED: 'bg-brand-red/10 text-brand-red border-brand-red/20',
  OVERDUE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export function ContractStatusBadge({ status, size = 'sm' }) {
  const sizeClass = size === 'lg'
    ? 'text-xs px-3 py-1.5 rounded-lg'
    : 'text-[10px] px-2 py-1 rounded-md';

  return (
    <span className={`font-bold border uppercase ${sizeClass} ${STYLES[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {CONTRACT_STATUS_LABELS[status] || status}
    </span>
  );
}
