import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatCurrency';

export function BreakdownPanel({ title, items = [], labelMap = {}, valueColor = 'text-brand-gold' }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Sem dados para exibir.
      </div>
    );
  }

  const maxPct = Math.max(...items.map(i => i.pct), 1);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{title}</p>
      {items.map((item, i) => {
        const key = item.method || item.type;
        const label = labelMap[key] || key;

        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{label}</span>
              <span className={`font-bold ${valueColor}`}>
                {formatCurrency(item.amount)}
                <span className="text-gray-500 font-normal text-xs ml-1">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 bg-gray-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.pct / maxPct) * 100}%` }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="h-full rounded-full bg-brand-gold/70"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
