import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';

export function FinancialCompositionDonut({ received = 0, paidExpenses = 0, pending = 0 }) {
  const items = [
    { key: 'received', label: 'Recebido', value: Number(received), color: '#22c55e', text: 'text-green-500' },
    { key: 'paidExpenses', label: 'Despesas pagas', value: Number(paidExpenses), color: '#ef4444', text: 'text-brand-red' },
    { key: 'pending', label: 'A receber', value: Number(pending), color: '#facc15', text: 'text-brand-gold' },
  ];

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(total, 1);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-5"
    >
      <div className="relative w-[180px] h-[180px] mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} className="fill-none stroke-gray-700/50" strokeWidth="12" />
          {items.map((item, index) => {
            const pct = item.value / safeTotal;
            const length = pct * circumference;
            const dashArray = `${length} ${circumference - length}`;
            const dashOffset = -cumulative;
            cumulative += length;

            return (
              <motion.circle
                key={item.key}
                cx="60"
                cy="60"
                r={radius}
                className="fill-none"
                stroke={item.color}
                strokeWidth="12"
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${circumference}`, opacity: 0.5 }}
                animate={{ strokeDasharray: dashArray, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 * index }}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Movimentado</p>
          <p className="text-white font-black text-sm leading-tight">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + 0.06 * index }}
              className="bg-gray-darker/60 border border-gray-mid/50 rounded-lg px-3 py-2.5 text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-gray-500 text-xs">{pct}%</span>
              </div>
              <p className={`font-bold mt-1 ${item.text}`}>{formatCurrency(item.value)}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
