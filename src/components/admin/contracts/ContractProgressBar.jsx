import { motion } from 'framer-motion';

export function ContractProgressBar({ startDate, endDate, label = 'Progresso do contrato' }) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = Math.max(end - start, 1);
  const elapsed = Math.min(Math.max(today - start, 0), total);
  const pct = Math.round((elapsed / total) * 100);
  const isExpired = today > end;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold ${isExpired ? 'text-blue-400' : 'text-brand-gold'}`}>
          {isExpired ? 'Período encerrado' : `${pct}%`}
        </span>
      </div>
      <div className="h-2 bg-gray-darker rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${isExpired ? 'bg-blue-500' : 'bg-brand-gold'}`}
        />
      </div>
    </div>
  );
}
